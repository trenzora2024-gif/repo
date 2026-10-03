// Contribution per unit, from verified inputs only.
//   npm run costs:check
//
// Two inputs, kept apart on purpose:
//   ops/landed-cost.csv     SUPPLIER pricing, only from the supplier's own
//                           page, dashboard, invoice or written reply.
//   ops/business-inputs.csv OWNER inputs per product type: input tax credit,
//                           output GST (from official GST sources) and the
//                           payment gateway's rate card.
// Retail prices come from app/data/catalogue/pricing.ts and are GST
// INCLUSIVE: taxable value = price ÷ (1 + output GST), never price + GST.
// Any blank input means no figures for that row: nothing is estimated or
// defaulted. A value confirmed to be zero is entered as 0.
// Writes catalogue/landed-cost-report.md.
import {readFileSync, writeFileSync} from 'node:fs';
import {
  PRICE_OVERRIDES_INR,
  RETAIL_PRICE_INR,
} from '../app/data/catalogue/pricing.ts';
import type {ProductTypeHandle} from '../app/data/catalogue/types.ts';

const SUPPLIER_INPUT = 'ops/landed-cost.csv';
const BUSINESS_INPUT = 'ops/business-inputs.csv';
const REPORT = 'catalogue/landed-cost-report.md';
const TARGET_MARGINS = [0.5, 0.55, 0.6];

const SUPPLIER_NUMERIC = [
  'product_cost_inr',
  'print_cost_inr',
  'supplier_gst_pct',
  'shipping_inr',
  'shipping_gst_pct',
  'cod_fee_inr',
  'cod_fee_gst_pct',
  'rto_charge_inr',
] as const;
const SUPPLIER_TEXT = ['source', 'quote_date'] as const;
const BUSINESS_NUMERIC = [
  'output_gst_pct',
  'gateway_fee_pct',
  'gateway_fixed_inr',
  'gateway_fee_gst_pct',
] as const;
const BUSINESS_TEXT = ['itc_source', 'gst_source', 'gateway_source'] as const;

type Row = Record<string, string>;
type Num = Record<
  (typeof SUPPLIER_NUMERIC)[number] | (typeof BUSINESS_NUMERIC)[number],
  number
>;

function parseCsv(path: string): Row[] {
  const [header, ...lines] = readFileSync(path, 'utf8').trim().split(/\r?\n/);
  const keys = header.split(',');
  return lines
    .filter((line) => line.trim() && !line.startsWith('#'))
    .map((line) => {
      const cells = line.split(',');
      return Object.fromEntries(
        keys.map((k, i) => [k, (cells[i] ?? '').trim()]),
      );
    });
}

const yes = (v: string) => /^(y|yes|true|1)$/i.test(v);
const isBool = (v: string) => /^(y|yes|true|1|n|no|false|0)$/i.test(v);
const isNum = (v: string | undefined) =>
  v !== undefined && v !== '' && !Number.isNaN(Number(v));
