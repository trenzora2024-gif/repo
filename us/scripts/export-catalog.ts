/**
 * Exports what the trenzora.com Shopify store needs to match the storefront:
 *
 *   node scripts/export-catalog.ts
 *
 * - catalog/collections.json   Admin API `collectionCreate` inputs: smart
 *                              collections on product tags (mission:*,
 *                              gear:*, tier:hero), with SEO.
 * - catalog/product-setup.csv  Per product: handle, tags to add, suggested
 *                              title, SEO title/description, Doba URL.
 * - catalog/bundles.md         Discount codes behind the complete setups.
 *
 * Nothing here talks to Shopify. Apply in Admin (or via the Admin API) only
 * after checking you're in the trenzora.com store.
 */
import {writeFileSync} from 'node:fs';
import {CATALOG} from '../app/data/catalog.ts';
import {BUNDLES, bundleListTotal} from '../app/data/bundles.ts';
import {GEAR, MISSIONS} from '../app/data/missions.ts';
import {CURATED_TAG} from '../app/lib/curated-tag.ts';

const out = (file: string, body: string) =>
  writeFileSync(new URL(`../catalog/${file}`, import.meta.url), body);

const smart = (handle: string, title: string, tag: string, seo: {title: string; description: string}, descriptionHtml: string) => ({
  input: {
    handle,
    title,
    descriptionHtml,
    seo,
    ruleSet: {appliedDisjunctively: false, rules: [{column: 'TAG', relation: 'EQUALS', condition: tag}]},
  },
});

const collections = [
  ...Object.values(MISSIONS).map((c) => smart(c.handle, c.title, `mission:${c.handle}`, c.seo, `<p>${c.intro}</p>`)),
  ...Object.values(GEAR).map((c) => smart(c.handle, c.title, `gear:${c.handle}`, c.seo, `<p>${c.intro}</p>`)),
  smart('trenzora-picks', 'Trenzora Picks', 'tier:hero', {title: 'Trenzora Picks', description: 'The products that solve the most camp problems.'}, '<p>Hero products.</p>'),
];
out('collections.json', JSON.stringify(collections, null, 2) + '\n');

const csv = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const rows = [
  ['rank', 'handle', 'tags_to_add', 'suggested_title', 'vendor', 'recommended_price_usd', 'seo_title', 'seo_description', 'doba_url', 'doba_listing_confirmed'],
  ...CATALOG.map((p) => [
    String(p.rank),
    p.handle,
    [CURATED_TAG, `tier:${p.tier}`, `gear:${p.gear}`, ...p.missions.map((m) => `mission:${m}`)].join(', '),
    p.title,
    p.vendor,
    p.priceUsd.toFixed(2),
    `${p.title.replace(/\s*\(.*\)$/, '')} | Trenzora`.slice(0, 70),
    `${p.outcome} ${p.whoFor}`.slice(0, 160),
    p.doba.url,
    p.doba.confirmed ? 'yes' : 'no — pick listing in Doba',
  ]),
];
out('product-setup.csv', rows.map((r) => r.map(csv).join(',')).join('\n') + '\n');

const md = [
  '# Complete setups: discount codes',
  '',
  'Bundles add every piece to the cart in one click. Savings are optional: create these codes in **Shopify Admin → Discounts → Create discount → Amount off order**, then set `PUBLIC_BUNDLE_DISCOUNTS=on` in the Hydrogen environment. Until then bundles sell at the sum of their parts (no fake savings).',
  '',
  'Settings for every code: fixed amount; **minimum purchase amount = the bundle total below** (so it can’t be used on smaller carts); one use per order; combines with nothing; no end date. The bundle button applies the code automatically — don’t publish the codes anywhere.',
  '',
  '| Setup | Code | Amount off | Minimum purchase (sum of parts) | Items |',
  '|---|---|---|---|---|',
  ...BUNDLES.map(
    (b) =>
      `| ${b.title} | \`${b.discountCode}\` | $${b.savingsUsd} | $${bundleListTotal(b)} | ${b.items.map((i) => `${i.quantity}× ${i.handle}`).join(', ')} |`,
  ),
  '',
  'If you change a product price, re-run `npm run catalog:export` and update the minimums.',
  '',
];
out('bundles.md', md.join('\n'));
// eslint-disable-next-line no-console
console.log(`catalog: ${collections.length} collections, ${CATALOG.length} products, ${BUNDLES.length} bundles → catalog/`);
