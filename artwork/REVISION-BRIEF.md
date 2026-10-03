# Artwork revision brief: round 3 (V1 masters)

Source pack under revision: `Trenzora_V1_10_Corrected_Production_Design_Masters_v2.zip` (sha256 `6094aba5…80e3`).

## Revise these 6 files (same filenames)

| File | Current red-rule clearance (measured at 4500×5400) | Problem |
| --- | --- | --- |
| 01_mumbai_made.png | 32 px above | under the 40 px minimum |
| 02_local_life.png | 28 px above | under the 40 px minimum |
| 03_corporate_survivor.png | 27 px above | under the 40 px minimum |
| 04_coffee_personality.png | rule runs through "COFFEE" (18 rows overlap) | collision |
| 05_bestie_energy.png | 8 px above | effectively touching |
| 08_campus_energy.png | 0 px; rule sits inside "SUGGESTION" | collision |

## Requirements
- At least **40 px** of clear space between the red rule and any text, above and below.
- No letters touching or crossing the rule.
- No artwork touching the canvas edges.
- Keep the concept, wording, hierarchy and visual style. No new copy.
- 4500×5400 px, 300 DPI, RGBA PNG, transparent background. Same filenames.

## Do not change
`06_us.png`, `07_pet_parent.png`, `09_desi_roots.png` and `10_make_it_yours.png` are locked by checksum. `npm run verify:artwork` fails if any of them changes. A revised ZIP may include them unchanged or leave them out.

## Acceptance
`npm run verify:artwork` reports **0 problems**, followed by a visual review of all 6 revised files.
