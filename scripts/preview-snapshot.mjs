// Builds a single self-contained, shareable preview of the storefront from the
// running mock build (npm run dev:mock). DEV ONLY — mock catalogue, no Shopify.
//
//   BASE_URL=http://localhost:3000 OUT=.preview/trenzora-preview.html \
//     node scripts/preview-snapshot.mjs
//
// Every route is rendered by the real app and captured after hydration. A small
// vanilla-JS shim (scripts/preview-shim.js) then provides hash routing, drawers,
// an in-browser cart, search, sort and the size picker, so the page works on a
// phone without a server. Checkout is a hand-off notice: real checkout is
// Shopify's and only exists once a store is connected.
import {createRequire} from 'node:module';
import {execSync} from 'node:child_process';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT = process.env.OUT ?? '.preview/trenzora-preview.html';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({chromium} = require('playwright'));
} catch {
  const globalRoot = execSync('npm root -g').toString().trim();
  ({chromium} = require(join(globalRoot, 'playwright')));
}

const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1280, height: 900}});

async function load(path) {
  const res = await page.goto(BASE + path, {waitUntil: 'networkidle'});
  if (!res || res.status() >= 400)
    throw new Error(`${path} → ${res?.status()}`);
  await page.waitForTimeout(150);
}

const mainHtml = () => page.$eval('main', (el) => el.innerHTML);
const pathsFrom = (selector) =>
  page.$$eval(selector, (as) => [
    ...new Set(as.map((a) => new URL(a.href).pathname)),
  ]);

/* ------------------------------------------------------------ chrome + home */
await load('/');
const chrome = await page.evaluate(() => {
  const html = (sel) => document.querySelector(sel)?.outerHTML ?? '';
  return {
    header: html('.site-header'),
    footer: html('.site-footer'),
    drawers: [...document.querySelectorAll('.drawer')].map((d) => d.outerHTML),
    title: document.title,
  };
});
const pages = {'/': {html: await mainHtml(), title: chrome.title}};

// "One design, your way": capture each family's tee/tote/tumbler set.
const designWay = {};
for (const chip of await page.$$('.design-switch .chip')) {
  await chip.click();
  await page.waitForTimeout(60);
  const label = (await chip.textContent()).trim();
  designWay[label] = await page.$eval(
    '.design-switch',
    (el) =>
      el.parentElement.querySelector('.way').outerHTML +
      el.parentElement.querySelector('.way-foot').outerHTML,
  );
}

/* --------------------------------------------------------------- crawling */
const queue = [
  '/collections/all',
  '/collections/mumbai-made',
  '/collections/drops',
  '/collections/gifts',
  '/collections/trending',
  '/about',
  '/shipping',
  '/contact',
  '/personalize',
  '/cart',
  '/search',
  '/policies',
  '/this-page-does-not-exist',
];
const allowed =
  /^\/(collections\/[\w-]+|products\/[\w-]+|designs\/[\w-]+|policies(\/[\w-]+)?|about|shipping|contact|personalize)$/;
for (const p of await pathsFrom(
  'main a[href^="/"], .site-footer a[href^="/"]',
)) {
  if (allowed.test(p) && !queue.includes(p)) queue.push(p);
}

const products = {};
const cards = {};
const collections = {};

while (queue.length) {
  const path = queue.shift();
  if (pages[path]) continue;
  try {
    if (path === '/this-page-does-not-exist') {
      await page.goto(BASE + path, {waitUntil: 'networkidle'});
    } else {
      await load(path);
    }
  } catch (error) {
    console.warn(`skip ${path}: ${error.message}`);
    continue;
  }
  const finalPath = new URL(page.url()).pathname;
  if (finalPath !== path) {
    pages[path] = {redirect: finalPath};
    if (!pages[finalPath] && !queue.includes(finalPath))
      queue.unshift(finalPath);
    continue;
  }
  const key = path === '/this-page-does-not-exist' ? '404' : path;
  pages[key] = {html: await mainHtml(), title: await page.title()};

  for (const p of await pathsFrom('main a[href^="/"]')) {
    if (allowed.test(p) && !pages[p] && !queue.includes(p)) queue.push(p);
  }

  if (path.startsWith('/collections/')) {
    const found = await page.$$eval('.product-card', (els) =>
      els.map((el) => {
        const a = el.querySelector('a[href*="/products/"]') ?? el.closest('a');
        return {
          handle: new URL(a.href).pathname.split('/').pop(),
          html: el.outerHTML,
        };
      }),
    );
    collections[path.split('/').pop()] = found.map((c) => c.handle);
    for (const c of found) cards[c.handle] ??= c.html;
  }

  if (path.startsWith('/products/')) {
    const handle = path.split('/').pop();
    products[handle] = await page.evaluate(() => {
      const text = (sel) =>
        document.querySelector(sel)?.textContent?.trim() ?? '';
      const price = text('.pdp__price');
      return {
        title: text('h1'),
        price: Number(price.replace(/[^\d.]/g, '')) || 0,
        priceText: price,
        media: document.querySelector('.pdp__gallery .media')?.outerHTML ?? '',
        sizes: [...document.querySelectorAll('.option-grid .option-btn')].map(
          (b) => b.textContent.trim(),
        ),
        selected:
          document
            .querySelector('.option-btn[aria-checked="true"]')
            ?.textContent?.trim() ?? null,
        story: text('.pdp__story'),
        canAdd: Boolean(document.querySelector('.atc button')),
      };
    });
  }
}

