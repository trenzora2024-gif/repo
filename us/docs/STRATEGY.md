# Trenzora.com: US strategy report

**Prepared:** 2026-10-04 · **Scope:** what Trenzora should become in the US, the niche, the Doba catalog, economics, information architecture, brand, and the Hydrogen storefront built from it (`us/`).

## How to read this report: evidence levels

| Label | Meaning |
|---|---|
| **Verified** | Read from a public source on 2026-10-04 (linked in §Sources). |
| **Benchmark** | Industry-average figures from published reports. Treat them as ranges, not forecasts. |
| **Estimate** | My reasoning from the evidence. It isn't a measurement. |
| **Not verified** | Data this environment could not reach. It is listed as an owner action. |

**What I could not access, and why it matters.** From this cloud environment, doba.com, trenzora.com, Amazon and Google Trends are blocked at the network level. The Shopify connector is signed in to the **trenzora.in** (India, INR) store, not trenzora.com. So:

- **Doba wholesale costs are not verified.** Doba shows prices only after login. Every margin below is either a scenario or comes from `catalog/doba-cost-inputs.csv` once you fill it in.
- **I have not seen your current trenzora.com catalog, analytics or orders.** The "products to remove" list below gives criteria, not SKUs.
- Doba product existence, titles, specs and URLs come from public Doba listing pages found through web search (verified). Retail price benchmarks come from vevor.com, Walmart, Home Depot, Best Buy and Amazon listings found the same way (verified).

---

## 1. Executive summary

**Recommendation:** Trenzora becomes **the US destination for car camping and basecamp setups**: gear for people who camp *with their vehicle*. It covers SUV and truck tents, camp kitchens, 12V fridges, sleep systems, hot-tent heat, power and light, and tailgating. The secondary expansion niche is **off-grid power and outage readiness**, which shares products (power stations, lanterns, heaters) and gives demand in winter.

**Why this niche wins (score 80/100 vs. 66 for the next best):**
1. **Demand is large and moving our way.** More than 52M North American households camped in 2025, above pre-pandemic levels. Interest in car camping is **up 41% since 2019** while traditional RV interest fell 14–29% (KOA 2026 report, verified).
2. **Doba's strongest supplier fits it exactly.** VEVOR has about 13–14k items on Doba, ~99% fulfillment, US warehouses and ~3.4-day delivery (verified). Its outdoor range covers tailgate tents, bell tents with stove jacks, tent stoves, camp kitchens, 12V fridges, awnings, cots, wagons and power. That is a full ecosystem from one reliable source.
3. **Products combine naturally into setups.** A tent needs a cot, a cot needs a sleeping bag, a bell tent needs a stove, a fridge needs power. Bundles raise AOV, and they are hard to price-compare.
4. **The gap is curation, not price.** These products are sold today as spec-dump marketplace listings ("VEVOR 8-10 Person Canvas Glamping Bell Tent, Breathable Waterproof Yurt Tent…") with no guidance. REI curates premium brands at premium prices. Nobody owns *value gear plus expert curation plus complete setups*.

**The hard truth about money:**
- **Revenue of $5K/month needs only ~33 orders/month (~1.1/day) at a $150 AOV, from ~2,800 sessions/month at 1.2% conversion.** That is achievable.
- **Profit depends on one number I can't see: your Doba cost.** Reviewers report Doba prices are often near retail, and VEVOR sells the same items on vevor.com, Walmart and Home Depot. Model results:
  - If Doba cost is ≤72% of the lowest public retail price, most heroes make 30–40% contribution before ads. That supports Meta at a break-even ROAS of 2.5–3.2×.
  - At 85%, several heroes fall to 21–25% and only work in bundles and organic channels.
  - **Fill `us/catalog/doba-cost-inputs.csv` before any ad spend.** `npm run economics` then shows the go/no-go per product.
- **Do not retain the blanket 30% markup.** Price at market parity, anchored to the lowest credible competitor. Use bundles, not discounts, to lift AOV. Reject any product that can't clear 25% contribution.

**What I built:** a production-grade Hydrogen storefront in `us/`, separate from the trenzora.in project so neither can break the other. It has:
- mission-based navigation and collections
- outcome-led product pages with sticky add-to-cart
- one-click complete setups
- guides
- Google-ready structured data
- consent-gated Meta Pixel and GA4

Browser QA passes on iPhone, Android, laptop, desktop and large-desktop viewports with **no blockers**. It runs against a local mock of the Storefront API. Connecting it to the real trenzora.com store needs your login (see §Launch checklist).

---

## 2. US market opportunity

| Signal | Data | Level |
|---|---|---|
| Camping participation | 52M+ North American households camped in 2025, above pre-pandemic. Campers who camped last year are up 24% vs 2019. 31% plan more trips and nights. | Verified (KOA 2026) |
| Car camping shift | Car-camping interest **+41% since 2019**. Traditional RV interest **−14% to −29%**. Car camping is Hipcamp's #4 rig filter. | Verified (KOA, Hipcamp) |
| Why people camp | 77% say "just being in nature is enough": low-structure, comfort-focused trips. | Verified (KOA) |
| Spend per camper | $287 (2020) → $412 (2025) per consumer. Adults 25–54 are 68% of spend. 63% bought compact gear, 69% multifunctional gear. | Benchmark |
| Channel | Offline still ~79% of camping-equipment sales. Online is growing but the category is under-served by specialist DTC. | Benchmark |
| Outages (secondary niche) | Two-thirds of US homeowners lost power in 2026. 47% say backup power would most help (top answer by 18 pts). 41% own no backup power. | Verified (Sunrun/Talker, Aug 2026) |
| Backyard fire | 48% of outdoor lounge areas include a fire pit or fireplace. Fire-pit search peaks in May; patio heaters spike in November. | Verified (Houzz 2026 via search; Google Trends summary) |
| Tailgating | Tailgating gear is a live editorial category in 2026 (Gear Patrol, Barbecue Bible). Hitch grills, wagons and recliners lead. | Verified |
| Garage organization | US market growing ~8.9% CAGR 2026–2033, driven by home renovation. | Benchmark |

**What US consumers are buying in this space:** comfort upgrades for vehicle-based trips (tailgate tents, cots, recliners, 12V fridges, camp kitchens). Power stations sit at the intersection of camping and outages. Cold-season heat (hot tents, stoves) is a growing niche among hunters, anglers and winter campers.

