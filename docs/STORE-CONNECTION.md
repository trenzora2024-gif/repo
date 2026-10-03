# Connecting the real Trenzora Shopify store

The storefront is ready. This runbook covers steps A–I. Each 🔒 **GATE** is a point where Claude stops and asks for one specific authorization.

**Standing rules**

- **MaternEase is never touched.** The app (`app/lib/store-guard.ts`) and `verify:store` both refuse any MaternEase domain or shop name.
- The Shopify connector in Claude sessions is currently signed in to MaternEase. Before any Admin call, the active shop must be switched to Trenzora and confirmed with `catalogue/admin/store-identity.graphql`. If the result isn't Trenzora, stop.
- Products stay **DRAFT** and collections stay **unpublished** until you approve pricing, supplier economics, artwork and shipping.
- Personalization stays OFF (`personalization.enabled: false` for every family).
- **V1 = 8 design families × 3 products = 24 SKUs.** Us and Make It Yours are V2 personalization concepts. They're kept as design records but are never imported, published or sold in V1. `verify:store` fails if either becomes visible, and their product pages show no Add to Cart even if published by mistake.
- Prices in `app/data/catalogue/pricing.ts` are **provisional**.
- Supplier data lives only in `ops/suppliers.ts` and `catalogue/supplier-map.csv`. Neither is imported by the storefront, and `qa:storefront` fails if a supplier name or internal note appears in page HTML.

## Current status (2026-10-03): what's blocking the connection

| #   | Blocker                                                                                                                                                                                                                                                                | Who                    | What to do                                                                                                                                                                                                                                                                                                                     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **No Trenzora store is reachable from this workspace.** The Shopify connector here is signed in to MaternEase, which is never used.                                                                                                                                    | You                    | Create or claim the Trenzora store (INR, India) at admin.shopify.com under your own login, then send its `<name>.myshopify.com` domain. If it was created from a store preview or signup link, finish the claim/save step first.                                                                                               |
| 2   | **This cloud environment's network policy blocks Shopify** (`accounts.shopify.com`, `admin.shopify.com`, `*.myshopify.com`, `cdn.shopify.com`, Oxygen all return 403). `hydrogen link`, `env pull`, `verify:store` and deploys can't run from here until this changes. | You                    | Environment settings → Network access: either a broader level, or Custom with `shopify.com`, `*.shopify.com`, `*.myshopify.com`, `shopifycdn.com`, `*.shopifysvc.com` and `*.shopifyapps.com` added (keep the package-manager defaults). Or run Gate 1 on your own machine and add the 6 `.env` values as environment secrets. |
| 3   | **Gate 1 authorization** for `<trenzora>.myshopify.com`. `hydrogen link` prints a Shopify login URL/code that only you can approve.                                                                                                                                    | You                    | Reply "Gate 1 approved for <domain>".                                                                                                                                                                                                                                                                                          |
| 4   | Hydrogen sales channel installed on the Trenzora store (creates the Storefront API tokens).                                                                                                                                                                            | You (1 click in Admin) | Install "Hydrogen" from the Shopify App Store on the Trenzora store.                                                                                                                                                                                                                                                           |

Everything after that (env pull, read-only verification, draft import under Gate 2) is scripted below.

---

### A. Link Hydrogen to the Trenzora store

🔒 **GATE 1: authorize linking to `<trenzora>.myshopify.com`.** This installs/uses the Hydrogen sales channel and creates a storefront record. No products change.

```
npx shopify hydrogen link        # interactive Shopify login; choose the Trenzora store
```

### B. Pull environment safely

```
npx shopify hydrogen env pull     # writes .env (gitignored, never committed)
```

`.env` must contain `PUBLIC_STORE_DOMAIN`, `PUBLIC_STOREFRONT_API_TOKEN`, `PRIVATE_STOREFRONT_API_TOKEN`, `PUBLIC_STOREFRONT_ID`, `PUBLIC_CHECKOUT_DOMAIN` and `SESSION_SECRET`. A production build without them fails on purpose instead of silently showing mock.shop.

### C. Verify Storefront API access (read-only)

```
npm run verify:store -- --gate1 --expect-store trenzora-in.myshopify.com --expect-domain trenzora.in
                                 # Gate 1: exact store, never MaternEase, INR, nothing imported yet
npm run verify:store             # store identity (blocks MaternEase), INR, policies, products, collections, tag search
```

