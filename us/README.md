# Trenzora.com (US) storefront

**Car camping and basecamp gear, sorted by mission.** This is the Hydrogen storefront (React Router 7, TypeScript) for **trenzora.com**. It runs on Shopify's Storefront API, cart and checkout, with products supplied through Doba.

```
trenzora.com → Hydrogen (Oxygen) → Storefront API → Shopify cart/checkout → Doba suppliers (VEVOR, …)
```

This app is separate from the trenzora.in project in the repo root, with its own package, environment and safety guard. Neither can affect the other.

- **Strategy:** `docs/STRATEGY.md`
- **Owner steps:** `docs/LAUNCH-CHECKLIST.md`

## Run it

All commands run from `us/`. You need Node 22+.

| Command | What it does |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev:mock` | Preview without a Shopify store: mock Storefront API with the 30-product catalog, plus the dev server at http://localhost:3000 |
| `npm run dev` | Dev server against the real store (`.env` from `npx shopify hydrogen env pull`) |
| `npm run build` / `npm run preview` | Production build / local preview of the build |
| `npm run typecheck` · `npm run lint` | Quality gates |
| `npm run economics` | Unit economics and the $5K/month model → `catalog/economics.md`. Uses verified costs from `catalog/doba-cost-inputs.csv` and labeled scenarios otherwise. |
| `npm run catalog:export` | Writes `catalog/collections.json` (17 smart collections), `catalog/product-setup.csv` (tags, titles, SEO per product) and `catalog/bundles.md` (discount codes) |
| `ENV_FILE=.env.qa npm run dev:mock`, then `QA_STUB=1 npm run qa:storefront` | Browser QA on 5 viewports: SEO tags, JSON-LD, overflow, product → cart → checkout URL, bundles, and Meta/GA4 event checks. Screenshots go to `.qa/`. |

## Where things live

```
app/data/catalog.ts     30 curated products: problem, persona, missions, specs, price, market benchmark, Doba URL…
app/data/missions.ts    8 mission + 8 gear collections: job, intro, problem, how-to-choose, FAQ, SEO
app/data/bundles.ts     6 complete setups (+ optional discount codes)
app/data/guides.ts      5 buying guides
app/data/site.ts        Brand, shipping/returns promises (OWNER TO CONFIRM), nav, seasonal block
app/lib/seo.ts          Meta tags + JSON-LD (Product with shipping/returns, Breadcrumb, FAQ, Article, Organization)
app/lib/analytics.ts    Event map → dataLayer, Meta Pixel, gtag (catalog-format item IDs)
app/components/Tracking.tsx   Consent-gated pixel loader
app/lib/curated.ts      `curated` tag gates listings; legacy products stay reachable
app/lib/store-guard.ts  Refuses the trenzora.in and MaternEase stores
scripts/                mock Storefront API, economics, catalog export, QA
```

## How the storefront relates to Shopify

- **Shopify stays the source of truth** for products, prices, inventory, images, orders, customers, checkout, payments and shipping.
- **This repo adds the editorial layer** (problems, missions, setups, guides), keyed by product **handle**.
- **A Shopify product appears in listings only when tagged `curated`.** Collections are smart collections on `mission:*`, `gear:*` and `tier:hero` tags.
- **Product URLs are `/products/<handle>`**, the same as the Online Store, so Google Merchant listings and links keep working.
- **Never commit secrets.** `.env` is gitignored. `.env.mock` and `.env.qa` hold only dummy values.