**The problems they're trying to solve:** bad sleep, no room, no light, cooking on the ground, ice melting, no bathroom or shower at dispersed sites, too many trips from the car, and freezing in October. Each of these maps to a mission in §16.

---

## 3. Niche scoring

Each factor is scored 0–10 and weighted as you specified. Scores are estimates built from the evidence in §2, §8 and §9.

| Niche | Demand 20% | Doba avail. 15% | Profit 15% | Competition 10% (10 = least) | Problem-solving 15% | Repeat/expansion 10% | Seasonal 5% | Meta 5% | SEO 5% | **Score /100** |
|---|---|---|---|---|---|---|---|---|---|---|
| Car camping & basecamp (vehicle-based camping) | 8.5 | 9.5 | 6 | 6 | 9 | 8 | 8 | 9 | 8 | **80** |
| Off-grid power & emergency preparedness | 8 | 6.5 | 5 | 4 | 9 | 6 | 7 | 5 | 7 | **66** |
| Backyard outdoor living (fire, heat, patio) | 8 | 8.5 | 5.5 | 3.5 | 6 | 6 | 6 | 7 | 6 | **65** |
| Garage & workshop organization | 6.5 | 8 | 5.5 | 4 | 7 | 5 | 3 | 5 | 6 | **60** |
| Practical pet travel & outdoor pet gear | 7.5 | 5.5 | 5 | 4 | 6.5 | 7 | 3 | 7 | 6 | **60** |
| Garden & yard tools | 7 | 8.5 | 4.5 | 3 | 5.5 | 6 | 6 | 4 | 5 | **58** |
| Home organization | 7.5 | 6 | 3.5 | 2.5 | 6 | 5 | 4 | 5 | 5 | **53** |

**Why the leader wins on the factors that matter most:**
- **Doba availability (9.5):** VEVOR alone covers almost every subcategory, with US stock and free shipping on many listings. Doba shows ~650 camp-tent, 540 wagon, 511 fire-pit, 277 portable-shower and 36 rooftop-tent results.
- **Problem-solving (9):** every product answers a concrete trip problem.
- **Meta (9):** setups are highly visual and demonstrable (tent pitch, kitchen unfold, hot-tent glow).
- **Profit (6):** high AOV ($60–$400 items), held back only by the unverified Doba cost risk.

**Why the others lose:**
- **Off-grid power/preparedness (66):** power stations are dominated by Jackery, EcoFlow and Bluetti, which discount hard every Black Friday (Jackery 300 at $159). Fear-based ads face Meta scrutiny. Doba has generators and panels but no food or water storage depth. It is better as a *secondary* lane that shares products.
- **Backyard (65):** Wayfair, Home Depot and Lowe's own the category with in-store pickup and freight. Furniture and heavy freight bring damage and return risk.
- **Garage, garden, home organization (53–60):** commodity products where Amazon, Home Depot and Lowe's win on price and speed. Low problem-specificity and weak Meta creative.

## 4. Recommended niche

- **Primary:** *Car camping & basecamp*: gear for camping with your vehicle, from weekend sites to cold-season hunting camps and tailgates.
- **Secondary expansion:** *Off-grid power & outage readiness*. It reuses power stations, solar, lanterns and heaters. It is merchandised in winter (Nov–Feb storms) and hurricane season (Jun–Oct).
- **Niches to avoid:**
  - general garden tools
  - home organization
  - generic garage storage
  - furniture
  - pet supplies

  They have no problem-specificity, are Amazon- or big-box-dominated, and dilute the brand.

---

## 5. Customer personas

| | **1. Weekend Car Camper** (primary) | **2. Family Basecamp Planner** (secondary) | **3. Cold-Season Hunter / Hot-Tent Camper** (high-value) | **4. Tailgate Host** | **5. Gift Buyer** (seasonal) |
|---|---|---|---|---|---|
| Age / gender | 28–45, mixed (slightly male) | 32–48, often the mother plans | 30–60, mostly male | 25–55, mostly male | 30–65, mostly female in Q4 |
| Household | Couple or small family, SUV/crossover | 2 kids, minivan/3-row SUV | Pickup, hunting party | Homeowner, college/NFL fan | Buying for partner/dad |
| Income | $70–140k | $80–160k | $60–130k | $70–150k | $60–150k |
| Geography | Mountain West, PNW, Southeast, Texas, Midwest lakes | Suburbs near state parks | Rockies, Midwest, Appalachia, Northeast | SEC/Big Ten states | Nationwide |
| Trigger | "We're going Friday", first nice spring weekend | School holidays, Memorial Day | Season opener (Sep–Nov) | Football season (Aug–Jan) | Black Friday–Dec 15 |
| Problem | No room, bad sleep, no light | Comfort: bathroom, shower, sleep | Staying warm, dry basecamp | Logistics: hauling, cooking | Doesn't know what they own |
| AOV | $120–250 | $180–400 | $300–700 | $100–300 | $40–150 |
| Search behavior | "suv tent", "car camping essentials" | "family camping checklist", "shower tent" | "hot tent with stove jack", "tent wood stove" | "tailgate setup", "collapsible wagon" | "gifts for campers", "gift for dad who camps" |
| Marketplaces | Amazon, REI, Walmart | Walmart, Target, Amazon | Cabela's/Bass Pro, Amazon, forums | Academy, Dick's, Amazon | Amazon, Etsy, Target |
| Social | Instagram, YouTube, TikTok | Facebook, Pinterest, Instagram | YouTube, Facebook groups, Reddit | Facebook, Instagram | Facebook, Pinterest |
| Objections | "Will it fit my car?" "Is it cheap junk?" | "Is it easy to set up?" | "Is it safe?" "Will the stove fit the tent?" | "Is it worth the trunk space?" | "Will it arrive in time?" "Can they return it?" |
| Trust needs | Fit specs, real photos, returns | Setup video, returns | Safety copy, materials, matched pairs | Price vs Amazon | Delivery date, gift returns |
| Price sensitivity | Medium | Medium | Low–medium | Medium–high | Medium |

**Primary customer:** the Weekend Car Camper. **Secondary:** the Family Basecamp Planner. **High-value:** the Cold-Season Hunter, with the largest baskets (bell tent + stove + cots ≈ $640+). The Gift Buyer is the Q4 volume driver.

## 6. Customer problems → missions