`PUBLIC_STORE_DOMAIN` may show the store's original shop identifier (`hetvyh-8e.myshopify.com`) instead of `trenzora-in`. Leave it as Shopify wrote it: it's an exact alias in `app/lib/store-guard.ts`, and Gate 1 cross-checks that both hosts return the same shop ID. `PUBLIC_CHECKOUT_DOMAIN` is the host where Shopify checkout runs. Today that's `trenzora.in`, the primary domain still serving the Online Store. Before Gate 6 moves `trenzora.in` to Hydrogen, connect `checkout.trenzora.in` in Settings → Domains and switch to it.

At this point products are expected to be "0/24 visible", since nothing has been imported yet.

### D. Import the 24 V1 products as DRAFTS

Full procedure, both routes (Admin CSV or the API `productSet`), and the pre- and post-flight queries: **`catalogue/README.md`**.

🔒 **GATE 2: authorize creating 24 draft products (56 variants) in the Trenzora store.** The CSV contains V1 only. Us and Make It Yours (V2) are never exported for import.

1. Pre-flight: run `catalogue/admin/existing-check.graphql`. It must return no products tagged `drop:01` and none of the 4 V1 collection handles, so nothing gets overwritten.
2. `npm run catalogue:export`, then Shopify Admin → Products → Import → `catalogue/shopify-products.csv`.
   Every product imports with `Status=draft` and `Published=FALSE`, no compare-at prices, untracked inventory with "continue selling" (POD), and the SKUs and tags the storefront relies on.
3. Re-run the pre-flight query and confirm 24 handles, all with `status: DRAFT`, and no `us-*` or `make-it-yours-*` handles.

### E. Create the collections

🔒 **GATE 3: authorize creating 4 smart collections (unpublished).** This can be approved together with Gate 2.
Run `catalogue/admin/collection-create.graphql` once per entry in `catalogue/admin/collections.variables.json` (`mumbai-made`, `drops`, `gifts`, `trending`; rule: tag equals `col:<handle>`). `personalize` is V2 and isn't created in V1: the Personalize nav item goes to the `/personalize` coming-soon page. "All products" is built into Hydrogen and needs no collection.

### F. Map the 10 production masters

Put the official pack in `artwork/masters/` (it's gitignored) and run:

```
npm run verify:artwork           # presence, real PNG, px size, DPI, alpha, sha256 → catalogue/artwork-manifest.json
```

The mapping is fixed in the catalogue: `NN_<family>.png` → design family → its 3 products (see `catalogue/supplier-map.csv`). Nothing is regenerated or AI-altered.

### G. Mockups

**Decided (2026-10-03):** White blanks for all three products. The working supplier products are Printrove Oversized T-shirts, Qikink Unisex Tote Bag Zipper (TbZp) and Qikink Tumbler Bottle 20 Oz (Tumb); see `ops/supplier-templates.ts`. Pipeline: `docs/SUPPLIER-SETUP.md` → `npm run supplier:check` (template + artwork DPI fit), `npm run mockups:check` (validates `artwork/mockups/`, writes the upload plan), then `catalogue/admin/product-media.graphql` attaches them to the draft products. Concept cards are never uploaded as product images. QA flags any page still showing one.

### H. Approval gate

Products stay DRAFT. 🔒 **GATE 4: your approval of pricing, supplier economics, artwork and shipping**, before any status or publishing change.

### I. Real-store QA

⚠️ **Decision needed from you first.** The Storefront API (and so the Hydrogen site) **cannot see DRAFT products**. A full homepage → product → cart → checkout QA on real data needs one of these:

1. **Recommended:** set products **Active, published only to the Hydrogen channel** (not Online Store), with the Hydrogen deployment kept **private** (Oxygen preview environment, behind Shopify auth) and checkout limited by a test payment gateway or store password. Customers can't reach it.
2. Publish only **1–2 test products** the same way, QA the flow, then revert them to draft.
3. Keep everything draft and QA only against the mock catalogue (already passing). Real-data QA then happens at launch.

🔒 **GATE 5: authorize whichever option you choose.** Then run:

```
npm run verify:store -- --cart                                   # products, images, variants, prices, tags, collections, checkout URL
BASE_URL=https://<preview-url> QA_EXPECT_CHECKOUT_HOST=<checkout domain> npm run qa:storefront
```

`qa:storefront` covers mobile and desktop, status codes, H1/title/description/canonical, overflow, broken images, concept placeholders, variant → cart → checkout URL, policies and sitemaps. It never submits checkout.

**Purchase tracking:** paste `catalogue/shopify-custom-pixel.js` into Shopify Admin → Settings → Customer events → Add custom pixel. It emits `purchase` with design family and a personalized flag. Testing it end to end needs a test-gateway order, which is part of Gate 5.

### Selling

🔒 **GATE 6: explicit approval to publish and activate selling.** Nothing goes live before it.
