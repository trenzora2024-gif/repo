/**
 * Trenzora US: Doba catalog research → final catalog economics.
 *
 *   node scripts/doba-research.ts
 *
 * Inputs (us/catalog/research/):
 *   doba-listings.json  Listing facts captured from each Doba product page
 *                       (exact URL, item no., supplier, stock by warehouse,
 *                       shipping, processing, returns, images, video, and
 *                       Doba's own "max profit" fields).
 *   market-prices.json  Lowest comparable US retail price per listing.
 *   selection.json      Editorial decisions: Trenzora name, category,
 *                       missions, persona, qualitative scores, decision.
 * Outputs:
 *   catalog/doba-final-catalog.csv
 *   catalog/research/economics.md   (tables embedded in the final report)
 *
 * DOBA COST: the logged-in wholesale price is not visible without an
 * account session. Doba's public product data exposes the maximum profit
 * vs. MSRP as an amount (maxPriceProfitDiff) and a rate (…Rate). Then
 * MSRP = amount / rate and cost = MSRP − amount. This reproduced the cost
 * implied by trenzora.com's own price for the VEVOR 550 lb wagon (item
 * D0102X3YK0U) within 1.4% ($98.06 derived vs $96.72). Every cost below is
 * labelled "derived"; replace it with the logged-in price in
 * doba-cost-inputs.csv when available (column doba_cost_usd overrides).
 */
import {readFileSync, writeFileSync} from 'node:fs';

const R = (f: string) => new URL(`../catalog/research/${f}`, import.meta.url);
const listings: Record<string, Listing> = JSON.parse(readFileSync(R('doba-listings.json'), 'utf8'));
const market: Record<string, Market> = JSON.parse(readFileSync(R('market-prices.json'), 'utf8'));
const selection: Pick[] = JSON.parse(readFileSync(R('selection.json'), 'utf8'));

type Listing = {
  url: string; skuId: string; name: string; brand: string; seller: string; itemNo: string; upc?: string;
  free: boolean; shipCost: string; shipMethod: string; delMin: number; delMax: number; from: string;
  processDays: number; avgHandling: number; stock: number; stockWh: string[]; inv: string;
  prohibited?: string; profitDiff: string; profitRate: string; imgs: number; video?: string | null;
  variants: Array<{skuId: string; itemNo: string; a?: string; inv?: string}>; variantType?: string;
  supplier?: {orderFinishedRate?: number; orderRefundRate?: number; avgDeliveryTimeUs?: number; freightStrategy?: string};
  ret?: {returnRdToDays?: number; acceptNonDefReturns?: number};
  size?: {length?: number; width?: number; height?: number; dimUnit?: string; weight?: number; weightUnit?: string};
};
type Market = {low: number; lowAt: string; lowUrl: string; high?: number; highAt?: string; note?: string};
type Scores = {problem: number; demand: number; competition: number; meta: number; seo: number; crossSell: number; video: number};
type Pick = {
  skuId: string; product: string; category: string; missions: string[]; persona: string; problem: string;
  decision: 'HERO' | 'CORE' | 'BUNDLE ONLY' | 'PHASE 2' | 'TEST' | 'REJECT';
  season: string; events: string[]; scores: Scores; vehicleFit?: string; safety?: string;
  metaAngle?: string; videoIdea?: string; crossSells?: string[]; bundle?: string; notes?: string; rank?: number;
};

export const ASSUME = {
  paymentPct: 0.029, // Shopify Payments (Basic plan, US online cards)
  paymentFixed: 0.3,
  returnsPct: 0.05, // refunds, returns and damage allowance (bulky goods)
  discountPct: 0.02, // bundle savings + occasional codes, blended
  shipping: 0, // free shipping verified on every selected listing
  targetContribution: 0.25,
  maxPremium: 0.15, // never price more than 15% above the lowest identical retail
};

