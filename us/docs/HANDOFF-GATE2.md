# Trenzora USA — handoff for the next working session

Last updated: 13 Oct 2026, after the first implementation session. **Start with section 0.**

## 0. Status (updated late on 13 Oct 2026, after the owner imported the 8 Trendsi products)

### Done in the store (all verified through the Admin API)

| # | Change | Result |
|---|---|---|
| 1–3 | Shipping and tax | Every US order ships free ("Free US Shipping (3–7 business days)", $0). Store ships to the US only. The US market adds tax at checkout (**confirm at checkout during QA**). |
| 4–6 | Pages | New copy on /pages/shipping-policy, /pages/returns-policy and /pages/faq. The About page now says 14-day returns, but the rest still describes home and garden products (rewrite pending). |
| 9 | Old catalogue | All **166 old products set to Draft** (not deleted). IDs are in `old-catalogue-drafted-2026-10-13.txt`. Doba drafts were already Draft. |
| 10 | Compare-at prices | Removed from all 8 new products. The Trendsi app had set fake "was" prices of about 2×. |
| 12 | Collections (live) | Jeans That Fit, Bootcut Jeans, Straight Leg Jeans, Wide Leg Jeans and Cozy Layers: smart collections by tag, published to the Online Store and Shop. Bundles exists but is unpublished and empty. |
| 13 | Import | 8 products imported by the owner. Their titles, vendor (now the brand instead of "Trendsi"), type, tags and SEO were cleaned up. |
| 14 | Product pages | Each description starts with "Free US shipping · arrives in 3–7 business days" and the returns and Fit Guide links, followed by fit notes, details and the size chart. Alt text was added to all 71 images. |
| — | Prices | Planned price for core sizes; plus sizes cost the Trendsi cost difference more (rounded up). Bootcut $64.99/$67.99; JB straight $69.99; JB wide $69.99/$72.99; RISEN crop $66.99/$68.99; RISEN straight $64.99/$66.99; Umgee $59.99/$61.99; SO ME $51.99; Zenana $34.99/$36.99. |
| — | Channels | The 8 products are published to Online Store, Shop, Google & YouTube, and Facebook & Instagram (catalogue only, no campaigns). |
| 17 | Navigation | Main menu: Home · Jeans That Fit · Cozy Layers · Fit Guide · Shipping & Returns. A Fit Guide link was added to the footer menu. |
| 18 | Fit Guide | /pages/fit-guide is **published**. |
| 16 | Theme | **"Denim launch - REVIEW BEFORE PUBLISH"** (theme ID 158927618188) is **UNPUBLISHED**. It has the new homepage (hero "Jeans that fit. Sizes 0–24W.", shop-by-fit tiles, jeans and cozy carousels, Fit Guide call to action). It also updates the header, mobile menu, top bar, footer, the product page's shipping/returns blocks and tab, the cart note and the cart recommendations. Preview: https://trenzora.com/?preview_theme_id=158927618188 |
| 20 | Order #1003 | Left as is. |

**Added on 14 Oct (Admin API, verified):**
- **Checkout check:** a draft calculation for a Dallas, TX address offers only "Free US Shipping (3–7 business days)" at $0.00, and `taxesIncluded` is false. Tax came to $0 because the store has no state tax registrations, which is normal below economic-nexus thresholds; review with a CPA later.
- **Google fields:** product categories set (Jeans ×5, Shirts, Sweaters, Sweatshirts). The Google channel fields are set to gender female, age group adult, condition new.
- **Bootcut option:** renamed from "Color: REG/SHORT/LONG INSEAM" to "Inseam: Regular 32" / Short 30" / Long 34"". The Judy Blue wide colour "MD" is now "Medium Wash".
- **About page:** rewritten for denim, and its SEO title and description updated. The Fit Guide got an SEO title and description too.
- **Review theme:** the cart section was fixed (14-day returns; the old script that rewrote the shipping note to "$40+ to qualify" was removed; new empty-cart text). A preview crawl of the homepage, collections, pages, a product, cart and search found no "30-day", "$40", "garden", "Trendsi" or "Doba". The only exception is the homepage `<title>`, which is an admin setting.
- **Steps left for a browser session:** `us/docs/REMOTE-AGENT-PROMPT.md` is a ready-to-paste prompt covering publishing the theme, policies, homepage SEO, hiding old collections, Trendsi app settings, bundles, Shopify Email and a final checkout check.

Backups: `policy-backup-2026-10-13.md`, `page-backup-2026-10-13/`, `trendsi-import-backup-2026-10-13.md` (original titles, prices and menus) and `old-catalogue-drafted-2026-10-13.txt`.

### URGENT: owner, do this first

