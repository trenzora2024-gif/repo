# Trenzora storefront

**Made for people with personality.** The trenzora.in storefront: Hydrogen (React Router 7, TypeScript) on top of Shopify's Storefront API, cart and checkout. Fulfilment is print-on-demand and handled outside the frontend.

```
trenzora.in → Hydrogen (Oxygen) → Storefront API → Shopify cart/checkout → POD supplier
```

## Run it

| Command | What it does |
| --- | --- |
| `npm run dev:mock` | **Preview without a Shopify store.** Starts a local mock Storefront API with the 30-SKU Trenzora catalogue plus the dev server at <http://localhost:3000>. |
| `npm run dev` | Dev server against the real store, using `.env` (copy it from `.env.example`). |
| `npm run build` / `npm run preview` | Production build / local preview of the build. |
| `npm run typecheck` · `npm run lint` | Quality gates. |
| `npm run catalogue:export` | Regenerates `catalogue/`: product CSV (drafts), supplier map, collection inputs, Shopify custom pixel. |
| `npm run verify:store` | Read-only Storefront API readiness check (blocks MaternEase). Add `-- --cart` to test the checkout URL. |
| `npm run verify:artwork` | Checks the production master pack in `artwork/masters/`. |
| `npm run qa:storefront` | Browser QA (mobile + desktop) against `BASE_URL`. Needs Playwright. |

**Connecting the real store:** follow `docs/STORE-CONNECTION.md` (steps A–I with authorization gates).

Node 22+. Never commit secrets: `.env` is gitignored. `.env.mock` holds only dummy values.

## Where things live

```
app/
  data/catalogue/       Single source of truth for the 30-SKU catalogue
    design-families.ts    10 design concepts: story, concept, palette, personalization config
    product-types.ts      Tee / tote / tumbler specs, care, supplier key
    pricing.ts            Retail prices (one place to change after landed-cost validation)
    suppliers.ts          Supplier registry (exports/docs only, never rendered)
    index.ts              Builds handles, titles, SKUs, tags, SEO; joins Shopify ↔ editorial
  data/site.ts          Brand copy, shipping/returns promises, FAQ, navigation
  styles/tokens.css     Design tokens (colour, type, space, motion, breakpoints)
  styles/app.css        Component styles (buttons, cards, drawer, header, PDP, cart…)
  components/           Header, Footer, Drawer, ProductCard, ProductMedia, ProductForm,
                        CartMain, SearchPanel, CollectionView, home/HomeSections
  lib/seo.ts            seoMeta(): title, description, canonical, OG/Twitter, JSON-LD
  lib/analytics.ts      track(): dataLayer events (no third-party scripts)
  lib/art.ts            Brand concept-art SVGs shown until real product photos exist
  routes/               Home, /collections/*, /designs/:handle, /products/:handle,
                        /cart, /search, /about, /shipping, /contact, policies, sitemaps
catalogue/              Generated: shopify-products.csv, supplier-map.csv, collections.md
scripts/                export-catalogue.ts, mock-storefront.ts (dev only), dev-mock.mjs
docs/                   STORE-CONNECTION.md (runbook), LAUNCH.md, PERSONALIZATION.md
artwork/masters/        Official production masters go here (gitignored binaries)
```

## Catalogue conventions

- **Title:** `{Design} — {Product}`, e.g. `Mumbai Made — Premium Oversized Tee`
- **Handle:** `{design}-{type}`, e.g. `mumbai-made-oversized-tee`, `us-tote`, `desi-roots-tumbler`
- **SKU:** `TRZ-{DESIGN}-{TYPE}[-{SIZE}]`, e.g. `TRZ-MUM-TEE-L`, `TRZ-USS-TOT`, `TRZ-DES-TMB`
- **Tags:** `design:{design}`, `type:{type}`, `drop:01`, `col:{collection}`, `personalizable`

The storefront joins a Shopify product to its editorial content (story, concept, materials, care) through the `design:` and `type:` tags, and falls back to the handle. Smart collections use the `col:` tags.

## Analytics

Shopify analytics (page, product, collection, search, cart views, checkout and purchase) runs through Hydrogen's `<Analytics.Provider>`, gated on customer-privacy consent. Trenzora's own event stream goes to `window.dataLayer` using these names:

| Event | Fired from |
| --- | --- |
| `page_view`, `view_item`, `add_to_cart` | `AnalyticsBridge` (mirrors Hydrogen events) |
| `begin_checkout` | Checkout button in the cart |
| `customization_start` / `customization_complete` | Personalization fields on the product page (live once personalization is enabled) |
| `email_signup` | "New drop every week" form |
| `purchase` | Shopify checkout, via the generated custom pixel `catalogue/shopify-custom-pixel.js` |
| `share_design` | Reserved; wire it up when share buttons ship |

To send these to GA4, Meta or another tool, attach GTM or a Shopify custom pixel to `dataLayer`. The headline funnel is **customization_start → purchase**.
