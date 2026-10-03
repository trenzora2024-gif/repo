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
// Any blank required input means no figures for that row: nothing is
// estimated or defaulted. A value confirmed to be zero is entered as 0.
// Optional (blank allowed, reported as missing):
//   - payment fees: contribution is then shown before payment fee only;
//   - GST on shipping / COD when the supplier quotes ex GST and input tax
//     credit is claimable (it is recovered, so contribution is unaffected);
//   - RTO charge, when the supplier doesn't state one.
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
/** GST on these may be blank when it is recovered as input tax credit. */
const SUPPLIER_GST_OPTIONAL = ['shipping_gst_pct', 'cod_fee_gst_pct'] as const;
const PAYMENT_NUMERIC = [
  'gateway_fee_pct',
  'gateway_fixed_inr',
  'gateway_fee_gst_pct',
] as const;
const SUPPLIER_TEXT = ['source', 'quote_date'] as const;
const BUSINESS_NUMERIC = ['output_gst_pct', ...PAYMENT_NUMERIC] as const;
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
  // NaN when the payment-fee inputs are blank; callers check `paymentKnown`.
  const paymentKnown = Number.isFinite(gatewayPct + gatewayFixed);
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
  /**
   * GST-inclusive retail price giving margin `t` on taxable value.
   * 'prepaid' includes the gateway fee; 'before-fee' and 'cod' have none.
   */
  const priceFor = (t: number, mode: 'prepaid' | 'before-fee' | 'cod') => {
    const solve = (rate: number) => {
      const k = (1 - t) / (1 + rate / 100);
      if (mode === 'prepaid') return (fixed + gatewayFixed) / (k - gatewayPct);
      return (mode === 'cod' ? fixed + cost(cod) : fixed) / k;
    };
    // Solve at the rate the resulting price actually attracts: if the price
    // at the lower rate crosses the threshold, re-solve at the higher rate
    // (which only raises the price, so it stays above the threshold).
    const low = gstRate(0);
    const first = solve(low);
    const rate = gstRate(first);
    return rate === low
      ? {price: first, rate, crossed: false}
      : {price: solve(rate), rate, crossed: true};
  };
  // Supplier GST on a prepaid unit (recovered as input tax credit when claimable).
  const inputGst = goods.gst + (Number.isFinite(ship.gst) ? ship.gst : 0);
  return {fixed, goods, ship, cod, cost, at, priceFor, inputGst, paymentKnown};
}

const business = new Map(
  parseCsv(BUSINESS_INPUT).map((row) => [row.product_type, row]),
);
const out: string[] = [
  '# Contribution per unit (before marketing)',
  '',
  `Generated by \`npm run costs:check\` from \`${SUPPLIER_INPUT}\` (supplier pricing), \`${BUSINESS_INPUT}\` (owner tax and payment inputs) and \`app/data/catalogue/pricing.ts\`.`,
  'Retail prices are GST inclusive. Rows with any blank required input show no figures. Nothing is estimated.',
  '',
];
const supplierRows: string[] = [];
const complete: string[] = [];
const targets: string[] = [];
const gstRows: string[] = [];
const incomplete: string[] = [];
let paymentMissing = false;

const show = (v: number) => (Number.isFinite(v) ? inr(v) : 'not stated');

