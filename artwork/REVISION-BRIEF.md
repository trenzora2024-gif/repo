# Artwork revision brief: round 6 (04 and 08 only)

Source pack under revision: `Trenzora_V1_10_Corrected_Production_Design_Masters_v5.zip` (sha256 `eab42c54…5615`).

## Approved (do not change)
01, 02, 03, 05, 07, 09 (V1), plus 06 and 10 (V2). All match their approved checksums.

## Why 04 and 08 keep failing
v3 and v5 were produced by **erasing pixels from the previous PNG** where the old red rule crossed the letters. That leaves transparent strips through the letters. v4 was re-typeset, which fixed the letters, but it used a different typeface and the rule overlapped the baseline.

**Fix at the source:** open the original layered or vector design file (the one 01–03 and 05 were exported from). Move the red rule into the gap between the headline and subline, with **at least 40 px** of clear space above and below, and export a fresh PNG. Don't edit the old PNG.

| File | v5 result |
| --- | --- |
| 04_coffee_personality.png | ✓ typeface consistent. ✗ Erased strips through the bottom of “COFFEE” (rows ~1902–1919). |
| 08_campus_energy.png | ✓ typeface consistent. ✗ Erased strips through “SUGGESTION” (rows ~1912–1929) and through the subline “CAMPUS DAYS • FOREVER”. |

## Requirements
Same typeface, mark and rule style as 01–03 and 05. Intact letters. Rule clear by at least 40 px. No canvas-edge clipping. Same wording. 4500×5400 px, 300 DPI, RGBA, transparent background. Same filenames.

## Self-check before sending
`npm run verify:artwork` now also detects erased strips through letters. It must report **0 problems**, and the visual check must show intact headline and subline letters.
