# Trenzora.com — Doba product research (final)

_Research date: 4–5 October 2026. Scope: US car-camping / basecamp catalog sourced through Doba. Nothing on the live store was changed._

**Files:** `catalog/doba-final-catalog.csv` (every product checked, all columns) · `catalog/research/doba-listings.json` (raw listing facts) · `catalog/research/market-prices.json` (retail benchmarks with URLs) · `catalog/research/selection.json` (editorial decisions) · `catalog/research/setups.json` · `catalog/research/economics.md` (generated tables) · `catalog/research/cost-calibration.json` · `catalog/research/doba-logged-in-costs.csv` (fill to replace derived costs) · `scripts/doba-research.ts` (regenerates everything).

## The answer in one paragraph

The niche survives on **demand and fit**, but **not on the margins the previous report assumed.** Doba's cost for the products this niche needs runs at about **82% of the lowest US retail price** (median across 65 VEVOR listings; 84% for other suppliers). VEVOR — the supplier with the stock, US warehouses, 2–7 day delivery and 99.6% fulfillment — sells the same items on vevor.com, Walmart, Home Depot and Best Buy. At those prices Trenzora keeps about **10% contribution before ads**. Priced up to 15% above the lowest identical retail price (the ceiling in this report), the 10 heroes reach **21.3%** and the 20-product launch mix **20.7%**. **No product reaches 30%, and only one (the AOSOM rocking-chair set, 24.9%) is near 25%.** $5K/month in revenue is reachable, but at break-even ROAS ~4.8× it is only profitable if most sales come from organic, SEO, email and setups rather than paid social. Treat this catalog as a demand test with tight ad limits — and fix the cost problem (logged-in cost check, VEVOR volume pricing, a second supplier) before scaling.

## How this research was done

**Doba access.** Every listing here was opened on doba.com, read from the product page's own data, and recorded in `catalog/research/doba-listings.json`. That data includes:

- the exact product URL, item number, UPC and supplier
- stock in each US warehouse
- the shipping rule and cost, processing time and delivery estimate
- the return window and the supplier's fulfillment and refund rates
- image count and video
- Doba's "max profit vs. MSRP" fields

**What was not available: a logged-in Doba session.** No Doba credentials exist in this workspace (no environment secret, no saved session), so the wholesale price that Doba shows after login could not be read directly. The cost used everywhere below is **derived** from the product page's public data:

- Doba publishes, on every product page, the maximum profit vs. MSRP as both an amount (`maxPriceProfitDiff`) and a rate (`maxPriceProfitRate`).
- So `MSRP = amount ÷ rate` and `Doba cost = MSRP − amount`.
- **Calibration:** trenzora.com already sells one of these listings, the VEVOR 550 lb wagon (item D0102X3YK0U), at Doba cost × 1.3. That implies a cost of $96.72. The derived cost is $98.06, within 1.4%.
- Calibration against more store items is in the appendix.
- Every cost is labeled "derived". **If the logged-in price differs, enter it in `catalog/doba-cost-inputs.csv` (`doba_sku_id`, `doba_cost_usd`) and run `node scripts/doba-research.ts`.** Every price, margin, score and decision below recalculates.

**Market prices.** Retail sites (vevor.com, Walmart, Home Depot, Amazon) refuse automated connections from this environment, so the lowest comparable US price was taken from web search results on 2026-10-04 and recorded with the retailer and URL in `catalog/research/market-prices.json`.

- Where the search result pointed at a store or category page rather than the product page, the CSV says so.
- Prices move daily. Re-check the 10 heroes by hand before setting prices.

**Store.** Nothing on trenzora.com, Shopify, Hydrogen, Meta or Google was changed. The only store data read was the public product feed, used to calibrate cost.

### Cost calibration against trenzora.com