for (const row of parseCsv(SUPPLIER_INPUT)) {
  const type = row.product_type as ProductTypeHandle;
  const retail = RETAIL_PRICE_INR[type];
  const label = `${type} / ${row.variant}`;
  const biz = business.get(type) ?? {};
  const threshold = biz.gst_threshold_inr ?? '';
  const inclGst = yes(row.supplier_prices_include_gst ?? '');
  const itc = yes(biz.itc_claimable ?? '');
  // GST on an ex-GST charge is recovered when ITC is claimable, so a blank
  // rate there doesn't change contribution; it is reported, not required.
  const gstOptional = (k: string) =>
    !inclGst && itc && (SUPPLIER_GST_OPTIONAL as readonly string[]).includes(k);
  const supplierMissing: string[] = [
    ...SUPPLIER_NUMERIC.filter(
      (k) => !isNum(row[k]) && k !== 'rto_charge_inr' && !gstOptional(k),
    ),
    ...(isBool(row.supplier_prices_include_gst ?? '')
      ? []
      : ['supplier_prices_include_gst']),
    ...SUPPLIER_TEXT.filter((k) => !row[k]),
  ];
  const unstated = [
    ...SUPPLIER_GST_OPTIONAL.filter((k) => gstOptional(k) && !isNum(row[k])),
    ...(isNum(row.rto_charge_inr) ? [] : ['rto_charge_inr']),
  ];
  const missing: string[] = [
    ...supplierMissing,
    ...(isNum(biz.output_gst_pct) ? [] : ['owner:output_gst_pct']),
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

  const n = Object.fromEntries(
    [
      ...SUPPLIER_NUMERIC.map((k) => [k, row[k]]),
      ...BUSINESS_NUMERIC.map((k) => [k, biz[k]]),
    ].map(([k, v]) => [k, isNum(v) ? Number(v) : NaN]),
  ) as Num;
  const gstRate = (price: number) =>
    outputGstRate(
      price,
      n.output_gst_pct,
      isNum(threshold) ? Number(threshold) : null,
      isNum(biz.output_gst_pct_above) ? Number(biz.output_gst_pct_above) : null,
    );
  const m = contribution(n, inclGst, itc, gstRate);

  if (!supplierMissing.length) {
    supplierRows.push(
      `| ${label} | ${inr(m.goods.ex)} (${inr(n.product_cost_inr)} + ${inr(n.print_cost_inr)}) | ${inr(m.goods.gst)} (${n.supplier_gst_pct}%) | ${inr(m.ship.ex)} | ${show(m.ship.gst)} | ${inr(m.cod.ex)} | ${show(m.cod.gst)} | ${show(n.rto_charge_inr)} | ${unstated.join(', ') || '—'} | ${row.source} (${row.quote_date}) |`,
    );
  }
  if (missing.length) {
    incomplete.push(`| ${label} | ${missing.join(', ')} |`);
    continue;
  }

  const r = m.at(retail);
  const codCost = m.cost(m.cod);
  if (!m.paymentKnown) paymentMissing = true;
  const fee = m.paymentKnown
    ? `${inr(r.gateway)} → ${inr(r.prepaid)} (${pct(r.prepaid / r.net)})`
    : 'payment fee inputs missing';
  complete.push(
    `| ${label} | ${inr(retail)} | ${inr(r.outputGst)} (${r.rate}%) | ${inr(r.net)} | ${inr(m.fixed)} | ${inr(r.beforeFee)} (${pct(r.beforeFee / r.net)}) | ${fee} | ${inr(codCost)} | ${inr(r.codOrder)} (${pct(r.codOrder / r.net)}) | ${show(n.rto_charge_inr)} |`,
  );
  const target = (t: number, mode: 'before-fee' | 'cod' | 'prepaid') => {
    const p = m.priceFor(t, mode);
    return `${inr(p.price)} @ ${p.rate}%${p.crossed ? ' (threshold crossed)' : ''}`;
  };
  targets.push(
    `| ${label} | ${TARGET_MARGINS.map(
      (t) =>
        `${target(t, 'before-fee')} / ${target(t, 'cod')}${m.paymentKnown ? ` / ${target(t, 'prepaid')}` : ''}`,
    ).join(' | ')} |`,
  );
  gstRows.push(
    `| ${label} | ${itc ? 'yes' : 'no'} | ${inr(r.net)} | ${inr(r.outputGst)} (${r.rate}%) | ${inr(m.inputGst)}${unstated.some((k) => k !== 'rto_charge_inr') ? ' + unstated GST on shipping' : ''} | ${inr(itc ? r.outputGst - m.inputGst : r.outputGst)} | ${biz.gst_source} |`,
  );
}

if (supplierRows.length) {
  out.push(
    '## Verified supplier charges per unit',
    '',
    'From `ops/landed-cost.csv` (supplier pages only; see its `notes` column). Amounts ex GST.',
    '',
    '| Product / variant | Product + print | Supplier GST on product | Shipping | GST on shipping | COD fee | GST on COD fee | RTO charge | Not stated by supplier | Source |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...supplierRows,
    '',
  );
}
if (complete.length) {
  out.push(
    '## Contribution at current prices',
    '',
    'Supplier = product + print + supplier shipping (ex GST when input tax credit is claimable).',
    '',
    '| Product / variant | Retail (GST incl.) | Embedded output GST | Taxable value | Supplier | Prepaid, before payment fee | Payment fee → prepaid after fee | Extra COD cost | COD, before payment fee | Cost per RTO |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...complete,
    '',
    'Margins are on taxable value (GST-inclusive price ÷ (1 + output GST)). Contribution is before marketing, overheads and income tax. An RTO costs the amount shown each time it happens; no RTO rate is assumed.',
    '',
    `## GST-inclusive retail price for a target margin: prepaid before payment fee / COD${paymentMissing ? '' : ' / prepaid after payment fee'}`,
    '',
    `| Product / variant | ${TARGET_MARGINS.map((t) => `${Math.round(t * 100)}%`).join(' | ')} |`,
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
    '## Incomplete rows (no contribution shown)',
    '',
    '`owner:` = `ops/business-inputs.csv`; everything else = `ops/landed-cost.csv`.',
    '',
    '| Product / variant | Missing inputs |',
    '| --- | --- |',
    ...incomplete,
    '',
  );
}
if (paymentMissing || incomplete.length) {
  out.push(
    'Payment fees: gateway %, fixed fee, GST on the fee and any Shopify transaction fee are not provided, so no contribution after payment fee is shown.',
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
  '- Prepaid after payment fee = before payment fee − gateway fee (retail × gateway % + fixed fee, plus GST on the fee unless claimable). Shown only when the fee inputs are known.',
  '- COD = before payment fee − supplier COD fee (no gateway fee on a COD order).',
  '',
);

writeFileSync(REPORT, out.join('\n'));
// eslint-disable-next-line no-console
console.log(
  `${complete.length} complete, ${incomplete.length} incomplete row(s) → ${REPORT}`,
);
