# Trenzora.com: launch checklist

These steps need your login, your money or a business decision. Work through them in order. Nothing in this repo has connected to, changed or published anything on the trenzora.com store. The Shopify connector in this workspace is signed in to **trenzora.in**, and the US storefront code refuses that store (`app/lib/store-guard.ts`).

## A. Verify the numbers (before any ad spend)

- [ ] **A1. Doba costs.** For each row in `catalog/doba-cost-inputs.csv`:
  1. Open the Doba URL. Rows marked "no — pick listing" need you to choose the exact listing first.
  2. Fill in `doba_cost_usd`, `doba_shipping_usd` (0 if free), `supplier` and `checked_on`.
  3. Run `npm run economics`.
  4. Drop or bundle-only anything below 25% contribution.
- [ ] **A2. Retail check.** Look up the lowest price at vevor.com, Walmart and Amazon for each hero. Adjust `priceUsd` in `app/data/catalog.ts` to anchor + 0–5%.
- [ ] **A3. Supplier terms.** For every supplier you'll list, confirm three things. If any differ, edit `app/data/site.ts` (`SHIPPING`, `RETURNS`).
  - **Free shipping area:** contiguous US? AK/HI excluded?
  - **Processing and delivery days.**
  - **Return policy:** 30 days unused? Who pays return shipping on bulky items?
- [ ] **A4. Safety listings.** Stoves, heaters and the propane water heater need a CSA/UL mark on the listing. Lithium power and lanterns need UL/FCC. Reject any listing without them.

## B. Shopify store (trenzora.com, USD)

- [ ] **B1. Connect this workspace to the trenzora.com store.** The connector currently points at trenzora.in, and switching signs that session out. Alternatively, run the Admin steps yourself.
- [ ] **B2. Install the Hydrogen channel** on trenzora.com: Settings → Apps and sales channels → Hydrogen → Create storefront.
- [ ] **B3. Link this app.** Run `cd us && npx shopify hydrogen link` and pick the *US* storefront. Then run `npx shopify hydrogen env pull`. The app refuses trenzora.in and MaternEase hosts.
- [ ] **B4. Products.**
  1. Push the first 20 products from Doba: ranks 1–10, plus bundle parts 14, 15, 19, 20, 21, 24, 13, 12, 18, 16.
  2. **Rename each product handle** to the handle in `catalog/product-setup.csv`, and tick "Create URL redirect". **Test one product first** to confirm Doba order sync still works after a handle change. It syncs by product/variant ID, but verify.
  3. Add the tags from `product-setup.csv`. `curated` makes a product appear in listings.
  4. Set Vendor to the real maker.
  5. Set SEO title and description.
- [ ] **B5. Rewrite imported titles and descriptions.** Remove "Dropship…", "to sell online" and keyword stuffing. The QA script fails any page containing "dropship", "Doba" or "AliExpress".
- [ ] **B6. Images and video.**
  1. Upload Doba product photos (they come with the push).
  2. From the Doba **Video Hub**, add Supplier Showcase videos to heroes as product media. The home "See it set up" block shows the SUV tent video automatically.
  3. Save the license terms for each video.
- [ ] **B7. Collections.** Create the 17 smart collections in `catalog/collections.json`: Admin API `collectionCreate`, or Admin → Collections → Smart, with "Product tag is equal to …". Publish them to the Hydrogen channel.
- [ ] **B8. Discount codes.** Create the 6 `SETUP-*` codes per `catalog/bundles.md`, then set `PUBLIC_BUNDLE_DISCOUNTS=on`.
- [ ] **B9. Legacy products.** Leave old non-camping products **untagged**: they stay reachable at their URLs, so Google listings keep working, but never appear in listings. Unpublish from Google later, product by product. **Delete nothing.**
- [ ] **B10. Policies.** Settings → Policies: refund, shipping, privacy and terms. They must match `RETURNS`/`SHIPPING` in `app/data/site.ts`.
- [ ] **B11. Contact.** Create the `support@trenzora.com` mailbox, or change `SITE.contactEmail`.
- [ ] **B12. Customer privacy.** Settings → Customer privacy: keep the cookie banner on for regions that require it. The storefront uses `withPrivacyBanner: true`.

