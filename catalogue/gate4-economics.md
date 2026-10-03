# Gate 4: supplier economics and tax verification (2026-10-03)

Prices stay **PROVISIONAL**: ₹999 tee / ₹599 tote / ₹1,099 tumbler (GST inclusive). Nothing in Shopify was changed for Gate 4. Not approved: awaiting owner review.

## Network check (2026-10-03)

| Domain                     | Result                                                                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| printrove.com              | reachable                                                                                                                                          |
| qikink.com                 | reachable                                                                                                                                          |
| help.qikink.com            | reachable (redirects to qikink.com/help/)                                                                                                          |
| cbic-gst.gov.in            | reachable                                                                                                                                          |
| cbic.gov.in                | **not verified**: its server sends an incomplete certificate chain (Sectigo OV R36 intermediate missing), so TLS verification fails. Not bypassed. |
| taxinformation.cbic.gov.in | **blocked** by the environment's network policy (CBIC's current rate finder; cbic-gst.gov.in links to it)                                          |

## A. Verified official supplier data

Every value is in `ops/landed-cost.csv` with its source URL, date and notes.

### Printrove oversized tee: https://printrove.com/products/oversized-t-shirts

| Item                    | Value on the page                                                 |
| ----------------------- | ----------------------------------------------------------------- |
| Base price              | ₹240, "upto 2XL" (all sizes XS–2XL)                               |
| Printing, white tee     | ₹0.8 per sq in, minimum ₹80                                       |
| Printing, other colours | ₹1.5 per sq in, minimum ₹120                                      |
| GST                     | 5%, "applicable on product price (base price + printing charges)" |
| Shipping (prepaid)      | ₹60 per 500 g; "each t-shirt weighs about 250 grams"              |
| COD                     | flat ₹50 extra on standard shipping (₹110 total)                  |
| GST on shipping / COD   | not stated                                                        |
| RTO / return charge     | not stated                                                        |
| Print methods listed    | Direct to garment, Direct to film, Screen print for bulk          |

Print cost depends on the blank colour (not chosen) and the billed area. The page doesn't say what area is billed. The CSV brackets it: minimum charge vs the full front template (15.60 × 19.60 in = 305.76 sq in → ₹244.61 white / ₹458.64 coloured).

### Qikink 20 oz tumbler: https://qikink.com/custom/drinkware/tumbler-bottle/

| Item                | Value on the page                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------- |
| Exact product       | "Tumbler Bottle", 20 Oz, White (only colour listed)                                      |
| Base price          | ₹440 ex GST; ₹519 shown = ₹440 + 18%                                                     |
| Printing            | included ("18% GST with print charges included")                                         |
| GST                 | 18% (product tax rate on the page)                                                       |
| Shipping            | ₹54 (sample pricing table)                                                               |
| COD                 | ₹34 (sample pricing table)                                                               |
| GST in sample       | ₹95 on ₹440 + ₹54 + ₹34 (= 18% of ₹528; the rate on shipping/COD is implied, not stated) |
| Total in sample     | ₹623                                                                                     |
| Weight              | 450 g; shipping weight 500 g                                                             |
| RTO / return charge | not stated                                                                               |

### Qikink tote: https://qikink.com/custom-tote-bags/

**Exact product not identified.** The page is a range/bulk page with six styles and "From" prices only: Unisex Tote Bag Zipper ₹130, Unisex Tote Bag Non-Zipper ₹100, Everyday Large Tote Bag ₹200, AOP Tote Bag Zipper ₹200, AOP Tote Bag Non-Zipper ₹200, AOP Large Tote Bag ₹270.

It doesn't say whether print or GST is included. It gives no single-piece print charge, GST rate, shipping, COD, RTO or weight. Bulk tiers (50+ pcs, Zipper tote with 10×10 in DTF) don't apply to POD. Our "Everyday Tote" (cotton canvas, long handles, one side) is **not** assumed to be Qikink's "Everyday Large Tote Bag" (multiple compartments). Nothing is entered in the CSV.

## B. Verified official GST/CBIC data

**None.** https://cbic-gst.gov.in/gst-goods-services-rates.html ("GST rates for Goods and Services as on 01.04.2023") offers only the 2017 schedules and says "Kindly visit the website" https://taxinformation.cbic.gov.in/, which is blocked here. The 2017 schedules aren't current and aren't used. No HSN, rate, threshold, threshold basis or effective date is entered.

Supplier-side rates (what the supplier charges us, not our output rate): Printrove 5% on the tee, Qikink 18% on the tumbler.

## C. Owner business inputs (`ops/business-inputs.csv`)

GST registered; ITC eligible subject to normal rules (no ITC % assumed); retail prices GST inclusive, never added at checkout or shown as a surcharge. Payment gateway, gateway fixed fee and Shopify transaction fee: not finalised (blank).

## D. Unknown / not yet verified

- Output GST rate, HSN, any per-piece threshold and its basis, and effective date: tee, tote, tumbler.
- Tote: exact Qikink product and all its costs.
- Tee: blank colour; billed print area; GST on shipping/COD; RTO charge; whether our XXL is Printrove's 2XL.
- Tumbler: whether ₹54 shipping applies to every pin code (labelled "sample"); RTO charge.
- Payment fees.

## Model (`npm run costs:check`)

`catalogue/landed-cost-report.md` now shows the verified supplier charges per unit. Contribution, embedded GST and target prices appear for each row once the output GST rate (and any threshold) is entered from an official source. Payment fees may stay blank: contribution is then shown before payment fee only. Target prices are solved at the GST rate the resulting price attracts, including across a threshold.

