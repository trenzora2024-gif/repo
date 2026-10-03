# Printrove: Premium Oversized Tee (40 SKUs)

Product list to share or work from: `catalogue/supplier-orders/printrove.csv` (8 designs × S, M, L, XL, XXL).

## Message to send

> Hi Printrove team, we're launching **Trenzora** (trenzora.in), an Indian original-design brand on Shopify with a headless (Hydrogen) storefront. We'd like to use Printrove for our **oversized tees**: 8 designs × 5 sizes (S–XXL), printed on demand with blind shipping across India.
>
> Could you share:
>
> 1. Your **oversized / drop-shoulder tee** options: product names and IDs, GSM, fabric composition, colours, size chart (chest/length per size) and the spec sheet.
> 2. **Print method** for that blank (DTG or other), the **maximum front print area** in inches, and the recommended file spec. Ours are 4500 × 5400 px, 300 DPI, transparent PNG.
> 3. **Pricing** per size (blank + front print), with whether **GST** is included and the GST rate.
> 4. **Shipping**: rates by zone and weight, **COD** availability and charges, and **RTO** charges.
> 5. **Times**: production (days to dispatch) and delivery by zone.
> 6. **Shopify**: can your app **link products that already exist in our Shopify store** (matched by SKU), or does it only fulfil products it pushes itself? Does it work with a headless Hydrogen storefront? Orders are standard Shopify orders.
> 7. **Branding**: blind shipping, custom neck labels / packaging inserts, and invoice format (our brand, not Printrove's).
> 8. **Mockups**: can we export product mockups (front + close-up) from your designer at 2048 px or larger?
> 9. **Samples**: how do we order samples, and what do they cost?
>
> Thank you! — Trenzora

## Facts to record (→ `ops/supplier-templates.ts` → `'oversized-tee'`)

| Field                                                                          | Value | Source + date |
| ------------------------------------------------------------------------------ | ----- | ------------- |
| `blankName` (exact catalogue name)                                             |       |               |
| `blankRef` (product ID)                                                        |       |               |
| `blankColour` (**owner decision**: light blank required; black ink + red rule) |       |               |
| `printArea` front `{widthIn, heightIn}`                                        |       |               |
| `variantRefs` S / M / L / XL / XXL                                             |       |               |
| GSM / composition (for the site copy "heavyweight, 100% cotton")               |       |               |
| Print method (the site says "DTG")                                             |       |               |
| Size chart (chest × length per size)                                           |       |               |

## Costs (→ `ops/landed-cost.csv`, one row per size)

`supplier_unit_cost_inr`, `supplier_cost_includes_gst`, `supplier_gst_pct`, `shipping_to_customer_inr`, `cod_fee_inr`, `rto_cost_inr`, plus `source` and `quote_date`.

## After the blank is confirmed

1. In Printrove's designer: choose the blank, upload each master unchanged, centre it ~1 in below the collar (scale only), save.
2. Record each product and variant ref in `printrove.csv`.
3. Export mockups → `artwork/mockups/<handle>/01-front.jpg` (+ `02-detail.jpg`) → `npm run mockups:check`.
4. Order 2 samples: **Mumbai Made L** (headline + red rule + small subline) and **Desi Roots M** (Devanagari). Check them against the acceptance list in `README.md`.
5. After Gate 2: link the Shopify variants to Printrove by SKU.
