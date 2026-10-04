/**
 * Trenzora US unit economics and the $5K/month model.
 *
 *   node scripts/economics.ts          → writes catalog/economics.md
 *
 * Doba wholesale cost is login-only. Fill catalog/doba-cost-inputs.csv from
 * your Doba account (Inventory list → export, or copy the "Price" shown on
 * each product page). Rows with a cost use it; rows without fall back to a
 * labeled scenario (cost as % of the lowest public retail price) so you can
 * see which products survive at each cost level. Scenario numbers are never
 * presented as verified.
 */
import {readFileSync, writeFileSync} from 'node:fs';
import {CATALOG, type CatalogProduct} from '../app/data/catalog.ts';
import {BUNDLES, bundleListTotal} from '../app/data/bundles.ts';

const ASSUME = {
  paymentPct: 0.029, // Shopify Payments Basic, US cards (online)
  paymentFixed: 0.3,
  returnsPct: 0.05, // refunds/returns allowance, bulky outdoor goods
  discountPct: 0.02, // bundle savings + occasional codes, blended
  shippingUsd: 0, // products selected with supplier free shipping
  targetContributionPct: 0.25, // after all variable costs, before ads
};

/** Doba cost as a share of the lowest public retail price. */
const SCENARIOS = {low: 0.6, mid: 0.72, high: 0.85} as const;
type Scenario = keyof typeof SCENARIOS;

type CostRow = {handle: string; cost: number; shipping: number; date: string};
function readCosts(): Map<string, CostRow> {
  const rows = new Map<string, CostRow>();
  let text = '';
  try {
    text = readFileSync(new URL('../catalog/doba-cost-inputs.csv', import.meta.url), 'utf8');
  } catch {
    return rows;
  }
  const [header, ...lines] = text.trim().split(/\r?\n/);
  const cols = header.split(',');
  for (const line of lines) {
    const cells = line.split(',');
    const get = (k: string) => cells[cols.indexOf(k)]?.trim() ?? '';
    const cost = Number(get('doba_cost_usd'));
    if (!get('handle') || !cost) continue;
    rows.set(get('handle'), {
      handle: get('handle'),
      cost,
      shipping: Number(get('doba_shipping_usd') || 0),
      date: get('checked_on'),
    });
  }
  return rows;
}

export function unit(price: number, cost: number, shipping = ASSUME.shippingUsd) {
  const fees = price * ASSUME.paymentPct + ASSUME.paymentFixed;
  const returns = price * ASSUME.returnsPct;
  const discounts = price * ASSUME.discountPct;
  const gross = price - cost - shipping;
  const contribution = gross - fees - returns - discounts;
  return {
    gross,
    grossPct: gross / price,
    contribution,
    contributionPct: contribution / price,
    breakevenRoas: contribution > 0 ? price / contribution : Infinity,
  };
}

const money = (n: number) => (Number.isFinite(n) ? `$${n.toFixed(2)}` : '—');
const pct = (n: number) => `${(n * 100).toFixed(0)}%`;
const roas = (n: number) => (Number.isFinite(n) ? `${n.toFixed(1)}×` : 'never');

function productRow(p: CatalogProduct, costs: Map<string, CostRow>) {
  const verified = costs.get(p.handle);
  if (verified) {
    const u = unit(p.priceUsd, verified.cost, verified.shipping);
    return `| ${p.rank} | ${p.title} | ${money(p.priceUsd)} | ${money(p.market.low)}–${money(p.market.high)} | **${money(verified.cost)} (Doba, ${verified.date})** | ${pct(u.grossPct)} | ${money(u.contribution)} (${pct(u.contributionPct)}) | ${roas(u.breakevenRoas)} | ${verdict(u.contributionPct)} |`;
  }
  const cells = (Object.keys(SCENARIOS) as Scenario[]).map((s) => {
    const u = unit(p.priceUsd, p.market.low * SCENARIOS[s]);
    return `${pct(u.contributionPct)}`;
  });
  const mid = unit(p.priceUsd, p.market.low * SCENARIOS.mid);
  return `| ${p.rank} | ${p.title} | ${money(p.priceUsd)} | ${money(p.market.low)}–${money(p.market.high)} | not verified | ${cells.join(' / ')} | ${money(mid.contribution)} | ${roas(mid.breakevenRoas)} | ${verdict(mid.contributionPct)} (scenario) |`;
}

function verdict(contributionPct: number) {
  if (contributionPct >= 0.3) return 'List + advertise';
  if (contributionPct >= ASSUME.targetContributionPct) return 'List; ads only in bundles';
  if (contributionPct >= 0.15) return 'Bundle/organic only';
  return 'Reject';
}

type Plan = {name: string; aov: number; cvr: number; paidShare: number; cpc: number; contributionPct: number};
const TARGET = 5000;
const PLANS: Plan[] = [
  {name: 'Conservative', aov: 120, cvr: 0.009, paidShare: 0.6, cpc: 0.9, contributionPct: 0.22},
  {name: 'Base', aov: 150, cvr: 0.012, paidShare: 0.5, cpc: 0.75, contributionPct: 0.27},
  {name: 'Aggressive', aov: 185, cvr: 0.016, paidShare: 0.45, cpc: 0.65, contributionPct: 0.31},
];

