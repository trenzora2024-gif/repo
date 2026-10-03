# Trenzora go-live checklist

Owner actions: `LAUNCH-BLOCKERS.md`. The step-by-step store connection, with authorization gates, is in `docs/STORE-CONNECTION.md`. Pre-flight: `npm run launch:audit`.

## 1. Shopify store (owner action)

- [ ] Create or confirm the **Trenzora** Shopify store (INR, India). The Shopify account connected to this workspace is a different store (MaternEase), so nothing has been written to it.
- [ ] Install the **Hydrogen** sales channel and create a storefront. That gives you `PUBLIC_STOREFRONT_API_TOKEN`, `PRIVATE_STOREFRONT_API_TOKEN` and `PUBLIC_STOREFRONT_ID`.
- [ ] Run `npx shopify hydrogen link`, then `npx shopify hydrogen env pull`, to fill `.env`.
- [ ] Payments: set up an Indian gateway (e.g. Razorpay/PayU/Shopify Payments where available) and decide on COD.
- [ ] Policies: Refund, Privacy, Terms, Shipping (Settings → Policies). The footer already links to them. Make the refund policy match `RETURNS` in `app/data/site.ts`.

## 2. Catalogue

- [ ] Run `npm run catalogue:export`, then go to Shopify Admin → Products → Import → `catalogue/shopify-products.csv`. This imports the 24 V1 products as **draft** and unpublished. V2 designs (Us, Make It Yours) aren't in the file.
- [ ] Create the 4 V1 smart collections in `catalogue/collections.md` (`mumbai-made`, `drops`, `gifts`, `trending`).
- [ ] Create each product with the supplier using the production masters (`01_mumbai_made.png` … `10_make_it_yours.png`). Record the supplier product refs in `catalogue/supplier-map.csv`.
- [ ] Upload real supplier mockups/photography to each Shopify product. Until then the site shows clearly labelled brand concept cards, not fake mockups.
- [ ] Supplier blanks, SKU linking and mockups: `docs/SUPPLIER-SETUP.md` (`npm run supplier:check`, `npm run mockups:check`)
- [ ] Validate landed cost (`ops/landed-cost.csv` → `npm run costs:check`), then update `app/data/catalogue/pricing.ts` and re-export. Current prices: Tee ₹999, Tote ₹599, Tumbler ₹1,099.
- [ ] Confirm every spec line in `app/data/catalogue/product-types.ts` against the supplier spec sheets.
- [ ] Set products to **Active** and publish them to the Hydrogen channel.

## 3. Content to confirm (`app/data/site.ts`)

- [ ] Support email (`hello@trenzora.in`) and Instagram handle (`@trenzora.in`)
- [ ] Production and delivery windows (currently 2–4 + 3–7 working days), checked against supplier SLAs
- [ ] Returns promise (currently: replacement for damaged/misprinted items within 7 days)
- [ ] Design-family copy in `design-families.ts`, reviewed against the final artwork

## 4. Deploy

- [ ] `npx shopify hydrogen deploy` (Oxygen), or connect the GitHub repo in the Hydrogen channel
- [ ] Point the `trenzora.in` domain to the Hydrogen storefront and set up the checkout subdomain
- [ ] Submit `https://trenzora.in/sitemap.xml` in Google Search Console
- [ ] Shopify **Customer Events**: paste `catalogue/shopify-custom-pixel.js` (emits `purchase`), then set GTM_ID or add GA4/Meta

## 5. Pre-launch QA on the real store

- [ ] Place a live order with a ₹1 test product or a test gateway, end to end, to the supplier
- [ ] Run Lighthouse (mobile) on home, a collection and a product page
