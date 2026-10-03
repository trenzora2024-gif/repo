# Gate 4: economics and launch data (revised 2026-10-03)

Prices stay **PROVISIONAL**: ₹999 tee / ₹599 tote / ₹1,099 tumbler (GST inclusive). `ops/landed-cost.csv` is blank because no supplier value is verified yet. Nothing in Shopify was changed for Gate 4.

## Data by category

### A. Verified from a supplier source

**None.** The three official pages (Printrove oversized tees, Qikink tote bags, Qikink tumbler) are blocked by this cloud environment's network policy, and no dashboard figure, invoice or written reply is on file. Each page was tried once.

### B. Owner-confirmed operational knowledge

- Printrove can fulfil the oversized tees and Qikink can fulfil the totes and tumblers (owner has used both).
- Not assumed from this: prices, GST treatment, weights, shipping, COD or RTO terms, or that the blanks match the site copy.

### C. Unverified (not used for costs or pricing)

Search-result snippets of the supplier sites, never opened:

- **Printrove tee:** blank ₹240; DTG ₹0.8–0.9 per sq in, minimum ₹80–90; GST 5%; shipping ₹60 per 500 g.
- **Qikink:** tote ₹210; tumbler ₹440; shipping ₹54 air / ₹42.37 surface per 500 g + 18% GST; COD ₹34 + 18% GST; no RTO charge.

Also unverified: any payment-gateway rate, any output GST rate, and any Shopify transaction fee.

## Economics model (`npm run costs:check`)

Per unit, from `ops/landed-cost.csv`:

- Selling price − product − print − supplier shipping = **contribution before payment fee**
- − gateway fee = **prepaid contribution**
- − supplier COD fee instead of the gateway fee = **COD contribution**
- Margins are on net revenue (price ÷ (1 + output GST)).
- **GST shown separately:** output GST collected, input GST on supplier charges, net payable (with or without input tax credit).
- **Target prices:** the price for 50 / 55 / 60% margin, prepaid and COD.
- **RTO:** shown as the cost of one failed delivery; no RTO rate is assumed.

Every input needs a source and date. A row with a blank input shows no figures.

## What the current prices can absorb (no supplier figures used)

Maximum product + print + supplier shipping per unit, before payment fee, for each target margin. Output GST isn't confirmed (CA), so both candidate rates are shown.

| Product | Price  | Output GST | Net revenue | 50%    | 55%    | 60%    |
| ------- | ------ | ---------- | ----------- | ------ | ------ | ------ |
| Tee     | ₹999   | 5%         | ₹951        | ≤ ₹476 | ≤ ₹428 | ≤ ₹381 |
| Tee     | ₹999   | 18%        | ₹847        | ≤ ₹423 | ≤ ₹381 | ≤ ₹339 |
| Tote    | ₹599   | 5%         | ₹570        | ≤ ₹285 | ≤ ₹257 | ≤ ₹228 |
| Tote    | ₹599   | 18%        | ₹508        | ≤ ₹254 | ≤ ₹228 | ≤ ₹203 |
| Tumbler | ₹1,099 | 5%         | ₹1,047      | ≤ ₹523 | ≤ ₹471 | ≤ ₹419 |
| Tumbler | ₹1,099 | 18%        | ₹931        | ≤ ₹466 | ≤ ₹419 | ≤ ₹373 |

The payment fee comes on top. Costs count ex GST if you claim input tax credit, otherwise including GST.

## Missing inputs

Every supplier value is still missing; see `docs/suppliers/data-request.md` (P1–P10, Q1–Q8, T1–T8, O1–O4). The fastest route is to allow the supplier domains in the environment's network settings so Claude can read the official pages itself.

**Tee print cost:** Printrove's charge depends on how it bills print (per sq in of the placed design, or by template size) and on the template's dimensions (P5–P7). The approved masters' inked area at native 300 DPI is about 7.9 × 12.9 in to 10.9 × 13.3 in (`artwork-manifest.json`), but that alone is **not** the billed area. Print cost isn't calculated until P5–P7 are known.

## SEO: corrected in the catalogue source (not yet in Shopify)

`app/data/catalogue/index.ts` now builds the search description from the longest closing that fits in 160 characters, so it always ends on a full sentence. Re-exported: only these 4 descriptions changed (all 24 now end with a full stop, longest 160).

| Handle                        | Corrected description (chars)                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `corporate-survivor-tote`     | This meeting could have been an email. A sturdy cotton canvas tote with long handles — laptop, groceries, life. Made to order in India. (135)          |
| `bestie-energy-oversized-tee` | She knows too much. That’s why she’s my bestie. A heavyweight, relaxed-fit tee with dropped shoulders and a boxy drape. Made to order in India. (143)  |
| `bestie-energy-tote`          | She knows too much. That’s why she’s my bestie. A sturdy cotton canvas tote with long handles — laptop, groceries, life. Made to order in India. (144) |
| `bestie-energy-tumbler`       | She knows too much. That’s why she’s my bestie. A 20oz insulated stainless steel tumbler, printed edge to edge. Made to order in India. (135)          |

Applying them to the live store means 4 `productSet` updates (SEO description only, same handles; still DRAFT and unpublished). That needs your approval.

## Unchanged by design

24 draft products, 4 unpublished collections (customer name **The Edit**, handle `trending`), no images, nothing published, payments/shipping/policies/domains untouched, default Home page collection left as is, no other store touched.