| Customer says… | Mission collection | Hero answer |
|---|---|---|
| "We're heading out Friday after work." | Weekend Car Camping | SUV tailgate tent + cot + lantern + recliner |
| "I want to cook real food at camp." | Camp Kitchen | One-piece kitchen table, 12V fridge, water jug |
| "Hunting camp opens in three weeks and last year we froze." | Cold-Weather & Hot-Tent Camping | Canvas bell tent with stove jack + tent wood stove |
| "I love camping. I hate how I sleep." | Sleep Better Outside | Cot with mattress, cold-rated bag |
| "I need light at camp and power when the grid goes down." | Power & Light | Lantern/power bank, 300W station + 100W solar |
| "Game day is Saturday and I'm hosting." | Tailgate & Backyard | Wagon, kitchen table, recliners, fire pit |
| "First camping trip with the kids." | Family Campsite | Privacy tent, camp toilet, propane shower |
| "They love camping and I don't know what they own." | Gifts for Campers | Lantern, recliner, hatchet set, fridge |

---

## 7. Competitor analysis

Based on public positioning and search results. I could not browse competitor sites from this environment.

| Competitor | Positioning | Assortment / price | Strength | Weakness = Trenzora's gap |
|---|---|---|---|---|
| **REI** | Co-op, expert advice | Premium brands; e.g. Base Camp 4 tent, Yeti cooler | Best content ("Expert Advice", staff picks) | Premium prices; little value-tier gear; no vehicle-specific setups |
| **Amazon** | Everything store | Thousands of near-identical listings | Price, Prime speed, reviews | No curation; spec-dump titles; no "what goes with what" |
| **Walmart** | Value | Sells VEVOR, GVDV and similar at low prices | Price, pickup | Zero guidance; third-party listing quality |
| **Home Depot / Lowe's** | Home improvement | VEVOR camping kitchens, awnings, SUV tents via marketplace | Trust, returns | Camping is an afterthought; no camp content |
| **Bass Pro / Cabela's** | Hunting & fishing | Wall tents, stoves, heaters | Hunting credibility | Dated UX; hot-tent setup guidance thin |
| **Dick's / Academy** | Sporting goods | Coleman/Ozark Trail-tier camping, tailgate shops | Seasonal tailgate merchandising | Mass-market; no mission depth |
| **VEVOR.com** | Manufacturer direct | Same products, low prices | Price | Industrial catalog feel; no curation or education |
| **KingCamp, Camplux, Gasland, BougeRV** | Single-brand DTC | Own-brand camp furniture, water heaters | Brand clarity | One brand only; can't build cross-brand setups |
| **GTFOverland, Overland Depot, Rhino USA, Blue Ridge Overland Gear** | Overland specialists | Rooftop tents, awnings, fridges, power | Expertise, community | Overland-enthusiast prices ($1–3k RTTs); intimidating to weekend campers |
| **Jackery / EcoFlow / Bluetti** | Power stations | $150–$3,000 power | Brand, Black Friday deals | Single category; heavy discounting |
| **Solo Stove / BioLite** | Premium fire & power | $100–$500 hero products | Video-led Meta ads | Premium only |
| **Huckberry / Uncommon Goods** | Gift curation | Lifestyle gifts | Gift merchandising | Not a camping destination |

**What Trenzora does better:**
1. **The missing middle: value gear with real curation.** REI-quality guidance on VEVOR-tier prices.
2. **Vehicle-first setups.** Nobody merchandises "your SUV as basecamp" end to end.
3. **Matched systems.** Bell tent + stove matched by size, panel + station connectors matched, cots that fit the tent. Marketplaces can't do this.
4. **Honest product pages.** The problem it solves, who it's for, who it isn't for, safety rules, and the maker's name shown openly.
5. **Problem-led content** that ranks for the long tail Amazon ignores ("how to heat a canvas tent safely").

## 8. Marketplace analysis

| Question | Answer |
|---|---|
| Commoditized, with price pressure | Lanterns, headlamps, wagons, cookware, water jugs, roll-up tables, sleeping bags. **Sell only as bundle filler and AOV add-ons.** |
| Price-anchored by the maker's own site | All VEVOR-branded items: vevor.com, Walmart, Home Depot and Best Buy show the same product at $X. **Price at parity; never above the lowest major retailer by more than ~5%.** |
| Easier to differentiate | Bell tent + stove systems, camp kitchens, SUV/truck tents, awnings, 12V fridges paired with power. Fit, setup and safety need expertise. |
| Where customers expect expertise | Hot tents (safety), vehicle fit (tents, awnings, mattresses), power sizing (which station runs which fridge). |
| Where Trenzora curates better | Complete setups, fit guidance, gift-by-budget, seasonal missions. |

---

## 9. Doba catalog opportunity

**Platform (verified):**
- 1M+ SKUs; ~90% of suppliers ship from US warehouses.
- Categories include Home & Garden, Outdoor, Sports, Pets and Electronics.
- **Basic plan ($59.99/mo): 250 one-click listings, 600 inventory-list capacity, 2 store integrations.** That comfortably fits a 30–80-product curated catalog, so no plan upgrade is needed.

**VEVOR on Doba (verified):**
- ~13,400 active products shipping from the US
- 99.0–99.6% fulfillment rate
- ~3 business days processing; average 3.4 days delivery
- free-shipping options
- a published return policy page

**Category depth on Doba (verified result counts):**

| Category | Results |
|---|---|
| Camp tents | ~650 |
| Wagons | 540 |
| Outdoor fire pits | 511 |
| Portable showers | 277 |
| Camp toilets | 51 |
| Rooftop tents | 36 |

**Also present:**
- outdoor kitchens and camp tables
- 12V fridges
- power stations (300W to 3,840Wh LiFePO4)
- 100–200W solar panels
- lanterns and cots
- sleeping bags and gas heaters
- tent stoves

**Video (verified):** Doba's **Video Hub** offers two kinds of content:
- **Supplier Showcases:** polished demos.
- **Influencer Picks:** unboxing and review-style videos.

Doba states they are free to use for marketing, and its supplier agreement has suppliers warrant they hold the rights. Usage rules and risks:
- **Use as-is** on product pages and in Meta ads.
- **Do not alter influencer videos** in a way that implies the creator endorses Trenzora.
- **Do not imply the creator is Trenzora's customer.**
- **Keep a screenshot of the license terms** per downloaded video.
- **Risk:** influencer likeness and music rights sit with the supplier. If a video carries trending music, strip the audio before using it in ads.
- **Flag:** product imagery and videos show VEVOR branding. That's fine, and honest. Brand = VEVOR in Shopify and Google Merchant (§22).

