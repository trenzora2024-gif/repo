# Artwork revision brief: round 5 (V1 masters)

Source pack under revision: `Trenzora_V1_10_Corrected_Production_Design_Masters_v4.zip` (sha256 `8736519d…3793`).

## Approved (do not change)
01, 02, 03, 05, 07, 09. 06 and 10 stay V2 and unchanged.

## Revise these 2 files (same filenames)

| File | v4 result |
| --- | --- |
| 04_coffee_personality.png | ✓ letters now intact. ✗ The red rule sits on the baseline of “COFFEE”, overlapping the letters by 12 rows of pixels. |
| 08_campus_energy.png | ✓ letters now intact. ✗ The red rule sits on the baseline of “SUGGESTION”, overlapping the letters by 6 rows of pixels. |

**Consistency (both files):** v4 switched to a different typeface, and the “TRENZORA” mark is lighter than in the other six V1 masters. To keep the V1 set visually consistent, use the same headline and subtitle typeface, the same mark weight, and the same rule style (square ends, same thickness) as 01–03 and 05.

## Requirements
- Red rule **at least 40 px** clear of the text above and below. No letters touching the rule.
- Intact letterforms, with no erased or patched pixels. No canvas-edge clipping.
- Same wording and hierarchy. No new copy. 4500×5400 px, 300 DPI, RGBA, transparent background. Same filenames.

## Acceptance
`npm run verify:artwork` reports **0 problems**, and a visual review confirms intact letters and a typeface consistent with the V1 set.