const inr = (n: number) =>
  `₹${n.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

/**
 * Output GST rate for a GST-inclusive price. With a threshold (apparel), the
 * lower rate applies while the taxable value at that rate stays at or below
 * the threshold.
 */
function outputGstRate(
  retail: number,
  low: number,
  threshold: number | null,
  high: number | null,
) {
  if (threshold == null || high == null) return low;
  return retail / (1 + low / 100) <= threshold ? low : high;
}

/** A supplier charge as {ex GST, GST} from the quoted amount. */
function charge(amount: number, gstPct: number, quotedInclGst: boolean) {
  const rate = gstPct / 100;
  const ex = quotedInclGst ? amount / (1 + rate) : amount;
  return {ex, gst: ex * rate};
}

function contribution(
  n: Num,
  inclGst: boolean,
  itc: boolean,
  gstRate: (retail: number) => number,
) {
  const goods = charge(
    n.product_cost_inr + n.print_cost_inr,
    n.supplier_gst_pct,
    inclGst,
  );
  const ship = charge(n.shipping_inr, n.shipping_gst_pct, inclGst);
  const cod = charge(n.cod_fee_inr, n.cod_fee_gst_pct, inclGst);
  // With input tax credit the GST on a charge is recovered; without, it's a cost.
  const cost = (c: {ex: number; gst: number}) => (itc ? c.ex : c.ex + c.gst);
  const feeGst = 1 + n.gateway_fee_gst_pct / 100;
  const gatewayPct = (n.gateway_fee_pct / 100) * (itc ? 1 : feeGst);
  const gatewayFixed = n.gateway_fixed_inr * (itc ? 1 : feeGst);
  const fixed = cost(goods) + cost(ship);

  const at = (retail: number) => {
    const rate = gstRate(retail);
    const net = retail / (1 + rate / 100);
    const beforeFee = net - fixed;
    const gateway = retail * gatewayPct + gatewayFixed;
    return {
      rate,
      net,
      outputGst: retail - net,
      beforeFee,
      gateway,
      prepaid: beforeFee - gateway,
      codOrder: beforeFee - cost(cod),
    };
  };
  /** GST-inclusive retail price giving margin `t` on taxable value. */
  const priceFor = (t: number, mode: 'prepaid' | 'cod') => {
    const solve = (rate: number) => {
      const k = (1 - t) / (1 + rate / 100);
      return mode === 'prepaid'
        ? (fixed + gatewayFixed) / (k - gatewayPct)
        : (fixed + cost(cod)) / k;
    };
    // Solve at the rate the resulting price actually attracts.
    const first = solve(gstRate(0));
    return gstRate(first) === gstRate(0) ? first : solve(gstRate(first));
  };
  // Supplier GST on a prepaid unit (recovered as input tax credit when claimable).
  const inputGst = goods.gst + ship.gst;
  return {fixed, at, priceFor, inputGst};
}

const business = new Map(
  parseCsv(BUSINESS_INPUT).map((row) => [row.product_type, row]),
);
const out: string[] = [
  '# Contribution per unit (before marketing)',
  '',
  `Generated by \`npm run costs:check\` from \`${SUPPLIER_INPUT}\` (supplier pricing), \`${BUSINESS_INPUT}\` (owner tax and payment inputs) and \`app/data/catalogue/pricing.ts\`.`,
  'Retail prices are GST inclusive. Rows with any blank or invalid input show no figures. Nothing is estimated.',
  '',
];
const complete: string[] = [];
const targets: string[] = [];
const gstRows: string[] = [];
const incomplete: string[] = [];

for (const row of parseCsv(SUPPLIER_INPUT)) {
  const type = row.product_type as ProductTypeHandle;
  const retail = RETAIL_PRICE_INR[type];
  const label = `${type} / ${row.variant}`;
  const biz = business.get(type) ?? {};
  const threshold = biz.gst_threshold_inr ?? '';
  const missing: string[] = [
    ...SUPPLIER_NUMERIC.filter((k) => !isNum(row[k])),
    ...(isBool(row.supplier_prices_include_gst ?? '')
      ? []
      : ['supplier_prices_include_gst']),
    ...SUPPLIER_TEXT.filter((k) => !row[k]),
    ...BUSINESS_NUMERIC.filter((k) => !isNum(biz[k])).map((k) => `owner:${k}`),
    ...(isBool(biz.itc_claimable ?? '') ? [] : ['owner:itc_claimable']),
    ...(threshold === 'none' || isNum(threshold)
      ? []
      : ['owner:gst_threshold_inr']),
    ...(isNum(threshold) && !isNum(biz.output_gst_pct_above)
      ? ['owner:output_gst_pct_above']
      : []),
    ...BUSINESS_TEXT.filter((k) => !biz[k]).map((k) => `owner:${k}`),
  ];
  if (retail == null) missing.unshift('product_type (unknown)');
  if (missing.length) {
    incomplete.push(`| ${label} | ${missing.join(', ')} |`);
    continue;
  }

  const n = Object.fromEntries(
    [
      ...SUPPLIER_NUMERIC.map((k) => [k, row[k]]),
      ...BUSINESS_NUMERIC.map((k) => [k, biz[k]]),
    ].map(([k, v]) => [k, Number(v)]),
  ) as Num;
  const itc = yes(biz.itc_claimable);
  const gstRate = (price: number) =>
    outputGstRate(
      price,
      n.output_gst_pct,
      isNum(threshold) ? Number(threshold) : null,
      isNum(biz.output_gst_pct_above) ? Number(biz.output_gst_pct_above) : null,
    );
  const m = contribution(n, yes(row.supplier_prices_include_gst), itc, gstRate);
  const r = m.at(retail);
  complete.push(
    `| ${label} | ${inr(retail)} | ${r.rate}% | ${inr(r.net)} | ${inr(m.fixed)} | ${inr(r.beforeFee)} (${pct(r.beforeFee / r.net)}) | ${inr(r.gateway)} | ${inr(r.prepaid)} (${pct(r.prepaid / r.net)}) | ${inr(r.codOrder)} (${pct(r.codOrder / r.net)}) | ${inr(n.rto_charge_inr)} | ${row.source} (${row.quote_date}) |`,
  );
  targets.push(
    `| ${label} | ${TARGET_MARGINS.map((t) => `${inr(m.priceFor(t, 'prepaid'))} / ${inr(m.priceFor(t, 'cod'))}`).join(' | ')} |`,
  );
  gstRows.push(
    `| ${label} | ${itc ? 'yes' : 'no'} | ${inr(r.net)} | ${inr(r.outputGst)} (${r.rate}%) | ${inr(m.inputGst)} | ${inr(itc ? r.outputGst - m.inputGst : r.outputGst)} | ${biz.gst_source} |`,
  );
}