// Manual cost overrides from a logged-in Doba session (preferred when filled).
const overrides = new Map<string, number>();
try {
  const [head, ...rows] = readFileSync(new URL('../catalog/doba-cost-inputs.csv', import.meta.url), 'utf8').trim().split(/\r?\n/);
  const cols = head.split(',');
  for (const row of rows) {
    const c = row.split(',');
    const sku = c[cols.indexOf('doba_sku_id')] ?? '';
    const cost = Number(c[cols.indexOf('doba_cost_usd')]);
    if (sku && cost) overrides.set(sku, cost);
  }
} catch {
  /* optional */
}

export function derivedCost(l: Listing) {
  const diff = Number(l.profitDiff);
  const rate = Number(l.profitRate) / 100;
  if (!diff || !rate) return null;
  const msrp = diff / rate;
  return {msrp, cost: msrp - diff};
}

const charm = (x: number) => Math.max(0.99, Math.floor(x + 0.01) - 0.01);

export function unit(price: number, cost: number) {
  const fees = price * ASSUME.paymentPct + ASSUME.paymentFixed;
  const returns = price * ASSUME.returnsPct;
  const discounts = price * ASSUME.discountPct;
  const gross = price - cost - ASSUME.shipping;
  const contribution = gross - fees - returns - discounts;
  return {
    gross, grossPct: gross / price, fees, returns, discounts, contribution, contributionPct: contribution / price,
    breakevenCac: contribution, breakevenRoas: contribution > 0 ? price / contribution : Infinity,
  };
}

export function recommendPrice(cost: number, m: Market) {
  const variablePct = ASSUME.paymentPct + ASSUME.returnsPct + ASSUME.discountPct;
  const floor = (cost + ASSUME.paymentFixed + ASSUME.shipping) / (1 - variablePct - ASSUME.targetContribution);
  const cap = Math.min(m.high ?? m.low * (1 + ASSUME.maxPremium), m.low * (1 + ASSUME.maxPremium));
  if (floor <= m.low) return {price: charm(m.low), rule: 'market low (target met at parity)'};
  const p = Math.max(m.low, Math.min(floor, cap));
  return {price: charm(p), rule: p >= floor - 0.01 ? 'target contribution, within market range' : 'capped at market range (target not reachable)'};
}

function scoreOf(p: Pick, l: Listing, contributionPct: number) {
  const s = p.scores;
  const fulfil = l.supplier?.orderFinishedRate ?? 0;
  const dobaEcon =
    (l.free && Number(l.shipCost) === 0 ? 5 : 0) +
    (l.stock >= 100 ? 5 : l.stock >= 20 ? 3 : l.stock > 0 ? 1 : 0) +
    (fulfil >= 0.99 ? 5 : fulfil >= 0.97 ? 3 : fulfil > 0 ? 1 : 0) +
    (l.processDays <= 3 && l.delMax <= 7 ? 5 : l.processDays <= 3 ? 3 : 1);
  const margin =
    contributionPct >= 0.3 ? 15 : contributionPct >= 0.25 ? 12 : contributionPct >= 0.2 ? 9 : contributionPct >= 0.15 ? 6 : contributionPct >= 0.1 ? 3 : 0;
  const total =
    (s.problem / 5) * 15 + dobaEcon + (s.demand / 5) * 15 + (s.competition / 5) * 10 + margin +
    (s.meta / 5) * 10 + (s.seo / 5) * 5 + (s.crossSell / 5) * 5 + (s.video / 5) * 5;
  return {total: Math.round(total), dobaEcon, margin};
}

// A market link is only "exact" when it points at a product page, not a store or category home.
const marketLink = (m?: Market) =>
  !m ? '' : /\/(p|ip|pd|product|item|itm|dp)\/|-p_\d+|\/pdp\//.test(m.lowUrl) ? m.lowUrl : `${m.lowUrl} (retailer/category page; exact product page not captured)`;
