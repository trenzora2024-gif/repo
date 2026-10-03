# Supplier setup: templates, SKU mapping, mockups, landed cost

Ops-only. Supplier names live in `ops/` and `catalogue/supplier-map.csv`, never in the storefront.

V1 = 8 design families × 3 products = **24 products / 56 variants**. Tee → Printrove; tote and tumbler → Qikink (subject to sampling, `ops/suppliers.ts`). Us and Make It Yours (V2) are never created at a supplier in V1.

## 1. Confirm the blanks (`ops/supplier-templates.ts`)

For each product type, fill these in from the supplier's spec sheet or designer tool, then run `npm run supplier:check`:

| Field                            | Tee (Printrove)  | Tote (Qikink) | Tumbler (Qikink)  |
| -------------------------------- | ---------------- | ------------- | ----------------- |
| Blank name + ref                 | to confirm       | to confirm    | to confirm        |
| Blank colour (**your decision**) | to confirm       | to confirm    | to confirm        |
| Print area (in)                  | to confirm       | to confirm    | to confirm (wrap) |
| Variant refs                     | S, M, L, XL, XXL | default       | default           |
| Source + date                    | —                | —             | —                 |

When a print area is entered, `supplier:check` reports each master's printed size and effective DPI. It flags anything below 150 DPI and never touches the PNGs. The masters are 4500 × 5400 px at 300 DPI with transparent backgrounds. Placement and scale are set in the supplier's designer.

The storefront copy in `app/data/catalogue/product-types.ts` (heavyweight 100% cotton, DTG; cotton canvas tote; 20oz double-wall steel tumbler, sublimation) has to match the chosen blanks. Correct it there if it doesn't.

## 2. Create the 24 supplier products

For each row of `catalogue/supplier-map.csv` with **Release = V1 launch**:

1. In the supplier's designer, pick the confirmed blank and upload the **Production master** named in the row, unchanged, from `artwork/masters/`.
2. Set the supplier SKU to the row's **SKU** (`TRZ-MUM-TEE-L` etc.) wherever the supplier allows it.
3. Record the supplier product/variant ref in `ops/supplier-templates.ts` (per type) and in the sheet's **Supplier product ref** column.

**How the products reach Shopify: a process decision, to confirm with each supplier before Gate 2.**

- Both suppliers' Shopify apps can push products into the store. Our CSV import (Gate 2) also creates them.
- To avoid duplicates, use exactly one path per product:
  - **Recommended:** import our CSV, which keeps our handles, SKUs, tags, SEO and draft status. Then link each Shopify variant to the supplier product, by SKU or via the app's "link existing product" feature.
  - **If a supplier can only fulfil products it pushed itself:** push from the supplier as drafts. Then apply our handle, SKU, tags and SEO from the CSV to those products, and don't import those rows.
- Whether linking existing products is supported must be confirmed in each app before any import. It hasn't been verified from here.

## 3. Mockups (`npm run mockups:check`)

1. Export mockups from the supplier's designer: real blank, real master.
   - Recommended: 2048 px+ square JPEG/PNG/WebP, under 20 MB.
   - Concept cards are never used as product images.
2. Save them to `artwork/mockups/<product-handle>/01-front.jpg`, `02-back.jpg`, … (the folder is gitignored).
3. Run `npm run mockups:check`. It requires every V1 product to have an image, rejects V2 or unknown folders, and checks format, size and ratio.
4. It writes `catalogue/mockup-manifest.json`: the upload order and alt text per product.
5. After Gate 2, attach them with `catalogue/admin/product-media.graphql`: stage, upload, then `productUpdate` with media. This was validated against the Admin schema. It doesn't change status or publishing.

## 4. Landed cost (`npm run costs:check`)

Fill `ops/landed-cost.csv` per product type (per size for the tee) from **written quotes and rate cards only**:

| Column                                            | Meaning                                                     |
| ------------------------------------------------- | ----------------------------------------------------------- |
| `supplier_unit_cost_inr`                          | Blank + print, per unit, as quoted                          |
| `supplier_cost_includes_gst` / `supplier_gst_pct` | Whether the quote includes GST, and the rate                |
| `itc_claimable`                                   | yes if you're GST-registered and can claim input tax credit |
| `shipping_to_customer_inr`, `packaging_inr`       | Per-order average actually paid                             |
| `gateway_fee_pct`, `gateway_fixed_inr`            | Prepaid gateway fee (include GST on the fee)                |
| `cod_share_pct`, `cod_fee_inr`                    | Expected COD share and the COD charge per order             |
| `rto_rate_pct`, `rto_cost_inr`                    | Expected return-to-origin rate and cost per RTO             |
| `reprint_rate_pct`                                | Expected misprint/damage replacements                       |
| `output_gst_pct`                                  | GST rate on the sale (confirm HSN/rate with your CA)        |
| `source`, `quote_date`                            | Where the numbers came from                                 |

The report (`catalogue/landed-cost-report.md`) shows contribution and margin **only for rows with every input filled**. Incomplete rows list what's missing. Prices in `app/data/catalogue/pricing.ts` stay provisional until this report is complete and you approve them at Gate 4.