if (complete.length) {
  out.push(
    '## Contribution at current prices',
    '',
    'Supplier = product + print + supplier shipping (ex GST when input tax credit is claimable).',
    '',
    '| Product / variant | Retail (GST incl.) | Output GST | Taxable value | Supplier | Before payment fee | Gateway fee | Prepaid | COD | Cost per RTO | Supplier source |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...complete,
    '',
    'Margins are on taxable value (GST-inclusive price ÷ (1 + output GST)). Contribution is before marketing, overheads and income tax. An RTO costs the amount shown each time it happens; no RTO rate is assumed.',
    '',
    '## GST-inclusive retail price for a target margin: prepaid / COD',
    '',
    `| Product / variant | ${TARGET_MARGINS.map((t) => `${t * 100}%`).join(' | ')} |`,
    `| --- | ${TARGET_MARGINS.map(() => '---').join(' | ')} |`,
    ...targets,
    '',
    '## GST per unit at current prices (prepaid)',
    '',
    '| Product / variant | Input tax credit | Taxable value | Output GST | Input GST on supplier charges | Net GST payable | GST source |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...gstRows,
    '',
  );
}
if (incomplete.length) {
  out.push(
    '## Incomplete rows (no figures shown)',
    '',
    '`owner:` = `ops/business-inputs.csv`; everything else = `ops/landed-cost.csv`.',
    '',
    '| Product / variant | Missing inputs |',
    '| --- | --- |',
    ...incomplete,
    '',
  );
}
if (Object.keys(PRICE_OVERRIDES_INR).length) {
  out.push(
    `Per-design price overrides exist (${Object.keys(PRICE_OVERRIDES_INR).join(', ')}); check them separately.`,
    '',
  );
}
out.push(
  '## Formula',
  '',
  '- Retail prices are GST inclusive. Taxable value = retail ÷ (1 + output GST); output GST = retail − taxable value.',
  '- With a threshold (apparel), the lower rate applies while the taxable value stays at or below it; target prices are solved at the rate they attract.',
  '- Supplier charges (product, print, shipping, COD fee) are taken ex GST when input tax credit is claimable, otherwise including GST.',
  '- Before payment fee = taxable value − product − print − supplier shipping.',
  '- Prepaid = before payment fee − gateway fee (retail × gateway % + fixed fee, plus GST on the fee unless claimable).',
  '- COD = before payment fee − supplier COD fee (no gateway fee on a COD order).',
  '',
);

writeFileSync(REPORT, out.join('\n'));
// eslint-disable-next-line no-console
console.log(
  `${complete.length} complete, ${incomplete.length} incomplete row(s) → ${REPORT}`,
);