const imageScore = (n: number) => (n >= 12 ? 5 : n >= 10 ? 4 : n >= 7 ? 3 : n >= 4 ? 2 : 1);
const usd = (n: number) => (Number.isFinite(n) ? `$${n.toFixed(2)}` : '—');
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export const rows = selection.map((p) => {
  const l = listings[p.skuId];
  if (!l) throw new Error(`No Doba listing captured for ${p.skuId} (${p.product})`);
  const m = market[p.skuId];
  const d = derivedCost(l);
  const cost = overrides.get(p.skuId) ?? d?.cost ?? NaN;
  const costSource = overrides.has(p.skuId) ? 'Doba (logged in)' : 'derived from Doba profit fields';
  const rec = m ? recommendPrice(cost, m) : {price: NaN, rule: 'no market price'};
  const u = unit(rec.price, cost);
  const parity = m ? unit(m.low, cost) : null;
  const sc = scoreOf(p, l, u.contributionPct);
  return {p, l, m, cost, costSource, msrp: d?.msrp ?? NaN, rec, u, parity, score: sc, img: imageScore(l.imgs)};
});

// ---------------------------------------------------------------- CSV
const csvCell = (v: unknown) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const header = [
  'Rank', 'Decision', 'Product', 'Category', 'Mission', 'Persona', 'Supplier', 'Brand', 'Doba SKU', 'Doba Item No', 'UPC',
  'Exact Doba URL', 'Doba cost (USD)', 'Cost source', 'Doba MSRP (derived)', 'Variant', 'Free shipping', 'Shipping cost',
  'Shipping method', 'Ships from', 'In-stock units (Doba warehouses)', 'Processing time', 'Delivery estimate',
  'Supplier fulfillment rate', 'Return window (days)', 'Prohibited marketplaces', 'Market low', 'Market low at',
  'Market URL', 'Market high', 'Recommended price', 'Price rule', 'Gross profit', 'Gross margin', 'Payment fees',
  'Returns allowance', 'Discount allowance', 'Contribution', 'Contribution margin', 'Break-even CAC', 'Break-even ROAS',
  'Contribution at market low', 'Score', 'Video available', 'Image score', 'Season', 'Events', 'Vehicle fit', 'Safety', 'Notes',
];
const csv = [header.join(',')];
for (const r of rows) {
  const {p, l, m, u} = r;
  csv.push([
    p.rank ?? '', p.decision, p.product, p.category, p.missions.join(' | '), p.persona, l.seller, l.brand, l.skuId, l.itemNo, l.upc ?? '',
    l.url, r.cost.toFixed(2), r.costSource, r.msrp.toFixed(2), l.variantType && l.variants.length > 1 ? `${l.variantType}: ${l.variants.map((v) => v.a).join(' / ')}` : 'Single',
    l.free && Number(l.shipCost) === 0 ? 'Yes (verified on listing)' : 'No', usd(Number(l.shipCost)), l.shipMethod, l.from,
    l.stock, `${l.processDays} business days (avg ${l.avgHandling})`, `${l.delMin}-${l.delMax} days`,
    l.supplier?.orderFinishedRate ? pct(l.supplier.orderFinishedRate) : '', l.ret?.returnRdToDays ?? '', l.prohibited ?? '',
    m ? m.low.toFixed(2) : '', m?.lowAt ?? '', marketLink(m), m?.high?.toFixed(2) ?? '',
    r.rec.price.toFixed(2), r.rec.rule, u.gross.toFixed(2), pct(u.grossPct), u.fees.toFixed(2), u.returns.toFixed(2), u.discounts.toFixed(2),
    u.contribution.toFixed(2), pct(u.contributionPct), u.breakevenCac.toFixed(2), Number.isFinite(u.breakevenRoas) ? u.breakevenRoas.toFixed(2) : 'n/a',
    r.parity ? pct(r.parity.contributionPct) : '', r.score.total, l.video ? 'Yes (listing video)' : 'No (none on Doba listing)', r.img,
    p.season, p.events.join(' | '), p.vehicleFit ?? '', p.safety ?? '', p.notes ?? '',
  ].map(csvCell).join(','));
}
writeFileSync(new URL('../catalog/doba-final-catalog.csv', import.meta.url), csv.join('\n') + '\n');

