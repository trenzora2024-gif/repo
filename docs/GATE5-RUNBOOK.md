# Gate 5 runbook: real-data QA on a private preview

Prepared 2026-10-03. Nothing here has been run. Every step that changes the store needs the owner's Gate 5 approval, and none of it publishes to the Online Store or takes a real payment.

**Chosen option** (recommended in `docs/STORE-CONNECTION.md` → I): products **Active**, published **only to the Hydrogen channel**, Hydrogen deployment kept **private** (Oxygen preview behind Shopify auth), checkout limited by a **test payment gateway** or the store password. Customers can't reach it.

**Locked inputs:**

- Prices ₹999 tee / ₹599 tote / ₹1,099 tumbler (approved).
- White blanks for all three products.
- V7 masters unchanged.
- 24 V1 products / 56 variants. Us and Make It Yours (V2) are never imported.

## Pre-launch state verified (2026-10-03, read-only via the Shopify connector)

- **Store:** Trenzora, `hetvyh-8e.myshopify.com`, primary domain `trenzora.in`, INR, India, taxes included. Not MaternEase.
- **Products:** 24 V1 products, 56 variants (8 tees × 5 sizes + 8 totes + 8 tumblers), all `DRAFT`, 0 publications. Every tee ₹999, tote ₹599, tumbler ₹1,099. No V2 products.
- **Collections:** `mumbai-made`, `drops`, `gifts`, `trending` exist with 0 publications. `frontpage` is on 3 channels.
- **Hydrogen publication:** `gid://shopify/Publication/226146451634` ("Trenzora"). Not the Online Store (`…226143731890`) or Point of Sale (`…226143764658`).
- **Production guard:** the app refuses to start without real Shopify credentials, so it can never fall back to the mock.shop demo catalogue. `.env.mock` is used only by `npm run dev:mock`.
- **Deployment:** this cloud environment cannot reach any Shopify host or `trenzora.in`, and holds no Oxygen deployment token. Deploy through the Hydrogen channel's GitHub connection or from your machine.

## Before you start (owner)

1. Shopify access for whoever runs the steps: your machine, or this environment with the Shopify hosts allowed (see `LAUNCH-BLOCKERS.md` → ACTION REQUIRED FROM ME).
2. A test payment gateway: Settings → Payments → (for development stores) "Bogus Gateway", or your chosen gateway's test mode. Otherwise keep the store password on.

## Steps

| #   | Step                                                                                                                         | Command / file                                                                                                                                   | Changes the store? |
| --- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| 1   | Confirm the store is Trenzora (INR, `hetvyh-8e` / `trenzora-in`), never MaternEase                                           | `catalogue/admin/store-identity.graphql`; `npm run verify:store -- --gate1 --expect-store trenzora-in.myshopify.com --expect-domain trenzora.in` | No                 |
| 2   | Update the 24 drafts with the corrected copy and the 4 SEO fixes (still DRAFT)                                               | `catalogue/admin/product-set.graphql` with each input in `catalogue/admin/products.productSet.json` (keyed by handle, updates in place)          | Yes: content only  |
| 3   | Find the Hydrogen publication ID                                                                                             | `catalogue/admin/gate5.graphql` → `Gate5Publications`                                                                                            | No                 |
| 4   | Collect the 24 product and 4 collection IDs; expect exactly 24 and 4                                                         | `Gate5ProductsByTag`                                                                                                                             | No                 |
| 5   | Set the 24 products **ACTIVE**                                                                                               | `Gate5SetStatus` (status `ACTIVE`)                                                                                                               | Yes                |
| 6   | Publish the 24 products and 4 collections to the **Hydrogen publication only**                                               | `Gate5PublishToHydrogen`                                                                                                                         | Yes                |
| 7   | Deploy a **private** Oxygen preview                                                                                          | `npx shopify hydrogen deploy` (preview environment)                                                                                              | Deploy only        |
| 8   | Verify real data: products, variants, prices, tags, collections, checkout URL                                                | `npm run verify:store -- --cart`                                                                                                                 | No                 |
| 9   | Browser QA on the preview, mobile and desktop                                                                                | `BASE_URL=https://<preview-url> QA_EXPECT_CHECKOUT_HOST=trenzora.in npm run qa:storefront`                                                       | No                 |
| 10  | Install the purchase pixel                                                                                                   | Paste `catalogue/shopify-custom-pixel.js` into Settings → Customer events                                                                        | Yes: settings      |
| 11  | **One test order** with the test gateway, end to end. Check the order reaches the supplier app; cancel it before fulfilment. | Manual                                                                                                                                           | Test order only    |
| 12  | Lighthouse (mobile) on home, a collection and a product page                                                                 | Chrome DevTools or `npx lighthouse <url>`                                                                                                        | No                 |

`PUBLIC_CHECKOUT_DOMAIN` stays `trenzora.in` while the Online Store serves that domain. Switch to `checkout.trenzora.in` before Gate 6.

## Rollback (any time)

1. `Gate5UnpublishFromHydrogen` for each product and collection.
2. `Gate5SetStatus` with status `DRAFT` for each product.
3. The step 2 content update can stay: it is the approved copy.

## Not part of Gate 5

- Publishing to the Online Store.
- Pointing `trenzora.in` at Hydrogen.
- Removing the store password.
- Taking real payments.

These are Gate 6, which needs separate explicit approval.
