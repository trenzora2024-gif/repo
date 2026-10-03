# Launch blockers

Prioritised by dependency (updated 2026-10-03, after Gate 4D). Items are grouped by **what they block**, not by how unknown they are. Most remaining items need your login, money, a supplier reply, a legal call or a business decision.

Nothing has been connected to, imported into or published on any Shopify store beyond the approved Gates 1–3 below. MaternEase has not been touched: the app and `verify:store` refuse it, and the repo references it only in those guards.

## Where things stand

| Gate                                            | Status                                                                                                                                                                                                                |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Link Hydrogen to `trenzora-in.myshopify.com` | Approved and run locally (Option B). Permanent ID `hetvyh-8e.myshopify.com`, primary domain `trenzora.in`, INR. The cloud environment still gets 403 from every Shopify host.                                         |
| 2. Import 24 draft products / 56 variants       | Done. All `DRAFT`, 0 publications, 0 media, provisional prices.                                                                                                                                                       |
| 3. Create 4 smart collections                   | Done, unpublished: Mumbai Made 12, Drops 24, Gifts 18, The Edit 12. Shopify's default `frontpage` collection contains the draft `mumbai-made-oversized-tee` (not added by us). Decide before Gate 5 whether it stays. |
| 4. Pricing, supplier economics, imagery         | **Open.** Working position recorded (`catalogue/gate4-economics.md` → Gate 4D). Prices stay provisional: ₹999 / ₹599 / ₹1,099.                                                                                        |
| 5. Real-data QA                                 | Not started. Recommended option: Active + Hydrogen channel only, private Oxygen preview, test gateway or store password.                                                                                              |
| 6. Go live                                      | Not started.                                                                                                                                                                                                          |

**Technical preparation (no supplier input needed), all green on 2026-10-03:**

- Production build passes, with no product renders in the build.
- `lint` and `typecheck` pass.
- `launch:audit` 67/67.
- `qa:storefront` passes on mobile (390 px) and desktop (1440 px): every route, sitemap, robots, one H1 per page, and home → collection → product → variant → add to cart → cart → checkout handoff (stops before checkout).
- Analytics events fire in order: `page_view`, `view_item`, `add_to_cart`, `begin_checkout`.
- `supplier:check`: all eight V1 masters fit the tee, tote and tumbler print areas at 197 DPI or better.

## Your next actions (in dependency order)

1. **Send the two quote requests.** I can't send email or message suppliers from here.
   - [`docs/suppliers/printrove-quote-request.md`](docs/suppliers/printrove-quote-request.md)
   - [`docs/suppliers/qikink-tote-quote-request.md`](docs/suppliers/qikink-tote-quote-request.md)

   Attach `01_mumbai_made.png` from your master pack. The masters are gitignored, so they aren't in the cloud checkout. Paste the replies (or screenshots) here and I'll record them in `ops/landed-cost.csv` and re-run `npm run costs:check`.

2. **Choose the tee and tote blank colours.** All eight designs are black ink with a red rule on a transparent background, so they need light blanks.
   - Printrove tee colours: baby blue, black, dusty rose, iris lavender, navy blue, red, royal blue, white, bottle green, burgundy, steel grey.
   - Qikink tote colours: white, black, navy blue, bottle green, red, maroon, khaki.
   - Tumbler: Qikink lists white only.
   - A white tee is billed at ₹0.8/sq in; every other colour at ₹1.5/sq in.
3. **Choose the payment gateway** and decide on COD.
4. **Ask your CA** for the output GST rate and HSN for the tote and the tumbler, and to confirm the tee's 5% at ₹999.

## 1. Must resolve before accepting orders

