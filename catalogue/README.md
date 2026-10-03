# Trenzora V1 Shopify import package

Everything needed to load V1 into the **Trenzora** Shopify store, generated from `app/data/catalogue/` by `npm run catalogue:export` and checked by `npm run launch:audit`. **Don't edit these files by hand.** Change the catalogue source and re-export.

|                  |                                                                                                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Products         | **24** (8 designs × tee / tote / tumbler)                                                                                                                        |
| Variants         | **56** (8 tees × S, M, L, XL, XXL + 16 single-variant totes and tumblers)                                                                                        |
| Collections      | **4** smart collections: Mumbai Made (12), Drops (24), Gifts (18), The Edit (12)                                                                                 |
| Status on import | **Draft**, published to **no** sales channel                                                                                                                     |
| Prices           | **PROVISIONAL**: tee ₹999 · tote ₹599 · tumbler ₹1,099 (incl. GST). No compare-at prices. Don't publish until Gate 4 approves prices from complete landed costs. |
| Excluded (V2)    | `us-*`, `make-it-yours-*`: never imported, never sold in V1                                                                                                      |
| Inventory        | Not tracked, "continue selling" (print on demand)                                                                                                                |
| Images           | None on import. Supplier mockups are attached afterwards (step 5).                                                                                               |

`MANIFEST.json` records the counts, price status and SHA-256 of every file below, so we can prove exactly what was imported.

## Files

| File                                                                   | Use                                                                                                          |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `shopify-products.csv`                                                 | **Route A**: Shopify Admin → Products → Import (56 rows; product fields on each product's first row)         |
| `admin/products.productSet.json` + `admin/product-set.graphql`         | **Route B**: Admin API, one `productSet` call per product, keyed by handle (re-runs update, never duplicate) |
| `admin/collections.variables.json` + `admin/collection-create.graphql` | The 4 smart collections (rule: product tag equals `col:<handle>`), with descriptions and SEO                 |
| `collections.md`                                                       | The same collections, written out for creating them by hand in Admin                                         |
| `admin/store-identity.graphql`                                         | **Run first.** Confirms the connected store is Trenzora (never MaternEase) and uses INR.                     |
| `admin/existing-check.graphql`                                         | Pre-flight: nothing with our tags or handles exists yet                                                      |
| `admin/post-import-check.graphql`                                      | Post-flight: 24 drafts, 56 variants, 0 publications, 0 V2, 4 collections with correct rules                  |
| `admin/product-media.graphql` + `mockup-manifest.json`                 | Step 5: attach supplier mockups to the drafts                                                                |
| `image-replacement-map.csv`                                            | Every temporary image and exactly what replaces it                                                           |
| `supplier-map.csv`                                                     | SKU → supplier → production master → artwork text (ops only)                                                 |
| `shopify-custom-pixel.js`                                              | Shopify Customer events → custom pixel (purchase tracking)                                                   |
| `launch-audit.md`                                                      | Latest audit result                                                                                          |

## Store settings before import (owner)

1. Settings → General: currency **INR**, time zone Asia/Kolkata.
2. Settings → Taxes and duties: **All prices include tax = ON** (prices are GST-inclusive). GST registration and HSN codes as advised by your CA.
3. Settings → Markets: India as the primary market.
4. Hydrogen sales channel installed (creates the storefront and tokens).

## Import (Gates 2 and 3, only after your explicit approval)

1. **Identity:** run `admin/store-identity.graphql`. Stop if the name or domain isn't Trenzora, or the currency isn't INR.
2. **Pre-flight:** run `admin/existing-check.graphql`. It must return **0** products tagged `drop:01` and **0** of our collection handles.
3. **Products**, using one route:
   - **Route A (Admin UI):** Products → Import → `shopify-products.csv` → leave "Overwrite products with matching handles" **off** → Upload and preview → check that the preview says 24 products / 56 variants → Import. If Shopify rejects a column header because the template has changed, use Route B; it's validated against the API schema.
   - **Route B (Admin API):** for each entry in `admin/products.productSet.json`, run `admin/product-set.graphql` with that entry as the variables (`{identifier, input}`). Every response needs `userErrors: []` and `status: DRAFT`.
4. **Collections:** for each entry in `admin/collections.variables.json`, run `admin/collection-create.graphql`, or create them by hand from `collections.md` (Products → Collections → Create → Smart, "Product tag is equal to `col:<handle>`"). Leave them **unpublished**.
5. **Post-flight:** run `admin/post-import-check.graphql`. Expect 24 products, all `DRAFT`, `variantsCount` 5 for tees and 1 for the rest, `resourcePublicationsCount` 0, `v2` empty, and 4 collections with the right rules and product counts of 12 / 24 / 18 / 12. Admin counts drafts. The storefront shows these products only after Gate 5 publishes them to the Hydrogen channel.
6. **Images (after supplier mockups exist):** run `npm run mockups:check`, then `admin/product-media.graphql` for each product in `mockup-manifest.json`.

**Rollback** (only if an import goes wrong, and only with your OK): Admin → Products → filter tag `drop:01` and status Draft → select all → Delete. Nothing else in the store is touched.

## Fulfilment link (after import)

In the Printrove app (tees) and the Qikink app (totes, tumblers), link each Shopify variant to its supplier product by **SKU** (`supplier-map.csv`). How each app links existing products is still to be confirmed with the supplier: see `docs/suppliers/`.
