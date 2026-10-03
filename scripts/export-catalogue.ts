/**
 * Generates Shopify-ready catalogue files from app/data/catalogue:
 *
 *   catalogue/shopify-products.csv   Shopify Admin → Products → Import
 *   catalogue/supplier-map.csv       SKU → supplier → production master
 *   catalogue/collections.md         Smart-collection rules to create
 *
 * Run: npm run catalogue:export
 */
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  CATALOGUE,
  COLLECTIONS,
  DESIGN_FAMILIES,
  LAUNCH_CATALOGUE,
  LAUNCH_COLLECTIONS,
  TAG,
} from '../app/data/catalogue/index.ts';
import {
  ARTWORK_REVISIONS,
  SUPPLIERS,
  SUPPLIER_BY_PRODUCT_TYPE,
} from '../ops/suppliers.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'catalogue');
mkdirSync(outDir, {recursive: true});

function csvCell(value: string | number | boolean | undefined) {
  const text = value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(
  rows: Array<Record<string, string | number | boolean | undefined>>,
) {
  const headers = Object.keys(rows[0]);
  return (
    [
      headers.join(','),
      ...rows.map((row) => headers.map((h) => csvCell(row[h])).join(',')),
    ].join('\n') + '\n'
  );
}

// Shopify product CSV — V1 launch catalogue ONLY (24 products). V2 designs
// (Us, Make It Yours) are never exported for import.
const productRows = LAUNCH_CATALOGUE.flatMap((product) =>
  product.variants.map((variant, index) => {
    const first = index === 0;
    return {
      Handle: product.handle,
      Title: first ? product.title : '',
      'Body (HTML)': first ? product.descriptionHtml : '',
      Vendor: first ? product.vendor : '',
      Type: first ? product.type.shopifyProductType : '',
      Tags: first ? product.tags.join(', ') : '',
      // Not published to any sales channel on import (launch gate).
      Published: first ? 'FALSE' : '',
      'Option1 Name': first ? (variant.option?.name ?? 'Title') : '',
      'Option1 Value': variant.option?.value ?? 'Default Title',
      'Variant SKU': variant.sku,
      'Variant Grams': product.type.weightGrams,
      // POD: inventory not tracked by Shopify; never blocks a sale.
      'Variant Inventory Tracker': '',
      'Variant Inventory Policy': 'continue',
      'Variant Fulfillment Service': 'manual',
      'Variant Price': variant.priceInr.toFixed(2),
      'Variant Compare At Price': '',
      'Variant Requires Shipping': 'TRUE',
      'Variant Taxable': 'TRUE',
      'SEO Title': first ? product.seo.title : '',
      'SEO Description': first ? product.seo.description : '',
      Status: first ? 'draft' : '',
    };
  }),
);

const supplierRows = CATALOGUE.flatMap((product) =>
  product.variants.map((variant) => ({
    SKU: variant.sku,
    Handle: product.handle,
    Title: product.title,
    Variant: variant.option?.value ?? '',
    Release:
      product.family.release === 'v1' ? 'V1 launch' : 'V2 — not for sale',
    'Design family': product.family.name,
    'Product type': product.type.name,
    Supplier: SUPPLIERS[SUPPLIER_BY_PRODUCT_TYPE[product.type.handle]].name,
    'Production master': product.family.artworkFile,
    'Artwork text (launch)': product.family.artworkText,
    'Artwork revision required': ARTWORK_REVISIONS[product.family.handle] ?? '',
    'Supplier product ref': '', // fill after supplier product is created
    'Image alt text (use on upload)': product.imageAlt,
    'Retail price (INR)': variant.priceInr,
    'Personalization planned': product.family.personalization.planned,
  })),
);

const collectionsMd = [
  '# Shopify collections (V1 launch)',
  '',
  'Create the V1 collections as **smart collections** in Shopify Admin so products join automatically via tags. Counts are V1 launch products only.',
  '',
  '| Handle | Title | Rule | V1 products | Release |',
  '| --- | --- | --- | --- | --- |',
  ...Object.entries(COLLECTIONS).map(([handle, c]) => {
    const count = LAUNCH_CATALOGUE.filter((p) =>
      p.collections.includes(handle as keyof typeof COLLECTIONS),
    ).length;
    const release =
      handle === 'all'
        ? 'V1: built in (do not create)'
        : c.release === 'v1'
          ? 'V1: create'
          : 'V2: do not create in V1';
    return `| \`${handle}\` | ${c.title} | ${c.rule} | ${count} | ${release} |`;
  }),
  '',
  'Collection descriptions (paste into Shopify):',
  '',
  ...LAUNCH_COLLECTIONS.map(
    (handle) => `- **${handle}** — ${COLLECTIONS[handle].description}`,
  ),
  '',
].join('\n');

// Shopify Customer Events custom pixel (Settings → Customer events → Add
// custom pixel). Runs inside Shopify checkout, where Hydrogen can't, and emits
// the `purchase` event with the same names/params as app/lib/analytics.ts.
const familyByCode = Object.fromEntries(
  DESIGN_FAMILIES.map((family) => [family.code, family.handle]),
);
const pixel = `/* global analytics */
// Trenzora — Shopify custom pixel. GENERATED by npm run catalogue:export.
// Paste into Shopify Admin → Settings → Customer events → Add custom pixel.
// Vendor-neutral: pushes GA4-shaped events to the pixel's dataLayer. To
// forward them, set GTM_ID (Google Tag Manager) or add your tool below.
const GTM_ID = ''; // e.g. 'GTM-XXXXXXX' — leave empty until analytics is chosen
const FAMILY_BY_SKU_CODE = ${JSON.stringify(familyByCode)};

window.dataLayer = window.dataLayer || [];
if (GTM_ID) {
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
  document.head.appendChild(s);
  window.dataLayer.push({'gtm.start': Date.now(), event: 'gtm.js'});
}

function familyFromSku(sku) {
  const code = (sku || '').split('-')[1];
  return FAMILY_BY_SKU_CODE[code];
}

function items(checkout) {
  return (checkout.lineItems || []).map((line) => ({
    item_id: (line.variant && line.variant.sku) || (line.variant && line.variant.id),
    item_name: line.title,
    item_variant: line.variant && line.variant.title,
    design_family: familyFromSku(line.variant && line.variant.sku),
    personalized: (line.properties || []).some((p) => p.key && p.key[0] !== '_' && p.value),
    price: Number(line.variant && line.variant.price && line.variant.price.amount),
    quantity: line.quantity,
  }));
}

analytics.subscribe('checkout_completed', (event) => {
  const checkout = event.data.checkout;
  const lineItems = items(checkout);
  window.dataLayer.push({ecommerce: null});
  window.dataLayer.push({
    event: 'purchase',
    personalized_order: lineItems.some((item) => item.personalized),
    ecommerce: {
      transaction_id: checkout.order && checkout.order.id,
      currency: checkout.currencyCode,
      value: Number(checkout.totalPrice && checkout.totalPrice.amount),
      tax: Number(checkout.totalTax && checkout.totalTax.amount),
      shipping: Number(checkout.shippingLine && checkout.shippingLine.price && checkout.shippingLine.price.amount),
      items: lineItems,
    },
  });
});
`;

// Inputs for catalogue/admin/collection-create.graphql (step E).
const collectionInputs = LAUNCH_COLLECTIONS.filter((handle) => handle !== 'all')
  .map((handle) => [handle, COLLECTIONS[handle]] as const)
  .map(([handle, c]) => ({
    input: {
      title: c.title,
      handle,
      descriptionHtml: `<p>${c.description}</p>`,
      seo: {title: `${c.title} | Trenzora`, description: c.description},
      ruleSet: {
        appliedDisjunctively: false,
        rules: [
          {
            column: 'TAG',
            relation: 'EQUALS',
            condition: TAG.collection(handle),
          },
        ],
      },
    },
  }));
mkdirSync(join(outDir, 'admin'), {recursive: true});
writeFileSync(
  join(outDir, 'admin', 'collections.variables.json'),
  JSON.stringify(collectionInputs, null, 2) + '\n',
);

writeFileSync(join(outDir, 'shopify-custom-pixel.js'), pixel);
writeFileSync(join(outDir, 'shopify-products.csv'), toCsv(productRows));
writeFileSync(join(outDir, 'supplier-map.csv'), toCsv(supplierRows));
writeFileSync(join(outDir, 'collections.md'), collectionsMd);

// eslint-disable-next-line no-console
console.log(
  `Exported ${LAUNCH_CATALOGUE.length} V1 products / ${productRows.length} variants for import (${CATALOGUE.length - LAUNCH_CATALOGUE.length} V2 design records excluded) to catalogue/`,
);
