# Qikink quote request: Unisex Tote Bag Zipper (TbZp), design 01 Mumbai Made

Status: **draft, not sent** (2026-10-03). Answers go into `ops/landed-cost.csv` with the source "Qikink written reply" and the reply date. Nothing is filled in until Qikink answers.

## Message (ready to send)

> Hello Qikink team,
>
> We're launching a print-on-demand store on Shopify (Trenzora, India; GST registered) and plan to use your **Unisex Tote Bag Zipper** (SKU **TbZp**, type **Standard**; https://qikink.com/custom/bags/tote-bag/). Before we finalise pricing, could you please quote one exact design, single-piece order, using the attached production file?
>
> **Artwork:** `01_mumbai_made.png`, 4500 × 5400 px, 300 DPI, transparent PNG. The printed (non-transparent) area is about 7.9 × 12.9 in at 300 DPI, so it will need to be scaled down in your designer to fit the 10 × 12 in print area (about 7.4 × 12.0 in). Placement: front, centred. We don't want the file itself edited.
>
> Please confirm:
>
> 1. Exact product price for TbZp / Standard (and whether it differs by colour).
> 2. Exact print charge for this design at up to 10 × 12 in, with DTF and with DTG.
> 3. Is the ₹80 DTF minimum the charge that actually applies to this order?
> 4. Is print billed on the artwork's actual area, its bounding box, or a fixed print area?
> 5. GST rate on the product.
> 6. GST rate on printing.
> 7. GST rate on shipping.
> 8. GST rate on the COD charge.
> 9. Shipping charge for one tote (Air and Surface).
> 10. COD charge per order.
> 11. RTO: please confirm there is no charge for a returned COD or prepaid order, and list any other fee that applies.
> 12. Bag dimensions (height, width, gusset, handle length).
> 13. Exact product weight and shipping weight for each colour.
> 14. Shopify integration: how our Shopify product/variant maps to TbZp so orders are fulfilled automatically.
> 15. Production time before dispatch.
>
> A written reply or a screenshot of the quote from your dashboard is fine. Thank you!

## What we already know (public pages, 2026-10-03)

These are listed so the reply can be checked against them. They are not answers to the questions above.

- "Tote Bag / Zipper / ₹150 / 5%" (https://qikink.com/help/payments-pricing/pricing/); product page shows ₹158, "5% GST included. Print & shipping charges extra." (https://qikink.com/custom/bags/tote-bag/).
- DTF ₹0.75/sq in, minimum ₹80; DTG colour ₹0.75/sq in, minimum ₹100; DTG white ₹0.5/sq in, minimum ₹50; 5% GST on printing (https://qikink.com/help/payments-pricing/printing-charges/).
- Shipping Air ₹54 per 500 g + 18%; COD ₹34 per order + 18% (https://qikink.com/help/payments-pricing/pricing/; https://qikink.com/shipping/).
- No RTO charge (https://qikink.com/help/returns/no-return-to-origin-rto-charges/).
- Max print area DTF/DTG 10 × 12 in; weight 135 g white / 150 g other colours (product page).
- "Tote Bag" 14.5 × 13.5 × 2.5 in, handle 11.5 in (https://qikink.com/help/printing/size-of-the-totebag/). The article doesn't say "Zipper".

## Where each answer goes

| #      | Answer                   | Destination                                                                                  |
| ------ | ------------------------ | -------------------------------------------------------------------------------------------- |
| 1–8    | Price, print charge, GST | `ops/landed-cost.csv`; replaces tote scenarios A/C with a confirmed row                      |
| 9–11   | Shipping, COD, RTO       | `shipping_inr`, `cod_fee_inr`, `rto_charge_inr` and their GST columns                        |
| 12, 13 | Dimensions, weight       | `ops/supplier-templates.ts` and `app/data/catalogue/product-types.ts` (owner approval first) |
| 14     | Shopify mapping          | `catalogue/supplier-orders/qikink.csv`                                                       |
| 15     | Production time          | `app/data/site.ts` → `SHIPPING` (owner approval first)                                       |