## Product specifications (for mockup validation)

**Tee (Printrove):**

- 100% combed cotton, single jersey, bio-washed, side-seamed, made in India.
- **GSM conflict on the page:** "220 GSM" in the spec list vs "180 gsm" under Durable Fabric.
- Fit: unisex, loose and boxy.
- Colours: baby blue, black, dusty rose, iris lavender, navy blue, red, royal blue, white, bottle green, burgundy, steel grey.
- Sizes: XS, S, M, L, XL, 2XL.
- Design template 15.60 × 19.60 in front, and the same at back.
- DTG with Epson Ultrachrome DG inks; PNG with transparent background, RGB, max 16 MB, max 5000 px.

**Tote (Qikink):**

- Exact product not identified.
- Page-level facts: cotton totes in white, black, navy blue, bottle green, khaki, red, maroon; 200 GSM cotton canvas.
- Print methods: DTG, DTF or embroidery on cotton; sublimation on polyester AOP totes.
- Max print area: 10 × 12 in per side on the standard Unisex Tote, 12 × 14 in on the Everyday Large Tote.
- Dimensions: not stated. "Natural" colour: not listed.

**Tumbler (Qikink):**

- 20 oz; 304 stainless steel; double-wall insulated (FAQ: double-wall vacuum insulation).
- Splash-proof lid, metal straw; white.
- Sublimation, printed around the tumbler; max printable area 9.5 × 8 in; PNG/JPEG at 300 DPI.

## Gate 4B: follow-up (2026-10-03)

**Apparel GST.** The tee is modelled at **5% up to ₹2,500 per piece, 18% above, effective 22 Sep 2025**. This is the owner-provided rule; the old ₹1,000 threshold is not used. No official text could be read here:

- cbic-gst.gov.in has no 2025 rate material (61 pages and 282 linked PDFs checked).
- pib.gov.in, gstcouncil.gov.in, taxinformation.cbic.gov.in and egazette.gov.in are blocked by the network policy.
- cbic.gov.in fails TLS verification.

Classification: HSN 6109, chapter 61 (knitted T-shirts). This is reasoned from Printrove's "single jersey" 100% cotton description, not verified. At ₹999 the rate is 5% whether the threshold uses the GST-inclusive price (₹999) or the taxable value (₹951). Every tee target price below is also under ₹2,500 on either basis.

**Tote: best match, owner to confirm.** Qikink "Unisex Tote Bag Zipper" (product 19): https://qikink.com/custom/bags/tote-bag/ (`/custom/bags/19/` redirects there).

| Item           | Value on the page                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Material       | 100% cotton woven canvas, minimum 200 GSM; double-stitched; long handles                                                  |
| Colours        | white, black, navy blue, bottle green, red, maroon, khaki                                                                 |
| Base price     | ₹150 ex GST, all colours (₹158 shown incl. 5%; "Print & shipping charges extra")                                          |
| Print methods  | DTG, DTF, embroidery; POD prints the front only                                                                           |
| Max print area | DTF/DTG 10 × 12 in; embroidery 3.5 × 3.5 in                                                                               |
| Artwork        | PNG/JPEG, 300 DPI, trim extra space                                                                                       |
| Weight         | 135 g white / 150 g other colours; shipping weight 150–160 g                                                              |
| Sample table   | Non Zipper DTF ₹115 + print ₹80 + ship ₹54 + COD ₹34 + GST ₹32 = ₹315; Zipper DTF ₹150 + ₹80 + ₹54 + ₹34 + GST ₹36 = ₹354 |
| Not stated     | dimensions; print charge for a given size (the ₹80 has no size); RTO; HSN                                                 |

The sample GST doesn't reconcile with a single stated rate, so GST on print, shipping and COD is left blank. Non Zipper appears only in that sample table; the page's only orderable type is "Standard". All ten V7 masters fit 10 × 12 in at 322 DPI or better.

Alternative ruled out as the default: "Unisex Everyday Large Tote bag" (https://qikink.com/custom/bags/large-tote-bag/). It's ₹210, white/black only, nylon-lined with compartments, 16.5 × 14.5 in. Its page gives two different print areas: 10 × 10 in in its design guidelines and 10 × 12 in in its FAQ.

**Tote economics are not calculated**: the print cost is unverified.

**Tee GSM.** The "220 GSM bio-washed fabric" line is the product-specific spec. The conflicting "180 gsm … Lasts up to 20 washes" block is word-for-word the same on Printrove's round-neck tee page (180 GSM) and oversized hoodie page (320 GSM). So it is shared template copy: likely a page error, not a variant. Confirm with the sample.

**Tee sizes.** Printrove lists XS, S, M, L, XL, 2XL and never mentions "XXL". The size guide loads from framerusercontent.com, which is blocked. **XXL = 2XL needs confirmation**; the catalogue is unchanged.

**Tee print cost.** The page gives a rate per sq in and a minimum charge but doesn't define the billed area (design bounding box, placed size, or template). Both scenarios stay as separate rows; launch economics must not assume the cheaper one.

- For information only, not used: V1 masters at native 300 DPI have ink bounds of 90–145 sq in.
- At ₹0.8/sq in (white) that would be ₹80–₹116; at ₹1.5/sq in (coloured) ₹135–₹218. This holds only if billing uses the ink bounding box at native size.

**Tumbler.** Qikink's page gives no HSN or classification. Its 18% is the supplier's charge to us and is kept separate; our output GST stays unverified.

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