| Store item | Doba SKU | Supplier | Doba rate | trenzora.com price | Implied cost (÷1.3) | Derived cost | Difference |
|---|---|---|---|---|---|---|---|
| D0102X3YK0U Collapsible Folding Wagon, 550lb Load & … | [ARQbqcuDePVo](https://www.doba.com/product/ARQbqcuDePVo/x.html) | vevor | 27% | $125.74 | $96.72 | $98.06 | +1.4% |
| D0102X3YK0G Double Decker Wagon Collapsible, 400L He… | [BeQRDPkCCYqc](https://www.doba.com/product/BeQRDPkCCYqc/x.html) | vevor | 27% | $146.54 | $112.72 | $114.29 | +1.4% |
| D0102HPC4E8 Underbody Truck Box, 60" x 17" x 18" Pic… | [mBDdqClSJQVM](https://www.doba.com/product/mBDdqClSJQVM/x.html) | vevor | 27% | $401.34 | $308.72 | $313.01 | +1.4% |
| D0102HPBEST Beach Dolly with Big Wheels for Sand, 29… | [zCDBboliOFqi](https://www.doba.com/product/zCDBboliOFqi/x.html) | vevor | 27% | $123.66 | $95.12 | $96.44 | +1.4% |
| D01027EA4K2 Ultra Thin Flip Shoe Cabinet, 8.66" Deep… | [ykKHQiJSOeqL](https://www.doba.com/product/ykKHQiJSOeqL/x.html) | Yapai Home | 46% | $106.11 | $81.62 | $75.38 | -7.6% |
| D0102HPBXR6 Hydraulic Wood Log Splitter Pump Kit, 13… | [maVMbQIAdevj](https://www.doba.com/product/maVMbQIAdevj/x.html) | vevor | 27% | $172.54 | $132.72 | $134.56 | +1.4% |
| D01027HGGR7 78"H 5-Tier Adjustable Heavy-Duty Storag… | [rlCybsAvGYDv](https://www.doba.com/product/rlCybsAvGYDv/x.html) | Munora | 38% | $175.67 | $135.13 | $135.58 | +0.3% |
| D0102HQ7FBV Outdoor Plant Container with Seat for Ga… | [tyDeFnSGuYql](https://www.doba.com/product/tyDeFnSGuYql/x.html) | Hooya Imp.& Exp.  | 45% | $102.62 | $78.94 | $77.66 | -1.6% |
| D01027R8TUJ Portable Cordless Pressure Washer with 2… | [cKCtQqYgvFVe](https://www.doba.com/product/cKCtQqYgvFVe/x.html) | vevor | 27% | $120.99 | $93.07 | $84.27 | -9.4% |

VEVOR items matched to within 1.4% on 5 of 6 (the pressure washer is −9.4%, likely a price change since it was imported). VEVOR costs below are corrected by that 1.4%. Other suppliers were within −7.7% to +0.3% and are not corrected.

## Fixed economics assumptions

| Item | Value | Why |
|---|---|---|
| Payment processing | 2.9% + $0.30 | Shopify Payments, Basic plan, US online card |
| Shipping | $0 | Free shipping verified on every listing. Shipping is "seller-selected", contiguous US. |
| Returns / refunds / damage allowance | 5% of price | Bulky goods. VEVOR's Doba refund rate is 3.05% and AOSOM's is 1.33%, plus a buffer for return shipping on non-defective returns. |
| Discount allowance | 2% of price | Blended bundle savings and occasional codes. Setups carry their own explicit discount instead. |
| Target contribution before ads | 25% (30% preferred) | From the brief |
| Price ceiling | Lowest identical US retail price + 15%, never above the highest seen | Trenzora can't charge much more than VEVOR.com, Walmart or Best Buy for the identical item |

**Recommended price** = the lowest price that meets the 25% target. When that is above the ceiling, the price is capped at the ceiling and the product is flagged "target not reachable".

**Score (out of 100):** customer problem 15 · Doba economics 20 (free shipping 5, stock 5, fulfillment 5, processing/delivery 5) · US demand 15 · competition 10 · margin 15 (≥30% → 15, ≥25% → 12, ≥20% → 9, ≥15% → 6, ≥10% → 3) · Meta potential 10 · SEO 5 · cross-sell 5 · video/demo 5. Problem, demand, competition, Meta, SEO, cross-sell and video are editorial 0–5 judgments in `selection.json`; the rest is computed from the listing.

## 10 hero products

| # | Product | Exact Doba URL | Supplier · item no. | Stock | Doba cost | Market low | Rec. price | Contribution | BE CAC | BE ROAS | Score | Img |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **SUV Tailgate Tent 8×8 ft (sleeps 6–8)** | [jAqdKQyGwobR](https://www.doba.com/product/jAqdKQyGwobR/dropshipping-suv-camping-tent-8-8-suv-tent-attachment-for-camping-with-rain-layer-and-carry-bag-pu2000mm-double-layer-truck-tent-accommodate-6-8-person-rear-tent-for-van-hatch-tailgate.html) | vevor · D0102HGJBJV | 222 | $109.51 | [$136.90](https://www.vevor.com/truck-tent-c_11508/vevor-suv-camping-tent-8-8-suv-tent-attachment-for-camping-with-carry-bag-waterproof-pu2000mm-double-layer-truck-tent-accommodate-6-8-person-rear-tent-for-van-hatch-tailgate-p_010359774655) (VEVOR) | $156.99 | $31.64 (20.2%) | $31.64 | 4.96× | 89 | 4/5 |
| 2 | **Canvas Bell Tent 3 m with stove jack** | [TZqbFWPfweVi](https://www.doba.com/product/TZqbFWPfweVi/dropshipping-canvas-bell-tent-4-seasons-3-m98ft-yurt-tent-canvas-tent-for-camping-with-stove-jack-breathable-tent-holds-up-to-4-people-family-camping-outdoor-hunting-party.html) | vevor · D0102HS0AFP | 234 | $195.10 | [$243.90](https://www.vevor.com/yurt-tent-c_10246/4-season3-m-9-8ft-waterproof-cotton-canvas-bell-tent-with-zipped-ground-sheet-p_010432929912) (VEVOR / Wayfair) | $279.99 | $56.87 (20.3%) | $56.87 | 4.92× | 86 | 5/5 |
| 3 | **12V Car Fridge 20 L (21 qt)** | [zDQmFaJcfKvl](https://www.doba.com/product/zDQmFaJcfKvl/dropshipping-12-volt-refrigerator-211-qt-20l-car-fridge-portable-ultra-light-epp-freezer-app-control-electric-compressor-12v24v-dc-14-f-to-50-f-for-truck-van-rv-suv-boat-travel-camping.html) | vevor · D01027EAJS6 | 185 | $119.91 | [$165.90](https://www.bestbuy.com/product/vevor-12-volt-refrigerator-21-1-qt-20l-car-fridge-portable-ultra-light-epp-freezer-app-control-electric-compressor-gray/JJGHKZ6F6Q/sku/12644699) (Best Buy) | $179.99 | $41.96 (23.3%) | $41.96 | 4.29× | 86 | 4/5 |
| 4 | **Car Side Awning 6.6×8.2 ft** | [mcVLbJdSnFDj](https://www.doba.com/product/mcVLbJdSnFDj/dropshipping-car-side-awning-large-66-x-82-shade-coverage-vehicle-awning-pu3000mm-uv50-retractable-car-awning-with-waterproof-storage-bag-height-adjustable-suitable-for-truck-suv-van-campers.html) | vevor · D0102HPBRG8 | 263 | $105.51 | [$131.90](https://www.vevor.com/awning-c_12491/vevor-car-side-awning-large-6-6-x-8-2-shade-coverage-vehicle-awning-pu3000mm-uv50-retractable-car-awning-with-waterproof-storage-bag-height-adjustable-suitable-for-truck-suv-van-campers-p_010582913386) (VEVOR) | $150.99 | $30.23 (20.0%) | $30.23 | 4.99× | 85 | 4/5 |
| 5 | **Vehicle Awning 10×7 ft** | [ywvPVcNinQDa](https://www.doba.com/product/ywvPVcNinQDa/dropshipping-vehicle-awning-large-10-x-7-shade-coverage-car-side-awning-pu2000mm-uv50-car-awning-with-extended-side-canopies-and-portable-storage-bag-suitable-for-truck-suv-van-campers.html) | vevor · D0102HPBR22 | 151 | $75.91 | [$94.90](https://www.vevor.com/awning-c_12491/vevor-vehicle-awning-large-10-x-7-shade-coverage-car-side-awning-pu2000mm-uv50-car-awning-with-extended-side-canopies-and-portable-storage-bag-suitable-for-truck-suv-van-campers-p_010515891156) (VEVOR) | $108.99 | $21.99 (20.2%) | $21.99 | 4.96× | 85 | 5/5 |
| 6 | **2-Person Folding Camping Cot with bedding** | [AoerVWdoEFvK](https://www.doba.com/product/AoerVWdoEFvK/dropshipping-2-person-foldable-camping-cot-portable-outdoor-w-bedspread-thick-air-mattress-4-in-1-elevated-camping-bed-tent-for-hiking-picnic-green.html) | AOSOM · D010275HPRP | 241 | $126.72 | [$162.99](https://www.wayfair.com/outdoor/pdp/outsunny-2-person-foldable-camping-cot-with-tent-bedspread-and-thick-air-mattress-4-in-1-elevated-camping-bed-tent-otsu1851.html) (Aosom (Outsunny)) | $186.99 | $41.45 (22.2%) | $41.45 | 4.51× | 85 | 4/5 |
| 7 | **Large SUV Tent 10.6×8 ft, all-season (5–9 people)** | [WMKkQoJtTeqD](https://www.doba.com/product/WMKkQoJtTeqD/dropshipping-large-suv-tent-for-59-person-106-x-8-ft-all-season-suv-tailgate-tent-with-ventilated-door-mesh-windows-pu3000mm-waterproof-dual-use-car-rear-hatch-tents-for-outdoor-camping-hiking.html) | vevor · D01027R3V38 | 104 | $134.31 | [$167.90](https://www.vevor.com/truck-tents-c_45132/vevor-large-suv-tent-for-5-9-person-10-6-x-8-ft-all-season-suv-tailgate-tent-with-ventilated-door-mesh-windows-pu3000mm-waterproof-dual-use-car-rear-hatch-tents-for-outdoor-camping-hiking-p_010884465180) (VEVOR / Best Buy) | $192.99 | $39.28 (20.4%) | $39.28 | 4.91× | 84 | 5/5 |
| 8 | **Folding Camp Kitchen Table, 3 heights, aluminum** | [OBFtqRpGScVN](https://www.doba.com/product/OBFtqRpGScVN/dropshipping-camping-kitchen-table-folding-outdoor-cooking-table-3-adjustable-height-aluminum-lightweight-portable-cook-station-with-storage-organizer-carry-handle-for-bbq-party-picnic-rv-travel-blue.html) | vevor · D0102X31U5Y | 659 | $49.51 | [$61.90](https://www.vevor.com/activity-tables-c_10621/camping-kitchen-table-folding-portable-cook-station-3-adjustable-height-aluminum-p_010260522352) (VEVOR) | $69.99 | $13.25 (18.9%) | $13.25 | 5.28× | 80 | 3/5 |
| 9 | **Shower & Privacy Tent, 1 room with crossbar** | [GoeQKdctYCvO](https://www.doba.com/product/GoeQKdctYCvO/dropshipping-camping-shower-tent-1-room-foldable-privacy-tent-changing-room-with-ground-stakes-ropes-carry-bag-and-crossbar-210d-oxford-fabric-with-silver-coating-for-camping-beach-and-fishing.html) | vevor · D01027RTQUX | 168 | $66.31 | [$82.90](https://www.vevor.com/privacy-tents-c_14277/vevor-camping-shower-tent-1-room-foldable-privacy-tent-changing-room-with-ground-stakes-ropes-carry-bag-and-crossbar-210d-oxford-fabric-with-silver-coating-for-camping-beach-and-fishing-p_010457739890) (VEVOR / Lowe's) | $94.99 | $18.97 (20.0%) | $18.97 | 5.01× | 80 | 3/5 |
| 10 | **Zero-Gravity Rocking Chair Set (2)** | [ZhCWVBIveQvp](https://www.doba.com/product/ZhCWVBIveQvp/dropshipping-zero-gravity-rocking-chair-set-2-pcs-outdoor-recliner-foldable-with-pillow-cup-phone-holder-beige.html) | AOSOM · D0102757JLJ | 51 | $145.76 | $199.99 (Outsunny (black); [page](https://outsunny.com/products/outsunny-outdoor-rocking-chairs-foldable-reclining-zero-gravity-lounge-rocker-with-pillow-cup-phone-holder-combo) — exact product page not captured) | $223.99 | $55.75 (24.9%) | $55.75 | 4.02× | 78 | 4/5 |

## 10 core products

| # | Product | Exact Doba URL | Supplier · item no. | Stock | Doba cost | Market low | Rec. price | Contribution | BE CAC | BE ROAS | Score | Img |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 11 | **Truck Bed Tent for 6.4–6.7 ft beds** | [hODWVblfiFqe](https://www.doba.com/product/hODWVblfiFqe/dropshipping-truck-bed-tent-64-67-pickup-truck-tent-with-rain-layer-and-carry-bag-waterproof-pu2000mm-double-layer-truck-tent-accommodate-2-3-person-for-camping-traveling-outdoor-activities.html) | vevor · D0102HPC8Y6 | 255 | $75.91 | $94.90 (VEVOR; [page](https://www.vevor.com/truck-tent-c_10954) — exact product page not captured) | $102.99 | $16.58 (16.1%) | $16.58 | 6.21× | 80 | 5/5 |
| 12 | **Mobile Camp Kitchen Box with wheels** | [QiDZCIlLYJqN](https://www.doba.com/product/QiDZCIlLYJqN/dropshipping-outdoor-mobile-kitchen-portable-multifunctional-camp-box-with-wheels-all-in-one-integrated-cooking-station-with-windproof-stove-folding-tables-storage-organizer-black.html) | vevor · D0102HGWYZU | 45 | $187.18 | [$233.99](https://www.vevor.com/activity-tables-c_10621/vevor-camping-cooking-station-foldable-outdoor-kitchen-w-stove-table-organizer-p_010875698910) (VEVOR) | $268.99 | $54.88 (20.4%) | $54.88 | 4.90× | 79 | 5/5 |
| 13 | **Flashfish E103 300W Power Station (LiFePO4)** | [rgQkvcdqqKDH](https://www.doba.com/product/rgQkvcdqqKDH/dropshipping-ff-flashfish-e103-300w-portable-power-station-1792wh-lifepo4-battery-pack-solar-generator-with-300w-600w-surge-ac-outlets-backup-power-for-home-use-camping-emergencies.html) | Solar Power · D0102773LGT | 448 | $99.06 | $129.99 (Flashfish (official); [page](https://www.flashfishtech.com/products/flashfish-e103-portable-power-station-300w-179-2wh) — exact product page not captured) | $148.99 | $34.88 (23.4%) | $34.88 | 4.27× | 78 | 3/5 |
| 14 | **Shower Tent with Solar Shower Bag** | [rbFtqdSLIQDj](https://www.doba.com/product/rbFtqdSLIQDj/dropshipping-camping-shower-tent-portable-privacy-shelter-with-solar-shower-bag-removable-floor-and-carrying-bag-blue.html) | AOSOM · D010275X9EX | 55 | $51.73 | [$74.99](https://www.aosom.com/item/outsunny-camping-shower-tent-portable-privacy-shelter-with-solar-shower-bag-removable-floor-and-carrying-bag-black~1LMPNQBNS3801.html) (Aosom) | $74.99 | $15.54 (20.7%) | $15.54 | 4.83× | 78 | 4/5 |
| 15 | **Folding Campfire Grill 22 in** | [hTqwPGDooYVc](https://www.doba.com/product/hTqwPGDooYVc/dropshipping-folding-campfire-grill-heavy-duty-steel-mesh-grate-224-portable-camping-grates-over-fire-pit-camp-fire-cooking-equipment-with-legs-carrying-bag-grilling-rack-for-outdoor-open-flame-cooking.html) | vevor · D0102HQ44UV | 1108 | $27.12 | [$32.90](https://www.vevor.com/commercial-outdoor-grills-c_10585/vevor-folding-campfire-grill-heavy-duty-steel-mesh-grate-22-4-portable-camping-grates-over-fire-pit-camp-fire-cooking-equipment-with-legs-carrying-bag-grilling-rack-for-outdoor-open-flame-cooking-p_010715205358) (VEVOR) | $36.99 | $5.91 (16.0%) | $5.91 | 6.26× | 77 | 3/5 |
| 16 | **2-Person Folding Cot 50 in wide** | [GjCbqFNRMeVs](https://www.doba.com/product/GjCbqFNRMeVs/dropshipping-2-person-folding-camping-cot-for-adults-50-extra-wide-portable-sleeping-cot-with-carry-bag-elevated-camping-bed-beach-hiking-blue.html) | AOSOM · D010277N6BP | 64 | $69.44 | [$84.99](https://www.aosom.com/item/outsunny-76-two-persons-double-wide-folding-camping-cot-with-bag-green~A20-030GN.html) (AOSOM (Outsunny)) | $96.99 | $17.65 (18.2%) | $17.65 | 5.50× | 77 | 4/5 |
| 17 | **Oxford Bell Tent 3 m with stove jack (non-canvas)** | [zoCtFfJimeDn](https://www.doba.com/product/zoCtFfJimeDn/dropshipping-oxford-bell-tent-4-seasons-984-ft-yurt-tent-for-camping-with-stove-jack-waterproof-breathable-holds-up-to-3-people-with-zipped-detachable-floor-family-camping-glamping-outdoor-hunting-party.html) | vevor · D01027EAVLP | 101 | $139.18 | [$173.99](https://www.bestbuy.com/product/vevor-oxford-bell-tent-4-seasons-9-84-ft-yurt-tent-for-camping-with-stove-jack-waterproof-breathable-holds-up-to-3-people-light-beige/JJGHK4R6XZ) (Best Buy) | $193.99 | $35.30 (18.2%) | $35.30 | 5.50× | 75 | 4/5 |
| 18 | **Flashfish 100W Foldable Solar Panel** | [nKqFVcmUwYvG](https://www.doba.com/product/nKqFVcmUwYvG/dropshipping-100w-18v-portable-solar-panel-flashfish-foldable-solar-charger-with-5v-usb-18v-dc-output-type-c-output-compatible-with-portable-generator-smartphones-tablets-and-more.html) | Solar Power · D0102HEBAKA | 796 | $93.88 | $119.99 (Flashfish official; [page](https://www.flashfishtech.com/products/flashfish-100w-18v-foldable-solar-panel) — exact product page not captured) | $136.99 | $29.25 (21.4%) | $29.25 | 4.68× | 74 | 2/5 |
| 19 | **Rooftop Cargo Bag 20 cu ft** | [RJetCMoBuQvF](https://www.doba.com/product/RJetCMoBuQvF/dropshipping-car-rooftop-cargo-carrier-bag-20-cubic-feet-roof-cargo-carrier-heavy-duty-840d-pvc-100-waterproof-car-roof-luggage-bag-for-all-vehicle-withwithout-rack--with-lock-anti-slip-mat-6-door-hook.html) | vevor · D01027R49VX | 41 | $47.99 | $59.99 (VEVOR; [page](https://www.vevor.com/) — exact product page not captured) | $67.99 | $12.96 (19.1%) | $12.96 | 5.24× | 70 | 5/5 |
| 20 | **1000 lm LED Lantern (360°)** | [aobWCtJUMQDV](https://www.doba.com/product/aobWCtJUMQDV/dropshipping-led-camping-lantern-all-in-one-1000lm-360-illumination-4-lighting-modes-battery-powered-light-outdoor-robust-flashlight-built-to-last-light-ideal-for-hiking-fishing-outages-repairs.html) | vevor · D0102HS0G3P | 896 | $14.40 | [$17.99](https://www.vevor.com/flashlight-c_12611/vevor-led-camping-lantern-battery-powered-all-in-one-for-exceptional-experience-p_010630456438) (VEVOR) | $19.99 | $3.31 (16.6%) | $3.31 | 6.03× | 69 | 5/5 |

Flashfish E103 power station (rank 13): list only after UL 2743 / UN38.3 documents are on file. Rooftop cargo bag and mobile kitchen: low stock (41 and 45 units) — check before advertising.

## 10 phase-2 products

| # | Product | Exact Doba URL | Supplier · item no. | Stock | Doba cost | Market low | Rec. price | Contribution | BE CAC | BE ROAS | Score | Img |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 21 | **Inflatable SUV Tent with Awning 8×6.7 ft** | [IFecQrCyBKDJ](https://www.doba.com/product/IFecQrCyBKDJ/dropshipping-inflatable-suv-tent-with-awning-8-x-67-ft-3-season-suv-tailgate-tent-with-ventilated-doors-mesh-window-pu2000mm-waterproof-car-rear-hatch-tents-for-outdoor-camping---air-pump-included.html) | vevor · D01027R6AH2 | 17 | $192.78 | [$240.99](https://www.vevor.com/other-c_45583/vevor-inflatable-suv-tent-with-awning-8-x-6-7-ft-3-season-suv-tailgate-tent-with-ventilated-doors-mesh-window-pu2000mm-waterproof-car-rear-hatch-tents-for-outdoor-camping-air-pump-included-p_010761017628) (VEVOR) | $276.99 | $56.49 (20.4%) | $56.49 | 4.90× | 76 | 5/5 |
| 22 | **SUV Tent 10×9 ft, 3-season (6 people)** | [dleDFrCjkKVa](https://www.doba.com/product/dleDFrCjkKVa/dropshipping-large-suv-tent-for-6-person-10-x-9-ft-3-season-suv-tailgate-tent-with-ventilated-doors-mesh-windows-pu2000mm-waterproof-dual-use-car-rear-hatch-tents-for-outdoor-camping-hiking.html) | vevor · D01027R6P1J | 18 | $98.39 | [$122.99](https://www.vevor.com/truck-tents-c_45132/vevor-large-suv-tent-for-6-person-10-x-9-ft-3-season-suv-tailgate-tent-with-ventilated-doors-mesh-windows-pu2000mm-waterproof-dual-use-car-rear-hatch-tents-for-outdoor-camping-hiking-p_010173834041) (VEVOR) | $140.99 | $28.34 (20.1%) | $28.34 | 4.97× | 74 | 5/5 |
| 23 | **Tent Wood Stove 80 in pipe, stainless** | [UdegqhNlQFDz](https://www.doba.com/product/UdegqhNlQFDz/dropshipping-wood-stove-80-inch-stainless-steel-camping-tent-stove-portable-wood-burning-stove-with-chimney-pipes-gloves-700infirebox-hot-tent-stove-for-outdoor-cooking-and-heating-with-8-pipes.html) | vevor · D010275EV4J | 521 | $71.11 | [$85.99](https://www.walmart.com/ip/VEVOR-Wood-Stove-80-inch-Stainless-Steel-Camping-Tent-Stove-Portable-Wood-Burning-Stove-Chimney-Pipes-Gloves-700in-Firebox-Hot-Tent-Stove-Outdoor-Coo/17491612785) (Walmart) | $87.99 | $7.87 (8.9%) | $7.87 | 11.19× | 73 | 5/5 |
| 24 | **1200W Power Station + 200W Solar Panel** | [qtCcvfZolJDb](https://www.doba.com/product/qtCcvfZolJDb/dropshipping-portable-power-station-with-200w-solar-panel-1200w-solar-generator-power-station-806wh-lifepo4-battery-backup-with-9-output-ports-for-home-emergency-outdoor-camping-rv-travel.html) | vevor · D01027HDT3Y | 91 | $516.66 | $645.90 (VEVOR; [page](https://www.vevor.com/) — exact product page not captured) | $741.99 | $151.57 (20.4%) | $151.57 | 4.90× | 73 | 2/5 |
| 25 | **Elevated Tent Cot (all-in-one)** | [WceHDgIyFCqQ](https://www.doba.com/product/WceHDgIyFCqQ/dropshipping-folding-camping-cot-for-adults-all-in-one-elevated-tent-with-sleeping-bag-thick-air-mattress-portable-single-bed.html) | AOSOM · D010275HRVX | 219 | $98.28 | $117.99 (AOSOM; [page](https://www.aosom.com/) — exact product page not captured) | $124.99 | $14.04 (11.2%) | $14.04 | 8.90× | 71 | 5/5 |
| 26 | **Heated Double Camping Chair** | [FhCaQDRCbevV](https://www.doba.com/product/FhCaQDRCbevV/dropshipping-heated-double-camping-chair-oversized-folding-padded-camp-loveseat-couch-with-3-heat-levels-and-4-heating-zones.html) | AOSOM · D01027EGT1T | 242 | $88.50 | $99.99 (Target / Amazon; [page](https://www.target.com/s/heated+portable+chairs) — exact product page not captured) | $109.99 | $10.30 (9.4%) | $10.30 | 10.68× | 71 | 3/5 |
| 27 | **12V Car Fridge 50 L** | [MwCkQqFCeKDK](https://www.doba.com/product/MwCkQqFCeKDK/dropshipping-12-volt-car-refrigerator-528qt50l-car-fridge-portable-electric-cooler-with--4-68fahrenheit-adjustable-temperature-1224v-dc-and-100--240v-ac-compressor-freezer-for-outdoor-camping.html) | vevor · D01027RS9Z6 | 266 | $191.90 | [$226.90](https://www.bestbuy.com/product/vevor-12-volt-car-refrigerator-52-8qt-50l-car-fridge-portable-electric-cooler-with-4F68F-adjustable-temperature-black/JJGHKZK83R) (Best Buy) | $238.99 | $23.13 (9.7%) | $23.13 | 10.33× | 70 | 5/5 |
| 28 | **12V Dual-Zone Car Fridge 40 L** | [hsvjPDbWkJVW](https://www.doba.com/product/hsvjPDbWkJVW/dropshipping-car-refrigerator-12-volt-car-refrigerator-fridge-40-l-dual-zone-portable-freezer--4-68-f-adjustable-range-1224v-dc-and-100-240v-ac-compressor-cooler-for-outdoor-camping-rv.html) | vevor · D0102HQ4S2G | 111 | $223.90 | [$252.90](https://www.vevor.com/car-refrigerator-c_10723/vevor-portable-car-refrigerator-freezer-compressor-40-l-dual-zone-for-car-home-p_010354326077) (VEVOR) | $278.99 | $27.17 (9.7%) | $27.17 | 10.27× | 70 | 5/5 |
| 29 | **270° Awning 52 sq ft (driver side)** | [RiCWKQcyDFVf](https://www.doba.com/product/RiCWKQcyDFVf/dropshipping-270-degree-awning-52-sqft-driver-side-vehicle-awning-waterproof-uv50-car-side-awnings-with-carry-bag-all-weather-free-standing-overland-awnings-car-shelter-for-suv-van-truck-camping.html) | vevor · D01027RNVP6 | 65 | $220.70 | [$275.90](https://www.bestbuy.com/product/vevor-270-degree-awning-52-sq-ft-driver-side-vehicle-awning-waterproof-uv50-car-side-awnings-with-carry-bag-beige/JJGHKKVY74) (Best Buy) | $288.99 | $39.38 (13.6%) | $39.38 | 7.34× | 69 | 5/5 |
| 30 | **4-Person Inflatable Cabin Tent with pump** | [hMCFetooyKbq](https://www.doba.com/product/hMCFetooyKbq/dropshipping-camping-tent-4-person-inflatable-cabin-tent-with-rechargeable-pump-tpu-air-tube-5-large-mesh-windows-portable-easy-setup-waterproof-with-carry-bag-for-family-outdoor-camping-hiking-green.html) | vevor · D01027EAVPP | 129 | $119.91 | [$149.90](https://www.vevor.com/other-c_45583/vevor-camping-tent-4-person-inflatable-cabin-tent-with-rechargeable-pump-tpu-air-tube-5-large-mesh-windows-portable-easy-setup-waterproof-with-carry-bag-for-family-outdoor-camping-hiking-beige-p_010380686950) (VEVOR) | $148.99 | $14.03 (9.4%) | $14.03 | 10.62× | 69 | 4/5 |

Phase 2 means: list later, once stock recovers (SUV tents with 17–18 units), safety documents arrive (wood stove, heated chair, 1200W power station) or the logged-in cost proves lower (the fridges and the elevated cot are under 12%).

## Bundle-only products

These are worth carrying only as setup parts or cart add-ons. Their contribution alone is 8–14%.

| # | Product | Exact Doba URL | Supplier · item no. | Stock | Doba cost | Market low | Rec. price | Contribution | BE CAC | BE ROAS | Score | Img |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 31 | **Truck Bed Air Mattress 6–6.5 ft** | [mrVkDKNQvCbR](https://www.doba.com/product/mrVkDKNQvCbR/dropshipping-truck-bed-air-mattress-for-6-65-ft-full-size-truck-beds-inflatable-air-mattress-camping-bed-with-12v-air-pump-2-pillows-carry-bag-for-chevrolet-silverado-dodge-ram-ford-150250350.html) | vevor · D0102HPCK08 | 87 | $71.91 | [$86.68](https://www.lowes.com/pd/VEVOR-Truck-Bed-Air-Mattress-for-6-to-6-5-ft-Full-Size-Truck-Beds-Inflatable-Air-Mattress-Camping-Bed-with-12V-Air-Pump-2-Pillows-Carry-Bag-for-Chevrolet-Silverado-Dodge-Ram/5015163431) (Lowe's) | $90.99 | $9.77 (10.7%) | $9.77 | 9.31× | 73 | 5/5 |
| 32 | **Collapsible Folding Wagon 550 lb** | [ARQbqcuDePVo](https://www.doba.com/product/ARQbqcuDePVo/dropshipping-collapsible-folding-wagon-550lb-load-220l-2-in-1-foldable-wagon-cart-converts-to-bench-utility-wagon-with-adjustable-handle-outdoor-cart-for-groceries-shopping-camping-gardening.html) | vevor · D0102X3YK0U | 463 | $96.71 | [$120.90](https://www.walmart.com/ip/VEVOR-Collapsible-Folding-Wagon-550lb-Load-220L-2-1-Foldable-Wagon-Cart-Converts-Bench-Utility-Wagon-Adjustable-Handle-Outdoor-Cart-Groceries-Shoppin/17477269946) (VEVOR / Walmart / Lowe's) | $122.99 | $13.80 (11.2%) | $13.80 | 8.91× | 72 | 4/5 |
| 33 | **Screen House 6×6 ft pop-up** | [qICevaBRVPDN](https://www.doba.com/product/qICevaBRVPDN/dropshipping-screen-house-tent-6-x-6-ft-4-6-person-pop-up-screen-tent-portable-screened-in-canopy-with-carry-bag-netting-sides-ground-stakes-for-garden-patio-backyard-and-outdoor-activities-beige.html) | vevor · D01027HHL7Y | 625 | $67.11 | [$79.71](https://www.walmart.com/ip/VEVOR-Screen-House-Tent-6-x-6-ft-4-6-Person-Pop-Screen-Tent-Portable-Screened-Canopy-Carry-Bag-Netting-Sides-Ground-Stakes-Garden-Patio-Backyard-Outd/18999617053) (Walmart) | $87.99 | $11.87 (13.5%) | $11.87 | 7.42× | 68 | 3/5 |
| 34 | **Oversized Camp Chair 450 lb** | [gpKMCYJEoebF](https://www.doba.com/product/gpKMCYJEoebF/dropshipping-oversized-camping-chairs-450-lbs-heavy-duty-support-portable-padded-folding-camp-chairs-with-dual-cup-holders-wine-glass-holders-carry-bag-for-outdoor-fishing-black-gray-1-pack.html) | vevor · D01027R3LK2 | 2494 | $45.52 | [$50.99](https://www.vevor.com/camping-folding-chair-c_43726/vevor-oversized-camping-chairs-450-lbs-heavy-duty-support-portable-padded-folding-camp-chairs-with-dual-cup-holders-wine-glass-holders-carry-bag-for-outdoor-fishing-black-gray-1-pack-p_010437165146) (VEVOR) | $55.99 | $4.63 (8.3%) | $4.63 | 12.09× | 68 | 5/5 |
| 35 | **Heavy-Duty Folding Camp Chair** | [iwqIbPdcoQvu](https://www.doba.com/product/iwqIbPdcoQvu/dropshipping-camping-folding-chair-for-adults-portable-heavy-duty-outdoor-quad-lumbar-back-padded-arm-chairs-with-side-pockets-cup-holder-and-cooler-bag-for-beach-lawn-picnic-fishing-backpacking-black.html) | vevor · D0102HPB5GX | 5187 | $31.92 | [$35.03](https://www.homedepot.com/p/VEVOR-Camping-Folding-Chair-for-Adults-Portable-Heavy-Duty-Outdoor-Quad-Lumbar-Back-Padded-Arm-Chairs-in-Black-HWZDYCY450LBSFODNV0/326908574) (Home Depot) | $39.99 | $3.81 (9.5%) | $3.81 | 10.48× | 64 | 5/5 |
| 36 | **Collapsible Storage Bins 65 L (2-pack)** | [ftFwKLcOQCDJ](https://www.doba.com/product/ftFwKLcOQCDJ/dropshipping-plastic-collapsible-storage-bins-with-lids-65l-2-packs-stackable-folding-storage-crates-with-handles-holds-84-lbs-per-bin-heavy-duty-containers-space-saving-baskets-for-home-organizing.html) | vevor · D01027E7TCT | 390 | $35.12 | [$43.90](https://www.vevor.com/folding-plastic-crate-c_44010/vevor-plastic-collapsible-storage-bins-with-lids-65l-2-packs-stackable-folding-storage-crates-with-handles-holds-84-lbs-per-bin-heavy-duty-containers-space-saving-baskets-for-home-organizing-p_010446778267) (VEVOR) | $42.99 | $3.32 (7.7%) | $3.32 | 12.96× | 62 | 2/5 |

## Products with ≥30% contribution

**None.** At recommended prices the best are the zero-gravity rocking set (24.9%), the Flashfish E103 (23.4%), the 20 L fridge (23.3%), the 2-person cot with bedding (22.2%) and the Flashfish 100 W panel (21.4%). One out-of-stock listing (680 lb wagon, Dizzo) would have reached 27.7%.

## Hero product details

#### 1. SUV Tailgate Tent 8×8 ft (sleeps 6–8)

- **Exact Doba URL:** https://www.doba.com/product/jAqdKQyGwobR/dropshipping-suv-camping-tent-8-8-suv-tent-attachment-for-camping-with-rain-layer-and-carry-bag-pu2000mm-double-layer-truck-tent-accommodate-6-8-person-rear-tent-for-van-hatch-tailgate.html
- **Supplier / brand / item no. / UPC:** vevor / VEVOR / D0102HGJBJV / 840281576142
- **Availability:** 222 units in US warehouses (City of Industry, California:41; Bloomington, California:155; Bloomington, California:26). Processing 3 business days (avg 0.5); delivery 2-7 days; supplier fulfillment rate 99.6%; returns 30 days.
- **Shipping:** Yes (verified on listing), Seller-Selected Shipping (Buyer Cannot Choose). Not allowed on: Amazon; Temu; Walmart (own Shopify store is allowed).
- **Economics:** Doba cost $109.51 (derived from Doba profit fields, calibrated vs trenzora.com (VEVOR −1.4%)). Market low [$136.90](https://www.vevor.com/truck-tent-c_11508/vevor-suv-camping-tent-8-8-suv-tent-attachment-for-camping-with-carry-bag-waterproof-pu2000mm-double-layer-truck-tent-accommodate-6-8-person-rear-tent-for-van-hatch-tailgate-p_010359774655) (VEVOR). Recommended price **$156.99** (capped at market range (target not reachable)). Gross $47.48 (30.2%); fees $4.85; returns $7.85; discounts $3.14; **contribution $31.64 (20.2%)**; break-even CAC $31.64, ROAS 4.96×. At market-low price: 9.9%.
- **Problem / persona:** Sleep beside the car with the cargo area as a dry room; no separate tent pitch — SUV/minivan family car camper.
- **Missions:** Tailgate & SUV Camping, Family Campground Comfort. **Category:** Vehicle Shelter.
- **Season / events:** Mar–Oct (peak May–Aug); Memorial Day, 4th of July, Labor Day, Black Friday / Cyber Monday, Father's Day.
- **Vehicle fit:** SUVs, crossovers, minivans and hatchbacks with an upward-opening rear liftgate (sleeve wraps the open hatch). Not for swing-out doors.
- **Meta angle:** Turn your SUV into a 6-person basecamp in 10 minutes
- **Own video idea:** Time-lapse pitch on a mid-size SUV, then walk-through from the cargo area
- **Cross-sells:** 12V Car Fridge 20 L (21 qt), Heavy-Duty Folding Camp Chair, 1000 lm LED Lantern (360°)
- **Video / images / reviews:** No (none on Doba listing); image score 4/5 (10 images); reviews: none on Doba, none imported.
- **Score:** 89/100

#### 2. Canvas Bell Tent 3 m with stove jack

- **Exact Doba URL:** https://www.doba.com/product/TZqbFWPfweVi/dropshipping-canvas-bell-tent-4-seasons-3-m98ft-yurt-tent-canvas-tent-for-camping-with-stove-jack-breathable-tent-holds-up-to-4-people-family-camping-outdoor-hunting-party.html
- **Supplier / brand / item no. / UPC:** vevor / VEVOR / D0102HS0AFP / 197988630395
- **Availability:** 234 units in US warehouses (Flanders, New Jersey:45; Rincon, Georgia:33; Burlington, New Jersey:23; City of Industry, California:21; Fontana, California:8; Edwardsville, Illinois:13; South Fulton, Georgia:9; North Aurora, Illinois:13; Roebling, New Jersey:31; Bloomington, California:23; Chino, California:15). Processing 3 business days (avg null); delivery 2-7 days; supplier fulfillment rate 99.6%; returns 30 days.
- **Shipping:** Yes (verified on listing), Seller-Selected Shipping (Buyer Cannot Choose). Not allowed on: Amazon; Temu; Walmart (own Shopify store is allowed).
- **Economics:** Doba cost $195.10 (derived from Doba profit fields, calibrated vs trenzora.com (VEVOR −1.4%)). Market low [$243.90](https://www.vevor.com/yurt-tent-c_10246/4-season3-m-9-8ft-waterproof-cotton-canvas-bell-tent-with-zipped-ground-sheet-p_010432929912) (VEVOR / Wayfair). Recommended price **$279.99** (capped at market range (target not reachable)). Gross $84.89 (30.3%); fees $8.42; returns $14.00; discounts $5.60; **contribution $56.87 (20.3%)**; break-even CAC $56.87, ROAS 4.92×. At market-low price: 10.0%.
- **Problem / persona:** Stand-up canvas tent that breathes and can take a stove — Couple glamper / hunter.
- **Missions:** Bell Tent Glamping, Cold-Weather Hot Tent. **Category:** Basecamp Tents.
- **Season / events:** Year-round (peak Sep–Nov for hot tent); Labor Day, Black Friday / Cyber Monday, Christmas gifting, Memorial Day.
- **Safety:** Stove use only with the included stove jack and a heat shield; recommend CO alarm.
- **Cross-sells:** Tent Wood Stove 80 in pipe, stainless, 2-Person Folding Camping Cot with bedding
- **Video / images / reviews:** No (none on Doba listing); image score 5/5 (12 images); reviews: none on Doba, none imported.
- **Score:** 86/100

#### 3. 12V Car Fridge 20 L (21 qt)

- **Exact Doba URL:** https://www.doba.com/product/zDQmFaJcfKvl/dropshipping-12-volt-refrigerator-211-qt-20l-car-fridge-portable-ultra-light-epp-freezer-app-control-electric-compressor-12v24v-dc-14-f-to-50-f-for-truck-van-rv-suv-boat-travel-camping.html
- **Supplier / brand / item no. / UPC:** vevor / (unbranded) / D01027EAJS6 / 197988371816
- **Availability:** 185 units in US warehouses (Flanders, New Jersey:9; Florence, New Jersey:7; Houston, Texas:7; City of Industry, California:10; Fontana, California:54; South Fulton, Georgia:31; North Aurora, Illinois:17; EDISON, New Jersey:50). Processing 3 business days (avg null); delivery 2-7 days; supplier fulfillment rate 99.6%; returns 30 days.
- **Shipping:** Yes (verified on listing), Seller-Selected Shipping (Buyer Cannot Choose). Not allowed on: Amazon; Temu; Walmart (own Shopify store is allowed).
- **Economics:** Doba cost $119.91 (derived from Doba profit fields, calibrated vs trenzora.com (VEVOR −1.4%)). Market low [$165.90](https://www.bestbuy.com/product/vevor-12-volt-refrigerator-21-1-qt-20l-car-fridge-portable-ultra-light-epp-freezer-app-control-electric-compressor-gray/JJGHKZ6F6Q/sku/12644699) (Best Buy). Recommended price **$179.99** (capped at market range (target not reachable)). Gross $60.08 (33.4%); fees $5.52; returns $9.00; discounts $3.60; **contribution $41.96 (23.3%)**; break-even CAC $41.96, ROAS 4.29×. At market-low price: 17.6%.
- **Problem / persona:** No more melted ice or soggy food — Weekend road-tripper.
- **Missions:** Off-Grid Power & Cooling, Tailgate & SUV Camping, Truck Bed Camping. **Category:** Cooling.
- **Season / events:** Apr–Sep (gift Nov–Dec); Memorial Day, 4th of July, Labor Day, Black Friday / Cyber Monday, Father's Day, Christmas gifting.
- **Vehicle fit:** 12/24V car socket; fits most SUV cargo areas and truck cabs
- **Video / images / reviews:** No (none on Doba listing); image score 4/5 (11 images); reviews: none on Doba, none imported.
- **Score:** 86/100

#### 4. Car Side Awning 6.6×8.2 ft

- **Exact Doba URL:** https://www.doba.com/product/mcVLbJdSnFDj/dropshipping-car-side-awning-large-66-x-82-shade-coverage-vehicle-awning-pu3000mm-uv50-retractable-car-awning-with-waterproof-storage-bag-height-adjustable-suitable-for-truck-suv-van-campers.html
- **Supplier / brand / item no. / UPC:** vevor / VEVOR / D0102HPBRG8 / 197988267713
- **Availability:** 263 units in US warehouses (Flanders, New Jersey:10; Florence, New Jersey:21; Atlanta, Georgia:10; Houston, Texas:11; City of Industry, California:108; Fontana, California:5; Bloomington, California:19; Roebling, New Jersey:6; Bloomington, California:56; Rincon, Georgia:17). Processing 3 business days (avg 0.5); delivery 2-7 days; supplier fulfillment rate 99.6%; returns 30 days.
- **Shipping:** Yes (verified on listing), Seller-Selected Shipping (Buyer Cannot Choose). Not allowed on: Amazon; Temu; Walmart (own Shopify store is allowed).
- **Economics:** Doba cost $105.51 (derived from Doba profit fields, calibrated vs trenzora.com (VEVOR −1.4%)). Market low [$131.90](https://www.vevor.com/awning-c_12491/vevor-car-side-awning-large-6-6-x-8-2-shade-coverage-vehicle-awning-pu3000mm-uv50-retractable-car-awning-with-waterproof-storage-bag-height-adjustable-suitable-for-truck-suv-van-campers-p_010582913386) (VEVOR). Recommended price **$150.99** (capped at market range (target not reachable)). Gross $45.48 (30.1%); fees $4.68; returns $7.55; discounts $3.02; **contribution $30.23 (20.0%)**; break-even CAC $30.23, ROAS 4.99×. At market-low price: 9.9%.
- **Problem / persona:** Instant shade and rain cover off the roof rack — Overlanding-curious SUV/truck owner.
- **Missions:** Shade & Day Basecamp, Tailgate & SUV Camping, Truck Bed Camping. **Category:** Vehicle Shelter.
- **Season / events:** Apr–Sep; Memorial Day, 4th of July, Labor Day, Father's Day.
- **Vehicle fit:** Requires roof rack crossbars or rails; mounting brackets included per listing. Customer must confirm rack load rating.
- **Cross-sells:** Heavy-Duty Folding Camp Chair
- **Video / images / reviews:** No (none on Doba listing); image score 4/5 (10 images); reviews: none on Doba, none imported.
- **Score:** 85/100

#### 5. Vehicle Awning 10×7 ft

- **Exact Doba URL:** https://www.doba.com/product/ywvPVcNinQDa/dropshipping-vehicle-awning-large-10-x-7-shade-coverage-car-side-awning-pu2000mm-uv50-car-awning-with-extended-side-canopies-and-portable-storage-bag-suitable-for-truck-suv-van-campers.html
- **Supplier / brand / item no. / UPC:** vevor / VEVOR / D0102HPBR22 / 197988264682
- **Availability:** 151 units in US warehouses (Flanders, New Jersey:31; City of Industry, California:12; Roebling, New Jersey:30; Pasadena, Texas:10; Bloomington, California:68). Processing 3 business days (avg null); delivery 2-7 days; supplier fulfillment rate 99.6%; returns 30 days.
- **Shipping:** Yes (verified on listing), Seller-Selected Shipping (Buyer Cannot Choose). Not allowed on: Amazon; Temu; Walmart (own Shopify store is allowed).
- **Economics:** Doba cost $75.91 (derived from Doba profit fields, calibrated vs trenzora.com (VEVOR −1.4%)). Market low [$94.90](https://www.vevor.com/awning-c_12491/vevor-vehicle-awning-large-10-x-7-shade-coverage-car-side-awning-pu2000mm-uv50-car-awning-with-extended-side-canopies-and-portable-storage-bag-suitable-for-truck-suv-van-campers-p_010515891156) (VEVOR). Recommended price **$108.99** (capped at market range (target not reachable)). Gross $33.08 (30.3%); fees $3.46; returns $5.45; discounts $2.18; **contribution $21.99 (20.2%)**; break-even CAC $21.99, ROAS 4.96×. At market-low price: 9.8%.
- **Problem / persona:** Larger fixed side awning — SUV/truck owner wanting more shade.
- **Missions:** Shade & Day Basecamp, Truck Bed Camping. **Category:** Vehicle Shelter.
- **Season / events:** Apr–Sep; Memorial Day, 4th of July, Labor Day, Father's Day.
- **Vehicle fit:** Requires roof rack crossbars/rails
- **Cross-sells:** Car Side Awning 6.6×8.2 ft
- **Video / images / reviews:** No (none on Doba listing); image score 5/5 (12 images); reviews: none on Doba, none imported.
- **Score:** 85/100

#### 6. 2-Person Folding Camping Cot with bedding

- **Exact Doba URL:** https://www.doba.com/product/AoerVWdoEFvK/dropshipping-2-person-foldable-camping-cot-portable-outdoor-w-bedspread-thick-air-mattress-4-in-1-elevated-camping-bed-tent-for-hiking-picnic-green.html
- **Supplier / brand / item no. / UPC:** AOSOM / (unbranded) / D010275HPRP / 842525132961
- **Availability:** 241 units in US warehouses (Mansfield, New Jersey:103; Redlands, California:138). Processing 3 business days (avg 0.5); delivery 5-7 days; supplier fulfillment rate 99.9%; returns 30 days.
- **Shipping:** Yes (verified on listing), Seller-Selected Shipping (Buyer Cannot Choose). Not allowed on: Amazon (own Shopify store is allowed).
- **Economics:** Doba cost $126.72 (derived from Doba profit fields). Market low [$162.99](https://www.wayfair.com/outdoor/pdp/outsunny-2-person-foldable-camping-cot-with-tent-bedspread-and-thick-air-mattress-4-in-1-elevated-camping-bed-tent-otsu1851.html) (Aosom (Outsunny)). Recommended price **$186.99** (capped at market range (target not reachable)). Gross $60.27 (32.2%); fees $5.72; returns $9.35; discounts $3.74; **contribution $41.45 (22.2%)**; break-even CAC $41.45, ROAS 4.51×. At market-low price: 12.2%.
- **Problem / persona:** Two people off the cold ground on one frame — Couple car camper.
- **Missions:** Family Campground Comfort, Bell Tent Glamping, Tailgate & SUV Camping. **Category:** Sleep.
- **Season / events:** Year-round; Memorial Day, 4th of July, Labor Day, Black Friday / Cyber Monday, Father's Day, Christmas gifting.
- **Cross-sells:** Canvas Bell Tent 3 m with stove jack, SUV Tailgate Tent 8×8 ft (sleeps 6–8)
- **Video / images / reviews:** No (none on Doba listing); image score 4/5 (11 images); reviews: none on Doba, none imported.
- **Notes:** AOSOM supplier (30% Doba rate)
- **Score:** 85/100

#### 7. Large SUV Tent 10.6×8 ft, all-season (5–9 people)

- **Exact Doba URL:** https://www.doba.com/product/WMKkQoJtTeqD/dropshipping-large-suv-tent-for-59-person-106-x-8-ft-all-season-suv-tailgate-tent-with-ventilated-door-mesh-windows-pu3000mm-waterproof-dual-use-car-rear-hatch-tents-for-outdoor-camping-hiking.html
- **Supplier / brand / item no. / UPC:** vevor / VEVOR / D01027R3V38 / 197988918585
- **Availability:** 104 units in US warehouses (Bloomington, California:104). Processing 3 business days (avg 0.7); delivery 2-7 days; supplier fulfillment rate 99.6%; returns 30 days.
- **Shipping:** Yes (verified on listing), Seller-Selected Shipping (Buyer Cannot Choose). Not allowed on: Amazon; Temu; Walmart (own Shopify store is allowed).
- **Economics:** Doba cost $134.31 (derived from Doba profit fields, calibrated vs trenzora.com (VEVOR −1.4%)). Market low [$167.90](https://www.vevor.com/truck-tents-c_45132/vevor-large-suv-tent-for-5-9-person-10-6-x-8-ft-all-season-suv-tailgate-tent-with-ventilated-door-mesh-windows-pu3000mm-waterproof-dual-use-car-rear-hatch-tents-for-outdoor-camping-hiking-p_010884465180) (VEVOR / Best Buy). Recommended price **$192.99** (capped at market range (target not reachable)). Gross $58.68 (30.4%); fees $5.90; returns $9.65; discounts $3.86; **contribution $39.28 (20.4%)**; break-even CAC $39.28, ROAS 4.91×. At market-low price: 9.9%.
- **Problem / persona:** More floor space and weather protection than the 8×8 for bigger groups — Larger family / group car camper.
- **Missions:** Tailgate & SUV Camping, Family Campground Comfort. **Category:** Vehicle Shelter.
- **Season / events:** Mar–Nov; Memorial Day, 4th of July, Labor Day, Black Friday / Cyber Monday, Father's Day.
- **Vehicle fit:** SUVs/minivans with upward liftgate
- **Cross-sells:** SUV Tailgate Tent 8×8 ft (sleeps 6–8), 2-Person Folding Camping Cot with bedding
- **Video / images / reviews:** No (none on Doba listing); image score 5/5 (12 images); reviews: none on Doba, none imported.
- **Score:** 84/100

#### 8. Folding Camp Kitchen Table, 3 heights, aluminum

- **Exact Doba URL:** https://www.doba.com/product/OBFtqRpGScVN/dropshipping-camping-kitchen-table-folding-outdoor-cooking-table-3-adjustable-height-aluminum-lightweight-portable-cook-station-with-storage-organizer-carry-handle-for-bbq-party-picnic-rv-travel-blue.html
- **Supplier / brand / item no. / UPC:** vevor / VEVOR / D0102X31U5Y / 197988129868
- **Availability:** 659 units in US warehouses (Flanders, New Jersey:267; Atlanta, Georgia:68; City of Industry, California:88; Eastvale, California:7; South Fulton, Georgia:43; North Aurora, Illinois:18; Bloomington, California:116; Roebling, New Jersey:52). Processing 3 business days (avg 0.5); delivery 2-7 days; supplier fulfillment rate 99.6%; returns 30 days.
- **Shipping:** Yes (verified on listing), Seller-Selected Shipping (Buyer Cannot Choose). Not allowed on: Amazon; Temu; Walmart (own Shopify store is allowed).
- **Economics:** Doba cost $49.51 (derived from Doba profit fields, calibrated vs trenzora.com (VEVOR −1.4%)). Market low [$61.90](https://www.vevor.com/activity-tables-c_10621/camping-kitchen-table-folding-portable-cook-station-3-adjustable-height-aluminum-p_010260522352) (VEVOR). Recommended price **$69.99** (capped at market range (target not reachable)). Gross $20.48 (29.3%); fees $2.33; returns $3.50; discounts $1.40; **contribution $13.25 (18.9%)**; break-even CAC $13.25, ROAS 5.28×. At market-low price: 9.6%.
- **Problem / persona:** A stable, waist-height cooking surface with storage — Car camper who cooks.
- **Missions:** Camp Kitchen, Tailgate & SUV Camping. **Category:** Camp Kitchen.
- **Season / events:** Mar–Oct; Memorial Day, 4th of July, Labor Day, Black Friday / Cyber Monday, Father's Day.
- **Cross-sells:** Folding Campfire Grill 22 in, 1000 lm LED Lantern (360°)
- **Video / images / reviews:** No (none on Doba listing); image score 3/5 (8 images); reviews: none on Doba, none imported.
- **Notes:** Replaces the rejected one-piece kitchen table; 659 units
- **Score:** 80/100

#### 9. Shower & Privacy Tent, 1 room with crossbar

- **Exact Doba URL:** https://www.doba.com/product/GoeQKdctYCvO/dropshipping-camping-shower-tent-1-room-foldable-privacy-tent-changing-room-with-ground-stakes-ropes-carry-bag-and-crossbar-210d-oxford-fabric-with-silver-coating-for-camping-beach-and-fishing.html
- **Supplier / brand / item no. / UPC:** vevor / VEVOR / D01027RTQUX / 197988178736
- **Availability:** 168 units in US warehouses (Flanders, New Jersey:54; Houston, Texas:5; Eastvale, California:23; South Fulton, Georgia:7; North Aurora, Illinois:41; Bloomington, California:9; Roebling, New Jersey:24; EDISON, New Jersey:5). Processing 3 business days (avg 0.5); delivery 2-7 days; supplier fulfillment rate 99.6%; returns 30 days.
- **Shipping:** Yes (verified on listing), Seller-Selected Shipping (Buyer Cannot Choose). Not allowed on: Amazon; Temu; Walmart (own Shopify store is allowed).
- **Economics:** Doba cost $66.31 (derived from Doba profit fields, calibrated vs trenzora.com (VEVOR −1.4%)). Market low [$82.90](https://www.vevor.com/privacy-tents-c_14277/vevor-camping-shower-tent-1-room-foldable-privacy-tent-changing-room-with-ground-stakes-ropes-carry-bag-and-crossbar-210d-oxford-fabric-with-silver-coating-for-camping-beach-and-fishing-p_010457739890) (VEVOR / Lowe's). Recommended price **$94.99** (capped at market range (target not reachable)). Gross $28.68 (30.2%); fees $3.05; returns $4.75; discounts $1.90; **contribution $18.97 (20.0%)**; break-even CAC $18.97, ROAS 5.01×. At market-low price: 9.7%.
- **Problem / persona:** Private changing and shower space at any site — Family / dispersed camper.
- **Missions:** Campsite Hygiene & Privacy, Family Campground Comfort. **Category:** Hygiene.
- **Season / events:** Apr–Sep; Memorial Day, 4th of July, Labor Day.
- **Cross-sells:** 1000 lm LED Lantern (360°)
- **Video / images / reviews:** No (none on Doba listing); image score 3/5 (9 images); reviews: none on Doba, none imported.
- **Notes:** 168 units
- **Score:** 80/100

#### 10. Zero-Gravity Rocking Chair Set (2)

- **Exact Doba URL:** https://www.doba.com/product/ZhCWVBIveQvp/dropshipping-zero-gravity-rocking-chair-set-2-pcs-outdoor-recliner-foldable-with-pillow-cup-phone-holder-beige.html
- **Supplier / brand / item no. / UPC:** AOSOM / (unbranded) / D0102757JLJ / 673986220320
- **Availability:** 51 units in US warehouses (Mansfield, New Jersey:11; Ellenwood, Georgia:15; Redlands, California:25). Processing 3 business days (avg null); delivery 5-7 days; supplier fulfillment rate 99.9%; returns 30 days.
- **Shipping:** Yes (verified on listing), Seller-Selected Shipping (Buyer Cannot Choose). Not allowed on: Amazon (own Shopify store is allowed).
- **Economics:** Doba cost $145.76 (derived from Doba profit fields). Market low $199.99 (Outsunny (black); [page](https://outsunny.com/products/outsunny-outdoor-rocking-chairs-foldable-reclining-zero-gravity-lounge-rocker-with-pillow-cup-phone-holder-combo) — exact product page not captured). Recommended price **$223.99** (target contribution, within market range). Gross $78.23 (34.9%); fees $6.80; returns $11.20; discounts $4.48; **contribution $55.75 (24.9%)**; break-even CAC $55.75, ROAS 4.02×. At market-low price: 17.1%.
- **Problem / persona:** Two recliners that rock — the evening-at-camp upgrade — Couple at the campsite / patio.
- **Missions:** Family Campground Comfort, Bell Tent Glamping. **Category:** Comfort & Haul.
- **Season / events:** Apr–Sep (gift Nov–Dec); Memorial Day, 4th of July, Labor Day, Black Friday / Cyber Monday, Father's Day, Christmas gifting.
- **Video / images / reviews:** No (none on Doba listing); image score 4/5 (11 images); reviews: none on Doba, none imported.
- **Notes:** AOSOM; only 51 units — watch stock
- **Score:** 78/100

## Rejected products

67 listings were checked and rejected. Most common reasons: out of stock on Doba (22 listings, including 10 from the previous top-30), Doba cost at or above the lowest retail price (17 listings), no identical retail benchmark, or under 10% contribution at any defensible price.

| Product | Exact Doba URL | Supplier | Stock | Doba cost | Market low | Reason |
|---|---|---|---|---|---|---|
| 2-Person Hot Tent with Stove Jack | [VHQdbfWOFovj](https://www.doba.com/product/VHQdbfWOFovj/dropshipping-camping-hot-tent-2-persons-cabin-hot-tent-with-stove-jack-waterproof-winter-tents-shelters-with-vents-lightweight-portable-4-season-tents-for-hiking-fishing-hunting-backpacking.html) | vevor | 253 | $79.11 | $80.90 | Cost $80.22 vs $80.90 retail: no margin |
| 4-Person Instant Cabin Tent | [ALeNDqBWGovE](https://www.doba.com/product/ALeNDqBWGovE/dropshipping-camping-tent-4-person-pop-up-instant-cabin-tent-with-large-mesh-windows-60-seconds-easy-setup-portable-cabin-hub-tents-with-carry-bag-for-family-outdoor-camping-hiking-upgraded-ventilation.html) | vevor | 0 | $109.51 | $136.90 | Out of stock on Doba (0 units). |
| Canvas Bell Tent 4 m | [mzqdDYNFkQvb](https://www.doba.com/product/mzqdDYNFkQvb/dropshipping-canvas-bell-tent-4-seasons-4-m1312-ft-yurt-tent-canvas-tent-for-camping-with-stove-jack-breathable-tent-holds-up-to-6-people-family-camping-outdoor-hunting-party.html) | vevor | 274 | $256.69 | $243.90 | Derived cost $260 exceeds the $243.90 market low |
| Canvas Bell Tent 5 m | [mVDgvoIQuQbP](https://www.doba.com/product/mVDgvoIQuQbP/dropshipping-canvas-tent-4-seasons-5-m164-ft-bell-tent-canvas-tent-for-camping-with-stove-jack-breathable-yurt-tent-for-up-to-8-people-family-camping-outdoor-hunting-party.html) | vevor | 479 | $315.89 | $390.90 | Reserve: contribution under 10% at market prices; reconsider only if the logged-in cost is lower. ~9% contribution at market; 479 units in stock |
| Canvas Bell Tent 6 m | [LGCgDElSSFVQ](https://www.doba.com/product/LGCgDElSSFVQ/dropshipping-canvas-bell-tent-4-seasons-6-m1968-ft-yurt-tent-canvas-tent-for-camping-with-stove-jack-breathable-tent-holds-up-to-10-people-family-camping-outdoor-hunting-party.html) | vevor | 84 | $404.68 | $487.99 | ~9% at most; $488+ ticket, 84 units |
| Screen House 10×9.2 ft | [VjQtvcrBeJDC](https://www.doba.com/product/VjQtvcrBeJDC/dropshipping-screen-house-tent-10-x-92-ft-4-8-person-pop-up-screen-tent-with-extended-awning-portable-screened-in-canopy-with-carry-bag-netting-sides-for-patio-backyard-and-outdoor-activities-beige.html) | vevor | 582 | $98.31 | $92.99 | Cost $99.69 above $92.99 market low |
| Screen House 10×9.2 ft (variant) | [KsegvVAUCcDB](https://www.doba.com/product/KsegvVAUCcDB/dropshipping-screen-house-tent-10-x-92-ft-4-8-person-pop-up-screen-tent-portable-screened-in-canopy-with-carry-bag-netting-sides-ground-stakes-for-garden-patio-backyard-outdoor-activities-beige.html) | vevor | 502 | $85.51 | — | ~9% at most |
| 16-pc Camp Cookware Set | [vdbyYPeWHoVi](https://www.doba.com/product/vdbyYPeWHoVi/dropshipping-16pcs-camping-cooking-ware-set-camping-stove-cookware-kit-aluminum-pot-pan-kettle-set-with-bowls-knife-fork-spoon-carabiner-spatula-cutting-board-for-hiking-picnic-outdoor.html) | inQ Boutique | 124 | $36.72 | $23.99 | Doba cost $36.72 vs $23.99 retail (inQ Boutique) |
| 2-Burner Propane Stove 150,000 BTU with legs | [CIQRKBYRleVF](https://www.doba.com/product/CIQRKBYRleVF/dropshipping-2-burner-outdoor-propane-gas-stove-150000-btu-propane-lpg-gas-camping-stove-foldable-heavy-duty-carbon-steel-outdoor-cooker-with-wheels-shield-20-psi-regulator-for-bbq-camp-home-patio.html) | vevor | 195 | $123.91 | $154.90 | Reserve: contribution under 10% at market prices; reconsider only if the logged-in cost is lower. ~9% at market; gas compliance unverified |
| Camp Kitchen Table with cupboards | [KbDWelSiocvI](https://www.doba.com/product/KbDWelSiocvI/dropshipping-camping-kitchen-table-folding-outdoor-cooking-table-with-storage-carrying-bag-aluminum-cook-station-3-cupboard-detachable-windscreen-quick-set-up-for-picnics-bbq-rv-traveling-brown.html) | vevor | 507 | $98.31 | $87.99 | Cost $99.69 above $87.99 market low |
| Cast-Iron Reversible Grill/Griddle 14×8.5 in | [MJKjVkgUCPbe](https://www.doba.com/product/MJKjVkgUCPbe/dropshipping-reversible-grillgriddle-14x85-inch-pre-seasoned-cast-iron-griddle-portable-rectangular-pan-with-handle-family-cookware-for-indooroutdoor-stove-top-burner-gas-camping-bbq-black.html) | vevor | 306 | $23.12 | — | No identical retail benchmark verified; comparable cast-iron griddles retail ~$20–30 vs $23.44 cost |
| Folding Camp Kitchen Table (variant B) | [MoekDOWBHcVb](https://www.doba.com/product/MoekDOWBHcVb/dropshipping-camping-kitchen-table-folding-outdoor-cooking-table-3-adjustable-heights-aluminum-lightweight-portable-cook-station-with-storage-organizer-carry-handle-for-bbq-party-picnic-rv-travel-black.html) | vevor | 292 | $51.91 | $61.90 | Same product family as OBFtqRpGScVN at a higher cost |
| One-Piece Folding Camp Kitchen Table | [eAqMCSIvJoVj](https://www.doba.com/product/eAqMCSIvJoVj/dropshipping-camping-kitchen-table-one-piece-folding-portable-cook-station-with-a-carrying-bag-aluminum-camping-table-4-iron-side-tables-2-shelves-ideal-for-outdoor-picnics-bbqs-camping-rv-traveling.html) | vevor | 310 | $74.31 | $65.99 | Cost $75.35 above $65.99 market low (was a hero in the previous list) |
| Swivel Campfire Grill | [iNbvcGDRJYqj](https://www.doba.com/product/iNbvcGDRJYqj/dropshipping-swivel-campfire-grill-fire-pit-grill-grate-over-fire-pits-heavy-duty-steel-grill-grates-360-adjustable-open-fire-outdoor-cooking-equipment-portable-camp-fire-racks-for-camping-outdoor-bbq.html) | vevor | 545 | $32.72 | $31.99 | Cost $33.17 vs $31.99 retail |
| 680 lb Folding Wagon | [ehKvqRtQyJDP](https://www.doba.com/product/ehKvqRtQyJDP/dropshipping-680lbs-heavy-duty-folding-wagon-cart-all-terrain-collapsible-utility-wagon-with-extra-large-capacity-compact-foldable-pull-cart-for-camping-grocery-shopping-garden-beach-sports-outdoor-home-u.html) | Dizzo | 0 | $40.90 | $65.99 | — |
| Oversized Padded Camp Chair 450 lb | [AmKZeFPfiCvn](https://www.doba.com/product/AmKZeFPfiCvn/dropshipping-oversized-camping-chairs-450-lbs-heavy-duty-support-portable-folding-camp-chairs-with-padded-backrest-armrests-cup-holder-side-pocket-cooler-bag-carry-bags-for-outdoor-fishing-2-pack.html) | vevor | 2987 | $62.31 | — | Cost $63.19 vs $46–57 retail for the single padded chair |
| Padded Zero-Gravity Chair | [TteMDQIOoFqp](https://www.doba.com/product/TteMDQIOoFqp/dropshipping-padded-zero-gravity-chair-folding-recliner-chair-with-cup-holder-cushion-red.html) | AOSOM | 82 | $85.63 | $80.99 | Cost $85.63 above $80.99 market |
| Reclining Camp Chair | [URqpKWPBCFVQ](https://www.doba.com/product/URqpKWPBCFVQ/x.html) | vevor | 0 | $55.11 | $59.99 | Out of stock (0) — was a hero in the previous list |
| Reclining Chair with Footrest | [kUCMvIWLiJqj](https://www.doba.com/product/kUCMvIWLiJqj/dropshipping-reclining-camping-chair-with-footrest-4-position-adjustable-outdoor-folding-chair-heavy-duty-portable-camping-lounge-chair-with-headrest-cup-holder-side-pocket-for-outdoor-beach-patio-travel.html) | UUSalesshop | 0 | $40.52 | $47.99 | — |
| Roll-Up Aluminum Side Table | [pkQZbOWNnYvV](https://www.doba.com/product/pkQZbOWNnYvV/dropshipping-folding-camping-table-portable-roll-up-side-tables-lightweight-aluminum-beach-table-with-adjustable-height-top-mesh-layer-and-carry-bag-for-outdoor-bbq-tailgating-picnic-travel-silver.html) | vevor | 150 | $47.11 | $41.99 | Cost $47.77 above $41.99 retail |
| Roll-Up Aluminum Table 46 in | [WBFrVckNOYqQ](https://www.doba.com/product/WBFrVckNOYqQ/dropshipping-folding-camping-table-portable-roll-up-side-tables-lightweight-aluminum-beach-table-with-adjustable-height-large-storage-bag-and-carry-bag-for-outdoor-bbq-tailgating-picnic-travel-black.html) | vevor | 396 | $50.31 | — | Cost $51.02 vs Best Buy $56.61 |
| 12V Car Fridge 25 L | [vVCwKJbYteDM](https://www.doba.com/product/vVCwKJbYteDM/dropshipping-12-volt-car-refrigerator-264qt25l-car-fridge-portable-electric-cooler-with--4-68-f-adjustable-temp-1224v-dc-and-100--240v-ac-compressor-freezer-for-outdoor-camping-travel-rv.html) | vevor | 29 | $135.91 | $154.89 | 29 units; ~5% contribution |
| 12V Car Fridge 40 L | [OCFHeCQgKCqC](https://www.doba.com/product/OCFHeCQgKCqC/dropshipping-12-volt-car-refrigerator-423qt40l-car-fridge-portable-electric-cooler-with--4-68-f-adjustable-temperature-1224v-dc-and-100--240v-ac-compressor-freezer-for-outdoor-camping-travel-rv.html) | vevor | 24 | $171.10 | $203.90 | Reserve: contribution under 10% at market prices; reconsider only if the logged-in cost is lower. 24 units only; ~9% contribution |
| 12V Car Fridge 40 L (old listing) | [iYbHoVDyuJvj](https://www.doba.com/product/iYbHoVDyuJvj/dropshipping-car-refrigerator-12-volt-car-refrigerator-fridge-40-l-single-zone-portable-freezer-with-wheels-and-handle--4-68-f-1224v-dc-and-100-240v-ac-compressor-cooler-for-outdoor-camping.html) | vevor | 0 | $142.38 | — | Out of stock (0) — this was the previous report's fridge |
| 12V Car Fridge 40 L EPP | [rFCeqVBBpJbf](https://www.doba.com/product/rFCeqVBBpJbf/dropshipping-12-volt-refrigerator-423-qt-40l-car-fridge-portable-ultra-light-epp-freezer-app-control-electric-compressor-12v24v-dc-14-to-50-f-for-truck-van-rv-suv-boat-travel-camping.html) | vevor | 329 | $143.90 | $152.90 | Cost $145.92 vs $152.90 market: no margin |
| 12V Dual-Zone Car Fridge 50 L | [hEqGYvDMgJbF](https://www.doba.com/product/hEqGYvDMgJbF/dropshipping-portable-car-refrigerator-12-volt-car-refrigerator-fridge-50-l-528-qt-dual-zone-portable-freezer--4-68-f-adjustable-temperature-compressor-cooler-for-home-outdoor-camping-rv-car.html) | vevor | 25 | $247.89 | $309.90 | Reserve: contribution under 10% at market prices; reconsider only if the logged-in cost is lower. 25 units; ~9% contribution |
| 12V Fridge 35 L with app | [ynvhPFbWToDB](https://www.doba.com/product/ynvhPFbWToDB/dropshipping-portable-refrigerator-37-quart35-liter12-volt-refrigerator-app-control-4-to-68-f-car-refrigerator-dual-zone-with-1224v-dc-110-240v-ac-for-camping-fishing-outdoor-or-home-use.html) | vevor | 27 | $164.70 | — | 27 units; no retail benchmark verified |
| 2-Room Shower & Privacy Tent | [RzetFCcqKQVa](https://www.doba.com/product/RzetFCcqKQVa/dropshipping-camping-shower-tent-2-room-portable-privacy-tent-changing-room-with-shower-bag-ground-stakes-ropes-carry-bag-and-support-poles-150d-oxford-fabric-with-silver-coating-for-camping-fishing.html) | vevor | 338 | $81.51 | $80.99 | Cost $82.65 above $80.99 market |
| Folding Camp Toilet 350 lb | [NwKRFgCOHevE](https://www.doba.com/product/NwKRFgCOHevE/dropshipping-portable-toilet-for-camping-350-lbs-weight-capacity-stainless-steel-foldable-camp-travel-toilet-with-soft-seat-for-adults-suitable-for-truckers-rv-travel-camping-road-trips-outdoor-use.html) | vevor | 176 | $25.52 | $25.99 | Cost $25.87 vs $25.99 retail |
| Pop-Up Shower/Privacy Tent | [EuFZQeJECKvG](https://www.doba.com/product/EuFZQeJECKvG/dropshipping-pop-up-shower-tent-instant-portable-privacy-tent-changing-room-with-hanging-bag-ground-stakes-ropes-carry-bag-190t-polyester-with-silver-coating-quick-setup-for-camping-beach-fishing.html) | vevor | 424 | $31.92 | $31.90 | Cost $32.36 vs $31.90 retail — the previous list's rank-10 product |
| Portable Flush Toilet 5.3 gal | [dreWCTFWQKbg](https://www.doba.com/product/dreWCTFWQKbg/dropshipping-portable-toilet-53-gallon-detachable-waste-tank-120-flushes-camping-toilet-for-adults-outdoor-travel-potty-with-level-indicator-carry-bag-suitable-for-rv-travel-camping-hiking-boating.html) | vevor | 24 | $63.11 | $78.90 | Reserve: contribution under 10% at market prices; reconsider only if the logged-in cost is lower. 24 units; ~10% contribution |
| Propane Water Heater 10 L | [jteZbJIjoCvR](https://www.doba.com/product/jteZbJIjoCvR/dropshipping-portable-propane-water-heater-10l-tankless-outdoor-water-heater-68000-btu-264-gpm-instant-hot-water-with-accessory-set-regulator-for-rv-camping-trips-cabins-barns.html) | vevor | 0 | $108.71 | $130.99 | — |
| Propane Water Heater 5 L | [uACtQbeqyKqG](https://www.doba.com/product/uACtQbeqyKqG/dropshipping-portable-propane-water-heater-5l-tankless-outdoor-water-heater-34000-btu-132-gpm-instant-hot-water-with-accessory-set-regulator-for-rv-camping-trips-cabins-barns.html) | vevor | 0 | $79.91 | $99.90 | — |
| Propane Water Heater 6 L | [uHCdQMeyOFbV](https://www.doba.com/product/uHCdQMeyOFbV/dropshipping-portable-propane-water-heater-6l-tankless-outdoor-water-heater-41000-btu-158-gpm-instant-hot-water-with-accessory-set-regulator-for-rv-camping-trips-cabins-barns.html) | vevor | 0 | $71.99 | $89.99 | Out of stock (0) — was in the previous list |
| Propane Water Heater with pump | [MPegCGHNNQVD](https://www.doba.com/product/MPegCGHNNQVD/dropshipping-portable-propane-water-heater-for-camping-with-pumpshowerhead.html) | GT | 0 | $417.50 | — | — |
| 3-in-1 Tent Fan with Lantern | [jDFtKRoypCVG](https://www.doba.com/product/jDFtKRoypCVG/dropshipping-3-in-1-camping-fan-with-led-lantern-portable-hanging-tent-fan-3-speed-wind-timer-function-power-bank-low-noise-rechargeable-fan-with-remote-control-for-outdoor-camping-fishing-rv-10400mah.html) | inQ Boutique | 169 | $41.32 | $29.99 | inQ Boutique cost $41.32 vs ~$30 comparable |
| Camping Fan with Lantern 10000 mAh | [QkeRqufYKYbV](https://www.doba.com/product/QkeRqufYKYbV/dropshipping-camping-fan-with-lantern-10000mah-rechargeable-battery-powered-portable-tripod-fan-for-tent-with-hanging-hook-carabiner-emergency-power-bank-desk-fan-with-timer-speed-brightness-setting.html) | UUSalesshop | 0 | $36.19 | — | — |
| Motion-Sensor Headlamp 2-pack | [pVKHevkUUFDZ](https://www.doba.com/product/pVKHevkUUFDZ/dropshipping-2-pack-led-headlamp-motion-sensor-5-modes-headlamp-usb-rechargeable-canping-hiking-headlight-us-logistics-for-uspsdhlfedexups-no-designated-logistics-acceptedtktmeu-only-for-self-pickup.html) | inQ Boutique | 99 | $17.70 | — | No identical retail benchmark verified; comparable 2-packs retail ~$15–20 vs $17.70 cost (inQ Boutique) |
| Rechargeable LED Lanterns 4-pack | [OeQgvcSoFCDz](https://www.doba.com/product/OeQgvcSoFCDz/dropshipping-led-camping-lanterns-4-pack-rechargeable-camping-flashlights-solar-usb-charging-portable-collapsible-bulit-to-last-lights-as-power-bank-for-hiking-hurricane-emergency-outrages-fishing.html) | vevor | 0 | $21.60 | $26.99 | Out of stock (0) |
| Rechargeable Lantern (non-VEVOR) | [vkePDQTUuYqL](https://www.doba.com/product/vkePDQTUuYqL/dropshipping-camping-lights-camping-lantern-rechargeable-with-3-brightness-4-modes-sos-1200lm-flashlight-lanterns-for-power-outages-hiking-outdoor-home-emergency-hanging-tent-camping-lamp-ice-shanty-lights.html) | Shunjia | 0 | $39.29 | — | — |
| 1800W Portable Power Station | [DbQtVcZowovy](https://www.doba.com/product/DbQtVcZowovy/dropshipping-portable-power-station-1800w-solar-generator-power-station-1008wh-lifepo4-battery-backup-with-9-output-ports-for-for-home-emergency-outdoor-camping-rv-travel-solar-panel-not-included.html) | vevor | 157 | $436.67 | $545.90 | Reserve: contribution under 10% at market prices; reconsider only if the logged-in cost is lower. ~9% contribution, $546 ticket |
| 300W Power Station (non-VEVOR) | [KCFcVEMdHJDP](https://www.doba.com/product/KCFcVEMdHJDP/dropshipping-300w-portable-power-station-296wh-80000mah-lithium-battery-generator-solar-for-outdoor-camping-rv-homepower-supply.html) | inQ Boutique | 0 | $110.43 | — | Out of stock (0) |
| 300W Power Station + 100W Panel kit | [diCeVyWLgPbm](https://www.doba.com/product/diCeVyWLgPbm/dropshipping-300w-power-station-100w-foldable-solar-panel-li-ion-battery-bank-with-acusbdc-outputs-23088wh-solar-generator-for-camping-with18v100w-portable-solar-charger-home-emergencies-outdoor-trips.html) | Solar Power | 433 | $194.08 | — | No identical retail benchmark verified |
| 40,000 mAh Solar/Crank Power Bank | [JVCZqHaqnPvU](https://www.doba.com/product/JVCZqHaqnPvU/dropshipping-40000mah-solar-hand-crank-power-bank-with-built-in-4-cables-emergency-portable-charger-with-flashlight-for-camping-hurricanes-travel-compatible-with-iphone-android-tablets.html) | soluser | 1000 | $26.80 | — | Off-mission and lithium; no benchmark verified |
| 60W Foldable Solar Panel | [NjFPQrKWYCbf](https://www.doba.com/product/NjFPQrKWYCbf/dropshipping-60w-foldable-solar-panel-charger-16bb-n-type-monocrystalline-solar-panel-24-efficiency-lightweight-portable-with-mc4-output-type-c-usb-a-dc-ports-for-power-stations-camping-hiking.html) | vevor | 106 | $44.72 | $43.99 | Cost $45.34 above $43.99 retail |
| Flashfish 1200W Power Station | [mzeRViBmwPqf](https://www.doba.com/product/mzeRViBmwPqf/dropshipping-ff-flashfish-1200w-portable-power-station-768wh-lifepo4-high-capacity-solar-generator-power-battery-backup-with-4ac-outputs-and-6usb-outputs-suitable-for-rv-travel-home-emergencies-backyard-gar.html) | Solar Power | 0 | $496.83 | $389.99 | — |
| 20°F Mummy Sleeping Bag | [KOFgeoYYQCvp](https://www.doba.com/product/KOFgeoYYQCvp/dropshipping-20f-cold-weather-mummy-sleeping-bag-82-inches-x-33-inches-olive-green.html) | ManifeststoreLLC | 0 | $85.45 | — | Out of stock (0) |
| 75 in Heavy-Duty Cot with mattress | [MGQpDPkRwcVf](https://www.doba.com/product/MGQpDPkRwcVf/dropshipping-75-inch-heavy-duty-folding-camping-cot-with-flip-mattress-portable-guest-bed-with-carry-bag-600-lbs-capacity-for-adults-and-teens-ideal-for-travel-garden-balcony-and-outdoor-use.html) | Dizzo | 0 | $53.75 | $62.98 | Out of stock (0) |
| Back-Seat Car Air Mattress | [sdKvqpNFECDL](https://www.doba.com/product/sdKvqpNFECDL/dropshipping-car-air-mattress-inflatable-back-seat-car-camping-mattress-flocking-travel-beds-durable-portable-sleeping-pad-with-air-pump-2-pillows-nozzle-carry-bag-fits-most-suv-mpv-sedan-black.html) | vevor | 0 | $35.20 | $43.99 | Was rank 27 in the previous list |
| Car Air Mattress (universal) | [ByebFdCjaKqA](https://www.doba.com/product/ByebFdCjaKqA/dropshipping-car-air-mattress-inflatable-car-camping-mattress-flocking-thickened-travel-beds-durable-portable-sleeping-pad-with-air-pump-2-pillows-nozzle-carry-bag-fits-most-suv-mpv-sedan-black.html) | vevor | 0 | $33.60 | $41.99 | — |
| Lightweight Sleeping Bag | [JqQYFdPqwKvW](https://www.doba.com/product/JqQYFdPqwKvW/dropshipping-lightweight-sleeping-bag-for-backpacking-hiking-waterproof-compact-envelope-sleeping-bag-for-cold-warm-weather-gray.html) | inQ Boutique | 210 | $13.62 | — | Backpacking item, off-mission; no identical retail benchmark verified |
| Portable Folding Cot RHB-03A | [aNDgbmviLPVe](https://www.doba.com/product/aNDgbmviLPVe/dropshipping-rhb-03a-portable-folding-camping-cot-with-carrying-bag-army-green.html) | inQ Boutique | 20 | $39.22 | — | No comparable retail price verified; 20 units; 47% Doba rate implies inflated MSRP |
| Truck Bed Air Mattress 5.5–5.8 ft | [zgvpqKSRbFDW](https://www.doba.com/product/zgvpqKSRbFDW/dropshipping-truck-bed-air-mattress-for-55-58-ft-full-size-short-truck-beds-inflatable-air-mattress-camping-bed-with-12v-air-pump-2-pillows-carry-bag-for-silverado-ram-f-series-sierra-titan-tundra.html) | vevor | 141 | $53.51 | $43.96 | Cost $54.26 above $43.96 Home Depot price |
| Truck Bed Tent for 5.0–5.2 ft beds | [sKFwDGSFheqO](https://www.doba.com/product/sKFwDGSFheqO/dropshipping-pickup-truck-tent-fits-50-52-ft-truck-tents-for-camping-waterproof-pu2000-mm-2-3-person-sleeping-truck-bed-tent-sturdy-truck-bed-camper-shell-with-expandable-awning-rainfly-storage-bag.html) | vevor | 81 | $97.51 | $92.90 | Derived cost $98.87 is above the $92.90 VEVOR retail price |
| Truck Bed Tent for 5.5–6 ft beds | [LJDpCoyNePvc](https://www.doba.com/product/LJDpCoyNePvc/dropshipping-truck-bed-tent-55-6-pickup-truck-tent-with-rain-layer-and-carry-bag-waterproof-pu2000mm-double-layer-truck-tent-for-camping-accommodate-2-3-person-for-camping-traveling-outdoor-activities.html) | vevor | 1221 | $68.71 | $73.99 | Doba cost $69.67 vs market low $73.99: contribution negative at market price. Highest stock (1,221) — revisit only if logged-in cost is lower. |
| Truck Bed Tent for 8.0–8.2 ft beds | [srFmbEdZhKDM](https://www.doba.com/product/srFmbEdZhKDM/dropshipping-pickup-truck-tent-fits-80-82-ft-truck-tents-for-camping-waterproof-pu2000-2-3-person-sleeping-truck-bed-tent-sturdy-truck-bed-camper-shell-with-expandable-awning-rainfly-storage-bag.html) | vevor | 74 | $148.70 | $155.00 | Cost $150.79 vs $155 retail: no margin |
| 270° Awning 133 sq ft (driver side) | [GzFmQdovKevf](https://www.doba.com/product/GzFmQdovKevf/dropshipping-270-degree-awning-133-sqft-driver-side-vehicle-awning-waterproof-uv50-car-side-awnings-with-carry-bag-all-weather-free-standing-overland-awnings-car-shelter-for-suv-van-truck-camping.html) | vevor | 57 | $283.09 | $353.90 | Reserve: contribution under 10% at market prices; reconsider only if the logged-in cost is lower. ~12% contribution; $353.90 ticket raises CAC |
| Hard-Shell Rooftop Tent | [cGKveqogJQbH](https://www.doba.com/product/cGKveqogJQbH/dropshipping-rooftop-tent-hard-shell-2-3-person-aluminum-roof-top-tent-hardshell-with-tri-color-led-light-thick-mattress-1-window-waterproof-windproof-overland-camping-car-roof-rack-for-jeep-suv-pickup.html) | vevor | 13 | $1,247.78 | $1,149.99 | Cost $1,265 above $1,150 market; freight-damage risk |
| SUV Tent 13×10 ft (5–9 people) | [iTCkeaYFSQVG](https://www.doba.com/product/iTCkeaYFSQVG/dropshipping-suv-camping-tent-for-5-9-person-13-x-10-ft-3-season-suv-tailgate-tent-with-ventilated-windows-pu2000mm-waterproof-dual-use-car-rear-hatch-tents-for-outdoor-hiking-travels.html) | vevor | 0 | $163.90 | — | Out of stock on Doba (0 units) |
| Waterproof SUV Tent 5–6 person (non-VEVOR) | [tPCjDFIfUevY](https://www.doba.com/product/tPCjDFIfUevY/dropshipping-waterproof-suv-tent-for-5-6-person-camping-travel-3-doors-mesh-window-gray-green-spacious-car-tent.html) | AOSOM | 13 | $86.89 | — | 13 units in stock, unbranded, no comparable retail price found; VEVOR listings preferred |
| 16-in-1 Survival Shovel/Axe | [pQFHDodEVCqJ](https://www.doba.com/product/pQFHDodEVCqJ/dropshipping-survival-shovel-survival-axe-16-in-1-camping-folding-shovels-with-hatchet-stainless-steel-tactical-shovel-hatchet-combo-multifunctional-emergency-survival-gear-equipment-for-camping-hiking.html) | vevor | 0 | $34.40 | — | — |
| 20 in Fire Bowl | [LCVWevdQEYqn](https://www.doba.com/product/LCVWevdQEYqn/dropshipping-20-inch-patio-fire-pit-metal-camping-fire-bowl-with-pot-holder-and-storage-shelf.html) | Summit Supplies | 0 | $122.53 | — | Out of stock (0) |
| Foldable Wood Tent Stove (non-VEVOR) | [tmeYFZJoKQbu](https://www.doba.com/product/tmeYFZJoKQbu/dropshipping-portable-foldable-wood-burning-tent-stove-with-5-sections-chimney-heavy-duty-carbon-steel-camping-stove-with-view-window-cooking-racks-for-outdoor-hunting-camping.html) | inQ Boutique | 86 | $153.08 | — | No comparable retail price; 47% Doba rate implies inflated MSRP |
| Knife & Hatchet Combo | [wFbReroyECVB](https://www.doba.com/product/wFbReroyECVB/dropshipping-hunting-knife-and-hatchet-axe-combo-set-with-sheath-fixed-blade-tactical-knife-and-camping-axe-stainless-steel-survival-knife-and-camping-hatchet-for-outdoor-survival-hunting-camping-adventure.html) | vevor | 0 | $22.40 | — | Out of stock (0) |
| Smokeless Fire Pit (magnesium oxide) | [ZbCHVAIyRKqv](https://www.doba.com/product/ZbCHVAIyRKqv/dropshipping-portable-smokeless-fire-pit-magnesium-oxide-bonfire-stove-with-mat-brown-ideal-for-outdoor-activities.html) | AOSOM | 132 | $111.39 | $76.99 | Cost $111.39 vs $76.99 retail |
| Tent Wood Stove 86 in, alloy steel | [iyqQbcIWnCDH](https://www.doba.com/product/iyqQbcIWnCDH/dropshipping-wood-stove-86-inch-alloy-steel-camping-tent-stove-portable-wood-burning-stove-with-chimney-pipes-gloves-1400infirebox-hot-tent-stove-for-outdoor-cooking-and-heating-with-8-pipes.html) | vevor | 345 | $98.31 | $105.99 | Cost $99.69 vs $105.99 market: no margin |
| Tent Wood Stove 86 in, stainless | [mZqwvYNfnFVD](https://www.doba.com/product/mZqwvYNfnFVD/dropshipping-wood-stove-86-inch-stainless-steel-camping-tent-stove-portable-wood-burning-stove-with-chimney-pipes-gloves-1646infirebox-hot-tent-stove-for-outdoor-cooking-and-heating-with-8-pipes.html) | vevor | 184 | $136.71 | $147.99 | Cost $138.62 vs $147.99 market: no margin |

## Setups (7 at launch + 1 after safety documents)

Each setup is priced at the sum of its items' recommended prices less 5%. Setups lift order value but **do not lift margin percentage** — the discount offsets most of the per-order fee saving.

| Setup | Mission | Status | Contents | Items at rec. price | Same items at market low | Setup price | Doba cost | Contribution | Contrib. % | Break-even ROAS |
|---|---|---|---|---|---|---|---|---|---|---|
| Tailgate Weekend Setup | Tailgate & SUV Camping | Launch | SUV Tailgate Tent 8×8 ft (sleeps 6–8) + 12V Car Fridge 20 L (21 qt) + Heavy-Duty Folding Camp Chair + Heavy-Duty Folding Camp Chair + 1000 lm LED Lantern (360°) | $436.95 | $390.85 | $414.99 (−5%) | $307.65 | $74.26 | 17.9% | 5.6× |
| Truck Bed Camping Setup | Truck Bed Camping | Launch | Truck Bed Tent for 6.4–6.7 ft beds + Truck Bed Air Mattress 6–6.5 ft + Vehicle Awning 10×7 ft + 1000 lm LED Lantern (360°) | $322.96 | $294.47 | $305.99 (−5%) | $238.13 | $43.38 | 14.2% | 7.1× |
| Shade Basecamp Setup | Shade & Day Basecamp | Launch | Car Side Awning 6.6×8.2 ft + Screen House 6×6 ft pop-up + Heavy-Duty Folding Camp Chair + Heavy-Duty Folding Camp Chair + Collapsible Folding Wagon 550 lb | $441.95 | $402.57 | $418.99 (−5%) | $333.16 | $52.43 | 12.5% | 8.0× |
| Couple's Bell Tent Setup | Bell Tent Glamping | Launch | Canvas Bell Tent 3 m with stove jack + 2-Person Folding Camping Cot with bedding + Zero-Gravity Rocking Chair Set (2) + 1000 lm LED Lantern (360°) | $710.96 | $624.87 | $674.99 (−5%) | $481.98 | $139.38 | 20.6% | 4.8× |
| Camp Kitchen Setup | Camp Kitchen | Launch | Folding Camp Kitchen Table, 3 heights, aluminum + Folding Campfire Grill 22 in + Collapsible Storage Bins 65 L (2-pack) + 1000 lm LED Lantern (360°) | $169.96 | $156.69 | $160.99 (−5%) | $126.15 | $21.83 | 13.6% | 7.4× |
| Campsite Privacy Setup | Campsite Hygiene & Privacy | Launch | Shower & Privacy Tent, 1 room with crossbar + 1000 lm LED Lantern (360°) + Collapsible Storage Bins 65 L (2-pack) | $157.97 | $144.79 | $149.99 (−5%) | $115.83 | $22.01 | 14.7% | 6.8× |
| Family Campground Setup | Family Campground Comfort | Launch | Large SUV Tent 10.6×8 ft, all-season (5–9 people) + 2-Person Folding Cot 50 in wide + Collapsible Folding Wagon 550 lb + Oversized Camp Chair 450 lb + Oversized Camp Chair 450 lb + Folding Campfire Grill 22 in | $561.94 | $508.67 | $532.99 (−5%) | $418.60 | $71.98 | 13.5% | 7.4× |
| Off-Grid Power & Cooling Setup | Off-Grid Power & Cooling | After UL/UN38.3 documents | Flashfish E103 300W Power Station (LiFePO4) + Flashfish 100W Foldable Solar Panel + 12V Car Fridge 20 L (21 qt) | $465.97 | $415.88 | $441.99 (−5%) | $312.84 | $93.93 | 21.3% | 4.7× |

Best setup economics: **Couple's Bell Tent Setup** ($136 contribution, 20%) and **Off-Grid Power & Cooling** ($92, 21%; after safety documents). Lead paid tests with these two and the Tailgate Weekend Setup ($70 contribution).

## Final missions

| Mission | Hero / core products | Setup |
|---|---|---|
| Tailgate & SUV Camping | SUV Tailgate Tent 8×8 ft (sleeps 6–8), 12V Car Fridge 20 L (21 qt), Car Side Awning 6.6×8.2 ft, 2-Person Folding Camping Cot with bedding, Large SUV Tent 10.6×8 ft, all-season (5–9 people), Folding Camp Kitchen Table, 3 heights, aluminum, Flashfish E103 300W Power Station (LiFePO4), Rooftop Cargo Bag 20 cu ft, 1000 lm LED Lantern (360°) | Tailgate Weekend Setup |
| Truck Bed Camping | 12V Car Fridge 20 L (21 qt), Car Side Awning 6.6×8.2 ft, Vehicle Awning 10×7 ft, Truck Bed Tent for 6.4–6.7 ft beds | Truck Bed Camping Setup |
| Shade & Day Basecamp | Car Side Awning 6.6×8.2 ft, Vehicle Awning 10×7 ft | Shade Basecamp Setup |
| Bell Tent Glamping | Canvas Bell Tent 3 m with stove jack, 2-Person Folding Camping Cot with bedding, Zero-Gravity Rocking Chair Set (2), 2-Person Folding Cot 50 in wide, Oxford Bell Tent 3 m with stove jack (non-canvas) | Couple's Bell Tent Setup |
| Camp Kitchen | Folding Camp Kitchen Table, 3 heights, aluminum, Mobile Camp Kitchen Box with wheels, Folding Campfire Grill 22 in, 1000 lm LED Lantern (360°) | Camp Kitchen Setup |
| Campsite Hygiene & Privacy | Shower & Privacy Tent, 1 room with crossbar, Shower Tent with Solar Shower Bag | Campsite Privacy Setup |
| Family Campground Comfort | SUV Tailgate Tent 8×8 ft (sleeps 6–8), 2-Person Folding Camping Cot with bedding, Large SUV Tent 10.6×8 ft, all-season (5–9 people), Shower & Privacy Tent, 1 room with crossbar, Zero-Gravity Rocking Chair Set (2), Folding Campfire Grill 22 in, 2-Person Folding Cot 50 in wide, Rooftop Cargo Bag 20 cu ft, 1000 lm LED Lantern (360°) | Family Campground Setup |
| Off-Grid Power & Cooling | 12V Car Fridge 20 L (21 qt), Flashfish E103 300W Power Station (LiFePO4), Flashfish 100W Foldable Solar Panel | Off-Grid Power & Cooling Setup (after safety docs) |
| Cold-Weather Hot Tent | Canvas Bell Tent 3 m with stove jack, Oxford Bell Tent 3 m with stove jack (non-canvas) | Phase 2 (stove needs safety review) |

Change from the previous report: **Cold-Weather Hot Tent** moves to phase 2. Every tent stove fails the margin bar or needs a safety review, and the 2-person hot tent costs more on Doba than at retail. **Campsite Hygiene & Privacy** is new, replacing the propane-shower mission: all 4 propane water-heater listings are out of stock.

## Final categories

| Category | Launch (hero + core) | Phase 2 / bundle-only |
|---|---|---|
| Vehicle Shelter | 4 | 3 |
| Basecamp Tents | 2 | 2 |
| Cooling | 1 | 2 |
| Sleep | 2 | 2 |
| Camp Kitchen | 3 | 0 |
| Hygiene | 2 | 0 |
| Comfort & Haul | 2 | 4 |
| Truck Bed Camping | 1 | 0 |
| Power | 2 | 1 |
| Light | 1 | 0 |
| Warmth | 0 | 2 |

## The $5K/month model (real derived costs)

Launch mix (20 hero + core products): average price $139.74, contribution before ads 20.7% at recommended prices and 11.6% at market-low prices. Break-even blended ROAS = 4.8×.

| Scenario | Assumptions | Revenue | Orders (at avg price) | Contribution before ads | Ad spend | Fixed | Net profit | Net margin |
|---|---|---|---|---|---|---|---|---|
| Conservative | sell at market-low parity, 80% of revenue from paid social at 3.0× ROAS | $5000.00 | 36 | $581.58 (11.6%) | $1333.33 | $100.00 | −$851.75 | -17.0% |
| Base | recommended prices, 60% paid at 4.0× ROAS, rest organic/SEO/email | $5000.00 | 36 | $1033.48 (20.7%) | $750.00 | $100.00 | $183.48 | 3.7% |
| Aggressive | recommended prices, 35% paid at 5.0× ROAS, setups lift AOV, logged-in cost 5% below derived | $5000.00 | 36 | $1235.98 (24.7%) | $350.00 | $100.00 | $785.98 | 15.7% |

**What this means**

- **$5K revenue is about 36 orders a month** at a $140 average price (more with setups). Demand is not the constraint. Margin is.
- **Paid social alone loses money.** At 20.7% contribution, every ad dollar must return $4.80 just to break even. A 3× ROAS (normal for a new store) loses about $0.38 on every ad dollar.
- **The realistic path** — base case, about +$180/month at $5K — is:
  1. **Organic first.** Mission pages, buying guides, Google Shopping free listings, Pinterest and YouTube setup videos you film yourself.
  2. **Paid only on the best economics:** the bell-tent setup, the 20 L fridge, the 2-person cot, the rocking set, and the off-grid setup once its documents arrive.
  3. **Hard rule:** pause any ad set below 5× ROAS after $150 spent.
  4. **Email and retargeting** for setup upgrades.
- **To reach the aggressive case (~$790/month)** you also need about 5% lower cost, from logged-in Doba prices or VEVOR volume terms, plus 65% of revenue from non-paid channels.
- **Cost is the lever that matters.** Every 5% of cost saved adds about 4 points of contribution. Get the logged-in Doba prices first (5 minutes per product). Then ask VEVOR (Doba dropship partner support) for volume or tier pricing on the 10 heroes. If neither moves cost, look for a second supplier for the heroes: CJdropshipping US warehouse, Spocket, or US brands' own dropship programs.

## Safety and certification

None of the 69 Doba listings checked shows a certification document. The `certs` field is empty on every listing, and no CSA, ANSI, UL, ETL, FCC or UN38.3 mark appears in any description. So:

| Type | Products | Decision |
|---|---|---|
| Propane appliances (2-burner stove, propane water heaters) | CIQRKBYRleVF, uHCdQMeyOFbV, uACtQbeqyKqG, jteZbJIjoCvR, MPegCGHNNQVD | **MANUAL REVIEW.** Ask the supplier for CSA/ANSI Z21 certificates. Market as outdoor use only. Never claim tent or indoor use. |
| Wood-burning tent stoves | UdegqhNlQFDz, iyqQbcIWnCDH, mZqwvYNfnFVD, tmeYFZJoKQbu | **MANUAL REVIEW.** No certification. If listed, the copy must require a fire-rated stove jack, spark arrestor and CO alarm. No "safe for any tent" claims. |
| Lithium power stations and power banks | DbQtVcZowovy, KCFcVEMdHJDP, Flashfish units, power banks | **MANUAL REVIEW.** Request UL 2743 / UN38.3 / FCC documents before listing. Ground shipping only. |
| Battery-heated chair | FhCaQDRCbevV | **MANUAL REVIEW.** Request UL/FCC documents for the battery pack. |
| Axes, hatchets, knives | wFbReroyECVB, pQFHDodEVCqJ | Not recommended: out of stock or off-mission, and age and state shipping rules apply. |
| Fire bowls, campfire grills | hTqwPGDooYVc, iNbvcGDRJYqj, LCVWevdQEYqn | No certification needed. Copy includes campfire-safety guidance only. |

No product copy should claim "certified", "UL listed", "CSA approved", "non-toxic", "fire-proof" or "safe indoors" unless the supplier provides the document.

## Video, images and reviews

- **Video:** only 2 of the 103 listings checked have a video on the Doba page, and both products were rejected. Doba's Video Hub license terms for commercial ad use were **not** verified. Treat supplier video as unusable in ads until Doba's terms confirm commercial use in writing. The plan assumes Trenzora films its own setup videos (pitch time-lapses, walk-throughs) for heroes.
- **Images:** scored 1–5 by count on the Doba listing (≥12 = 5, 10–11 = 4, 7–9 = 3, 4–6 = 2). Most VEVOR listings carry 12 images (white-background plus lifestyle). Photo quality still needs a human check.
- **Reviews:** Doba listings do not show customer reviews. No reviews were collected, imported or invented. Launch with no review stars, and collect real reviews after delivery (Shopify Product Reviews or Judge.me), only from verified purchases.


## Seasonality and holiday plan

| Window | Lead products | Note |
|---|---|---|
| Oct–Nov (now) | Bell tents, 20 L fridge, rocking set, power station + panel, cots | Hunting/fall camping. Gift-guide content for Black Friday/Cyber Monday. Fridges and power are the giftable heroes. |
| BFCM (27 Nov – 1 Dec 2026) | Setups, 20 L fridge, rocking set, Flashfish E103 + panel | Don't discount below the price floor in the CSV. A "free lantern in every setup" offer protects margin better than a % off. |
| Dec | Fridge, power station, rocking set, cot | Last ship date for Christmas ≈ 15 Dec (3 days processing + up to 7 days delivery). |
| Jan–Feb | Phase-2 stove (after safety review), canvas tents | Low season. Build SEO pages and film setup videos. |
| Mar–May | SUV tents, awnings, truck tent, kitchen table, shower tent | Main ramp. Memorial Day is the first big week. |
| Jun–Aug | Awnings, shade setups, shower tent, fridge | Father's Day, 4th of July. |
| Sep | Everything + Labor Day | Labor Day, then hunting season. |

## What changed from the previous report

The previous 30-product list used **assumed** Doba costs (60/72/85% of retail scenarios) and showed 25–48% contribution in the middle scenario. This pass read every listing and calibrated cost against trenzora.com's own prices. Changes:

| Old rank | Old product | Now | Doba listing |
|---|---|---|---|
| 1 | SUV Tailgate Tent 8×8 | Kept — hero #1 | [jAqdKQyGwobR](https://www.doba.com/product/jAqdKQyGwobR/dropshipping-suv-camping-tent-8-8-suv-tent-attachment-for-camping-with-rain-layer-and-carry-bag-pu2000mm-double-layer-truck-tent-accommodate-6-8-person-rear-tent-for-van-hatch-tailgate.html) |
| 2 | One-Piece Camp Kitchen Table | Rejected (Doba cost $74 > $65.99 retail); replaced by the 3-height aluminum kitchen table (hero) | [eAqMCSIvJoVj](https://www.doba.com/product/eAqMCSIvJoVj/dropshipping-camping-kitchen-table-one-piece-folding-portable-cook-station-with-a-carrying-bag-aluminum-camping-table-4-iron-side-tables-2-shelves-ideal-for-outdoor-picnics-bbqs-camping-rv-traveling.html) |
| 3 | 12V Car Fridge 40 L | Old listing out of stock; other 40 L listings under 10%. Replaced by the 20 L fridge (hero, 23%) | [iYbHoVDyuJvj](https://www.doba.com/product/iYbHoVDyuJvj/dropshipping-car-refrigerator-12-volt-car-refrigerator-fridge-40-l-single-zone-portable-freezer-with-wheels-and-handle--4-68-f-1224v-dc-and-100-240v-ac-compressor-cooler-for-outdoor-camping.html) |
| 4 | Reclining Rocking Camp Chair | Out of stock; replaced by the AOSOM zero-gravity rocking set (hero) | [URqpKWPBCFVQ](https://www.doba.com/product/URqpKWPBCFVQ/x.html) |
| 5 | Folding Cot with Mattress | Out of stock; replaced by the AOSOM 2-person cot with bedding (hero) | [MGQpDPkRwcVf](https://www.doba.com/product/MGQpDPkRwcVf/dropshipping-75-inch-heavy-duty-folding-camping-cot-with-flip-mattress-portable-guest-bed-with-carry-bag-600-lbs-capacity-for-adults-and-teens-ideal-for-travel-garden-balcony-and-outdoor-use.html) |
| 6 | Canvas Bell Tent 5 m | Rejected (8.7%); the 3 m bell tent is a hero (20%) | [mVDgvoIQuQbP](https://www.doba.com/product/mVDgvoIQuQbP/dropshipping-canvas-tent-4-seasons-5-m164-ft-bell-tent-canvas-tent-for-camping-with-stove-jack-breathable-yurt-tent-for-up-to-8-people-family-camping-outdoor-hunting-party.html) |
| 7 | Tent Wood Stove | Phase 2 — 8.9% and needs a safety review | [UdegqhNlQFDz](https://www.doba.com/product/UdegqhNlQFDz/dropshipping-wood-stove-80-inch-stainless-steel-camping-tent-stove-portable-wood-burning-stove-with-chimney-pipes-gloves-700infirebox-hot-tent-stove-for-outdoor-cooking-and-heating-with-8-pipes.html) |
| 8 | Collapsible Wagon | Bundle only (11%) | [ARQbqcuDePVo](https://www.doba.com/product/ARQbqcuDePVo/dropshipping-collapsible-folding-wagon-550lb-load-220l-2-in-1-foldable-wagon-cart-converts-to-bench-utility-wagon-with-adjustable-handle-outdoor-cart-for-groceries-shopping-camping-gardening.html) |
| 9 | Lantern & Power Bank | Out of stock; replaced by the 1000 lm lantern (core, add-on) | [OeQgvcSoFCDz](https://www.doba.com/product/OeQgvcSoFCDz/dropshipping-led-camping-lanterns-4-pack-rechargeable-camping-flashlights-solar-usb-charging-portable-collapsible-bulit-to-last-lights-as-power-bank-for-hiking-hurricane-emergency-outrages-fishing.html) |
| 10 | Pop-Up Privacy Tent | Rejected (cost ≈ retail); replaced by the 1-room shower tent (hero) | [EuFZQeJECKvG](https://www.doba.com/product/EuFZQeJECKvG/dropshipping-pop-up-shower-tent-instant-portable-privacy-tent-changing-room-with-hanging-bag-ground-stakes-ropes-carry-bag-190t-polyester-with-silver-coating-quick-setup-for-camping-beach-fishing.html) |
| 11 | 270° Awning | Phase 2 (13.6%); the simple side awnings are heroes | [RiCWKQcyDFVf](https://www.doba.com/product/RiCWKQcyDFVf/dropshipping-270-degree-awning-52-sqft-driver-side-vehicle-awning-waterproof-uv50-car-side-awnings-with-carry-bag-all-weather-free-standing-overland-awnings-car-shelter-for-suv-van-truck-camping.html) |
| 12 | 300W Power Station | Out of stock; replaced by the Flashfish E103 (core, after safety documents) | [KCFcVEMdHJDP](https://www.doba.com/product/KCFcVEMdHJDP/dropshipping-300w-portable-power-station-296wh-80000mah-lithium-battery-generator-solar-for-outdoor-camping-rv-homepower-supply.html) |
| 13 | 100W Solar Panel | Flashfish 100 W panel — core | [nKqFVcmUwYvG](https://www.doba.com/product/nKqFVcmUwYvG/dropshipping-100w-18v-portable-solar-panel-flashfish-foldable-solar-charger-with-5v-usb-18v-dc-output-type-c-output-compatible-with-portable-generator-smartphones-tablets-and-more.html) |
| 14 | Cold-Weather Sleeping Bag | Out of stock — dropped | [KOFgeoYYQCvp](https://www.doba.com/product/KOFgeoYYQCvp/dropshipping-20f-cold-weather-mummy-sleeping-bag-82-inches-x-33-inches-olive-green.html) |
| 15 | Camp Cookware Set | Rejected (Doba cost above retail) | [vdbyYPeWHoVi](https://www.doba.com/product/vdbyYPeWHoVi/dropshipping-16pcs-camping-cooking-ware-set-camping-stove-cookware-kit-aluminum-pot-pan-kettle-set-with-bowls-knife-fork-spoon-carabiner-spatula-cutting-board-for-hiking-picnic-outdoor.html) |
| 16 | Propane Water Heater | All 4 listings out of stock — dropped; mission becomes Hygiene & Privacy | [uHCdQMeyOFbV](https://www.doba.com/product/uHCdQMeyOFbV/dropshipping-portable-propane-water-heater-6l-tankless-outdoor-water-heater-41000-btu-158-gpm-instant-hot-water-with-accessory-set-regulator-for-rv-camping-trips-cabins-barns.html) |
| 17 | Portable Fire Pit | Out of stock / cost above retail — dropped | [LCVWevdQEYqn](https://www.doba.com/product/LCVWevdQEYqn/dropshipping-20-inch-patio-fire-pit-metal-camping-fire-bowl-with-pot-holder-and-storage-shelf.html) |
| 18 | Hatchet & Machete Set | Out of stock — dropped | [wFbReroyECVB](https://www.doba.com/product/wFbReroyECVB/dropshipping-hunting-knife-and-hatchet-axe-combo-set-with-sheath-fixed-blade-tactical-knife-and-camping-axe-stainless-steel-survival-knife-and-camping-hatchet-for-outdoor-survival-hunting-camping-adventure.html) |
| 19 | Portable Camp Toilet | Rejected (both listings ≤10%) | [dreWCTFWQKbg](https://www.doba.com/product/dreWCTFWQKbg/dropshipping-portable-toilet-53-gallon-detachable-waste-tank-120-flushes-camping-toilet-for-adults-outdoor-travel-potty-with-level-indicator-carry-bag-suitable-for-rv-travel-camping-hiking-boating.html) |
| 20 | Collapsible Water Jug | Not re-checked: no qualifying Doba listing in this pass — dropped | URL NOT VERIFIED |
| 21 | Roll-Up Camp Table | Rejected (cost above retail) | [pkQZbOWNnYvV](https://www.doba.com/product/pkQZbOWNnYvV/dropshipping-folding-camping-table-portable-roll-up-side-tables-lightweight-aluminum-beach-table-with-adjustable-height-top-mesh-layer-and-carry-bag-for-outdoor-bbq-tailgating-picnic-travel-silver.html) |
| 22 | Reclining Chair Set of 2 | Replaced by the zero-gravity rocking set (hero) | [ZhCWVBIveQvp](https://www.doba.com/product/ZhCWVBIveQvp/dropshipping-zero-gravity-rocking-chair-set-2-pcs-outdoor-recliner-foldable-with-pillow-cup-phone-holder-beige.html) |
| 23 | Truck Bed Tent | 6.4–6.7 ft version is core (16%); the 5.5–6, 5.0–5.2 and 8 ft versions are rejected | [hODWVblfiFqe](https://www.doba.com/product/hODWVblfiFqe/dropshipping-truck-bed-tent-64-67-pickup-truck-tent-with-rain-layer-and-carry-bag-waterproof-pu2000mm-double-layer-truck-tent-accommodate-2-3-person-for-camping-traveling-outdoor-activities.html) |
| 24 | Camp Storage Box | Collapsible 65 L bins — bundle only | [ftFwKLcOQCDJ](https://www.doba.com/product/ftFwKLcOQCDJ/dropshipping-plastic-collapsible-storage-bins-with-lids-65l-2-packs-stackable-folding-storage-crates-with-handles-holds-84-lbs-per-bin-heavy-duty-containers-space-saving-baskets-for-home-organizing.html) |
| 25 | Propane Tent Heater | Dropped: no listing with indoor-safe certification found | URL NOT VERIFIED |
| 26 | Camping Fan with Light | Rejected (cost above comparable retail / out of stock) | [jDFtKRoypCVG](https://www.doba.com/product/jDFtKRoypCVG/dropshipping-3-in-1-camping-fan-with-led-lantern-portable-hanging-tent-fan-3-speed-wind-timer-function-power-bank-low-noise-rechargeable-fan-with-remote-control-for-outdoor-camping-fishing-rv-10400mah.html) |
| 27 | SUV Back-Seat Air Mattress | Out of stock | [sdKvqpNFECDL](https://www.doba.com/product/sdKvqpNFECDL/dropshipping-car-air-mattress-inflatable-back-seat-car-camping-mattress-flocking-travel-beds-durable-portable-sleeping-pad-with-air-pump-2-pillows-nozzle-carry-bag-fits-most-suv-mpv-sedan-black.html) |
| 28 | Hammock with Stand | Not re-checked in this pass — dropped | URL NOT VERIFIED |
| 29 | Headlamp 2-Pack | Rejected (no benchmark; inflated supplier) | [pVKHevkUUFDZ](https://www.doba.com/product/pVKHevkUUFDZ/dropshipping-2-pack-led-headlamp-motion-sensor-5-modes-headlamp-usb-rechargeable-canping-hiking-headlight-us-logistics-for-uspsdhlfedexups-no-designated-logistics-acceptedtktmeu-only-for-self-pickup.html) |
| 30 | Camp Kitchen with Cupboard | Rejected (cost $98 > $87.99 retail) | [KbDWelSiocvI](https://www.doba.com/product/KbDWelSiocvI/dropshipping-camping-kitchen-table-folding-outdoor-cooking-table-with-storage-carrying-bag-aluminum-cook-station-3-cupboard-detachable-windscreen-quick-set-up-for-picnics-bbq-rv-traveling-brown.html) |

**Other changes**

- **Exact Doba URLs** for every product, instead of search links.
- **Real stock** in each warehouse.
- **Free shipping** verified on each listing.
- **Prices capped at the market:** never more than 15% over the lowest identical US price.
- **Setups re-priced** on real costs.
- **New products:** shower/privacy tents, the 3 m bell tent, the Flashfish power and solar pair, and the rooftop cargo bag.
- **Safety:** every gas, wood-stove and lithium item is flagged for manual review, because no Doba listing shows certification.

## Next steps (nothing done on the store yet)

1. **Logged-in costs.** Open the 30 Doba URLs in `catalog/research/doba-logged-in-costs.csv` while signed in, and type in the cost.
   - Alternatively, add Doba login credentials as an environment secret and I can read them.
   - Then run `node scripts/doba-research.ts`. Prices, margins, scores and setups all recalculate.
2. **Re-check prices.** Look up the lowest retail price for each of the 10 heroes by hand on the day you list. Prices here are from search results on 4 Oct 2026.
3. **Safety documents.** Request certificates from Flashfish (E103, 1200W kit) and VEVOR (wood stove), and AOSOM's battery documents for the heated chair.
4. **Ask VEVOR about volume pricing** on the 10 heroes, through Doba supplier messaging.
5. **Then, with your go-ahead:**
   1. Import the 10 heroes and 10 core products.
   2. Update `app/data/catalog.ts` to this list.
   3. Build the 7 launch setups.
   4. Launch ads only on setups and heroes with ≥20% contribution and a 5× ROAS stop-loss.

## Appendix — unit economics for every listed product

| Product | Price | Doba cost | Gross profit | Gross % | Fees | Returns 5% | Discount 2% | Contribution | Contrib. % | Break-even CAC | At market low: contrib. % |
|---|---|---|---|---|---|---|---|---|---|---|---|
| SUV Tailgate Tent 8×8 ft (sleeps 6–8) | $156.99 | $109.51 | $47.48 | 30.2% | $4.85 | $7.85 | $3.14 | $31.64 | 20.2% | $31.64 | 9.9% |
| Canvas Bell Tent 3 m with stove jack | $279.99 | $195.10 | $84.89 | 30.3% | $8.42 | $14.00 | $5.60 | $56.87 | 20.3% | $56.87 | 10.0% |
| 12V Car Fridge 20 L (21 qt) | $179.99 | $119.91 | $60.08 | 33.4% | $5.52 | $9.00 | $3.60 | $41.96 | 23.3% | $41.96 | 17.6% |
| Car Side Awning 6.6×8.2 ft | $150.99 | $105.51 | $45.48 | 30.1% | $4.68 | $7.55 | $3.02 | $30.23 | 20.0% | $30.23 | 9.9% |
| Vehicle Awning 10×7 ft | $108.99 | $75.91 | $33.08 | 30.3% | $3.46 | $5.45 | $2.18 | $21.99 | 20.2% | $21.99 | 9.8% |
| 2-Person Folding Camping Cot with bedding | $186.99 | $126.72 | $60.27 | 32.2% | $5.72 | $9.35 | $3.74 | $41.45 | 22.2% | $41.45 | 12.2% |
| Large SUV Tent 10.6×8 ft, all-season (5–9 people) | $192.99 | $134.31 | $58.68 | 30.4% | $5.90 | $9.65 | $3.86 | $39.28 | 20.4% | $39.28 | 9.9% |
| Folding Camp Kitchen Table, 3 heights, aluminum | $69.99 | $49.51 | $20.48 | 29.3% | $2.33 | $3.50 | $1.40 | $13.25 | 18.9% | $13.25 | 9.6% |
| Shower & Privacy Tent, 1 room with crossbar | $94.99 | $66.31 | $28.68 | 30.2% | $3.05 | $4.75 | $1.90 | $18.97 | 20.0% | $18.97 | 9.7% |
| Zero-Gravity Rocking Chair Set (2) | $223.99 | $145.76 | $78.23 | 34.9% | $6.80 | $11.20 | $4.48 | $55.75 | 24.9% | $55.75 | 17.1% |
| Truck Bed Tent for 6.4–6.7 ft beds | $102.99 | $75.91 | $27.08 | 26.3% | $3.29 | $5.15 | $2.06 | $16.58 | 16.1% | $16.58 | 9.8% |
| Mobile Camp Kitchen Box with wheels | $268.99 | $187.18 | $81.81 | 30.4% | $8.10 | $13.45 | $5.38 | $54.88 | 20.4% | $54.88 | 10.0% |
| Flashfish E103 300W Power Station (LiFePO4) | $148.99 | $99.06 | $49.93 | 33.5% | $4.62 | $7.45 | $2.98 | $34.88 | 23.4% | $34.88 | 13.7% |
| Shower Tent with Solar Shower Bag | $74.99 | $51.73 | $23.26 | 31.0% | $2.47 | $3.75 | $1.50 | $15.54 | 20.7% | $15.54 | 20.7% |
| Folding Campfire Grill 22 in | $36.99 | $27.12 | $9.87 | 26.7% | $1.37 | $1.85 | $0.74 | $5.91 | 16.0% | $5.91 | 6.8% |
| 2-Person Folding Cot 50 in wide | $96.99 | $69.44 | $27.55 | 28.4% | $3.11 | $4.85 | $1.94 | $17.65 | 18.2% | $17.65 | 8.0% |
| Oxford Bell Tent 3 m with stove jack (non-canvas) | $193.99 | $139.18 | $54.81 | 28.3% | $5.93 | $9.70 | $3.88 | $35.30 | 18.2% | $35.30 | 9.9% |
| Flashfish 100W Foldable Solar Panel | $136.99 | $93.88 | $43.11 | 31.5% | $4.27 | $6.85 | $2.74 | $29.25 | 21.4% | $29.25 | 11.6% |
| Rooftop Cargo Bag 20 cu ft | $67.99 | $47.99 | $20.00 | 29.4% | $2.27 | $3.40 | $1.36 | $12.96 | 19.1% | $12.96 | 9.6% |
| 1000 lm LED Lantern (360°) | $19.99 | $14.40 | $5.59 | 28.0% | $0.88 | $1.00 | $0.40 | $3.31 | 16.6% | $3.31 | 8.4% |
| Inflatable SUV Tent with Awning 8×6.7 ft | $276.99 | $192.78 | $84.21 | 30.4% | $8.33 | $13.85 | $5.54 | $56.49 | 20.4% | $56.49 | 10.0% |
| SUV Tent 10×9 ft, 3-season (6 people) | $140.99 | $98.39 | $42.60 | 30.2% | $4.39 | $7.05 | $2.82 | $28.34 | 20.1% | $28.34 | 9.9% |
| Tent Wood Stove 80 in pipe, stainless | $87.99 | $71.11 | $16.88 | 19.2% | $2.85 | $4.40 | $1.76 | $7.87 | 8.9% | $7.87 | 7.1% |
| 1200W Power Station + 200W Solar Panel | $741.99 | $516.66 | $225.33 | 30.4% | $21.82 | $37.10 | $14.84 | $151.57 | 20.4% | $151.57 | 10.1% |
| Elevated Tent Cot (all-in-one) | $124.99 | $98.28 | $26.71 | 21.4% | $3.92 | $6.25 | $2.50 | $14.04 | 11.2% | $14.04 | 6.6% |
| Heated Double Camping Chair | $109.99 | $88.50 | $21.49 | 19.5% | $3.49 | $5.50 | $2.20 | $10.30 | 9.4% | $10.30 | 1.3% |
| 12V Car Fridge 50 L | $238.99 | $191.90 | $47.09 | 19.7% | $7.23 | $11.95 | $4.78 | $23.13 | 9.7% | $23.13 | 5.4% |
| 12V Dual-Zone Car Fridge 40 L | $278.99 | $223.90 | $55.09 | 19.7% | $8.39 | $13.95 | $5.58 | $27.17 | 9.7% | $27.17 | 1.5% |
| 270° Awning 52 sq ft (driver side) | $288.99 | $220.70 | $68.29 | 23.6% | $8.68 | $14.45 | $5.78 | $39.38 | 13.6% | $39.38 | 10.0% |
| 4-Person Inflatable Cabin Tent with pump | $148.99 | $119.91 | $29.08 | 19.5% | $4.62 | $7.45 | $2.98 | $14.03 | 9.4% | $14.03 | 9.9% |
| Truck Bed Air Mattress 6–6.5 ft | $90.99 | $71.91 | $19.08 | 21.0% | $2.94 | $4.55 | $1.82 | $9.77 | 10.7% | $9.77 | 6.8% |
| Collapsible Folding Wagon 550 lb | $122.99 | $96.71 | $26.28 | 21.4% | $3.87 | $6.15 | $2.46 | $13.80 | 11.2% | $13.80 | 9.9% |
| Screen House 6×6 ft pop-up | $87.99 | $67.11 | $20.88 | 23.7% | $2.85 | $4.40 | $1.76 | $11.87 | 13.5% | $11.87 | 5.5% |
| Oversized Camp Chair 450 lb | $55.99 | $45.52 | $10.47 | 18.7% | $1.92 | $2.80 | $1.12 | $4.63 | 8.3% | $4.63 | 0.2% |
| Heavy-Duty Folding Camp Chair | $39.99 | $31.92 | $8.07 | 20.2% | $1.46 | $2.00 | $0.80 | $3.81 | 9.5% | $3.81 | -1.9% |
| Collapsible Storage Bins 65 L (2-pack) | $42.99 | $35.12 | $7.87 | 18.3% | $1.55 | $2.15 | $0.86 | $3.32 | 7.7% | $3.32 | 9.4% |

