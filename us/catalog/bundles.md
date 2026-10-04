# Complete setups: discount codes

Bundles add every piece to the cart in one click. Savings are optional: create these codes in **Shopify Admin → Discounts → Create discount → Amount off order**, then set `PUBLIC_BUNDLE_DISCOUNTS=on` in the Hydrogen environment. Until then bundles sell at the sum of their parts (no fake savings).

Settings for every code: fixed amount; **minimum purchase amount = the bundle total below** (so it can’t be used on smaller carts); one use per order; combines with nothing; no end date. The bundle button applies the code automatically — don’t publish the codes anywhere.

| Setup | Code | Amount off | Minimum purchase (sum of parts) | Items |
|---|---|---|---|---|
| Weekend Car Camping Setup | `SETUP-WEEKEND` | $17 | $366 | 1× suv-tailgate-tent, 1× folding-cot-with-mattress, 1× rechargeable-lantern-power-bank, 1× reclining-camp-chair |
| Hot-Tent Basecamp | `SETUP-HOTTENT` | $37 | $676 | 1× canvas-bell-tent-5m, 1× tent-wood-stove, 1× folding-cot-with-mattress, 1× cold-weather-sleeping-bag |
| Camp Kitchen Kit | `SETUP-KITCHEN` | $12 | $217 | 1× camp-kitchen-table, 1× camp-cookware-set, 1× collapsible-water-jug, 1× camp-storage-box |
| Tailgate-Ready Kit | `SETUP-TAILGATE` | $16 | $301 | 1× collapsible-wagon, 1× camp-kitchen-table, 1× reclining-camp-chair, 1× camp-side-table |
| Family Comfort Kit | `SETUP-FAMILY` | $16 | $301 | 1× pop-up-privacy-tent, 1× portable-camp-toilet, 1× portable-propane-water-heater, 1× collapsible-water-jug |
| Off-Grid Power Kit | `SETUP-POWER` | $17 | $332 | 1× portable-power-station-300w, 1× foldable-solar-panel-100w, 1× rechargeable-lantern-power-bank |

If you change a product price, re-run `npm run catalog:export` and update the minimums.