| #   | What                                                                                                                | Notes                                                                                                                                                                                                                                                                                                                                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| O1  | **Payment gateway** activated (Shopify Payments if eligible, Razorpay or PayU) and a **COD decision**               | Checkout can't take money without it. Qikink charges nothing for RTO. Printrove's RTO shipping charge is unknown (quote Q15), which matters for COD on tees.                                                                                                                                                                                                                                                   |
| O2  | **Supplier fulfilment connected**: Shopify → Printrove and Shopify → Qikink, with SKU/variant mapping               | Ask each supplier whether its app can link our existing Shopify products (Printrove quote Q18, Qikink Q14). **Printrove must confirm 2XL = our XXL** (quote Q4); until then the XXL variant can't be mapped.                                                                                                                                                                                                   |
| O3  | **Store tax and business details** in Shopify (Settings → Store details, Taxes)                                     | Legal name, address, GSTIN, HSN codes and rates (with your CA). "All prices include tax" must be **on**.                                                                                                                                                                                                                                                                                                       |
| O4  | **Policies** in Shopify (Settings → Policies): refund, privacy, terms, shipping                                     | Refund must match the site: replacement for damaged, misprinted or wrong items reported **within 7 days** with a photo; no change-of-mind returns on printed-to-order items.                                                                                                                                                                                                                                   |
| O5  | **Contact channels**: create `hello@trenzora.in` and confirm Instagram `@trenzora.in`                               | Printed site-wide.                                                                                                                                                                                                                                                                                                                                                                                             |
| O6  | **Customer-facing product claims checked** against supplier facts or a sample. Copy is unchanged until you approve. | **Tee:** "heavyweight jersey" and "ribbed crew neck" (Printrove states 220 GSM, combed cotton; ribbing not stated). **Tote:** "natural cotton canvas" (Qikink has no natural colour), "long shoulder handles" (Qikink's tote article says 11.5 in handle), zipper not mentioned. **Tumbler:** "printed edge to edge" (our placement is centred on the front; Qikink print area 9.5 × 8 in around the tumbler). |
| O7  | **One physical sample per product** (ideally Mumbai Made)                                                           | Confirms print quality and the claims in O6.                                                                                                                                                                                                                                                                                                                                                                   |
| O8  | **Delivery promise** ("printed 2–4, delivered 3–7, total 5–11 working days")                                        | Public pages, 2026-10-03: Printrove total turnaround 5–9 days (https://printrove.com/shipping); Qikink processing 2–3 days + delivery 2–5 days (https://qikink.com/shipping/). Both sit inside 5–11. Confirm in the quotes (Printrove Q17, Qikink Q15).                                                                                                                                                        |
| O9  | **Deployment path**: allow Shopify hosts in this environment's network settings, or deploy from your machine        | Every Shopify host returns 403 here. Hosts: `shopify.com`, `*.shopify.com`, `*.myshopify.com`, `shopifycdn.com`, `*.shopifysvc.com`, `*.shopifyapps.com`. Set `PUBLIC_CHECKOUT_DOMAIN` to `trenzora.in` while the Online Store serves it; switch to `checkout.trenzora.in` before Gate 6 moves `trenzora.in` to Hydrogen.                                                                                      |
| O10 | **Domain** `trenzora.in`: confirm you can change its DNS                                                            | Needed at Gate 6. It points at Shopify today.                                                                                                                                                                                                                                                                                                                                                                  |
| O11 | **Consent banner** (legal call)                                                                                     | Shopify analytics run without a cookie banner (Shopify's India default). If counsel wants DPDP consent, it's a one-line change.                                                                                                                                                                                                                                                                                |
| O12 | **Gates 5 and 6**                                                                                                   | Real-data QA with a test order, then go live.                                                                                                                                                                                                                                                                                                                                                                  |
| O13 | **Final prices approved**                                                                                           | Everything in section 2.                                                                                                                                                                                                                                                                                                                                                                                       |

## 2. Must resolve before final pricing

| #   | What                                                                                  | Status                                                                                                                                                                                                                              |
| --- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | **Printrove print charge and billing basis** for design 01 (quote Q6–Q8)              | Unknown. The model shows A (minimum charge, floor, not expected) and C (full 15.6 × 19.6 in template, conservative). At ₹999 the tee contribution before payment fee ranges from ₹193 (C, coloured blank) to ₹571 (A, white blank). |
| P2  | **Tee blank colour**                                                                  | Sets the print rate (₹0.8 vs ₹1.5 per sq in). Same decision as next action 2.                                                                                                                                                       |
| P3  | **Output GST rate and HSN** for the tote and tumbler; CA confirmation of the tee's 5% | The tee's 5% is owner-provided and not government-verified. Tote and tumbler margins aren't calculated until their rates are confirmed.                                                                                             |
| P4  | **Payment fees**: gateway %, fixed fee, GST on the fee, any Shopify transaction fee   | Needed for contribution after payment fee.                                                                                                                                                                                          |
| P5  | **Your approval** of final prices (`PRICE_STATUS` stays `provisional` until then)     | Live and mock catalogue prices don't change before this.                                                                                                                                                                            |

Already verified for pricing (sources in `ops/landed-cost.csv`):

- **Tote:** ₹150 + print (₹80–₹90 DTF), 5%; shipping ₹54 + 18%, COD ₹34 + 18%; no RTO charge.
- **Tumbler:** ₹440 including print, 18%; same shipping, COD and RTO terms.
- **Tee:** ₹240 base, 5%; shipping ₹60 and COD ₹50 (GST treatment unknown, treated as full cost).

## 3. Must resolve before replacing preview imagery

The current studio renders stay as temporary preview assets. They are dev-only and not in the production build, so without supplier mockups the live site shows concept cards. Full list: `catalogue/image-replacement-map.csv`. `npm run mockups:check` counts confirmed mockups (currently 0/24).

| #   | What                                                                               | Notes                                                                                                                                                                                                                                                                                     |
| --- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I1  | **Confirm the working tote**: Qikink Unisex Tote Bag Zipper, `TbZp`, type Standard | Recorded as a working mapping in `ops/supplier-templates.ts`, pending confirmation.                                                                                                                                                                                                       |
| I2  | **Blank colours** for the tee and tote                                             | Next action 2. Tumbler: white only.                                                                                                                                                                                                                                                       |
| I3  | **Supplier-designer mockups** for the 24 V1 products, made from the locked masters | Save as `artwork/mockups/<handle>/01-front.jpg` (2048 px square recommended). Masters are scaled in the supplier designer, never edited. The tote needs downscaling to fit 10 × 12 in (322 DPI or better); `catalogue/supplier-templates.md` has the printed size per master and product. |

## 4. Can safely be verified after launch

- **Printrove GST on ₹60 shipping and ₹50 COD.** The model treats them as the full cost, which can only over-state cost, and any GST is recoverable as input tax credit.
- **Exact tote print charge.** Already bounded at ₹80–₹90 for DTF.
- **Tote dimensions and exact weights.** Not used in pricing or current copy. The Shopify product weights (`weightGrams`: tee 300 g, tote 200 g) are above the supplier figures (tee about 250 g, tote 135–150 g). This only matters if you use weight-based shipping rates.
- **Qikink's ₹20 + 18% storage fee** on reshipped returns. Optional, charged per reship.
- **Customer accounts.** The site is guest-checkout only (no `/account` routes; `robots.txt` disallows `/account`). Add Shopify customer accounts later if wanted.
- **SEO.** Four corrected descriptions are in the catalogue source, not yet applied in Shopify. Apply with Gate 5.
- **GA4 / Meta pixel IDs.** Optional; the dataLayer and the custom Shopify pixel (`catalogue/shopify-custom-pixel.js`) are ready.
- **Editorial images.** The homepage, About and design-family studio renders (`public/visuals/editorial/`) ship with the site. Replace them with Drop 01 photography when it exists.
- **Upgrades.** React Router v8 future flags and the Shopify CLI update (4.8.4) are warnings only.

## Shopify authorization gates (in order)

| Gate | You approve                                    | What happens (nothing else changes)                            |
| ---- | ---------------------------------------------- | -------------------------------------------------------------- |
| 4    | Pricing, supplier economics, imagery, shipping | Nothing changes until you sign off.                            |
| 5    | Real-data QA                                   | Full QA on real products, `verify:store --cart`, a test order. |
| 6    | **Go live**: publish and take orders           | Domain, sitemap submission, selling enabled.                   |

Us and Make It Yours (V2) are never imported. If they're ever published by mistake, `verify:store` blocks the launch and their product pages show no Add to Cart.
