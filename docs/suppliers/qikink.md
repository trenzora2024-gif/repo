# Qikink: Everyday Tote (8) + 20oz Tumbler (8)

Product list: `catalogue/supplier-orders/qikink.csv` (16 single-variant SKUs).

## Message to send

> Hi Qikink team, we're launching **Trenzora** (trenzora.in), an Indian original-design brand on Shopify with a headless (Hydrogen) storefront. We'd like to use Qikink for **canvas totes** and **20oz tumblers**: 8 designs each, printed on demand with blind shipping across India.
>
> Could you share, for **(a) a white cotton canvas tote** and **(b) a 20oz insulated stainless-steel tumbler with lid**:
>
> 1. Product names and IDs, materials, dimensions, colours and the spec sheet.
> 2. **Print method** (tote: DTG/screen/other; tumbler: sublimation or other), **print area** in inches (tote: one side; tumbler: full wrap dimensions) and file spec. Ours are 4500 × 5400 px, 300 DPI, transparent PNG.
> 3. **Pricing** per unit (product + print), with whether **GST** is included and the rate.
> 4. **Shipping** by zone and weight, **COD** availability and charges, **RTO** charges.
> 5. **Times**: production and delivery by zone.
> 6. **Shopify**: can your app **link products that already exist in our store** (by SKU), or only fulfil products it creates? Does it work with a headless Hydrogen storefront?
> 7. **Branding**: blind shipping, custom packaging/inserts, invoice format.
> 8. **Mockups**: exportable product mockups at 2048 px or larger?
> 9. **Samples**: process and cost.
>
> Thank you! — Trenzora

## Facts to record (→ `ops/supplier-templates.ts`)

| Field                                                                                                                            | Tote (`tote`) | Tumbler (`tumbler`) | Source + date |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------- | ------------- |
| `blankName`                                                                                                                      |               |                     |               |
| `blankRef`                                                                                                                       |               |                     |               |
| `blankColour` (**owner decision 2026-10-03**: White tote, White tumbler)                                                         |               |                     |               |
| `printArea` `{widthIn, heightIn}`                                                                                                | one side      | full wrap           |               |
| `variantRefs.default`                                                                                                            |               |                     |               |
| Materials (the site says "white cotton canvas, long handles" / "white double-wall stainless steel, 20oz ≈ 590 ml, lid included") |               |                     |               |
| Print method (the site says tote "printed to order on one side", tumbler "sublimation")                                          |               |                     |               |

## Costs (→ `ops/landed-cost.csv`, rows `tote,default` and `tumbler,default`)

Same columns as Printrove, with source and quote date.

## After the blanks are confirmed

1. Tote: upload the master unchanged, centred on one side. Tumbler: place the master so the design sits **centred on the front face**; the transparent canvas wraps around. Scale only, no edits.
2. Record refs in `qikink.csv`; export mockups → `artwork/mockups/<handle>/01-front.jpg` → `npm run mockups:check`.
3. Order 2 samples: **Corporate Survivor tote** (longest line) and **Mumbai Made tumbler**. Check them against `README.md`.
4. After Gate 2: link the Shopify products to Qikink by SKU.
