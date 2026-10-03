# Printrove quote request: Oversized T-shirt, design 01 Mumbai Made

Status: **draft, not sent** (2026-10-03). Answers go into `ops/landed-cost.csv` with the source "Printrove written reply" and the reply date. Nothing is filled in until Printrove answers.

## Message (ready to send)

> Hello Printrove team,
>
> We're launching a print-on-demand store on Shopify (Trenzora, India; GST registered) and plan to use your **Oversized T-shirt** (https://printrove.com/products/oversized-t-shirts). Before we finalise pricing, could you please quote one exact design, single-piece order, using the attached production file?
>
> **Artwork:** `01_mumbai_made.png`, 4500 × 5400 px, 300 DPI, transparent PNG, RGB. The printed (non-transparent) area is about 7.9 × 12.9 in at 300 DPI. Placement: front, centred below the collar. We don't want the file resized or edited.
>
> Please confirm:
>
> 1. Oversized T-shirt blank price.
> 2. Blank colour options available for this product.
> 3. Sizes S, M, L, XL, 2XL: is the price the same for each?
> 4. Is your **2XL** the same size as what we list as **XXL**? Please share the size chart (chest and length) for S–2XL.
> 5. Exact printing method that will be used for this design (DTG or DTF), on a white blank and on a coloured blank.
> 6. Exact print charge for this design at the placement above, on a white blank and on a coloured blank.
> 7. How the print area is measured for billing.
> 8. Is the print charge based on the design's bounding box, the full template (15.60 × 19.60 in), the actual ink area, or a fixed size tier?
> 9. GST rate on the blank.
> 10. GST rate on printing.
> 11. GST on shipping (rate, or "not charged").
> 12. GST on the COD fee (rate, or "not charged").
> 13. Shipping charge for one tee to a domestic address.
> 14. COD charge per order.
> 15. RTO charge: what do you charge us when a prepaid or COD order is returned to origin (return shipping and any other fee)?
> 16. Are the publicly listed shipping (₹60 per 500 g) and COD (₹50) amounts GST-inclusive or before GST?
> 17. Expected production time before dispatch.
> 18. Can customer orders from our Shopify store be sent to you and fulfilled automatically? What do we need to set up, and how do we map our size variants to your products?
>
> A written reply or a screenshot of the quote from your merchant panel is fine. Thank you!

## What we already know (public pages, 2026-10-03)

These are listed so the reply can be checked against them. They are not answers to the questions above.

- Base ₹240 "upto 2XL"; print ₹0.8/sq in on white (minimum ₹80), ₹1.5/sq in on other colours (minimum ₹120); "GST applicable on product price (base price + printing charges)" 5%. Source: https://printrove.com/products/oversized-t-shirts
- Shipping ₹60 per 500 g; COD ₹50 per order. Source: https://printrove.com/shipping
- RTO parcels are stored 30 days without a warehousing fee; address correction ₹65 + GST. Source: https://printrove.com/returns-and-refund

## Where each answer goes

| #              | Answer                           | Destination                                                                                                                             |
| -------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1, 3, 6, 9, 10 | Blank price, print charge, GST   | `ops/landed-cost.csv` (`product_cost_inr`, `print_cost_inr`, `supplier_gst_pct`); replaces scenario A/C with a confirmed scenario B row |
| 7, 8           | Billing basis                    | `notes` column of the scenario B row                                                                                                    |
| 11–16          | Shipping, COD, RTO and their GST | `shipping_inr`, `shipping_gst_pct`, `cod_fee_inr`, `cod_fee_gst_pct`, `rto_charge_inr`                                                  |
| 2, 4, 5        | Colours, size mapping, method    | `ops/supplier-templates.ts` (blank colour, variant refs); no catalogue change until the owner approves                                  |
| 17             | Production time                  | `app/data/site.ts` → `SHIPPING` (owner approval first)                                                                                  |
| 18             | Shopify fulfilment               | `catalogue/supplier-orders/printrove.csv`                                                                                               |
