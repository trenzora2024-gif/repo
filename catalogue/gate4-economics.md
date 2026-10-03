# Gate 4: economics and launch data (2026-10-03)

Status: **prices stay PROVISIONAL** (₹999 tee / ₹599 tote / ₹1,099 tumbler, GST inclusive). `ops/landed-cost.csv` stays blank: there is still no written quote, rate card or dashboard figure on file, so `npm run costs:check` correctly shows no margin. Nothing in Shopify was changed for Gate 4.

## 1. Verified landed costs

None yet. Printrove and Qikink both fulfil (owner-confirmed capability), but no price, GST treatment, weight or shipping figure has been read from a supplier's own dashboard, rate card or quote. Their websites are blocked from the Claude cloud environment, so nothing could be checked from there.

## 2. Indicative only (unverified, not in `ops/landed-cost.csv`)

These figures come from web-search snippets of the suppliers' public pages. The pages themselves couldn't be opened, so they may be stale or wrong. Use them only to see roughly where prices land, and confirm each one in the supplier dashboard.

| Item                          | Unverified public figure                      | Source shown in search                     |
| ----------------------------- | --------------------------------------------- | ------------------------------------------ |
| Printrove oversized tee blank | ₹240 (up to 2XL)                              | printrove.com product-tag/oversizedtshirts |
| Printrove DTG print           | ₹0.8–0.9 per sq in, minimum ₹80–90            | same                                       |
| Printrove GST on apparel      | 5%                                            | same                                       |
| Printrove shipping            | ₹60 per 500 g (domestic flat)                 | same                                       |
| Qikink Everyday Large tote    | ₹210                                          | help.qikink.com pricing                    |
| Qikink Tumbler Bottle (20 oz) | ₹440                                          | same                                       |
| Qikink shipping               | ₹54 air / ₹42.37 surface per 500 g, + 18% GST | qikink.com help: product weight            |
| Qikink COD fee                | ₹34 per order + 18% GST                       | same                                       |
| Qikink RTO                    | no RTO charge, prepaid or COD                 | qikink.com help: no RTO charges            |

Print area for the tee, from `artwork-manifest.json` ink bounds at native 300 DPI: about 7.9 × 12.9 in (≈100 sq in) up to 10.9 × 13.3 in (≈145 sq in, Corporate Survivor). That puts the tee print at roughly ₹80–131.

### Indicative contribution at current prices (per prepaid order)

Assumptions, all labelled: prepaid gateway 2% + 18% GST on the fee (typical, gateway not chosen); output GST 5% tee, 18% tote and tumbler (CA to confirm); shipping absorbed by Trenzora; no packaging insert, COD, RTO or reprint allowance.

- **Best case:** GST-registered, input tax credit on supplier invoices, low print cost, no Shopify fee.
- **Worst case:** no input tax credit (GST is a cost), high print cost, plus 2% Shopify third-party-gateway fee.

| Product       | Retail | Net of GST | Landed (best → worst) | Contribution (best → worst) | Margin (best → worst) | Price for 35% margin, worst case |
| ------------- | ------ | ---------- | --------------------- | --------------------------- | --------------------- | -------------------------------- |
| Oversized tee | ₹999   | ₹951       | ₹404 → ₹503           | ₹548 → ₹448                 | 58% → 47%             | ₹799                             |
| Tote          | ₹599   | ₹508       | ₹278 → ₹338           | ₹229 → ₹170                 | 45% → 33%             | ₹614                             |
| 20oz tumbler  | ₹1,099 | ₹931       | ₹520 → ₹631           | ₹411 → ₹301                 | 44% → 32%             | ₹1,149                           |

A COD order adds about ₹40 on Qikink items (₹34 + GST). Printrove's COD and RTO charges are unknown.

## 3. Supplier inputs still missing (cannot be assumed)

From the Printrove and Qikink dashboards or a written quote, with date:

1. **Exact blank and ID** per product: tee (GSM, 100% cotton?), tote (cotton canvas, size), tumbler (double-wall insulated steel with lid?). The site copy claims these, so they must match.
2. **Unit price per size** (tee S–XXL; check whether XXL costs more) and **print price at our print size**, and whether GST is **included**.
3. **Packed weight** per product, which sets the shipping slab.
4. **Shipping rate** by zone and air/surface, and whether it is ex GST.
5. **Printrove COD fee and RTO policy/charge.** Qikink's COD fee and no-RTO policy need confirming in the dashboard.
6. **Print areas** (`ops/supplier-templates.ts`) so `npm run supplier:check` can confirm print resolution.
7. **Blind shipping / white-label invoice** confirmation, and the cost of any branded insert.

From you or your CA:

8. **GST registration** (yes/no) and therefore whether input tax credit applies. This is the single biggest swing in the table above.
9. **Output GST rates:** apparel 5% (≤ ₹2,500); cotton tote and steel tumbler rates (HSN) after the 2025 rate changes.
10. **Payment gateway** and its rate; **Shopify's transaction fee** for that gateway on the Basic plan (Admin → Settings → Plan).
11. **Shipping policy:** customer pays at checkout (current site copy says "calculated at checkout") or free shipping absorbed into price.
12. **COD:** offer it or not; if yes, any COD fee to the customer.

## 4. Pricing recommendation

- **Tee ₹999: keep.** Healthy even in the worst case.
- **Tote ₹599 and tumbler ₹1,099: keep for now, but decide once costs are verified.** Under the unverified figures they reach ~33% / 32% only when no input tax credit applies _and_ Shopify charges 2%. If verified costs confirm that, move to **tote ₹649** and **tumbler ₹1,199**. Both are inside the agreed target ranges (₹499–₹699 and ₹899–₹1,199).
- If you offer free shipping or COD, rerun with those costs before approving.

Final prices come from `npm run costs:check` once `ops/landed-cost.csv` has sourced rows. Then set `PRICE_STATUS = 'approved'`.

## 5. SEO descriptions cut at 160 characters (prepared, not applied)

The export truncates `tagline + summary + "Original Trenzora design, made to order in India."` at 160 characters (`app/data/catalogue/index.ts`). Corrected text, ≤ 160 characters and ending on a full sentence:

| Handle                        | Live (cut)              | Corrected (chars)                                                                                                                                              |
| ----------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `corporate-survivor-tote`     | …made to order in India | This meeting could have been an email. A sturdy cotton canvas tote with long handles — laptop, groceries, life. Original Trenzora design, made in India. (152) |
| `bestie-energy-oversized-tee` | …made to order          | She knows too much. That’s why she’s my bestie. A heavyweight, relaxed-fit tee with dropped shoulders and a boxy drape. Made to order in India. (143)          |
| `bestie-energy-tote`          | …made to order          | She knows too much. That’s why she’s my bestie. A sturdy cotton canvas tote with long handles — laptop, groceries, life. Made to order in India. (144)         |
| `bestie-energy-tumbler`       | …made to order in India | She knows too much. That’s why she’s my bestie. A 20oz insulated stainless steel tumbler, printed edge to edge. Made to order in India. (135)                  |

Applying them means a small change to the SEO builder in `app/data/catalogue/index.ts` (drop the closing clause when it doesn't fit), a re-export, and 4 `productSet` SEO updates. That needs your approval.

## 6. Unchanged by design

24 draft products, 4 unpublished collections (customer name **The Edit**, handle `trending`), no images, no publishing, payments and shipping not activated, the default Home page collection left as is, no other store touched.