await browser.close();

/* --------------------------------------------------- dedupe inline images */
const assets = new Set();
const images = [];
const imageIndex = new Map();
const dedupe = (html) =>
  html
    // Dev-server prefetch/module tags are meaningless outside the app.
    .replace(/<link\b[^>]*>/g, '')
    .replace(/<script\b[\s\S]*?<\/script>/g, '')
    // Site images → files published next to the page (see files.json).
    .replace(/\s(?:srcset|srcSet)="[^"]*"/g, '')
    .replace(
      /(?:https?:\/\/localhost:\d+)?\/(visuals\/[\w./-]+?\.webp)(?:\?[^"]*)?"/g,
      (_, file) => {
        assets.add(file);
        return `${file}"`;
      },
    )
    .replace(/src="(data:[^"]+)"/g, (_, uri) => {
      if (!imageIndex.has(uri)) {
        imageIndex.set(uri, images.length);
        images.push(uri);
      }
      return `data-img="${imageIndex.get(uri)}"`;
    });

for (const value of Object.values(pages))
  if (value.html) value.html = dedupe(value.html);
for (const key of Object.keys(cards)) cards[key] = dedupe(cards[key]);
for (const key of Object.keys(designWay))
  designWay[key] = dedupe(designWay[key]);
for (const p of Object.values(products)) p.media = dedupe(p.media);
chrome.header = dedupe(chrome.header);
chrome.footer = dedupe(chrome.footer);
chrome.drawers = chrome.drawers.map(dedupe);

/* ------------------------------------------------------- styles + fonts */
const css = (file) => readFileSync(file, 'utf8');
const b64 = (file) => readFileSync(file).toString('base64');
const fontDir = 'node_modules/@fontsource-variable/bricolage-grotesque/files';
const serifDir = 'node_modules/@fontsource/instrument-serif/files';
const fonts = `
@font-face{font-family:'Bricolage Grotesque Variable';font-style:normal;font-display:swap;font-weight:200 800;
src:url(data:font/woff2;base64,${b64(`${fontDir}/bricolage-grotesque-latin-wght-normal.woff2`)}) format('woff2-variations');}
@font-face{font-family:'Instrument Serif';font-style:italic;font-display:swap;font-weight:400;
src:url(data:font/woff2;base64,${b64(`${serifDir}/instrument-serif-latin-400-italic.woff2`)}) format('woff2');}`;

const styles = [
  css('app/styles/reset.css'),
  css('app/styles/tokens.css'),
  fonts,
  css('app/styles/app.css'),
  css('scripts/preview-shim.css'),
].join('\n');

const data = {
  builtAt: new Date().toISOString(),
  pages,
  products,
  cards,
  collections,
  designWay,
  images,
};

const html = `<title>Trenzora Storefront Preview</title>
<meta name="theme-color" content="#fbf6ee">
<style>${styles}</style>
<div class="preview-ribbon" role="note">Preview · mock catalogue · prices provisional · checkout not connected</div>
<div id="app">
<a href="#main" class="skip-link">Skip to content</a>
${chrome.header}
<main id="main" tabindex="-1"></main>
${chrome.footer}
${chrome.drawers.join('\n')}
</div>
<script>window.__PREVIEW__=${JSON.stringify(data).replace(/</g, '\\u003c')};</script>
<script>${readFileSync('scripts/preview-shim.js', 'utf8')}</script>
`;

mkdirSync(dirname(OUT), {recursive: true});
writeFileSync(OUT, html);
// Supporting files for the Artifact publish: {"visuals/x.webp": "public/visuals/x.webp"}
writeFileSync(
  join(dirname(OUT), 'files.json'),
  JSON.stringify(
    Object.fromEntries([...assets].sort().map((f) => [f, `public/${f}`])),
    null,
    2,
  ),
);
// eslint-disable-next-line no-console
console.log(
  `Wrote ${OUT} (${(html.length / 1024).toFixed(0)} KB): ${Object.keys(pages).length} pages, ${Object.keys(products).length} products, ${images.length} inline images, ${assets.size} image files`,
);
