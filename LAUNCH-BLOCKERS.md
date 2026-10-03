# Launch blockers

Prioritised by dependency (updated 2026-10-03: prices approved, White blanks decided, Gate 5 prepared). Items are grouped by **what they block**, not by how unknown they are. Most remaining items need your login, money, a supplier reply, a legal call or a business decision.

Nothing has been connected to, imported into or published on any Shopify store beyond the approved Gates 1–3 below. MaternEase has not been touched: the app and `verify:store` refuse it, and the repo references it only in those guards.

## Where things stand

| Gate                                            | Status                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Link Hydrogen to `trenzora-in.myshopify.com` | Approved and run locally (Option B). Permanent ID `hetvyh-8e.myshopify.com`, primary domain `trenzora.in`, INR. The cloud environment still gets 403 from every Shopify host.                                                                                                                                                                            |
| 2. Import 24 draft products / 56 variants       | Done. All `DRAFT`, 0 publications, 0 media, prices ₹999 / ₹599 / ₹1,099. The corrected product copy (below) is in the catalogue source and import files, not yet in Shopify: apply it with the 4 SEO fixes at Gate 5 by re-running `catalogue/admin/products.productSet.json` (keyed by handle, so it updates the drafts in place; needs your approval). |
| 3. Create 4 smart collections                   | Done, unpublished: Mumbai Made 12, Drops 24, Gifts 18, The Edit 12. Shopify's default `frontpage` collection contains the draft `mumbai-made-oversized-tee` (not added by us). Decide before Gate 5 whether it stays.                                                                                                                                    |
| 4. Pricing, supplier economics, imagery         | **Decided by the owner on 2026-10-03.** Prices ₹999 / ₹599 / ₹1,099 (final). White blanks for all three products, no other colours or variants. V7 artwork locked. Supplier costs are internal tracking only (`catalogue/gate4-economics.md`). Studio renders stay as temporary previews until supplier mockups on the White blanks exist.               |
| 5. Real-data QA                                 | **Prepared, not run.** Steps, validated Admin GraphQL (`catalogue/admin/gate5.graphql`) and rollback are in `docs/GATE5-RUNBOOK.md`. Option: Active + Hydrogen channel only, private Oxygen preview, test gateway or store password. Needs your approval and Shopify access.                                                                             |
| 6. Go live                                      | Not started.                                                                                                                                                                                                                                                                                                                                             |

**Technical preparation (no supplier input needed), all green on 2026-10-03:**

- Production build passes, with no product renders in the build.
- `lint` and `typecheck` pass.
- `launch:audit` 67/67.
- `qa:storefront` passes on mobile (390 px) and desktop (1440 px): every route, sitemap, robots, one H1 per page, and home → collection → product → variant → add to cart → cart → checkout handoff (stops before checkout).
- Analytics events fire in order: `page_view`, `view_item`, `add_to_cart`, `begin_checkout`.
- `supplier:check`: all eight V1 masters fit the tee, tote and tumbler print areas at 197 DPI or better.

## ACTION REQUIRED FROM ME

Only things that need your login, money, legal/tax information, supplier accounts or an irreversible approval. Everything else is done or proceeding.

1. **Payment gateway.** Activate one (Shopify Payments if eligible, Razorpay or PayU), decide on COD, and enable a test mode for Gate 5. _(Shopify login, money)_
2. **Store tax details.** Legal name, address, GSTIN, HSN codes and rates from your CA; turn "All prices include tax" on. _(Shopify login, GST/HSN)_
3. **Policies and contact.** Publish the refund, privacy, terms and shipping policies in Shopify; create the `hello@trenzora.in` mailbox. _(Shopify login)_
4. **Supplier apps.** Install the Printrove and Qikink Shopify apps and authorize them on the Trenzora store. Send the two requests in `docs/suppliers/`; the essential answers are Printrove 2XL = XXL (Q4) and how each app links our existing products (Printrove Q18, Qikink Q14). _(supplier accounts)_
5. **Mockups.** In each supplier's designer, place the masters from your local `artwork/masters/` (gitignored, so not in this checkout) on the White blanks and export the front mockups to `artwork/mockups/<handle>/01-front.jpg`, or send them to me. List: `catalogue/image-replacement-map.csv`. _(supplier accounts)_
6. **Shopify access for deployment.** Allow the Shopify hosts in this environment's network settings (O9), or run the Gate 5 steps from your machine. _(Shopify login)_
7. **Approve Gate 5** (`docs/GATE5-RUNBOOK.md`: products Active on the Hydrogen channel only, private preview, one test order). Later, **approve Gate 6** (go live: domain, publishing, real payments). _(irreversible)_
8. **Legal calls.** DPDP consent banner (yes/no), and whether the draft `mumbai-made-oversized-tee` stays in Shopify's default `frontpage` collection.

## 1. Must resolve before accepting orders

