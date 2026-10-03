# Trenzora graphics roadmap

How each design family should look beyond the product itself: the visual world to build around the locked artwork. The artwork stays untouched. This is everything _around_ it: sets, props, photography, campaign graphics.

## What exists now (Phase 2)

| Asset                                                                       | Where                                                     | Made how                 |
| --------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------ |
| 3 product images × 24 V1 products (studio, print detail, styled colour set) | `public/visuals/products/<handle>/` → mock Shopify images | `npm run visuals:render` |
| Family sets (tee + tote + tumbler, 4:5) × 8                                 | `public/visuals/editorial/<family>-set.webp`              | same                     |
| Trio (one design × three products, neutral) × 8                             | `…/<family>-trio.webp`                                    | same                     |
| Homepage hero (portrait + wide), Drop 01 print close-up                     | `…/hero-*.webp`, `…/drop01-detail.webp`                   | same                     |

The renders place the locked master **whole and uniformly scaled** on drawn blanks. They're studio renders, not photographs. They stand in until:

1. **Supplier mockups** for the confirmed blanks (`docs/SUPPLIER-SETUP.md`). These replace the 01 studio images on Shopify.
2. **Real photography.** This replaces the 03 styled images and the homepage editorial.

The blank colours in the renders (off-white tee, natural tote, white tumbler) follow the artwork: black ink with a red rule, made for light blanks. Confirm them against the supplier blanks.

No reviews, testimonials or customer photos are invented. "People of Trenzora" stays as prompts until real posts exist.

## System rules (all families)

- **Set colour** = the family's `palette.bg` in `app/data/catalogue/design-families.ts`. Muted and editorial, never neon.
- **Light**: hard window light, blind shadows, one direction (top-left). Warm midday Mumbai, not studio flash.
- **Crop**: square for product, 4:5 for editorial, 21:9 for campaign bands. Crop into the garment rather than showing it floating in a void.
- **Type over image**: never put type on the artwork itself. Headlines live beside or below imagery.
- **Props**: one or two real objects per frame, specific to the family (below). No clip-art, no stock icons, no emoji.
- **People**: Indian, real, mid-movement. Never posed catalogue smiles. Faces optional; the garment is the hero.

## Per family

| #       | Family                         | Visual language                                                                          | Set / props                                                                 | Photography brief                                                                  | Campaign graphics (later)                                                                      |
| ------- | ------------------------------ | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 01      | **Mumbai Made**                | Mumbai city: BEST red, sea-face concrete, kaali-peeli yellow as a sparing accent         | Brick-red set; local train pass, a folded _Mid-day_, a cutting-chai glass   | Marine Drive at golden hour; Fort lanes; a tee on a Bandra balcony railing         | Drop 01 poster series; tiles built from city signage typography (shot, not traced)             |
| 02      | **Local Life**                 | Station and train: platform yellow, footboard steel, ladies'/general compartment signage | Ochre set; ticket stubs, a steel grab-handle, a platform clock              | The 8:12 fast; doorway silhouettes; tote on a luggage rack                         | "Different station, same story" station-board series; route-map graphics drawn from real lines |
| 03      | **Corporate Survivor**         | Office: calendar grids, document stacks, lanyards, fluorescent glare                     | Slate set; a desk tumbler, a calendar printout full of meetings, a lanyard  | The 6 p.m. office lift; a tumbler on a cluttered desk; a tote leaving the building | Out-of-office emails and calendar invites as animated social posts                             |
| 04      | **Coffee Personality**         | Café editorial: espresso browns, crema, ceramics, morning steam                          | Espresso set; a ceramic cup, beans, a café receipt                          | Irani café table at 9 a.m.; the tumbler in a hand at a pour-over bar               | "Bombay Coffee Club" membership-card graphics; café menu-board typography                      |
| 05      | **Bestie Energy**              | Playful friendship: dusty rose, film-photo flash, handwritten notes                      | Rose set; Polaroids, a pair of tees folded together, a phone of screenshots | Two friends twinning on a terrace; flash-on night photos                           | Screenshot/voice-note style story graphics; "she knows too much" sticker sheet                 |
| 07      | **Pet Parent**                 | Pet lifestyle: sage, linen, leash and bowl details, paw-height angles                    | Sage set; a steel bowl, a leash, a chew toy                                 | Indies and cats with their humans; morning walk; tote with treats                  | "Pet Parent Club" membership badge (no specific pet name, like the artwork)                    |
| 08      | **Campus Energy**              | Varsity: royal blue, chalkboard, notebooks, ID cards, canteen                            | Varsity-blue set; ruled notebook, canteen token, a college ID               | Canteen tables; hostel corridors; the last bench                                   | Attendance-register and timetable parodies; varsity-number graphics                            |
| 09      | **Desi Roots**                 | Modern Marathi/Mumbai: deep teal, marigold, Devanagari signage, wada architecture        | Teal set; a marigold string, brass kalash, a Marathi newspaper              | Girgaon chawls, Dadar flower market, Ganpati season (respectfully)                 | Devanagari typographic posters by a Marathi type designer; festival drops                      |
| 06 / 10 | **Us**, **Make It Yours** (V2) | Personal: names, dates, handwriting                                                      | (when personalization launches)                                             | Couples and personal stories, real customers only                                  | Personalization preview system                                                                 |

## Production priority

1. **Before launch:** supplier mockups for 24 products (replace 01 studio images). One Drop 01 photo shoot: Mumbai Made + Local Life, 2 models, 2 locations.
2. **Launch +1 month:** styled flat-lays for all 8 families (replace 03 images and the `-set` editorial).
3. **Ongoing:** campaign graphics per drop, plus real customer photos in People of Trenzora (with permission).

To regenerate the renders: `npm run visuals:render` (needs the masters in `artwork/masters/` and Playwright). Re-render only some: `npm run visuals:render -- mumbai-made hero`.
