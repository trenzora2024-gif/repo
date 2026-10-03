// V1 launch audit (offline, read-only). npm run launch:audit
//
// Checks the 24 V1 products / 56 variants and 4 collections exactly as they
// will be imported, the V2 exclusion, SEO fields, the exported CSV, artwork
// mapping and the MaternEase isolation. Writes:
//   catalogue/launch-audit.md            pass/fail report
//   catalogue/image-replacement-map.csv  every temporary image + what replaces it
// Exit code 1 if any check fails.
import {execSync} from 'node:child_process';
import {existsSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';

import {
  CATALOGUE,
  COLLECTIONS,
  DESIGN_FAMILIES,
  LAUNCH_CATALOGUE,
  LAUNCH_COLLECTIONS,
  LAUNCH_FAMILIES,
  PRODUCT_TYPES,
  TAG,
} from '../app/data/catalogue/index.ts';
import {RETAIL_PRICE_INR} from '../app/data/catalogue/pricing.ts';
import {SUPPLIERS, SUPPLIER_BY_PRODUCT_TYPE} from '../ops/suppliers.ts';
import {SUPPLIER_TEMPLATES} from '../ops/supplier-templates.ts';

type Row = {area: string; ok: boolean; detail: string};
const rows: Row[] = [];
const check = (area: string, ok: boolean, detail: string) =>
  rows.push({area, ok, detail});

/* ------------------------------------------------------------ products */
const EXPECTED = {products: 24, variants: 56};
const variants = LAUNCH_CATALOGUE.flatMap((p) => p.variants);
check(
  'catalogue',
  LAUNCH_CATALOGUE.length === EXPECTED.products,
  `${LAUNCH_CATALOGUE.length} V1 products (expected ${EXPECTED.products}): ${LAUNCH_FAMILIES.length} families × ${PRODUCT_TYPES.length} types`,
);
check(
  'catalogue',
  variants.length === EXPECTED.variants,
  `${variants.length} V1 variants (expected ${EXPECTED.variants}: 8 tees × 5 sizes + 16 single-variant totes/tumblers)`,
);

const skus = variants.map((v) => v.sku);
const dupSkus = skus.filter((s, i) => skus.indexOf(s) !== i);
check(
  'sku',
  !dupSkus.length,
  dupSkus.length
    ? `duplicate SKUs: ${dupSkus.join(', ')}`
    : 'all 56 SKUs unique',
);
const badSku = skus.filter(
  (s) => !/^TRZ-[A-Z]{3}-(TEE-(S|M|L|XL|XXL)|TOT|TMB)$/.test(s),
);
check(
  'sku',
  !badSku.length,
  badSku.length
    ? `bad SKU format: ${badSku.join(', ')}`
    : 'SKU format TRZ-{DESIGN}-{TYPE}[-{SIZE}]',
);

const handles = LAUNCH_CATALOGUE.map((p) => p.handle);
check('handles', new Set(handles).size === handles.length, 'handles unique');

for (const p of LAUNCH_CATALOGUE) {
  const where = p.handle;
  const problems: string[] = [];
  if (p.title !== `${p.family.name} — ${p.type.name}`)
    problems.push(`title "${p.title}"`);
  if (p.handle !== `${p.family.handle}-${p.type.handle}`)
    problems.push('handle convention');
  if (p.priceInr !== RETAIL_PRICE_INR[p.type.handle])
    problems.push(`price ₹${p.priceInr} ≠ pricing.ts`);
  if (p.variants.some((v) => v.priceInr !== p.priceInr))
    problems.push('variant price mismatch');
  const sizes = p.variants.map((v) => v.option?.value).filter(Boolean);
  if (p.type.handle === 'oversized-tee' && sizes.join(',') !== 'S,M,L,XL,XXL')
    problems.push(`sizes ${sizes.join(',')}`);
  if (p.type.handle !== 'oversized-tee' && p.variants.length !== 1)
    problems.push('expected single variant');
  for (const tag of [
    TAG.design(p.family.handle),
    TAG.type(p.type.handle),
    TAG.drop('01'),
  ])
    if (!p.tags.includes(tag)) problems.push(`missing tag ${tag}`);
  for (const c of p.family.collections)
    if (!p.tags.includes(TAG.collection(c)))
      problems.push(`missing col tag ${c}`);
  if (p.tags.includes('personalizable'))
    problems.push('V1 product tagged personalizable');
  if (p.family.personalization.enabled)
    problems.push('personalization enabled');
  if (p.seo.title.length > 70)
    problems.push(`SEO title ${p.seo.title.length} chars`);
  if (p.seo.description.length < 70 || p.seo.description.length > 160)
    problems.push(`SEO description ${p.seo.description.length} chars`);
  if (!p.descriptionHtml.includes('<p>')) problems.push('empty description');
  if (
    /printrove|qikink|vistaprint|kraftix|bruno/i.test(
      p.descriptionHtml + p.title + p.seo.description + p.imageAlt,
    )
  )
    problems.push('supplier name in customer copy');
  if (!p.imageAlt) problems.push('no image alt');
  check(
    'product',
    !problems.length,
    problems.length
      ? `${where}: ${problems.join('; ')}`
      : `${where}: title, handle, ₹${p.priceInr}, ${p.variants.length} variant(s), tags, SEO`,
  );
}

/* --------------------------------------------------------------- V2 */
const v2 = CATALOGUE.filter((p) => p.family.release !== 'v1');
check(
  'v2',
  v2.length === 6 && v2.every((p) => !LAUNCH_CATALOGUE.includes(p)),
  `${v2.length} V2 records (Us, Make It Yours) excluded from the launch catalogue`,
);
check(
  'v2',
  DESIGN_FAMILIES.filter((f) => f.release === 'v2').every(
    (f) => !f.personalization.enabled,
  ),
  'V2 personalization disabled',
);

/* --------------------------------------------------------- collections */
const EXPECTED_COLLECTIONS: Record<string, {title: string; count: number}> = {
  'mumbai-made': {title: 'Mumbai Made', count: 12},
  drops: {title: 'Drops', count: 24},
  gifts: {title: 'Gifts', count: 18},
  trending: {title: 'The Edit', count: 12},
};
const created = LAUNCH_COLLECTIONS.filter((h) => h !== 'all');
check(
  'collections',
  created.join(',') === Object.keys(EXPECTED_COLLECTIONS).join(','),
  `V1 collections to create: ${created.join(', ')}`,
);
for (const [handle, exp] of Object.entries(EXPECTED_COLLECTIONS)) {
  const members = LAUNCH_CATALOGUE.filter((p) =>
    p.collections.includes(handle as never),
  );
  const c = COLLECTIONS[handle as keyof typeof COLLECTIONS];
  check(
    'collections',
    c.title === exp.title && members.length === exp.count,
    `${handle} "${c.title}": ${members.length} products (expected ${exp.count}), rule tag = ${TAG.collection(handle as never)}`,
  );
}
check(
  'collections',
  COLLECTIONS.personalize.release === 'v2',
  'personalize collection is V2 (not created)',
);

/* ------------------------------------------------------- export files */
const csv = existsSync('catalogue/shopify-products.csv')
  ? readFileSync('catalogue/shopify-products.csv', 'utf8')
  : '';
const csvLines = csv.trim().split(/\r?\n/).slice(1);
check(
  'export',
  csvLines.length === EXPECTED.variants,
  `shopify-products.csv: ${csvLines.length} variant rows (expected ${EXPECTED.variants})`,
);
check(
  'export',
  !/\bus-|make-it-yours-/.test(csv),
  'CSV contains no V2 handles',
);
check(
  'export',
  (csv.match(/,draft$/gm) ?? []).length === EXPECTED.products,
  `CSV: ${(csv.match(/,draft$/gm) ?? []).length} products with Status=draft`,
);
check('export', !/printrove|qikink/i.test(csv), 'CSV has no supplier names');

/* -------------------------------------------------------------- artwork */
const manifest: {file: string; sha256: string}[] = existsSync(
  'catalogue/artwork-manifest.json',
)
  ? (JSON.parse(readFileSync('catalogue/artwork-manifest.json', 'utf8')) as {
      file: string;
      sha256: string;
    }[])
  : [];
for (const f of LAUNCH_FAMILIES) {
  const m = manifest.find((x) => x.file === f.artworkFile);
  check(
    'artwork',
    Boolean(m),
    `${f.artworkFile} → ${f.name} ×3 ${m ? `(sha ${m.sha256.slice(0, 12)}…)` : 'MISSING from manifest'}`,
  );
}

/* ---------------------------------------------------- MaternEase isolation */
const tracked = execSync('git ls-files', {encoding: 'utf8'}).trim().split('\n');
const mentions = tracked.filter((file) => {
  if (/\.(webp|png|jpg|woff2?)$/.test(file)) return false;
  return /maternease/i.test(readFileSync(file, 'utf8'));
});
const allowed =
  /^(app\/lib\/store-guard\.ts|catalogue\/admin\/|scripts\/(verify-store|launch-audit)\.ts|docs\/|LAUNCH-BLOCKERS\.md|README\.md|catalogue\/launch-audit\.md)/;
const unexpected = mentions.filter((f) => !allowed.test(f));
check(
  'maternease',
  !unexpected.length,
  unexpected.length
    ? `unexpected references: ${unexpected.join(', ')}`
    : `referenced only as a block-list/guard (${mentions.join(', ')})`,
);
const envFiles = readdirSync('.').filter((f) => f.startsWith('.env'));
const envLeak = envFiles.filter((f) =>
  /maternease/i.test(readFileSync(f, 'utf8')),
);
check(
  'maternease',
  !envLeak.length,
  `env files (${envFiles.join(', ')}) contain no MaternEase domain or token`,
);
check('maternease', !tracked.includes('.env'), '.env is not committed');
const guard = readFileSync('app/lib/store-guard.ts', 'utf8');
check(
  'maternease',
  /maternease/i.test(guard),
  'runtime store guard blocks MaternEase domains',
);

/* ------------------------------------------------ image replacement map */
const productShots = [
  [
    '01-studio',
    'Main product image: front, on the confirmed blank',
    'Supplier designer mockup (front)',
    'P0 — before launch',
  ],
  [
    '02-detail',
    'Print close-up showing fabric/material',
    'Supplier close-up mockup or sample photo',
    'P1 — before launch if available',
  ],
  [
    '03-editorial',
    'Styled image on the family colour',
    'Sample photography (flat-lay / styled)',
    'P2 — after launch',
  ],
] as const;
const map: string[][] = [
  [
    'Asset',
    'Kind',
    'Used on',
    'Product handle',
    'SKUs',
    'Product type',
    'Supplier',
    'Supplier blank',
    'Current source',
    'Replace with',
    'Source needed',
    'Priority',
    'Status',
  ],
];
for (const p of LAUNCH_CATALOGUE) {
  const supplier = SUPPLIERS[SUPPLIER_BY_PRODUCT_TYPE[p.type.handle]].name;
  const blank = SUPPLIER_TEMPLATES[p.type.handle].blankName ?? 'TO CONFIRM';
  for (const [file, use, source, priority] of productShots) {
    map.push([
      `mock-assets/visuals/products/${p.handle}/${file}.webp`,
      'product image',
      `Shopify product media #${file.slice(0, 2)}`,
      p.handle,
      p.variants.map((v) => v.sku).join(' '),
      p.type.name,
      supplier,
      blank,
      'studio render (temporary, mock only)',
      use,
      source,
      priority,
      'open',
    ]);
  }
}
const editorial = [
  [
    'hero-portrait.webp',
    'Homepage hero, About hero',
    'Drop 01 campaign photo: Mumbai Made tee + tote + tumbler, 4:5',
  ],
  [
    'hero-wide.webp',
    'Mumbai Made collection banner',
    'Drop 01 campaign photo, 16:9',
  ],
  [
    'drop01-detail.webp',
    'Homepage Drop 01 band, Drops banner',
    'Macro photo of the Mumbai Made print on the real tee, 16:9',
  ],
  ...LAUNCH_FAMILIES.map((f) => [
    `${f.handle}-set.webp`,
    `Homepage personality card, /designs/${f.handle} hero`,
    `${f.name} styled set (tee + tote + tumbler) on ${f.palette.bg}, 4:5`,
  ]),
];
for (const [file, used, replace] of editorial) {
  map.push([
    `public/visuals/editorial/${file}`,
    'editorial',
    used,
    '',
    '',
    '',
    '',
    '',
    'studio render (ships with the site)',
    replace,
    'Photo shoot with supplier samples',
    'P1 — launch decision (see LAUNCH-BLOCKERS.md)',
    'open',
  ]);
}
const cell = (v: string) =>
  /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
writeFileSync(
  'catalogue/image-replacement-map.csv',
  map.map((r) => r.map(cell).join(',')).join('\n') + '\n',
);
check(
  'images',
  true,
  `image-replacement-map.csv: ${LAUNCH_CATALOGUE.length * 3} product images + ${editorial.length} editorial images to replace`,
);

/* -------------------------------------------------------------- report */
const failed = rows.filter((r) => !r.ok);
const md = [
  '# V1 launch audit',
  '',
  `Generated by \`npm run launch:audit\`. ${rows.length - failed.length}/${rows.length} checks pass.`,
  '',
  '| Area | Result | Detail |',
  '| --- | --- | --- |',
  ...rows.map(
    (r) =>
      `| ${r.area} | ${r.ok ? '✓' : '✗'} | ${r.detail.replace(/\|/g, '\\|')} |`,
  ),
  '',
];
writeFileSync('catalogue/launch-audit.md', md.join('\n'));
// eslint-disable-next-line no-console
console.log(
  [
    ...failed.map((r) => `✗ [${r.area}] ${r.detail}`),
    `${rows.length - failed.length}/${rows.length} checks pass → catalogue/launch-audit.md, catalogue/image-replacement-map.csv`,
  ].join('\n'),
);
if (failed.length) process.exitCode = 1;