function planRow(p: Plan) {
  const orders = TARGET / p.aov;
  const sessions = orders / p.cvr;
  const paidSessions = sessions * p.paidShare;
  const adSpend = paidSessions * p.cpc;
  // Paid sessions convert lower than organic (benchmark ~1.0% vs ~1.8%):
  // attribute orders by weighted CVR so CAC isn't flattered.
  const paidCvr = p.cvr * 0.8;
  const paidOrders = paidSessions * paidCvr;
  const cac = adSpend / paidOrders;
  const contribution = TARGET * p.contributionPct;
  return {
    ...p,
    orders,
    perDay: orders / 30,
    sessions,
    paidSessions,
    adSpend,
    paidOrders,
    cac,
    roas: (paidOrders * p.aov) / adSpend,
    contribution,
    profit: contribution - adSpend,
  };
}

const costs = readCosts();
const out: string[] = [];
out.push('# Trenzora US — unit economics & $5K/month model');
out.push('');
out.push(`Generated by \`node scripts/economics.ts\`. Verified Doba costs: **${costs.size}/${CATALOG.length}**.`);
out.push('');
out.push('## Assumptions');
out.push('');
out.push(`- Payment: ${pct(ASSUME.paymentPct)} + $${ASSUME.paymentFixed.toFixed(2)} per order (Shopify Payments, Basic plan).`);
out.push(`- Returns/refunds allowance: ${pct(ASSUME.returnsPct)} of price. Discount allowance: ${pct(ASSUME.discountPct)}.`);
out.push('- Shipping: $0 (free-shipping Doba listings). Confirm per product; add any shipping to the CSV.');
out.push(`- Target contribution before ads: ≥${pct(ASSUME.targetContributionPct)}. Break-even ROAS = price ÷ contribution.`);
out.push(`- Scenarios where Doba cost isn’t verified: cost = ${pct(SCENARIOS.low)} / ${pct(SCENARIOS.mid)} / ${pct(SCENARIOS.high)} of the lowest public retail price.`);
out.push('');
out.push('## Products');
out.push('');
out.push('| # | Product | Our price | Market (public retail) | Doba cost | Contribution % (60/72/85 scenarios) or gross % | Contribution $ (72%) | Break-even ROAS | Verdict |');
out.push('|---|---|---|---|---|---|---|---|---|');
for (const p of CATALOG) out.push(productRow(p, costs));
out.push('');
out.push('## Bundles');
out.push('');
out.push('| Bundle | Sum of parts | Bundle price (if code live) | Contribution at 72% scenario |');
out.push('|---|---|---|---|');
for (const b of BUNDLES) {
  const list = bundleListTotal(b);
  const price = list - b.savingsUsd;
  const cost = b.items.reduce((sum, item) => {
    const p = CATALOG.find((c) => c.handle === item.handle)!;
    const verified = costs.get(p.handle)?.cost;
    return sum + (verified ?? p.market.low * SCENARIOS.mid) * item.quantity;
  }, 0);
  const u = unit(price, cost);
  out.push(`| ${b.title} | ${money(list)} | ${money(price)} | ${money(u.contribution)} (${pct(u.contributionPct)}), break-even ROAS ${roas(u.breakevenRoas)} |`);
}
out.push('');
out.push('## $5,000/month scenarios');
out.push('');
out.push('| Scenario | AOV | CVR | Orders/mo | Orders/day | Sessions/mo | Paid share | CPC | Ad spend | Paid orders | CAC | ROAS | Contribution (pre-ads) | Profit after ads |');
out.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const r of PLANS.map(planRow)) {
  out.push(
    `| ${r.name} | ${money(r.aov)} | ${(r.cvr * 100).toFixed(1)}% | ${r.orders.toFixed(0)} | ${r.perDay.toFixed(1)} | ${Math.round(r.sessions).toLocaleString('en-US')} | ${pct(r.paidShare)} | ${money(r.cpc)} | ${money(r.adSpend)} | ${r.paidOrders.toFixed(1)} | ${money(r.cac)} | ${r.roas.toFixed(2)}× | ${money(r.contribution)} (${pct(r.contributionPct)}) | ${money(r.profit)} |`,
  );
}
out.push('');
out.push('Read this as: revenue is reachable on traffic alone; **profit** depends on (1) Doba cost leaving ≥25% contribution and (2) paid CAC staying below contribution per order. If CAC > contribution, paid traffic buys revenue at a loss — scale organic/Google free listings instead.');
out.push('');

const file = new URL('../catalog/economics.md', import.meta.url);
writeFileSync(file, out.join('\n'));
// eslint-disable-next-line no-console
console.log(`economics: ${costs.size}/${CATALOG.length} verified costs → catalog/economics.md`);