**The live theme still shows the old wording.** Customers see "Free shipping on orders $40+", "5–12 business days" and "30-day returns" on the new product pages, a home and garden homepage, and a header menu that points to empty collections. This contradicts the new policy. The API cannot edit the live theme.

**Fix:** open the preview link above, check it on mobile, then go to Online Store → Themes → "Denim launch - REVIEW BEFORE PUBLISH" → Publish. The old theme stays in the library, so you can switch back.

### Blocked for the API: the owner must do these in Shopify admin

1. **Settings → Policies:**
   - Paste the approved Shipping and Refund policies (Gate 2 doc, section 5).
   - Fix the three "[LINK]" placeholders in the Terms of service.
   - In the Contact information, remove "( Only For Documentation)".
2. **Online Store → Preferences:** change the homepage title and meta description from "Smart Finds for Home, Garden & Outdoor" to, for example, "Trenzora | Jeans That Fit, Sizes 0–24W | Free US Shipping".
3. **Optional:** hide the 10 old collections from the Online Store (the API blocks unpublishing). They are empty, and nothing in the new theme links to them.

### Remaining, in order

1. Publish the review theme (above).
2. **Trendsi app settings.** Turn **off** any automatic price sync or price rule, so the app does not overwrite the prices or add compare-at prices back. Keep inventory sync on. Confirm the app still routes orders after the vendor change; the first test order will show this.
3. **Trendsi account.** Upload a seller's permit or tax ID, turn on auto-checkout and add a payment card.
4. **Check the supplier data on the Umgee top.** Trendsi lists it as "55% linen, 45% cotton, semi-sheer", although the title says French terry. Confirm with a sample before advertising it.
5. **Stock is thin.** Several sizes show 0 in Shopify, for example most bootcut sizes from 0 to 9. Check that the Trendsi app syncs full stock, and only advertise styles with broad size coverage.
6. **#15 Bundles.** Install the free Shopify Bundles app. Create Bootcut + Umgee ($119.99), Bootcut + SO ME ($109.99) and Bootcut + Zenana ($94.99), and tag each bundle `bundle`. Then publish the Bundles collection and add it to the menu and the theme header. Zenana is tagged `bundle-addon` and kept out of the collections on purpose.
7. Rewrite the About page for denim.
8. **#19 Shopify Email:** turn on the abandoned-checkout automation and the welcome email.
9. **Meta:** settle the balances or use account 1780797503299545, and link Instagram. Samples (section 8).
10. **QA (section 6).** Place one real order, then refund it, and check that Trendsi creates the order.
11. Separate launch approval, then the ₹10,000 test.

## 1. Where things stand

- **Business:** Trenzora.com, a US Shopify store (Basic plan, USD). The owner is based in India. The store is run under MaternEase LLC (Wyoming).
- **Current store:** 166 general home, garden and DIY products. Lifetime sales are 3 orders: 2 placed by the owner, and 1 external order ($11.02, 6 Sep 2026). About 1,400 sessions since Aug 2026.
- **New direction (approved):** size-inclusive, fit-first women's denim plus cozy layers. Products are Judy Blue and RISEN tummy-control jeans in sizes 0–24W, with tops, sourced from **Trendsi (free plan, up to 500 listings)**. Use only items that **ship from the US in 2–5 business days**.
- **Rejected after research:** pet products (none ship from the US), men's clothing (none ship from the US), shoes (margin wiped out by $9.99 shipping), bags (no US stock) and jewellery (ships from China in 11–14 days; possibly revisit for Valentine's 2027).

Research documents (claude.ai):
- Gate 1 research: https://claude.ai/code/artifact/c61549de-518d-4e9d-ba48-53ab0589358f
- Category comparison: https://claude.ai/code/artifact/e6055fcb-d3a7-4035-84b8-4856c6a0bb6f
- Gate 2 store checklist (the source for this handoff): https://claude.ai/code/artifact/0d448265-59dd-4e72-b34f-251bcb8be06b

## 2. Owner decisions (13 Oct 2026)

- Implement **all 20 Gate 2 store changes** (list below). Progress is in section 0.
- Turn **"prices include tax" off** (the US default).
- **Leave order #1003 as is.** It is the owner's own order: $47.91, paid, unfulfilled. Do not fulfil or refund it.
- Pause the entity and tax work for now. The DBA "Trenzora" under MaternEase LLC, the Form 5472 filing and the CPA review are parked.
- **Marketing limit: ₹10,000 including 18% GST** (about $89 of ad spend) for one gated 14-day test. Campaigns stay **paused and unpublished** until a separate launch approval after QA.

## 3. Approved store changes (implement in this order; all reversible)