| #   | What                                                                                                         | Notes                                                                                                                                                                                                                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| O1  | **Payment gateway** activated (Shopify Payments if eligible, Razorpay or PayU) and a **COD decision**        | Checkout can't take money without it. Qikink charges nothing for RTO. Printrove's RTO shipping charge is unknown (quote Q15), which matters for COD on tees.                                                                                                                                                              |
| O2  | **Supplier fulfilment connected**: Shopify → Printrove and Shopify → Qikink, with SKU/variant mapping        | Ask each supplier whether its app can link our existing Shopify products (Printrove quote Q18, Qikink Q14). **Printrove must confirm 2XL = our XXL** (quote Q4); until then the XXL variant can't be mapped.                                                                                                              |
| O3  | **Store tax and business details** in Shopify (Settings → Store details, Taxes)                              | Legal name, address, GSTIN, HSN codes and rates (with your CA). "All prices include tax" must be **on**.                                                                                                                                                                                                                  |
| O4  | **Policies** in Shopify (Settings → Policies): refund, privacy, terms, shipping                              | Refund must match the site: replacement for damaged, misprinted or wrong items reported **within 7 days** with a photo; no change-of-mind returns on printed-to-order items.                                                                                                                                              |
| O5  | **Contact channels**: create `hello@trenzora.in` and confirm Instagram `@trenzora.in`                        | Printed site-wide.                                                                                                                                                                                                                                                                                                        |
| O6  | ~~Customer-facing product claims~~ **done 2026-10-03**                                                       | Copy now states only what the supplier pages publish. Tee: "100% cotton", "relaxed, boxy oversized fit", "printed to order in India" (no heavyweight, rib or DTG claim). Tote: "cotton canvas", "long handles". Tumbler: "design printed front and centre".                                                               |
| O7  | ~~Blank colours~~ **decided 2026-10-03**                                                                     | White tee, White tote, White tumbler. Recorded in `ops/supplier-templates.ts`, `catalogue/supplier-orders/*.csv` and the image map.                                                                                                                                                                                       |
| O9  | **Deployment path**: allow Shopify hosts in this environment's network settings, or deploy from your machine | Every Shopify host returns 403 here. Hosts: `shopify.com`, `*.shopify.com`, `*.myshopify.com`, `shopifycdn.com`, `*.shopifysvc.com`, `*.shopifyapps.com`. Set `PUBLIC_CHECKOUT_DOMAIN` to `trenzora.in` while the Online Store serves it; switch to `checkout.trenzora.in` before Gate 6 moves `trenzora.in` to Hydrogen. |
| O10 | **Domain** `trenzora.in`: confirm you can change its DNS                                                     | Needed at Gate 6. It points at Shopify today.                                                                                                                                                                                                                                                                             |
| O11 | **Consent banner** (legal call)                                                                              | Shopify analytics run without a cookie banner (Shopify's India default). If counsel wants DPDP consent, it's a one-line change.                                                                                                                                                                                           |
| O12 | **Gates 5 and 6**                                                                                            | Real-data QA with a test order, then go live.                                                                                                                                                                                                                                                                             |

## 2. Final pricing: approved, no blockers

The owner approved ₹999 / ₹599 / ₹1,099 on 2026-10-03. They are not recalculated from supplier costs unless the owner asks.

Still tracked internally in `ops/landed-cost.csv` and `npm run costs:check` (does not block anything):

- Printrove's actual print-billing basis (tee scenario B).
- Output GST for the tote and tumbler.
- Payment-gateway fees.

At ₹999 the tee's contribution before payment fee is between ₹193 (full template, coloured blank) and ₹571 (minimum charge, white blank).

## 3. Must resolve before replacing preview imagery

The current studio renders stay as temporary preview assets. They are dev-only and not in the production build, so without supplier mockups the live site shows concept cards. Full list: `catalogue/image-replacement-map.csv`. `npm run mockups:check` counts confirmed mockups (currently 0/24).

| #   | What                                                                               | Notes                                                                                                                                                                                                                                                                                     |
| --- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I1  | ~~Working tote~~ **locked**                                                        | Qikink Unisex Tote Bag Zipper, `TbZp`, type Standard, White.                                                                                                                                                                                                                              |
| I2  | ~~Blank colours~~ **decided**                                                      | White for all three. The temporary renders show an off-white tee and a natural tote; they are replaced, not regenerated.                                                                                                                                                                  |
| I3  | **Supplier-designer mockups** for the 24 V1 products, made from the locked masters | Save as `artwork/mockups/<handle>/01-front.jpg` (2048 px square recommended). Masters are scaled in the supplier designer, never edited. The tote needs downscaling to fit 10 × 12 in (322 DPI or better); `catalogue/supplier-templates.md` has the printed size per master and product. |

## 4. Can safely be verified after launch

- **One physical sample per product** (ideally Mumbai Made). Recommended before promoting the store; it doesn't block taking orders.
- **Delivery promise** ("printed 2–4, delivered 3–7, total 5–11 working days"). The public pages (2026-10-03) fit inside it: Printrove 5–9 days total (https://printrove.com/shipping), Qikink 2–3 days processing + 2–5 days delivery (https://qikink.com/shipping/).
- **Supplier construction details** not shown to customers: tee GSM, neck rib, tote zip and dimensions.

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
