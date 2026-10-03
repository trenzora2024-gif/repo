# Supplier setup: templates, SKU mapping, mockups, landed cost

Ops-only. Supplier names live in `ops/` and `catalogue/supplier-map.csv`, never in the storefront.

V1 = 8 design families × 3 products = **24 products / 56 variants**. Tee → Printrove; tote and tumbler → Qikink (subject to sampling, `ops/suppliers.ts`). Us and Make It Yours (V2) are never created at a supplier in V1.

## 1. Confirm the blanks (`ops/supplier-templates.ts`)

For each product type, fill these in from the supplier's spec sheet or designer tool, then run `npm run supplier:check`:

| Field                                    | Tee (Printrove)              | Tote (Qikink)                          | Tumbler (Qikink)                     |
| ---------------------------------------- | ---------------------------- | -------------------------------------- | ------------------------------------ |
| Blank name + ref                         | Oversized T-shirts (working) | Unisex Tote Bag Zipper, TbZp (working) | Tumbler Bottle 20 Oz, Tumb (working) |
| Blank colour (owner decision 2026-10-03) | **White**                    | **White**                              | **White**                            |
| Print area (in), from the supplier page  | 15.6 × 19.6 front            | 10 × 12, one side                      | 9.5 × 8 wrap                         |
| Variant refs                             | S, M, L, XL, XXL             | default                                | default                              |
| Source + date                            | —                            | —                                      | —                                    |

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

Two files, kept apart:

**`ops/landed-cost.csv`: supplier pricing** (supplier's own page, dashboard, invoice or written reply only)

| Column                             | Meaning                                                                                |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| `product_cost_inr`                 | Product (blank) price per unit                                                         |
| `print_cost_inr`                   | Print charge per unit at our print size (0 if included in the product price)           |
| `supplier_prices_include_gst`      | Whether the supplier's amounts include GST                                             |
| `supplier_gst_pct`                 | GST rate on product + print                                                            |
| `shipping_inr`, `shipping_gst_pct` | Supplier shipping for one packed unit, and its GST rate                                |
| `cod_fee_inr`, `cod_fee_gst_pct`   | Supplier COD charge per order and its GST rate (0 if none)                             |
| `rto_charge_inr`                   | Cost of one return-to-origin (0 if the supplier confirms none). No RTO rate is assumed |
| `source`, `quote_date`             | Exact supplier URL/document, and date                                                  |

**`ops/business-inputs.csv`: owner inputs** (one row per product type)

| Column                                                                          | Meaning                                                                                                            |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `itc_claimable`, `itc_source`                                                   | Input tax credit eligibility (owner)                                                                               |
| `output_gst_pct`, `hsn`, `gst_source`                                           | GST rate on the sale and its HSN, from an official GST/CBIC rate notification                                      |
| `gst_threshold_inr`, `output_gst_pct_above`                                     | Price threshold per piece (taxable value) and the rate above it, e.g. apparel; `none` if the rate has no threshold |
| `gateway_fee_pct`, `gateway_fixed_inr`, `gateway_fee_gst_pct`, `gateway_source` | Prepaid gateway fee from its rate card (ex GST), GST on the fee, and the source                                    |

Retail prices are GST inclusive: the model uses taxable value = price ÷ (1 + output GST).

Enter a value only when it comes from the supplier's own page, dashboard, invoice or written reply (gateway: its rate card; GST: your CA). A value confirmed to be zero is entered as `0`. The report shows contribution before and after the payment fee, prepaid and COD, the price needed for 50 / 55 / 60% margin, and the GST split.

The report (`catalogue/landed-cost-report.md`) shows contribution and margin **only for rows with every input filled**. Incomplete rows list what's missing. Prices in `app/data/catalogue/pricing.ts` stay provisional until this report is complete and you approve them at Gate 4.