// ---------------------------------------------------------- markdown
const md: string[] = [];
const byDecision = (d: Pick['decision']) => rows.filter((r) => r.p.decision === d);
md.push('<!-- generated by scripts/doba-research.ts — do not edit by hand -->');
md.push('');
md.push('### Master product table');
md.push('');
md.push('| Rank | Decision | Product | Category | Supplier | Doba item no. | Exact Doba URL | Doba cost | Ship | Proc. | Deliv. | Stock | Market low | Rec. price | Contrib. % | BE ROAS | Score |');
md.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const r of [...rows].sort((a, b) => (a.p.rank ?? 999) - (b.p.rank ?? 999))) {
  const {p, l, m, u} = r;
  md.push(`| ${p.rank ?? '—'} | ${p.decision} | ${p.product} | ${p.category} | ${l.seller} | ${l.itemNo} | [${l.skuId}](${l.url}) | ${usd(r.cost)} | ${l.free ? 'Free' : usd(Number(l.shipCost))} | ${l.processDays}d | ${l.delMin}–${l.delMax}d | ${l.stock} | ${m ? `[${usd(m.low)}](${m.lowUrl})` : '—'} | ${usd(r.rec.price)} | ${pct(u.contributionPct)} | ${Number.isFinite(u.breakevenRoas) ? u.breakevenRoas.toFixed(1) + '×' : '—'} | ${r.score.total} |`);
}
md.push('');
md.push('### Unit economics (recommended price)');
md.push('');
md.push('| Product | Price | Doba cost | Gross profit | Gross % | Fees | Returns 5% | Discount 2% | Contribution | Contrib. % | Break-even CAC | At market low: contrib. % |');
md.push('|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const r of rows.filter((x) => x.p.decision !== 'REJECT')) {
  const {u} = r;
  md.push(`| ${r.p.product} | ${usd(r.rec.price)} | ${usd(r.cost)} | ${usd(u.gross)} | ${pct(u.grossPct)} | ${usd(u.fees)} | ${usd(u.returns)} | ${usd(u.discounts)} | ${usd(u.contribution)} | ${pct(u.contributionPct)} | ${usd(u.breakevenCac)} | ${r.parity ? pct(r.parity.contributionPct) : '—'} |`);
}
md.push('');

// ------------------------------------------------------------ setups
type Setup = {name: string; mission: string; status: string; items: string[]; discountPct: number; why: string};
const setups: Setup[] = JSON.parse(readFileSync(R('setups.json'), 'utf8'));
const bySku = new Map(rows.map((r) => [r.p.skuId, r]));
export const setupRows = setups.map((s) => {
  const parts = s.items.map((id) => {
    const r = bySku.get(id);
    if (!r) throw new Error(`Setup ${s.name}: ${id} not in selection`);
    if (r.p.decision === 'REJECT') throw new Error(`Setup ${s.name}: ${id} is rejected`);
    return r;
  });
  const list = parts.reduce((t, r) => t + r.rec.price, 0);
  const marketLow = parts.reduce((t, r) => t + (r.m?.low ?? r.rec.price), 0);
  const price = charm(list * (1 - s.discountPct));
  const cost = parts.reduce((t, r) => t + r.cost, 0);
  // the bundle discount is explicit here, so the blended 2% allowance is not applied twice
  const fees = price * ASSUME.paymentPct + ASSUME.paymentFixed;
  const contribution = price - cost - fees - price * ASSUME.returnsPct;
  return {s, parts, list, marketLow, price, cost, contribution, pct: contribution / price, roas: price / contribution};
});
md.push('### Setups (bundles)');
md.push('');
md.push('| Setup | Mission | Status | Contents | Items at rec. price | Same items at market low | Setup price | Doba cost | Contribution | Contrib. % | Break-even ROAS |');
md.push('|---|---|---|---|---|---|---|---|---|---|---|');
for (const b of setupRows) {
  md.push(`| ${b.s.name} | ${b.s.mission} | ${b.s.status} | ${b.parts.map((r) => r.p.product).join(' + ')} | ${usd(b.list)} | ${usd(b.marketLow)} | ${usd(b.price)} (−${(b.s.discountPct * 100).toFixed(0)}%) | ${usd(b.cost)} | ${usd(b.contribution)} | ${pct(b.pct)} | ${b.roas.toFixed(1)}× |`);
}
md.push('');