1. **US shipping rate:** set the "General profile" rate to **$0.00** on every US order. Currently $5.75 under $40, free from $40.
2. **Shipping zones:** ship only to the **US and US territories**. Currently about 240 countries.
3. **"Prices include tax":** turn **off**.
4. **Shipping policy:** replace with the approved copy (section 5 below).
5. **Refund policy:** replace with the approved copy.
6. **FAQ page:** update the shipping, delivery time and returns answers, and add a "find my size" answer.
7. **Terms of service:** fix three "[LINK]" placeholders and the broken /pages/returns-policy link.
8. **Contact policy and footer:** show one consistent identity. Remove "Only For Documentation"; return addresses are given per return.
9. **Existing products:** **unpublish** the 166 current products and the Doba drafts from Online Store and Google. **Do not delete** them.
10. **Compare-at prices:** none on new products. Old products are unpublished anyway.
11. **Collections:** unpublish "Best Sellers" and "New & Trending".
12. **New collections:** create Jeans That Fit (0–24W), Cozy Layers and Bundles.
13. **Import** the 8 launch products below via the Trendsi app (free plan).
14. **Product pages:**
    - Clean titles, the brand's size chart and fit notes.
    - The line "Free US shipping · arrives in 3–7 business days".
    - Alt text on images.
15. **Bundles:** build 3 using a free method (Shopify Bundles app, or a product with fixed components). Prices are in section 4.
16. **Homepage**, in a **duplicate theme, left unpublished** until the owner reviews it:
    - Headline: "Jeans that fit. Sizes 0–24W."
    - Shop-by-fit tiles, Cozy Layers, Bundles, and a link to the Fit Guide.
17. **Navigation:** Jeans That Fit · Cozy Layers · Bundles · Fit Guide · Shipping & Returns.
18. **Fit Guide page:** brand-by-brand sizing (Judy Blue, RISEN, Zenana), how to measure, and "between sizes" advice.
19. **Shopify Email:** abandoned-checkout email and welcome email (free tier).
20. **Order #1003:** leave as is (owner decision).

**Not allowed:**
- Deleting products, orders or customers.
- Paid apps.
- Fake reviews, "X sold" counters, countdown timers, or compare-at prices without proof.
- Publishing the new theme, or creating or launching campaigns, without explicit approval.

## 4. Launch catalogue

All 8 products below were checked on Trendsi on 13 Oct 2026. Each ships from the USA in 2–5 business days and is labelled "7 Day Return & Refund".

| # | Product | Trendsi ID | Stock (13 Oct) | Trendsi cost | Trendsi shipping | Our price | Contribution before ads |
|---|---|---|---|---|---|---|---|
| 1 | Judy Blue tummy-control bootcut jeans (hero) | 152948 | 750 | $30.26 | $9.99 | $64.99 | $16.66 (25.6%) |
| 2 | Judy Blue tummy-control raw-hem straight jeans | 133329 | 230 | $34.34 | $9.99 | $69.99 | $17.13 (24.5%) |
| 3 | Judy Blue high-waist tummy-control wide jeans | 244986 | 115 | $32.72 | $9.99 | $69.99 | $18.86 (26.9%) |
| 4 | RISEN tummy-control high-rise crop wide jeans | 217029 | 80 | $32.72 | $9.99 | $66.99 | $15.97 (23.8%) |
| 5 | RISEN high-rise straight jeans | 242076 | 100 | $32.79 | $9.99 | $64.99 | $13.96 (21.5%) |
| 6 | Umgee French terry boxy top, 3D floral sleeve | 157936 | 90 | $30.20 | $5.99 | $59.99 | $18.59 (31.0%) |
| 7 | SO ME sequin-bow Christmas sweater | 245470 | 95 | $25.84 | $9.99 | $51.99 | $10.89 (20.9%) |
| 8 | Zenana fleece hi-low boyfriend sweatshirt (sell as a bundle add-on only) | 248858 | 255 | $15.04 | $9.99 | $34.99 | $5.63 (16.1%) |

Product page URLs follow the pattern `https://www.trendsi.com/products/detail?id=<ID>`.

**Bundles.** Trendsi charges shipping once per order, by weight: $9.99 covers 1–5 lb. The two-piece weight is unverified.

| Bundle | Price | Contribution |
|---|---|---|
| Judy Blue bootcut + Umgee top | $119.99 | $38.84 |
| Judy Blue bootcut + SO ME Christmas sweater | $109.99 | $33.77 |
| Judy Blue bootcut + Zenana fleece | $94.99 | $30.67 |

**How contribution is calculated:**
- Customer pays $0 shipping; Trenzora pays Trendsi's charge.
- Plus a $1 holiday surcharge.
- Minus payment fees of 2.9% + $0.30.
- Minus a returns allowance: return rate × (shipping + surcharge + fees), plus 30% of returns losing the full product cost. Return rates: jeans 22%, tops 12%, bundles 18%.

