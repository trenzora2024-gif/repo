/* eslint-disable no-console */
/**
 * Browser QA for the trenzora.com storefront (mock, Oxygen preview or prod).
 *
 *   ENV_FILE=.env.qa npm run dev:mock     # terminal 1 (test pixel IDs)
 *   QA_STUB=1 npm run qa:storefront       # terminal 2
 *
 * Viewports: iPhone (390), Android (412), laptop (1280), desktop (1440),
 * large desktop (1920). Per page: HTTP status, one H1, title, description,
 * canonical on https://trenzora.com, valid JSON-LD (Product needs brand,
 * offers.price, availability), horizontal overflow, broken images, images
 * without alt, and customer-facing copy that must never appear
 * ("dropship", "Doba", "AliExpress").
 * Flows: product → add to cart → drawer → checkout URL (never submitted);
 * bundle → add complete setup → lines + setup savings. With QA_STUB=1 the
 * Shopify consent API and Meta/Google scripts are stubbed so the funnel
 * events can be read back: PageView, ViewContent, AddToCart,
 * InitiateCheckout (Purchase fires in Shopify checkout, not here).
 * Screenshots go to QA_SHOTS (default .qa/). Never places orders.
 */
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({chromium} = require('playwright'));
} catch {
  ({chromium} = require(process.env.PW_PATH ?? '/opt/node22/lib/node_modules/playwright'));
}

const BASE = (process.env.BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const STUB = process.env.QA_STUB === '1';
const SHOTS = process.env.QA_SHOTS ?? '.qa';
const EXPECT_CHECKOUT_HOST = process.env.QA_EXPECT_CHECKOUT_HOST;
mkdirSync(SHOTS, {recursive: true});

const CONSENT_STUB = `(() => {
  const s = (window.Shopify = window.Shopify || {});
  const p = (s.customerPrivacy = s.customerPrivacy || {});
  const yes = () => true;
  Object.assign(p, {
    consentStatus: 'loaded',
    analyticsProcessingAllowed: yes, marketingAllowed: yes,
    saleOfDataAllowed: yes, preferencesProcessingAllowed: yes,
    userCanBeTracked: yes, shouldShowBanner: () => false,
    currentVisitorConsent: () => ({analytics: 'yes', marketing: 'yes', preferences: 'yes', sale_of_data: 'yes'}),
    setTrackingConsent: (c, cb) => cb && cb({}), getRegion: () => 'US',
  });
  document.dispatchEvent(new Event('consentTrackingApiLoaded'));
})();`;

const PATHS = [
  '/',
  '/collections',
  '/collections/all',
  '/collections/weekend-car-camping',
  '/collections/cold-weather-camping',
  '/collections/gifts-for-campers',
  '/collections/power-light',
  '/products/suv-tailgate-tent',
  '/products/truck-bed-tent',
  '/products/canvas-bell-tent-5m',
  '/bundles',
  '/bundles/weekend-car-camping-setup',
  '/guides',
  '/guides/hot-tent-camping-guide',
  '/search?q=stove',
  '/cart',
  '/pages/about',
  '/pages/shipping-returns',
  '/pages/contact',
  '/policies',
  '/policies/refund-policy',
  '/sitemap.xml',
  '/sitemap-trenzora.xml',
  '/robots.txt',
];
const SHOT_PATHS = ['/', '/collections/weekend-car-camping', '/products/suv-tailgate-tent', '/bundles/hot-tent-basecamp'];
const FORBIDDEN = /dropship|\bdoba\b|aliexpress|to sell online/i;
const VIEWPORTS = [
  ['iphone', {width: 390, height: 844}, true],
  ['android', {width: 412, height: 915}, true],
  ['laptop', {width: 1280, height: 800}, false],
  ['desktop', {width: 1440, height: 900}, false],
  ['large', {width: 1920, height: 1080}, false],
];

const issues = [];
const note = (level, msg) => {
  console.log(`${level === 'block' ? '✗' : level === 'warn' ? '!' : '✓'} ${msg}`);
  if (level === 'block') issues.push(msg);
};

const browser = await chromium.launch();

async function stubContext(ctx) {
  if (!STUB) return;
  // The storefront loads Shopify's consent API, or the banner build of it
  // when withPrivacyBanner is on. Stub both with "consent granted".
  await ctx.route('**/consent-tracking-api.js', (r) => r.fulfill({contentType: 'text/javascript', body: CONSENT_STUB}));
  await ctx.route('**/storefront-banner.js', (r) =>
    r.fulfill({
      contentType: 'text/javascript',
      body: `window.privacyBanner={loadBanner(){},showPreferences(){}};${CONSENT_STUB}`,
    }),
  );
  await ctx.route(/monorail|produce_batch/, (r) =>
    r.fulfill({status: 200, contentType: 'application/json', body: '{"result":[]}'}),
  );
  await ctx.route('**/shopify-perf-kit-spa.min.js', (r) =>
    r.fulfill({contentType: 'text/javascript', body: 'window.PerfKit={navigate(){},setPageType(){}};'}),
  );
  // Pixels: empty scripts, so fbq/gtag calls stay in their queues for reading.
  await ctx.route(/connect\.facebook\.net|googletagmanager\.com/, (r) =>
    r.fulfill({contentType: 'text/javascript', body: ''}),
  );
}

function checkJsonLd(blocks, path) {
  const problems = [];
  for (const raw of blocks) {
    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      problems.push('invalid JSON-LD');
      continue;
    }
    if (json['@type'] === 'Product') {
      if (!json.brand?.name) problems.push('Product without brand');
      for (const o of json.offers ?? []) {
        if (!o.price || !o.priceCurrency || !o.availability) problems.push('Offer missing price/currency/availability');
        if (!o.shippingDetails || !o.hasMerchantReturnPolicy) problems.push('Offer missing shipping/returns');
      }
    }
  }
  if (path.startsWith('/products/') && !blocks.some((b) => b.includes('"Product"'))) problems.push('no Product JSON-LD');
  if (/^\/collections\/[\w-]+$/.test(path) && !blocks.some((b) => b.includes('BreadcrumbList')))
    problems.push('no BreadcrumbList');
  return problems;
}

