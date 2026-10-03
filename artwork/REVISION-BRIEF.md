# Artwork revision brief: round 4 (V1 masters)

Source pack under revision: `Trenzora_V1_10_Corrected_Production_Design_Masters_v3.zip` (sha256 `5b5c833e…6322`).

## Approved in v3 (do not change)
01, 02, 03, 05 (rule fixed, glyphs intact), plus the previously approved 07 and 09. 06 and 10 stay V2 and unchanged.

## Revise these 2 files (same filenames)

| File | Problem found |
| --- | --- |
| 04_coffee_personality.png | Horizontal strips erased through the bottom of “COFFEE” where the old rule sat: the letters have visible cuts. The rule is also only 31 px above “BOMBAY COFFEE CLUB” (40 px minimum). |
| 08_campus_energy.png | Horizontal strips erased through the bottom of “SUGGESTION” (G G E S T I): the letters have visible cuts. |

## How to fix
Re-set the affected headline line from intact type. Don't erase or patch the old rule out of existing pixels. Then place the red rule with **at least 40 px** clear of the text above and below.

## Requirements (unchanged)
- No canvas-edge clipping. Keep the concept, wording, hierarchy and style. No new copy.
- 4500×5400 px, 300 DPI, RGBA PNG, transparent background. Same filenames.

## Acceptance
`npm run verify:artwork` reports **0 problems**, and a visual review confirms intact letterforms in 04 and 08.