**Expansion list** (only after the test passes). Each was US-shipped with at least 55 units in stock on 13 Oct.
- **Judy Blue:** 244975, 137981, 201761, 207699
- **RISEN:** 251420, 242085, 245764, 251415, 216653, 216484, 222277, 258861, 217023, 258856, 155298, 258847, 388828
- **Kancan:** 193608
- **Tops:** BiBi 252257, 243298, 250366 · SO ME 241729, 245465, 250372 · Zenana 226988, 381269

**Re-check stock and price on Trendsi before importing.**

## 5. Approved policy copy (summary; full text is in the Gate 2 doc, section 5)

**Shipping:**
- Free US shipping on every order.
- Arrives in 3–7 business days: 1–2 business days processing, then 2–5 business days in transit from a US warehouse.
- Ships to the US states, PR, GU, VI, AS, PO boxes and APO/FPO. No international shipping.
- Order by 15 Dec for Christmas.
- Support: support@trenzora.com.

**Returns:**
- 14 days from delivery.
- Items must be unworn, with tags, in the original bag.
- Final sale: bodysuits, intimates, swimwear, jewellery and beauty.
- The customer pays return shipping, unless the item was wrong or damaged.
- The return is authorised by email, then shipped back within 7 days.
- Refund within 5–7 business days of receipt.
- No exchanges.
- Wrong or damaged items: report within 48 hours with photos.

**Why 14 days:** Trendsi only accepts returns started within 7 days of delivery. Forward every return to Trendsi the same day.

## 6. QA to run after the changes (before any ad spend)

- Product page shows the price, "Free US shipping · 3–7 business days" and the size chart above the fold on mobile.
- Checkout shows $0.00 shipping for a US address, and a non-US address cannot check out.
- Checkout total = price + sales tax only (tax-inclusive is now off).
- Shop Pay, Apple Pay and Google Pay buttons appear. They are already enabled.
- One real test order, then refund it. Confirm:
  - Meta pixel **1875512863411767** fires PageView, ViewContent, AddToCart, InitiateCheckout and Purchase, with Purchase deduplicated.
  - GA4 **G-JPBRJR4TH4** records it.
  - The Trendsi order is created automatically and auto-checkout charges the card.
- The abandoned-checkout email fires.
- Policies, footer and contact page show the same identity.
- The Google free-listings feed contains only the curated products, with no compare-at prices.

## 7. Launch blockers (owner actions)

1. **Trendsi:** upload a US seller's permit or tax ID (the LLC's EIN or documents), turn on auto-checkout, and add a payment card.
2. **Meta:**
   - Two ad accounts have unpaid ("UNSETTLED") balances: "Trenzora" and "Trenzora.Fashion". Settle them, **or** use the active USD account **1780797503299545**.
   - No Instagram account is linked to that ad account yet.
   - Facebook Page to use: "Trenzora" (ID 491950360668226). Do not use the India pages.
3. **Samples** for photos and fit notes.

## 8. Money: three separate pots

| Pot | Amount | Use |
|---|---|---|
| A. Samples (product cost, not marketing) | About $105–$125 | 4 pieces: Judy Blue bootcut, RISEN crop wide, Zenana fleece, one sweater. Ordered by the owner. |
| B. Fulfilment float | $200 on the Trendsi card | Pays Trendsi for orders before Shopify payouts arrive. Payout timing is unverified. |
| C. Marketing | **₹10,000 maximum, including 18% GST** (about $89 of media; rate ₹95.3 = $1) | A single 14-day Meta test, only after the blockers clear and QA passes, and with explicit approval. |

**Test gate (to release more spend):** at least 3 external orders, cost per order ≤ $25, and checkout-to-purchase ≥ 30%.

**Stop-loss:**
- After $25 spent with CTR < 0.8% or CPC > $1.20: change the creative.
- After $50 with 0 add-to-carts: pause.
- After the full $71 test tranche with < 2 purchases and add-to-cart rate < 3%: stop paid ads.

## 9. Access notes for whoever continues

- The Shopify connector (claude.ai) is currently signed in to **trenzora.com**. MaternEase is signed out of it, so switch it back when working on MaternEase.
- Trendsi's public catalogue shows cost, stock and ship-from without a login. Trendsi's site blocks plain HTTP clients, so use a real browser.
- The repo `trenzora2024-gif/repo` holds an older Hydrogen storefront in `us/`, built for a car-camping concept. It is **not needed** for this test; use the live Shopify theme.
- Never claim an action is done unless it has been verified. Mark anything unverified clearly.