for (const [label, viewport, mobile] of VIEWPORTS) {
  const ctx = await browser.newContext({viewport, isMobile: mobile, hasTouch: mobile});
  await stubContext(ctx);
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
      if (label === 'iphone') note('ok', `[${label}] ${path} → ${status}`);
      continue;
    }
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 30));
      }
    });
    const r = await page.evaluate(() => ({
      h1: document.querySelectorAll('h1').length,
      title: document.title,
      desc: document.querySelector('meta[name=description]')?.content ?? '',
      canonical: document.querySelector('link[rel=canonical]')?.href ?? '',
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
      noAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length,
      ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
      text: document.body.innerText,
    }));
    const problems = [];
    const leak = r.text.match(FORBIDDEN);
    if (leak) problems.push(`forbidden customer-facing term "${leak[0]}"`);
    if (r.h1 !== 1) problems.push(`${r.h1} H1s`);
    if (!r.title) problems.push('no title');
    if (!r.desc) problems.push('no meta description');
    if (!r.canonical.startsWith('https://trenzora.com')) problems.push(`canonical ${r.canonical || 'missing'}`);
    if (r.overflow > 0) problems.push(`horizontal overflow ${r.overflow}px`);
    if (r.broken) problems.push(`${r.broken} broken images`);
    if (r.noAlt) problems.push(`${r.noAlt} images without alt`);
    problems.push(...checkJsonLd(r.ld, path.split('?')[0]));
    if (problems.length) note('block', `[${label}] ${path}: ${problems.join('; ')}`);
    else note('ok', `[${label}] ${path} — ${r.title}`);
    if (SHOT_PATHS.includes(path) && ['iphone', 'desktop'].includes(label)) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({path: `${SHOTS}/${label}${(path === '/' ? '_home' : path.replace(/\//g, '_'))}.png`, fullPage: true});
    }
  }

  // ---- product flow (stops at the checkout URL) ----
  await page.goto(BASE + '/products/truck-bed-tent', {waitUntil: 'networkidle'});
  const opt = page.locator('.option-btn[aria-checked="false"]:not([disabled])').first();
  if (await opt.count()) {
    await opt.click();
    await page.waitForURL(/Bed\+length|Bed%20length/);
  }
  await page.locator('.buy-row button.btn--accent').click();
  try {
    await page.waitForSelector('.drawer.is-open .cart-line', {timeout: 10000});
    note('ok', `[${label}] flow: product → variant → add to cart → cart drawer`);
    const checkout = page.locator('.drawer.is-open a.btn--accent');
    const href = await checkout.getAttribute('href');
    const host = href ? new URL(href).host : '';
    if (!href) note('block', `[${label}] flow: no checkout URL`);
    else if (EXPECT_CHECKOUT_HOST && host !== EXPECT_CHECKOUT_HOST)
      note('block', `[${label}] flow: checkout host ${host} ≠ ${EXPECT_CHECKOUT_HOST}`);
    else note('ok', `[${label}] flow: checkout URL on ${host}`);
    if (STUB && href) {
      await page.route(href.split('?')[0] + '**', (route) => route.fulfill({status: 204}));
      await checkout.click();
      await page.waitForTimeout(600);
    }
    if (label === 'iphone') await page.screenshot({path: `${SHOTS}/iphone_cart-drawer.png`});
  } catch {
    note('block', `[${label}] flow: add to cart did not open the cart`);
  }

  if (STUB) {
    const {layer, fb, ga} = await page.evaluate(() => ({
      layer: (window.dataLayer ?? []).map((e) => e && e.event).filter(Boolean),
      fb: (window.fbq?.queue ?? []).map((a) => `${a[0]}:${a[1]}`),
      ga: (window.dataLayer ?? []).filter((e) => e && e[0] === 'event').map((e) => e[1]),
    }));
    const need = (list, names, what) => {
      const missing = names.filter((n) => !list.includes(n));
      note(missing.length ? 'block' : 'ok', `[${label}] ${what}: ${[...new Set(list)].join(', ')}${missing.length ? ` — missing ${missing.join(', ')}` : ''}`);
    };
    need(layer, ['page_view', 'view_item', 'add_to_cart', 'begin_checkout'], 'dataLayer');
    need(fb, ['init:000000000000000', 'track:PageView', 'track:ViewContent', 'track:AddToCart', 'track:InitiateCheckout'], 'Meta Pixel');
    need(ga, ['page_view', 'view_item', 'add_to_cart', 'begin_checkout'], 'GA4');
  }

  // ---- bundle flow (fresh context so the cart is empty) ----
  if (label === 'iphone' || label === 'desktop') {
    const bctx = await browser.newContext({viewport, isMobile: mobile, hasTouch: mobile});
    await stubContext(bctx);
    const bp = await bctx.newPage();
    await bp.goto(BASE + '/bundles/weekend-car-camping-setup', {waitUntil: 'networkidle'});
    await bp.getByRole('button', {name: 'Add the complete setup'}).click();
    try {
      await bp.waitForFunction(() => document.querySelectorAll('.drawer.is-open .cart-line').length >= 4, null, {timeout: 10000});
      const saved = await bp.locator('.drawer.is-open .save').count();
      note('ok', `[${label}] bundle: 4 lines added${saved ? ', setup savings applied' : ''}`);
      if (label === 'iphone') await bp.screenshot({path: `${SHOTS}/iphone_bundle-cart.png`});
    } catch {
      note('block', `[${label}] bundle: setup not added to cart`);
    }
    await bctx.close();
  }

  // Legacy (uncurated) products must stay reachable but never be listed.
  if (label === 'iphone') {
    const legacy = await page.goto(BASE + '/products/legacy-garden-hose-reel');
    const listed = await (await page.request.get(BASE + '/collections/all')).text();
    note(
      legacy?.status() === 200 && !listed.includes('legacy-garden-hose-reel') ? 'ok' : 'block',
      `[${label}] legacy product: URL ${legacy?.status()}, listed=${listed.includes('legacy-garden-hose-reel')}`,
    );
  }

  if (pageErrors.length) note('block', `[${label}] JS errors: ${[...new Set(pageErrors)].slice(0, 5).join(' | ')}`);
  await ctx.close();
}

await browser.close();
console.log(`\n${issues.length ? `${issues.length} blocker(s)` : 'No blockers'} — ${BASE}`);
process.exitCode = issues.length ? 1 : 0;
/* eslint-enable no-console */
