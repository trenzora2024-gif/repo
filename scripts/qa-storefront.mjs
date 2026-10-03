/* eslint-disable no-console */
/**
 * Browser QA for step I, run against any running storefront (mock, local,
 * Oxygen preview or production).
 *
 *   BASE_URL=http://localhost:3000 npm run qa:storefront
 *   BASE_URL=https://<preview>.myshopify.dev QA_EXPECT_CHECKOUT_HOST=checkout.trenzora.in npm run qa:storefront
 *
 * Mobile (390px) + desktop (1440px): status codes, one H1, title,
 * description, canonical, horizontal overflow, broken images, concept
 * placeholders still showing, and the full flow home → collection → product
 * → variant → add to cart → cart → checkout URL (it stops BEFORE submitting
 * anything in Shopify checkout). Needs Playwright (`npx playwright` or a
 * global install). Never places orders.
 */
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({chromium} = require('playwright'));
} catch {
  ({chromium} = require(process.env.PW_PATH ?? 'playwright'));
}

const BASE = (process.env.BASE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
);
const EXPECT_CHECKOUT_HOST = process.env.QA_EXPECT_CHECKOUT_HOST;
const PATHS = [
  '/',
  '/collections/all',
  '/collections/mumbai-made',
  '/collections/drops',
  '/collections/personalize',
  '/collections/gifts',
  '/collections/trending',
  '/designs/mumbai-made',
  '/products/mumbai-made-oversized-tee',
  '/products/us-tote',
  '/products/make-it-yours-tumbler',
  '/search?q=mumbai',
  '/cart',
  '/about',
  '/shipping',
  '/contact',
  '/policies',
  '/policies/refund-policy',
  '/policies/privacy-policy',
  '/policies/terms-of-service',
  '/sitemap.xml',
  '/robots.txt',
];

// Internal data that must never reach customers (page HTML or bundle).
const FORBIDDEN = /printrove|qikink|vistaprint|kraftix|bruno/i;

const issues = [];
const note = (level, msg) => {
  console.log(
    `${level === 'block' ? '✗' : level === 'warn' ? '!' : '✓'} ${msg}`,
  );
  if (level === 'block') issues.push(msg);
};

const browser = await chromium.launch();

for (const [label, viewport] of [
  ['mobile', {width: 390, height: 844}],
  ['desktop', {width: 1440, height: 900}],
]) {
  const ctx = await browser.newContext({
    viewport,
    isMobile: label === 'mobile',
    hasTouch: label === 'mobile',
  });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));

  for (const path of PATHS) {
    const res = await page.goto(BASE + path, {waitUntil: 'networkidle'});
    const status = res?.status() ?? 0;
    if (status >= 400) {
      note('block', `[${label}] ${path} → HTTP ${status}`);
      continue;
    }
    if (/\.(xml|txt)$/.test(path)) {
      note('ok', `[${label}] ${path} → ${status}`);
      continue;
    }
    // Scroll to trigger lazy images.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
    });
    await page.waitForTimeout(300);
    const r = await page.evaluate(() => ({
      h1: document.querySelectorAll('h1').length,
      title: document.title,
      desc: document.querySelector('meta[name=description]')?.content ?? '',
      canonical: document.querySelector('link[rel=canonical]')?.href ?? '',
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      broken: [...document.images]
        .filter((i) => i.complete && i.naturalWidth === 0)
        .map((i) => i.currentSrc.slice(0, 80)),
      placeholders: document.querySelectorAll('img[data-placeholder="concept"]')
        .length,
      noAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length,
    }));
    const problems = [];
    const leak = (await page.content()).match(FORBIDDEN);
    if (leak) problems.push(`internal term in HTML: "${leak[0]}"`);
    if (r.h1 !== 1) problems.push(`${r.h1} H1s`);
    if (!r.title) problems.push('no title');
    if (!r.desc) problems.push('no meta description');
    if (!r.canonical.startsWith('https://trenzora.in'))
      problems.push(`canonical ${r.canonical || 'missing'}`);
    if (r.overflow > 0) problems.push(`horizontal overflow ${r.overflow}px`);
    if (r.broken.length) problems.push(`broken images: ${r.broken.join(', ')}`);
    if (r.noAlt) problems.push(`${r.noAlt} images without alt`);
    if (problems.length)
      note('block', `[${label}] ${path}: ${problems.join('; ')}`);
    else note('ok', `[${label}] ${path} — ${r.title}`);
    if (r.placeholders)
      note(
        'warn',
        `[${label}] ${path}: ${r.placeholders} concept placeholder image(s) — real product images not uploaded`,
      );
  }

  // ---- purchase flow (stops at the checkout URL) ----
  await page.goto(BASE + '/collections/all', {waitUntil: 'networkidle'});
  const firstCard = page.locator('.product-card').first();
  if (!(await firstCard.count())) {
    note('block', `[${label}] flow: no products on /collections/all`);
  } else {
    await firstCard.click();
    await page.waitForURL(/\/products\//);
    const size = page
      .locator('.option-btn[aria-checked="false"]:not([disabled])')
      .first();
    if (await size.count()) {
      await size.click();
      await page.waitForTimeout(400);
    }
    await page.locator('.atc button').click();
    try {
      await page.waitForSelector('.drawer.is-open .cart-line', {
        timeout: 10000,
      });
      note('ok', `[${label}] flow: product → add to cart → cart drawer`);
      const href = await page
        .locator('.drawer.is-open a.btn--accent')
        .getAttribute('href');
      const host = href ? new URL(href).host : '';
      if (!href) note('block', `[${label}] flow: no checkout URL`);
      else if (EXPECT_CHECKOUT_HOST && host !== EXPECT_CHECKOUT_HOST)
        note(
          'block',
          `[${label}] flow: checkout host ${host} ≠ ${EXPECT_CHECKOUT_HOST}`,
        );
      else
        note(
          'ok',
          `[${label}] flow: checkout URL ${host}${new URL(href).pathname.slice(0, 30)}…`,
        );
      const events = await page.evaluate(() =>
        (window.dataLayer ?? []).map((e) => e.event).filter(Boolean),
      );
      note(
        events.includes('add_to_cart') ? 'ok' : 'warn',
        `[${label}] dataLayer events: ${events.join(', ') || 'none (Shopify consent API may be blocked)'}`,
      );
    } catch {
      note('block', `[${label}] flow: add to cart did not open the cart`);
    }
  }
  if (pageErrors.length)
    note(
      'block',
      `[${label}] JS errors: ${[...new Set(pageErrors)].slice(0, 5).join(' | ')}`,
    );
  await ctx.close();
}

await browser.close();
console.log(
  `\n${issues.length ? `${issues.length} blocker(s)` : 'No blockers'} — ${BASE}`,
);
process.exitCode = issues.length ? 1 : 0;
/* eslint-enable no-console */
