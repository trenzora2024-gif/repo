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
import {CATALOGUE, COLLECTIONS} from '../app/data/catalogue/index.ts';
import {SUPPLIERS} from '../app/data/catalogue/suppliers.ts';

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

// Shopify product CSV (one row per variant; product fields on first row).
const productRows = CATALOGUE.flatMap((product) =>
  product.variants.map((variant, index) => {
    const first = index === 0;
    return {
      Handle: product.handle,
      Title: first ? product.title : '',
      'Body (HTML)': first ? product.descriptionHtml : '',
      Vendor: first ? product.vendor : '',
      Type: first ? product.type.shopifyProductType : '',
      Tags: first ? product.tags.join(', ') : '',
      Published: first ? 'TRUE' : '',
      'Option1 Name': first ? (variant.option?.name ?? 'Title') : '',
      'Option1 Value': variant.option?.value ?? 'Default Title',
      'Variant SKU': variant.sku,
      'Variant Grams': product.type.weightGrams,
      'Variant Inventory Policy': 'continue',
      'Variant Fulfillment Service': 'manual',
      'Variant Price': variant.priceInr.toFixed(2),
      'Variant Compare At Price': '',
      'Variant Requires Shipping': 'TRUE',
      'Variant Taxable': 'TRUE',
      'Image Alt Text': first ? product.imageAlt : '',
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
    'Design family': product.family.name,
    'Product type': product.type.name,
    Supplier: SUPPLIERS[product.supplier].name,
    'Production master': product.family.artworkFile,
    'Supplier product ref': '', // fill after supplier product is created
    'Retail price (INR)': variant.priceInr,
    'Personalization planned': product.family.personalization.planned,
  })),
);

const collectionsMd = [
  '# Shopify collections (launch)',
  '',
  'Create these as **smart collections** in Shopify Admin so products join automatically via tags.',
  '',
  '| Handle | Title | Rule | Products |',
  '| --- | --- | --- | --- |',
  ...Object.entries(COLLECTIONS).map(([handle, c]) => {
    const count = CATALOGUE.filter((p) =>
      p.collections.includes(handle as keyof typeof COLLECTIONS),
    ).length;
    return `| \`${handle}\` | ${c.title} | ${c.rule} | ${count} |`;
  }),
  '',
  'Collection descriptions (paste into Shopify):',
  '',
  ...Object.entries(COLLECTIONS).map(
    ([handle, c]) => `- **${handle}** — ${c.description}`,
  ),
  '',
].join('\n');

writeFileSync(join(outDir, 'shopify-products.csv'), toCsv(productRows));
writeFileSync(join(outDir, 'supplier-map.csv'), toCsv(supplierRows));
writeFileSync(join(outDir, 'collections.md'), collectionsMd);

// eslint-disable-next-line no-console
console.log(
  `Exported ${CATALOGUE.length} products / ${productRows.length} variants to catalogue/`,
);
