# Supplier data request (Gate 4)

The Claude cloud environment can't open printrove.com or qikink.com (blocked by the environment's network policy). There are two ways to get these values in:

1. **No manual work:** add `printrove.com`, `qikink.com` and `help.qikink.com` to the environment's allowed domains (Environment → Edit → Network access → Custom; keep the defaults). Claude then reads the official pages itself in a new session.
2. **Or** copy the values below from the official pages or your supplier dashboards.

Only values that come from the supplier's own page, dashboard, invoice or written reply go into `ops/landed-cost.csv`, each with its source and date. "Not stated" is a valid answer; it stays blank.

## Printrove: oversized tee

Official page: <https://printrove.com/products/oversized-t-shirts>

| #   | Value                                                                                                                      | CSV column / file                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| P1  | Exact product name and ID of the oversized tee blank; GSM and fabric                                                       | `ops/supplier-templates.ts` → `oversized-tee`     |
| P2  | Base price for **each** size S, M, L, XL, XXL (or "same for all")                                                          | `product_cost_inr` (one row per size)             |
| P3  | Whether listed prices include GST, and the GST rate                                                                        | `supplier_prices_include_gst`, `supplier_gst_pct` |
| P4  | Print method for this blank (DTG/DTF)                                                                                      | `ops/supplier-templates.ts`                       |
| P5  | How print is charged: per sq in rate, **or** by template size (e.g. A4/A3/max area), and the minimum print charge          | needed to compute `print_cost_inr`                |
| P6  | Front print-area / template dimensions in inches for this blank                                                            | `printArea` in `ops/supplier-templates.ts`        |
| P7  | Print charge for our design placed in that template (shown in the designer when a master is placed at full template width) | `print_cost_inr`                                  |
| P8  | Shipping charge for one tee (weight slab and rate; zone if it varies), and its GST                                         | `shipping_inr`, `shipping_gst_pct`                |
| P9  | COD charge per order, and its GST (or "COD not offered")                                                                   | `cod_fee_inr`, `cod_fee_gst_pct`                  |
| P10 | RTO / return-to-origin charge per failed delivery (or "none")                                                              | `rto_charge_inr`                                  |

## Qikink: tote

Official page: <https://qikink.com/custom-tote-bags/>

| #   | Value                                                                                                                | CSV column / file                                         |
| --- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Q1  | Which tote matches our catalogue (natural cotton canvas, long handles, one-side print): exact name, ID, size, fabric | `ops/supplier-templates.ts` → `tote`                      |
| Q2  | Base price (does it include printing on one side?)                                                                   | `product_cost_inr` (+ `print_cost_inr`, or 0 if included) |
| Q3  | Whether prices include GST, and the rate                                                                             | `supplier_prices_include_gst`, `supplier_gst_pct`         |
| Q4  | Print method and printable area in inches                                                                            | `ops/supplier-templates.ts`                               |
| Q5  | Product weight used for shipping                                                                                     | needed for Q6                                             |
| Q6  | Shipping charge for one tote (air or surface, by zone if it varies), and its GST                                     | `shipping_inr`, `shipping_gst_pct`                        |
| Q7  | COD charge per order and its GST                                                                                     | `cod_fee_inr`, `cod_fee_gst_pct`                          |
| Q8  | RTO charge per failed delivery (or "none")                                                                           | `rto_charge_inr`                                          |

## Qikink: 20oz tumbler

Official page: <https://qikink.com/custom/drinkware/tumbler-bottle/>

| #   | Value                                                                                                      | CSV column / file                                  |
| --- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| T1  | Exact product name and ID; material; whether it's double-wall insulated with a lid (the site copy says so) | `ops/supplier-templates.ts` → `tumbler`; site copy |
| T2  | Base price (does it include the wrap print?)                                                               | `product_cost_inr` (+ `print_cost_inr`)            |
| T3  | Whether prices include GST, and the rate                                                                   | `supplier_prices_include_gst`, `supplier_gst_pct`  |
| T4  | Print method (sublimation?) and wrap print area in inches                                                  | `ops/supplier-templates.ts`                        |
| T5  | Product weight used for shipping                                                                           | needed for T6                                      |
| T6  | Shipping charge for one tumbler, and its GST                                                               | `shipping_inr`, `shipping_gst_pct`                 |
| T7  | COD charge per order and its GST                                                                           | `cod_fee_inr`, `cod_fee_gst_pct`                   |
| T8  | RTO charge per failed delivery (or "none")                                                                 | `rto_charge_inr`                                   |

## Not on supplier pages (owner / CA)

| #   | Value                                                                                  | CSV column                                                    |
| --- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| O1  | GST-registered and able to claim input tax credit?                                     | `itc_claimable`                                               |
| O2  | Output GST rate per product (HSN): tee, cotton tote, steel tumbler                     | `output_gst_pct`                                              |
| O3  | Payment gateway chosen, its fee % and fixed fee from its rate card, and GST on the fee | `gateway_fee_pct`, `gateway_fixed_inr`, `gateway_fee_gst_pct` |
| O4  | Shopify's transaction fee for that gateway on the Basic plan (Admin → Settings → Plan) | add to `gateway_fee_pct`                                      |

Then run `npm run costs:check`. The report gives contribution before and after the payment fee, prepaid and COD, the GST split, and the prices for 50 / 55 / 60% margin.
