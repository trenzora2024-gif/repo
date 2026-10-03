# Artwork revision brief: round 7 (04 and 08 only)

Source pack under revision: `Trenzora_V1_10_Corrected_Production_Design_Masters_v6.zip` (sha256 `1393ce2d…310a`).

## Approved (do not change)
01, 02, 03, 05, 07, 09 (V1), plus 06 and 10 (V2).

## Finding
In v6, the **headline pixels of 04 and 08 are identical to the rejected v3** (a pixel comparison finds differences only below row 1981, in the rule and subline area). The erased strips through “COFFEE” (rows 1902–1919) and “SUGGESTION” (rows 1912–1929) are still there.

## Why patching can't work
In v2 the red rule was drawn **on top of** the bottom of “COFFEE” and “SUGGESTION”. In every PNG since, those letter pixels were replaced by red, so they no longer exist. Erasing or moving the rule can only leave holes. The letters have to be **re-set as live type**.

## How to produce passing files
1. In the design tool, typeset the headline and subline again as live text, using the **same font file and weight as 01–03 and 05** (the same font the approved masters were exported with), and the same “TRENZORA” mark.
2. Place the red rule in the gap between the headline and subline, with **at least 40 px** of clear space above and below.
3. Export a fresh 4500×5400, 300 DPI, transparent RGBA PNG with the same filename.
4. Run `npm run verify:artwork` before sending. It must report **0 problems**. It detects erased strips, rule collisions and edge clipping.