**Supplier reliability rule:**
- Default to VEVOR (US-stocked, 99% fulfillment).
- Any other supplier needs ≥97% fulfillment, US warehouse, ≤3 days processing and a published return policy before listing.
- Products with lithium batteries or gas need UL/CSA certification shown on the listing, or they are rejected.

**Must-do in your Doba account** (I can't log in):
1. Export your inventory list, or open each URL in `catalog/doba-cost-inputs.csv`.
2. Record cost, shipping and supplier.
3. Run `npm run economics`.

## 10. Product shortlist

The full per-product record lives in **`us/app/data/catalog.ts`**: 30 products × all the fields you listed. Those fields include problem, persona, missions, specs, included, FAQ, recommended price, market benchmark with sources, Doba URL (confirmed or to-confirm), seasonality, competition, search intent, cross-sells, video status, quality concerns and tier. It is also the data the storefront renders. The economics table in **`us/catalog/economics.md`** is regenerated from it.

Doba listing confirmation:
- **Confirmed:** 15 of 30. The URL is to the exact Doba product page found publicly.
- **To confirm:** 15. The category exists on Doba but the exact listing must be picked after login (wood stove, awning, lantern, solar, bags, and others).

## 11. Pricing strategy

**Stop using cost + 30%.** On VEVOR items, cost + 30% often lands *above* vevor.com and Walmart, so conversion dies. When Doba cost is low, it leaves money on the table instead.

**New rule. Recommended price is:**
1. **Anchor** at the lowest price among vevor.com, Walmart, Home Depot and Amazon for the same item.
2. **Price** at anchor to anchor + 5%. Round to a clean ending ($179, $89).
3. **Floor:** contribution after fees, returns and discount allowance must be ≥25% (`npm run economics`). Below the floor, the product goes bundle-only. Below 15%, reject it.

**Compare-at prices:** only where *you* sold at that price for 30+ days or a documented MSRP exists. Never invent "was" prices. The storefront shows a strikethrough only when Shopify has a compare-at above price.

**Tiers that fit this niche:**

| Tier | Price | Products | Role |
|---|---|---|---|
| Entry | $24–59 | Lantern, headlamps, water jug, privacy tent, hatchet set, cookware, sleeping bag | Add-ons, gifts, impulse |
| Core | $69–179 | Kitchen tables, chair, cot, wagon, stove, SUV tent, power station | Ad heroes, bundle anchors |
| Premium | $219–399+ | 12V fridge, awning, bell tent; later rooftop tent | AOV, high-value persona |

**Other pricing elements:**
- **Free shipping threshold:** none. Products were selected with free shipping, so "free shipping on everything" is simpler and converts better. Confirm the contiguous-US limit with each supplier.
- **Bundles:** a fixed $12–$37 off as a set (~3–6%), applied by a discount code that only the bundle button applies. The value is convenience and the matched system, not the discount.
- **Volume:** chairs as a 2-pack ($139 vs $148).
- **Cross-sell pricing:** no discount. Cross-sells appear in the cart as "Complete your setup".

## 12. Margin analysis

Run `node scripts/economics.ts` for the live table. Current output with **no verified Doba costs**, as scenarios:

| Product | Price | Contribution % at Doba cost = 60% / 72% / 85% of lowest retail | Break-even ROAS (72%) |
|---|---|---|---|
| SUV Tailgate Tent | $179 | 44% / 35% / 25% | 2.9× |
| Camp Kitchen Table | $89 | 48% / 40% / 31% | 2.5× |
| 12V Car Fridge 40 L | $219 | 41% / 31% / 21% | 3.2× |
| Reclining Camp Chair | $74 | 41% / 31% / 21% | 3.2× |
| Cot with Mattress | $79 | 48% / 40% / 31% | 2.5× |
| Canvas Bell Tent 5 m | $399 | 31% / 19% / 7% | 5.1× |
| Tent Wood Stove | $139 | 59% / 53% / 46% | 1.9× |
| Collapsible Wagon | $89 | 49% / 41% / 32% | 2.4× |
| Lantern/Power Bank | $34 | 45% / 36% / 27% | 2.8× |
| Privacy Tent | $49 | 53% / 45% / 37% | 2.2× |

**Assumptions:** Shopify Payments at 2.9% + $0.30, a 5% returns allowance, a 2% discount allowance, and $0 shipping.

**Bundle contribution (72% scenario):**

| Bundle | Price | Contribution |
|---|---|---|
| Weekend Setup | $349 | 33% |
| Hot-Tent Basecamp | $639 | 27% |
| Camp Kitchen Kit | $205 | 38% |
| Tailgate Kit | $285 | 35% |
| Family Comfort Kit | $285 | 38% |
| Off-Grid Power Kit | $315 | 28% |

**Reading:** the bell tent sits at the VEVOR price, so it is a *bundle anchor*, not a standalone ad product. The tent wood stove and camp kitchen carry the margin.

## 13. $5K/month economics

| Scenario | AOV | Conv. rate | Orders/mo | Orders/day | Sessions/mo | Paid share | CPC | Ad spend | CAC | ROAS | Contribution before ads | **Profit after ads** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Conservative | $120 | 0.9% | 42 | 1.4 | 4,630 | 60% | $0.90 | $2,500 | $125 | 0.96× | $1,100 (22%) | **−$1,400** |
| Base | $150 | 1.2% | 33 | 1.1 | 2,778 | 50% | $0.75 | $1,042 | $78 | 1.92× | $1,350 (27%) | **+$308** |
| Aggressive | $185 | 1.6% | 27 | 0.9 | 1,689 | 45% | $0.65 | $494 | $51 | 3.64× | $1,550 (31%) | **+$1,056** |

**Benchmarks behind the inputs:**
- Sports & Outdoors Shopify median conversion is 1.7% (top 25%: 2.8%).
- Conversion falls to 0.7–1.2% at $150–350 AOV.
- Paid-social conversion is ~1.0%.
- Meta Sports & Outdoors CPM is $9–11, CPC $0.41–0.67, median CPA ~$45 and ROAS ~2.3×.

**What must happen to reach $5K profitably:**
1. **AOV ≥ $150**, from bundles and setups, not single $34 lanterns.
2. **Conversion ≥ 1.2%**, from mission pages, fit answers, real photos and video.
3. **≥50% of traffic non-paid:** Google free listings, SEO guides, social, email.
4. **Meta CAC ≤ contribution per order** (≈ $40–60). Prospecting only on heroes whose verified contribution is ≥30%.
5. **Verified Doba cost ≤ ~72% of the lowest retail price** on the products you advertise.

**The conservative row shows the failure mode.** Low AOV plus mostly paid traffic loses money. That is what Easy Ads did, and it is why the plan starts with organic and Google and keeps Meta on a tight test budget.

---

## 14. Product ecosystem

```
                        ┌── Shelter ── SUV tent · truck tent · bell tent · awning
Car camping & basecamp ─┼── Sleep ── cot+mattress · cold-rated bag · SUV mattress
                        ├── Kitchen ── kitchen table · windscreen kitchen · 12V fridge · cookware · water jug
                        ├── Seating ── recliner (1 & 2-pack) · camp table · hammock stand
                        ├── Heat & fire ── tent wood stove · fire pit · certified propane heater · hatchet set
                        ├── Power & light ── lantern/power bank · headlamps · 300W station · 100W solar · fan
                        ├── Haul & storage ── wagon · camp box
                        └── Comfort ── privacy tent · camp toilet · propane water heater/shower
Secondary: Off-grid power & outage readiness (reuses Power & light + heater)
```

## 15. Category architecture

There are 8 gear collections ("Shop by gear"), each a Shopify smart collection on the tag `gear:<handle>`:
- `shelter`
- `sleep`
- `camp-kitchen-gear`
- `seating-tables`
- `heat-fire`
- `power-light`
- `haul-storage`
- `campsite-comfort`

Subcategories are handled by filters and copy, not more collections. Avoid thin 2-product pages.

## 16. Mission-based collections

There are 8 mission collections, each a smart collection on the tag `mission:<handle>`:
- `weekend-car-camping`
- `camp-kitchen`
- `cold-weather-camping`
- `sleep-better-outside`
- `power-and-light`
- `tailgate-and-backyard`
- `family-campsite`
- `gifts-for-campers`

Each has:
- the job in the customer's words
- an intro and a problem statement
- "How to choose" (3 steps)
- an FAQ, with FAQPage schema
- a linked bundle and guide
- related missions

There is also `trenzora-picks` (tag `tier:hero`) for the home page. All copy is in `us/app/data/missions.ts`.

## 17. Brand positioning

| | |
|---|---|
| **Positioning** | Car camping and basecamp gear, sorted by what you're trying to do. |
| **One-line value proposition** | Hand-picked gear and complete setups for car camping, cold nights and weekends off-grid. |
| **Homepage headline** | *Your campsite, sorted.* |
| **Subheadline** | Tell us what you're planning: a weekend at the lake, a cold hunting camp, game day. We'll show you the gear that does the job and works together. No 400-listing scroll. |
| **Primary CTA** | Shop by mission |
| **Secondary CTA** | See complete setups |
| **Brand promise** | Every product here earns its place: it solves a real camp problem, works with the rest of your setup, and is explained honestly. |
| **Trust proposition** | Free US shipping · 30-day returns · ships from US warehouses · the maker's name on every product · real answers from support@trenzora.com |
| **Why Trenzora** | Fewer products. Better matched. Honestly explained. |

**Personality:** useful, practical, calm-expert, friendly, action-oriented. It does not use hype, countdown timers, fake scarcity or any mention of dropshipping.

**Visual system:**
- Warm paper background (#F6F3EC), pine ink (#1F3F30), ember action color (#C4542A).
- One variable typeface (Archivo) for speed.
- Topographic contour motif.
- Line-drawn product glyphs until real photography is in.

## 18. Homepage architecture (built)

1. **Hero** (outcome headline, 2 CTAs, proof row) beside the 4 most common missions
2. **Shop by mission:** 8 tiles with the customer's own words
3. **Featured solutions:** hero products (`tier:hero`)
4. **Seasonal block:** currently *October: hunting camp & cold nights*; updated monthly in `data/site.ts`
5. **Complete setups:** 3 bundle cards
6. **Product demonstration:** auto-appears when the SUV tent has a Shopify video (upload the Doba Video Hub demo)
7. **Shop by gear** chips
8. **Why Trenzora:** 3 pillars and a trust strip
9. **Most popular:** Shopify best-sellers. It is hidden until sales data adds products not already featured.
10. **Guides**
11. **Final CTA**

**Social proof is deliberately absent until real reviews exist.** The recommendation is Judge.me's free plan (§Apps) with post-delivery review requests. No imported or fake reviews.

## 19. Navigation (built)

`Shop by mission | Gear | Complete setups | Guides | Gifts`, plus Search and Cart.

The mobile menu lists missions, then gear. The footer has missions, gear and help (shipping & returns, contact, why Trenzora, guides, policies).

## 20. SEO architecture

| Type | URLs | Target intent | Examples |
|---|---|---|---|
| Pillar (mission) | `/collections/<mission>` | Commercial-problem | "car camping gear", "hot tent camping", "tailgating gear" |
| Category (gear) | `/collections/<gear>` | Category | "camping cots", "camp kitchen table" |
| Product | `/products/<handle>` (unchanged from the Online Store) | Product, Shopping | "suv tailgate tent", "12v car fridge 40l" |
| Guides | `/guides/<handle>` | Informational / problem | "car camping checklist", "how to heat a canvas tent" |
| Setups | `/bundles/<handle>` | Commercial | "camping gear bundle", "hot tent and stove" |
| Seasonal | mission + guide refresh | Seasonal | "gifts for campers", "winter camping gear" |
| Comparison (next) | guides | Comparison | "cot vs air mattress camping", "12v fridge vs cooler" |

**Technical SEO built in:**
- one H1 per page, unique titles and descriptions, canonical URLs
- Open Graph and Twitter tags
- JSON-LD: Organization/OnlineStore with return policy, WebSite SearchAction, Product (brand, GTIN from barcode, per-variant offers, shipping details, return policy), BreadcrumbList, FAQPage, Article
- sitemap index (products, collections, pages, plus Hydrogen-only bundles and guides)
- robots.txt (Shopify defaults)
- sorted collection URLs set to `noindex`
- legacy product URLs stay live

**Content rule:** 5 guides written now. Add 2 per month, each answering a real question and linking to its mission and setup. No mass AI pages.

## 21. Meta strategy

**Hero problems (angles):**
1. "Your SUV is half your campsite."
2. "Stop crouching over the picnic table."
3. "Warm tent in October."
4. "No more ice runs."
5. "The 2 a.m. bathroom walk."

**Hero products for ads**, only once verified contribution is ≥30%:
- SUV tailgate tent
- camp kitchen table
- tent wood stove + bell tent (as a setup)
- 12V fridge
- reclining chair
- cot
- collapsible wagon

**Best video products:** tent pitch, kitchen unfold, stove glow at night, fridge freezing on 12V, recliner rocking. Source these from the Doba Video Hub "Supplier Showcases" first.

**UGC:** after first orders, offer free product to 3–5 micro-creators (5–50k, car-camping/hunting niches). Give clear disclosure (#ad) and get usage rights in writing.

**Testing roadmap:**

| Phase | Budget | Setup | Success gate |
|---|---|---|---|
| 0: Readiness | $0 | Pixel + Facebook & Instagram channel app (CAPI), catalog synced, 20+ products with real photos | Events verified in Events Manager |
| 1: Creative test (2 weeks) | $20/day | 1 Advantage+ Sales campaign, 3 hero products × 2 angles each, broad US 25–55 | CTR ≥1.5%, CPC ≤$0.80, ATC rate ≥6% |
| 2: Validate (2 weeks) | $30–40/day on the 2 winners | Add setup bundles as ads, retarget viewers 30d with catalog ads | CAC ≤ verified contribution/order; ROAS ≥ break-even (§12) |
| 3: Scale | +20% per week while ROAS holds | Seasonal angles (hunting, tailgate, gifts) | Stop any ad set at 2× target CPA with no purchase |

**Hard stops:** never more than $300 total before Phase-1 gates are met. No Easy Ads or similar automation apps.

## 22. Google strategy

- **Keep:** the Google & YouTube app feeds Merchant Center from Shopify product data, so free listings keep working regardless of the storefront.
- **Must not break:**
  - **Product URLs:** Hydrogen serves `/products/<handle>` exactly like the Online Store. Keep handles unchanged.
  - **Price and availability:** both come from the same Storefront API data as the feed.
- **Product data fixes (owner, in Shopify):**
  - **Title format:** `Product type – key spec – size` (e.g. "SUV Tailgate Tent – 8×8 ft – Sleeps 6–8").
  - **Brand = real maker** (VEVOR).
  - **GTIN:** put it in Barcode where the supplier provides one. Otherwise set "identifier exists = no" in the Google app.
  - **Google product category** per product.
  - Remove "Dropship…" / "to sell online" text from imported Doba titles and descriptions.
- **Structured data:** Product schema per variant, with shipping and return policy, matching the feed (§20).
- **Shopping Ads later:** start only after 60 days of free-listing data. Use Performance Max on the 5 best-converting products with a target ROAS at break-even.

## 23. Holiday strategy (starting today, 2026-10-04)

| Window | Focus | Hero products | Landing page | Ad / email angle |
|---|---|---|---|---|
| **Oct (now)** | Hunting camp, cold nights, tailgating, fall foliage trips | Bell tent, wood stove, cot, cold bag, wagon, kitchen table | `/collections/cold-weather-camping`, `/bundles/hot-tent-basecamp`, `/collections/tailgate-and-backyard` | "Heat your camp this fall"; "One trip from the car" |
| **Halloween** | Not a fit. Skip it; no themed promo. | — | — | — |
| **Nov 1–20** | Gift planning, outage prep (first storms) | Lantern, recliner, hatchet set, power kit | `/collections/gifts-for-campers`, `/guides/gifts-for-campers-guide` | "Gifts they'll actually use, by budget" |
| **Thanksgiving / BF / CM (Nov 26–Dec 1)** | Real, modest setup savings only | All bundles; 12V fridge as "big gift" | `/bundles` | "Complete setups, ready to gift". No fake "was" prices. |
| **Dec 1–15** | Last order dates | Under $50 and $50–150 gifts | Gifts mission | "Order by Dec 15 for the best chance of Christmas delivery" (real cut-off: 3 days processing + up to 7 transit) |
| **Dec 16–31** | No delivery promises; e-gift card | Shopify gift card | Gift card PDP | "Give the gift of choosing" |
| **Jan–Feb** | Winter storms; New Year trip planning | Power kit, lantern, heater | Power & Light | "Ready for the next outage" (calm, not fear) |
| **Valentine's** | Two-person setups | Recliner 2-pack, SUV tent | Weekend car camping | "Weekend for two" |
| **Mar–Apr** | Season opener | SUV tent, cot, kitchen | Weekend car camping, checklist guide | "First trip of the year" |
| **Memorial Day** | Family camping kickoff | Family Comfort Kit | Family campsite | "Make the first family trip a good one" |
| **Father's Day** | Strong gift moment | Recliner, hatchet set, 12V fridge, kitchen | Gifts | "For the dad who runs the campsite" |
| **July 4th / Labor Day** | Summer peak | Fan, privacy tent, shower | Family, power & light | "Beat the heat at camp" |
| **Aug–Sep** | Back-to-tailgating | Tailgate kit | Tailgate & backyard | "Game-day ready" |

**Email** (Shopify Email, free tier; or Klaviyo free ≤250 contacts):
- welcome flow, with the checklist guide as the lead magnet
- abandoned checkout (Shopify built-in)
- post-purchase "complete your setup" at day 10
- review request at day 14

**Urgency:** only real shipping cut-offs and real stock levels. No countdown timers.

## 24. 90-day roadmap

| | Days 1–30 (Oct 4 – Nov 3) | Days 31–60 (Nov 4 – Dec 3) | Days 61–90 (Dec 4 – Jan 2) |
|---|---|---|---|
| **Store** | Connect Hydrogen to trenzora.com (preview URL), policies, contact mailbox | Launch Hydrogen on trenzora.com after QA. Checkout on checkout.trenzora.com. | Iterate on CRO data |
| **Products** | Verify Doba costs. Import/tag first 20 (heroes + bundle parts). Rewrite titles and descriptions. Upload Doba photos and videos. | Add remaining 10. Hide legacy products from listings (they're already excluded from listings by default). | Cut bottom 20% by views→ATC. Test 5 "later" products. |
| **SEO** | 5 guides live; submit sitemap in Search Console | +2 guides (cot vs mattress, 12V fridge vs cooler) | +2 winter guides |
| **Content** | Video Hub assets on 10 heroes | 6 short-form videos (setups) | Gift-guide video |
| **Meta** | Phase 0 (pixel/CAPI/catalog) | Phase 1 creative test ($20/day) | Phase 2 validate (gift + hot-tent angles) |
| **Google** | Fix feed (brand, GTIN, titles); monitor free listings | Merchant promotions only for real bundle savings | Evaluate Shopping Ads readiness |
| **Email** | Welcome + abandoned checkout | BF/CM and gift emails (2–3 sends) | Shipping cut-off email; January outage readiness |
| **Bundles** | Create 6 SETUP-* discount codes; turn on `PUBLIC_BUNDLE_DISCOUNTS` | Gift bundles | Review bundle attach rate (target ≥15% of orders) |
| **CRO** | QA script on preview + prod | Add reviews (Judge.me free) as they arrive | A/B: hero headline, bundle card position |
| **Analytics** | Verify PageView/ViewContent/AddToCart/InitiateCheckout/Purchase in Meta Events Manager and GA4 DebugView | Weekly dashboard: sessions, CVR, AOV, CAC, contribution | Monthly P&L by product |
| **Seasonal** | Cold-weather + tailgate | Gifts + BF/CM | Shipping cut-offs → outage readiness |

---

## Products: remove, test later, avoid

**Remove from listings** (unpublish, or simply leave untagged; don't delete, so order history and URLs are kept): any current product that isn't camping, basecamp or power related. That includes general garden tools, home décor, generic DIY tools, organization bins and random viral items. Legacy URLs keep returning 200 so Google listings and old links don't break. Delete only after 90 days with zero traffic.

**Test later** (after the first 30 prove out):

| Product | Why test it |
|---|---|
| Hard-shell rooftop tent ($1–2k on Doba, 36 listings) | AOV hero; risky freight and fit |
| Dual-zone 12V fridge | AOV upgrade |
| 3,840Wh LiFePO4 power station | Outage lane |
| Camping projector/speaker | Tech gifts |
| Dog camping gear (bed, tie-out, bowls) | Pet-camper crossover |
| Ice-fishing shelter | Winter |
| Patio heater | Backyard winter |

**Avoid:**
- food or water rations (shelf life, liability)
- uncertified propane heaters and lithium products without UL
- knives as Meta ads (policy)
- anything sold mainly on price, such as tarps, bungees and cheap tents under $40
- trend items with no mission

## First 30 products and 10 heroes

See **`us/app/data/catalog.ts`** (ranked 1–30, all fields) and **`us/catalog/economics.md`** (margin per product). The 10 hero products are ranks 1–10:

| # | Product | Price | Persona | Core problem | Meta angle | Google intent | Video idea | Bundle | Upsell / cross-sell |
|---|---|---|---|---|---|---|---|---|---|
| 1 | SUV Tailgate Tent | $179 | Weekend car camper | Cramped sleeping in SUV | "Your SUV is half your campsite" | suv tent, tailgate tent | 60-sec pitch on a crossover | Weekend Setup | Awning / cot, lantern, recliner |
| 2 | Camp Kitchen Table | $89 | Family planner | Cooking on the ground | "Stop crouching over the picnic table" | camp kitchen table | Unfold → cook → fold in 30 s | Camp Kitchen Kit, Tailgate Kit | Windscreen kitchen / cookware, water jug |
| 3 | 12V Car Fridge 40 L | $219 | Weekend car camper | Melting ice | "No more ice runs" | 12v car fridge | Freezing ice cream on 12V day 3 | Off-Grid Power (pairing) | Power station / solar |
| 4 | Reclining Camp Chair | $74 | Tailgate host | Uncomfortable chairs | "The chair everyone fights over" | rocking camp chair | Rock + recline by the fire | Weekend, Tailgate | 2-pack / fire pit |
| 5 | Cot with Mattress | $79 | Family planner | Bad sleep | "Sleep like home at camp" | camping cot with mattress | Ground vs cot comparison | Weekend, Hot-Tent | Cold bag |
| 6 | Canvas Bell Tent 5 m | $399 | Cold-season hunter | Freezing hunting camp | "Your October basecamp" | bell tent with stove jack | Night glow time-lapse | Hot-Tent Basecamp | Stove / cots, bags |
| 7 | Tent Wood Stove | $139 | Cold-season hunter | Cold nights | "Warm tent, hot breakfast" | tent wood stove | Boil water + tent warm-up | Hot-Tent Basecamp | Bell tent / hatchet set |
| 8 | Collapsible Wagon | $89 | Family / tailgate | Four trips from the car | "Car to camp in one trip" | collapsible wagon | Load and haul across a field | Tailgate Kit | Kitchen table, chair |
| 9 | Lantern + Power Bank | $34 | Gift buyer | Light + phone charge | "Light the whole campsite" | rechargeable camping lantern | Night campsite, phone charging | Weekend, Power | Headlamps |
| 10 | Privacy Tent | $49 | Family planner | No bathroom/shower | "The 2 a.m. bathroom walk" | privacy shower tent | Pop-up in 3 seconds | Family Comfort Kit | Toilet, propane shower |

---

## RECOMMENDED TRENZORA MODEL

**Build Trenzora.com as a curated car camping and basecamp store:**
- **Catalog:** about 30 hand-picked products, mostly VEVOR via Doba, grouped into 8 customer missions and 6 complete setups.
- **Store:** a fast Hydrogen storefront. It explains each product's problem, fit and safety, and makes one-click setups the main way to build AOV.
- **Pricing:** at market parity. Products that can't clear 25% contribution on verified Doba costs are cut.
- **Acquisition:** organic first (Google free listings, problem-led guides, mission pages, email), then a small, gated Meta test on the 3–5 heroes with verified ≥30% contribution.
- **Expansion:** into off-grid power and outage readiness each winter.

### WHAT WE ARE SELLING
Car camping and basecamp setups: shelter, sleep, camp kitchen, heat, power and light, hauling and campsite comfort. These are 30 products sold singly and as 6 matched setups.

### WHO WE ARE SELLING TO
Weekend car campers (primary), family basecamp planners (secondary), cold-season hunters and hot-tent campers (high value), tailgate hosts, and Q4 gift buyers. All are US-based, aged 25–60, and drive SUVs, minivans or pickups.

### WHAT PROBLEM WE SOLVE
"I want to camp comfortably with my vehicle without researching 400 near-identical listings or buying things that don't fit together."

### WHY THEY SHOULD BUY FROM TRENZORA
- Curated choices with the problem and fit explained.
- Systems matched so they work together.
- One-click complete setups.
- Honest pages: the maker shown, safety rules, no fake discounts.
- Free US shipping and 30-day returns.

### WHY THIS CAN REACH $5K/MONTH
It needs only ~33 orders a month at a $150 AOV. That is ~2,800 sessions a month at 1.2% conversion, in a category with 52M+ camping households and rising car-camping interest. Setups push AOV above $150. Organic and Google free listings can carry half the traffic. Profitability is gated by verified Doba cost (§12–13).

### WHAT PRODUCTS WE START WITH
Ranks 1–30 in `catalog.ts`. Launch with the 10 heroes plus the 10 bundle components (20 products). Add the rest by day 60.

### WHAT WE WILL NOT SELL
- general garden, home or organization products
- furniture
- food rations
- uncertified gas or lithium products
- commodity items under $40 sold on price alone
- random viral products

### HOW WE WILL ACQUIRE CUSTOMERS
1. Google free listings (already active) with fixed product data.
2. SEO pillar pages and guides.
3. Email: welcome, abandoned checkout, post-purchase.
4. Gated Meta tests: video-first, hero problems, Advantage+ with catalog retargeting.
5. Micro-creator UGC.
6. Google Shopping after 60 days.

### HOW WE WILL INCREASE AOV
- one-click complete setups
- "Complete your setup" cross-sells in the cart and on product pages
- the chair 2-pack
- premium anchors (fridge, bell tent, awning)
- free shipping on everything, so there is no threshold friction

### HOW WE WILL SCALE
1. Scale proven heroes at +20% budget per week while ROAS ≥ break-even.
2. Add the secondary off-grid power lane in winter.
3. Test rooftop tents and dual-zone fridges for AOV.
4. Add 2 guides a month.
5. Add Google Shopping.
6. Consider custom Trenzora creative and photography for the top 5.

### WHAT I BUILT
See `us/README.md`:
- Hydrogen storefront (`us/`) with home, missions, gear collections, all-gear, product pages, bundles, guides, search, cart, info pages, policies, sitemaps and robots.
- Catalog, missions, bundles and guides as data.
- Consent-gated Meta Pixel and GA4/Google Ads with Shopify catalog-format item IDs.
- Full structured data.
- A safety guard that refuses the trenzora.in and MaternEase stores.
- Mock Storefront API, unit-economics script, Doba cost-input sheet, and 5-viewport browser QA (0 blockers).

### WHAT STILL NEEDS TO BE CONNECTED
See `us/docs/LAUNCH-CHECKLIST.md`:
- Doba costs
- the trenzora.com Shopify connection (Hydrogen channel, env, link)
- products tagged and collections created
- discount codes
- policies
- the contact mailbox
- pixel IDs
- the domain cut-over
- Search Console

### LAUNCH CHECKLIST
→ `us/docs/LAUNCH-CHECKLIST.md`

---

## Apps (ROI rule: free or clearly paying for itself)

| App | Cost | Why |
|---|---|---|
| Facebook & Instagram (Meta) | Free | Pixel/CAPI on checkout, catalog for Advantage+ |
| Google & YouTube | Free | Merchant Center feed, free listings |
| Shopify Email (or Klaviyo free tier) | Free tier | Welcome and abandoned checkout |
| Judge.me | Free plan | Verified reviews; no imports of supplier reviews |
| Doba | $59.99/mo | Already paid; Basic is sufficient |

**Do not install:** Easy Ads or any auto-ad tool, countdown/scarcity apps, review importers, page builders (Hydrogen replaces the theme).

## Sources

- KOA 2026 Camping & Outdoor Hospitality Report: https://www.koapressroom.com/press/2026-camping-hospitality-report/ · https://rv-pro.com/news/koa-outdoor-hospitality-report-52m-americans-camped-in-2025/ · https://www.hipcamp.com/journal/camping/car-camping-trend-are-more-campers-skipping-the-rv
- Camping equipment market: https://www.fortunebusinessinsights.com/camping-and-hiking-equipment-market-115954 · https://www.marketreportsworld.com/market-reports/camping-equipment-market-14714742
- Outages survey (Sunrun/Talker, Aug 2026): https://www.purdueexponent.org/news/national/bracing-for-blackouts-how-americans-prepare-for-power-outages/article_ca46a9c0-cbb1-5d68-843c-844c61e139c2.html
- Garage organization: https://www.grandviewresearch.com/horizon/outlook/garage-organization-and-storage-market/united-states
- Outdoor living / fire: https://www.northcountrynow.com/premium/stacker/stories/investing-in-outdoor-living-5-of-the-biggest-backyard-trends-of-2026,384332 · https://www.accio.com/business/outdoor_heating_design_trends
- Tailgating 2026: https://www.gearpatrol.com/outdoors/best-new-tailgating-gear-2026/ · https://barbecuebible.com/2026/09/17/tailgating-essentials-2026/
- REI car camping picks: https://www.rei.com/learn/expert-advice/best-car-camping-gear.html
- Black Friday power stations: https://www.fieldandstream.com/outdoor-gear/camping-and-outdoor-rec/camping-gear/black-friday-camping-deals
- Doba plans: https://www.doba.com/blog/doba-guides-and-tools/doba-tutorials/dobas-pricing-plans-which-one-is-right-for-you-38865 · https://ecommerceparadise.com/doba-pricing/
- Doba catalog/suppliers: https://ecommerce-platforms.com/ecommerce-reviews/doba-review · https://www.doba.com/dropshipping-supplier/tHvkbcJtFQVs · https://www.doba.com/blog/find-products-and-suppliers/finding-suppliers/vevor-dropshipping-a-guide-to-partnering-with-reliable-industrial-suppliers-37634
- Doba pricing critique: https://www.salehoo.com/learn/doba-review
- Doba Video Hub and rights: https://www.doba.com/video-hub · https://www.doba.com/blog/marketing-and-sales-growth/marketing-tips/get-the-best-product-images--video-for-your-dropshipping-social-media-ads-39520 · https://www.doba.com/supply/terms
- Doba listings: URLs per product in `us/app/data/catalog.ts`
- Retail benchmarks: vevor.com, Walmart, Home Depot, Best Buy, Amazon listing URLs found 2026-10-04 (summarized per product in `catalog.ts` → `market.sources`)
- Conversion/AOV benchmarks: https://www.growthsuite.net/resources/shopify-conversion-rate/complete-guide/benchmarks-by-industry · https://www.dollarpocket.com/shopify-store-benchmarks-2026
- Meta benchmarks: https://mhigrowthengine.com/blog/meta-ads-benchmarks-ecommerce-2026/ · https://www.digitalapplied.com/blog/facebook-ads-benchmarks-2026-cpc-cpm-ctr-industry
- Hydrogen analytics and consent: https://shopify.dev/docs/storefronts/headless/hydrogen/analytics
