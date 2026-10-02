# Personalization: architecture (V2-ready, off in V1)

V1 launches with **static designs only**. "Us" and "Make It Yours" have the personalization structure in place but switched off, so turning it on later needs no rebuild.

## What already exists

- `app/data/catalogue/design-families.ts` gives each family a `personalization` block:
  - `enabled` (`false` for every family in V1) turns input collection on the product page on or off.
  - `planned` (`true` for `us` and `make-it-yours`) shows the "coming soon" note and adds the `personalizable` tag.
  - `fields` lists the inputs: key, label, max length, required.
- When `enabled` is `true`, `ProductForm` renders the fields, validates the required ones, and sends them as **Shopify cart line attributes**:
  - Customer-visible: `Name 1`, `Name 2`, `Date`, `Your text`. These show in the cart, at checkout, and on the order.
  - Hidden (underscore prefix): `_design_family`, `_artwork_master`. These are for the artwork pipeline.
- Analytics fire `customization_start` on the first keystroke and `customization_complete` on add to cart.

## Flow to build before enabling

```
Customer enters text → cart line attributes → Shopify order
  → orders/create webhook (Shopify Flow or a small app)
  → render order-specific artwork from the production master + text
  → human/automated validation (profanity, length, fit)
  → send artwork to the supplier (Printrove/Qikink/Vistaprint API or panel)
  → fulfilment + tracking back to Shopify
```

Before setting `enabled: true` for any family:

1. The supplier must accept per-order artwork for that product type.
2. Artwork rendering must be tested on all three products, including long names and Devanagari.
3. Return-policy copy for personalised items must be confirmed. The form already shows a note.
4. The order-routing automation must be running in Shopify and tested end to end.

None of this lives in the storefront. The frontend only collects attributes.