## C. Tracking

- [ ] **C1. Meta.** Facebook & Instagram app connected, with data sharing set to **Maximum** (Pixel + Conversions API). Copy the Pixel ID into `PUBLIC_META_PIXEL_ID`. The storefront then fires PageView, ViewContent, Search, AddToCart and InitiateCheckout. Purchase comes from checkout via the app.
- [ ] **C2. Google.** Google & YouTube app connected (Merchant Center, GA4). Put the GA4 measurement ID in `PUBLIC_GA4_ID` and the Ads ID (AW-…) in `PUBLIC_GOOGLE_ADS_ID` when ads start.
- [ ] **C3. Catalog IDs.** Item IDs are sent as `shopify_US_<productId>_<variantId>`, the format both apps use. In Events Manager, Test Events, check that ViewContent's `content_ids` match catalog items.
- [ ] **C4. Verify the funnel on the preview URL:**
  - Meta Test Events: PageView, ViewContent, AddToCart, InitiateCheckout, and Purchase (place a real order, then refund it).
  - GA4 DebugView: page_view, view_item, add_to_cart, begin_checkout, purchase.
  - Shopify Analytics: sessions and add-to-carts appear.
- [ ] **C5. UTMs.** Use `utm_source=facebook&utm_medium=paid_social&utm_campaign=<angle>` on Meta ads. Shopify and GA4 attribute them automatically.

## D. Domain and launch

- [ ] **D1. Deploy.** `npx shopify hydrogen deploy` (or connect GitHub in the Hydrogen channel), then run QA against the preview URL:
  `BASE_URL=https://<preview> QA_EXPECT_CHECKOUT_HOST=checkout.trenzora.com npm run qa:storefront`
- [ ] **D2. Checkout domain.** Add `checkout.trenzora.com` in Settings → Domains, then set `PUBLIC_CHECKOUT_DOMAIN=checkout.trenzora.com`.
- [ ] **D3. Cut over `trenzora.com`** to the Hydrogen storefront (Settings → Domains). Keep the Online Store theme as a fallback for a week.
- [ ] **D4. Search Console.** Submit `https://trenzora.com/sitemap.xml`. Watch Coverage and Merchant listings for 2 weeks.
- [ ] **D5. Post-launch QA on production:**
  `BASE_URL=https://trenzora.com QA_EXPECT_CHECKOUT_HOST=checkout.trenzora.com npm run qa:storefront`
  Run it without `QA_STUB`: the real consent API and pixels load. Then place one real test order and refund it.

## E. Final quality gate (§44 of the brief)

| Area | How it's checked | Status |
|---|---|---|
| Mobile (iPhone 390, Android 412), laptop 1280, desktop 1440, large 1920 | `qa:storefront` | ✓ on mock, 0 blockers |
| Titles, descriptions, canonical, one H1 | `qa:storefront` | ✓ on mock |
| Schema (Product, Breadcrumb, FAQ, Article, Organization) | `qa:storefront` validates JSON-LD | ✓ on mock |
| Sitemap / robots | `qa:storefront` | ✓ on mock |
| Product → variant → cart → checkout URL | `qa:storefront` | ✓ on mock; real checkout pending D1 |
| Bundles → cart + savings | `qa:storefront` | ✓ on mock |
| Search, collections, sort | `qa:storefront` + manual | ✓ on mock |
| Meta / GA4 events (PageView, ViewContent, AddToCart, InitiateCheckout) | `qa:storefront` with stubs | ✓ on mock; live verification pending C4 |
| Purchase event | Shopify checkout via Meta/Google apps | Pending C4 |
| Core Web Vitals | PageSpeed Insights on the preview URL (target LCP < 2.5 s, CLS < 0.1, INP < 200 ms) | Pending D1 |
| Real product images, reviews | Owner content | Pending B6 / post-launch |
