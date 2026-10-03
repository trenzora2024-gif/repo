# Trenzora go-live checklist

Owner actions: `LAUNCH-BLOCKERS.md` → **ACTION REQUIRED FROM ME**. The step-by-step store connection, with authorization gates, is in `docs/STORE-CONNECTION.md`; the Gate 5 steps are in `docs/GATE5-RUNBOOK.md`. Pre-flight: `npm run launch:audit`.

## 1. Shopify store

- [x] **Trenzora** store created (INR, India): `trenzora-in.myshopify.com` (permanent ID `hetvyh-8e.myshopify.com`), primary domain `trenzora.in`. The Shopify connector's MaternEase account is never used.
- [x] **Hydrogen** sales channel installed, storefront "Trenzora" created.
- [x] `hydrogen link` and `env pull` run on your machine (Gate 1).
- [ ] **Payments**: activate an Indian gateway (Shopify Payments if eligible, Razorpay or PayU) and decide on COD. _(you)_
- [ ] **Policies**: refund, privacy, terms, shipping (Settings → Policies). The refund policy must match `RETURNS` in `app/data/site.ts`. _(you)_
- [ ] **Store details and taxes**: legal name, address, GSTIN, HSN codes and rates, "All prices include tax" **on**. _(you, with your CA)_

## 2. Catalogue

- [x] 24 V1 products / 56 variants imported as **draft** (Gate 2). V2 designs (Us, Make It Yours) are excluded.
- [x] 4 smart collections created, unpublished (Gate 3).
- [x] Prices approved: Tee ₹999, Tote ₹599, Tumbler ₹1,099 (`app/data/catalogue/pricing.ts`, `PRICE_STATUS = 'approved'`).
- [x] Customer-facing copy states only what the supplier pages publish (`app/data/catalogue/product-types.ts`).
- [x] V1 blanks: **White** tee, tote and tumbler. Working supplier products are in `ops/supplier-templates.ts` and `catalogue/supplier-orders/*.csv`.
- [ ] Apply the corrected copy and 4 SEO fixes to the Shopify drafts: re-run `catalogue/admin/products.productSet.json` (keyed by handle, updates in place). _(Gate 5, needs your approval)_
- [ ] Create each product in the supplier apps from the production masters and record the supplier refs in `catalogue/supplier-orders/*.csv`. _(you: supplier accounts)_
- [ ] Supplier mockups on the White blanks → `artwork/mockups/<handle>/01-front.jpg` → `npm run mockups:check` → `catalogue/admin/product-media.graphql`. Until then the live site shows concept cards. The studio renders are dev-only.

## 3. Content (`app/data/site.ts`)

- [x] Support email `support@trenzora.in` and phone +91 96196 57030 (from Shopify store details) shown on Contact, policies and footer.
- [ ] `support@trenzora.in` mailbox receives mail; Instagram `@trenzora.in` is yours. _(you)_
- [ ] Policies: site pages done (`/shipping`, `/policies/*`, `/faq`, `/track-order`, `/contact`); paste `catalogue/policies/*.html` into Shopify Settings → Policies after review. _(you)_
- [x] Delivery window (2–4 + 3–7 working days) is consistent with the public supplier pages (Printrove 5–9 days total; Qikink 2–3 + 2–5 days).
- [x] Returns promise: replacement for damaged or misprinted items within 7 days.

## 4. Deploy

- [ ] `npx shopify hydrogen deploy` (Oxygen) to a **private preview**, or connect the GitHub repo in the Hydrogen channel. _(needs Shopify access: your machine, or Shopify hosts allowed in this environment)_
- [ ] Gate 6: point `trenzora.in` at the Hydrogen storefront and connect `checkout.trenzora.in`.
- [ ] Submit `https://trenzora.in/sitemap.xml` in Google Search Console.
- [ ] Shopify **Customer Events**: paste `catalogue/shopify-custom-pixel.js` (emits `purchase`), then optionally set GTM_ID or add GA4/Meta.

## 5. Pre-launch QA

- [x] Mock-catalogue QA on mobile and desktop (`npm run qa:storefront`): routes, SEO tags, cart, checkout handoff, analytics events.
- [x] Production build, lint, typecheck, `launch:audit` 67/67.
- [ ] Real-data QA on the private preview (`verify:store -- --cart`, `qa:storefront` with `BASE_URL`), plus one test-gateway order end to end. _(Gate 5)_
- [ ] Lighthouse (mobile) on home, a collection and a product page, on the preview.