// ------------------------------------------------------- $5K/month model
const launchRows = rows.filter((r) => ['HERO', 'CORE'].includes(r.p.decision));
const sum = (f: (r: (typeof rows)[number]) => number) => launchRows.reduce((t, r) => t + f(r), 0);
const mixAtRec = sum((r) => r.u.contribution) / sum((r) => r.rec.price);
const mixAtLow = sum((r) => r.parity?.contribution ?? 0) / sum((r) => r.m?.low ?? 0);
const aov = sum((r) => r.rec.price) / launchRows.length;
const FIXED = 100; // Shopify Basic + essential apps, per month
const scenarios = [
  {name: 'Conservative', note: 'sell at market-low parity, 80% of revenue from paid social at 3.0× ROAS', c: mixAtLow, paid: 0.8, roas: 3.0},
  {name: 'Base', note: 'recommended prices, 60% paid at 4.0× ROAS, rest organic/SEO/email', c: mixAtRec, paid: 0.6, roas: 4.0},
  {name: 'Aggressive', note: 'recommended prices, 35% paid at 5.0× ROAS, setups lift AOV, logged-in cost 5% below derived', c: mixAtRec + 0.05 * 0.81, paid: 0.35, roas: 5.0},
];
md.push('### $5K/month revenue model (actual derived Doba costs)');
md.push('');
md.push(`Launch mix (${launchRows.length} hero + core products): average price ${usd(aov)}, contribution before ads ${pct(mixAtRec)} at recommended prices and ${pct(mixAtLow)} at market-low prices. Break-even blended ROAS = ${(1 / mixAtRec).toFixed(1)}×.`);
md.push('');
md.push('| Scenario | Assumptions | Revenue | Orders (at avg price) | Contribution before ads | Ad spend | Fixed | Net profit | Net margin |');
md.push('|---|---|---|---|---|---|---|---|---|');
for (const sc of scenarios) {
  const rev = 5000;
  const contrib = rev * sc.c;
  const ads = (rev * sc.paid) / sc.roas;
  const net = contrib - ads - FIXED;
  md.push(`| ${sc.name} | ${sc.note} | ${usd(rev)} | ${Math.round(rev / aov)} | ${usd(contrib)} (${pct(sc.c)}) | ${usd(ads)} | ${usd(FIXED)} | ${usd(net)} | ${pct(net / rev)} |`);
}
md.push('');
writeFileSync(R('economics.md'), md.join('\n'));

// ------------------------------------------------------------ summary
const launch = rows.filter((r) => ['HERO', 'CORE'].includes(r.p.decision));
// eslint-disable-next-line no-console
console.log(
  `doba-research: ${rows.length} rows (${byDecision('HERO').length} hero, ${byDecision('CORE').length} core) · launch avg contribution ${pct(
    launch.reduce((s, r) => s + r.u.contribution, 0) / launch.reduce((s, r) => s + r.rec.price, 0),
  )} · ≥30%: ${rows.filter((r) => r.u.contributionPct >= 0.3).length} · ≥25%: ${rows.filter((r) => r.u.contributionPct >= 0.25).length}`,
);
