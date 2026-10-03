# Supplier outreach (V1)

| Supplier  | Products                            | V1 SKUs    | Product list                              |
| --------- | ----------------------------------- | ---------- | ----------------------------------------- |
| Printrove | Premium Oversized Tee × 8 designs   | 40 (S–XXL) | `catalogue/supplier-orders/printrove.csv` |
| Qikink    | Everyday Tote × 8, 20oz Tumbler × 8 | 16         | `catalogue/supplier-orders/qikink.csv`    |

Checklists: [`printrove.md`](printrove.md) · [`qikink.md`](qikink.md). Quote requests for design 01 (drafts, Gate 4D): [`printrove-quote-request.md`](printrove-quote-request.md) · [`qikink-tote-quote-request.md`](qikink-tote-quote-request.md). Each one has a ready-to-send message, the exact facts we need, and where each answer goes in the repo.

## Rules for every supplier conversation

- Upload artwork **only** from `artwork/masters/` (`01_…09_` except 06): 4500 × 5400 px, 300 DPI, transparent PNG, locked (SHA-256 in `ops/suppliers.ts`). Never resize, recolour, flatten or "fix" a file. If a supplier's tool needs a change, stop and tell the owner.
- Never send `06_us.png` or `10_make_it_yours.png` (V2, not for sale).
- Supplier facts are recorded **only** from their spec sheet, designer tool or written quote, with the source and date. Nothing is estimated.
- Supplier names stay out of anything customers see. `qa:storefront` fails if one appears.
- Nothing here involves MaternEase or any Shopify store other than Trenzora.

## Where answers go

| Answer                                                    | File                                                                           | Check                                                                  |
| --------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Blank name/ID, colour, print area, size refs, source      | `ops/supplier-templates.ts`                                                    | `npm run supplier:check` (also reports artwork DPI at that print size) |
| Supplier product and variant refs per SKU                 | `catalogue/supplier-orders/<supplier>.csv` (working copy) → `supplier-map.csv` | —                                                                      |
| Unit cost, GST, shipping, COD, RTO, reprint, payment fees | `ops/landed-cost.csv`                                                          | `npm run costs:check`                                                  |
| Mockups                                                   | `artwork/mockups/<handle>/01-front.jpg` (+ `02-detail.jpg`, `03-styled.jpg`)   | `npm run mockups:check`                                                |
| Delivery and production times                             | `app/data/site.ts` → `SHIPPING`                                                | —                                                                      |
| Product spec wording (fabric, GSM, print method)          | `app/data/catalogue/product-types.ts`                                          | —                                                                      |

## Sample acceptance (per product type)

- Print is sharp at arm's length and close up. No banding, no pixelation on the small sublines (e.g. "EST. 1995", "BOMBAY COFFEE CLUB").
- The red rule prints red and stays clear of the text.
- Devanagari (Desi Roots "माझी मुंबई") renders correctly: matras and conjuncts intact.
- Placement matches the template: tee ~1 in below the collar and centred; tote centred; tumbler design on the front face.
- Fabric/body matches the copy on the site (weight, cotton content, canvas, double-wall steel).
- Tee: wash test (cold, inside out, 3 washes) with no cracking or fading. Tumbler: hand-wash test.
- Packaging, invoice and labels carry **no** supplier branding visible to the customer (blind/white-label shipping).
