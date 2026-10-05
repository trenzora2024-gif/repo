#!/usr/bin/env python3
"""Place the locked V7 masters on the plain supplier tee mockups.

    python3 scripts/compose-tee-mockups.py --masters <dir with 01_…09_ PNGs> \
        --blanks <dir with Front_1_c_*.jpg / Back_2_c_*.jpg> [--colour white]

Writes artwork/mockups/<handle>/01-front.jpg, 02-detail.jpg, 03-back.jpg
(2048 px square) for the 8 V1 tees, plus a QA sheet.

The masters are only read: each one must match its sha256 in
catalogue/artwork-manifest.json or the script stops. The artwork is scaled
uniformly (never stretched, cropped or recoloured) and multiplied onto the
garment, so the supplier photo's folds and shading show through the ink.
The garment photo itself is only enlarged and padded to a square.
"""
import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent

# V1 tees: master file -> Shopify handle. 06 Us and 10 Make It Yours are V2.
TEES = {
    '01_mumbai_made.png': 'mumbai-made-oversized-tee',
    '02_local_life.png': 'local-life-oversized-tee',
    '03_corporate_survivor.png': 'corporate-survivor-oversized-tee',
    '04_coffee_personality.png': 'coffee-personality-oversized-tee',
    '05_bestie_energy.png': 'bestie-energy-oversized-tee',
    '07_pet_parent.png': 'pet-parent-oversized-tee',
    '08_campus_energy.png': 'campus-energy-oversized-tee',
    '09_desi_roots.png': 'desi-roots-oversized-tee',
}

# Supplier mockup colour codes (Qikink terry oversized tee export names).
COLOURS = {'white': 'c_1', 'lavender': 'c_49', 'flamingo': 'c_56'}

# Geometry on the 682 x 875 supplier front mockup, measured 2026-10-05.
# Body at chest: x 171-503 (332 px) for a 22 in flat chest (size M, chest 44 in).
# The render isn't exactly to scale (length reads ~21 px/in), so use a middle value.
SRC_PX_PER_IN = 17.5
CENTRE_X = 337  # centre of the body between the side seams
CANVAS_TOP_Y = 190  # top of the 15 x 18 in master canvas, about 1 in below the collar
MASTER_IN = (15.0, 18.0)  # 4500 x 5400 px at 300 DPI

OUT = 2048
BG = (242, 242, 242)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def square(img: Image.Image) -> tuple[Image.Image, float, int]:
    """Enlarge to OUT px tall and pad to a square with the studio grey."""
    k = OUT / img.height
    big = img.resize((round(img.width * k), OUT), Image.LANCZOS)
    canvas = Image.new('RGB', (OUT, OUT), BG)
    dx = (OUT - big.width) // 2
    canvas.paste(big, (dx, 0))
    return canvas, k, dx


def place(garment: Image.Image, master: Image.Image, k: float, dx: int):
    """Multiply the master onto the garment. Returns image and ink box."""
    px_per_in = SRC_PX_PER_IN * k
    w = round(MASTER_IN[0] * px_per_in)
    h = round(MASTER_IN[1] * px_per_in)  # same scale both ways: no stretch
    art = master.resize((w, h), Image.LANCZOS)
    x = round(CENTRE_X * k + dx - w / 2)
    y = round(CANVAS_TOP_Y * k)

    layer = Image.new('RGB', garment.size, (255, 255, 255))
    alpha = Image.new('L', garment.size, 0)
    layer.paste(art.convert('RGB'), (x, y))
    alpha.paste(art.getchannel('A'), (x, y))
    inked = ImageChops.multiply(garment, layer)
    out = Image.composite(inked, garment, alpha)

    bx = master.getchannel('A').getbbox()
    s = w / master.width
    ink = (x + bx[0] * s, y + bx[1] * s, x + bx[2] * s, y + bx[3] * s)
    return out, ink


def detail(img: Image.Image, ink) -> Image.Image:
    """Square crop around the print with a margin, enlarged back to OUT."""
    cx, cy = (ink[0] + ink[2]) / 2, (ink[1] + ink[3]) / 2
    side = max(ink[2] - ink[0], ink[3] - ink[1]) * 1.35
    box = (cx - side / 2, cy - side / 2, cx + side / 2, cy + side / 2)
    return img.crop(tuple(round(v) for v in box)).resize((OUT, OUT), Image.LANCZOS)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--masters', required=True)
    ap.add_argument('--blanks', required=True)
    ap.add_argument('--colour', default='white', choices=COLOURS)
    ap.add_argument('--out', default=str(ROOT / 'artwork/mockups'))
    args = ap.parse_args()

    manifest = {
        m['file']: m['sha256']
        for m in json.loads((ROOT / 'catalogue/artwork-manifest.json').read_text())
    }
    code = COLOURS[args.colour]
    blanks = Path(args.blanks)
    front = Image.open(blanks / f'Front_1_{code}.jpg').convert('RGB')
    back = Image.open(blanks / f'Back_2_{code}.jpg').convert('RGB')
    front_sq, k, dx = square(front)
    back_sq, _, _ = square(back)

    out_dir = Path(args.out)
    sheet = Image.new('RGB', (4 * 512, 2 * 512), BG)
    for i, (file, handle) in enumerate(TEES.items()):
        path = Path(args.masters) / file
        digest = sha256(path)
        if digest != manifest[file]:
            raise SystemExit(f'{file}: sha256 {digest[:12]}… is not the locked V7 master')
        master = Image.open(path)
        assert master.size == (4500, 5400) and master.mode == 'RGBA', file

        hero, ink = place(front_sq, master, k, dx)
        d = out_dir / handle
        d.mkdir(parents=True, exist_ok=True)
        hero.save(d / '01-front.jpg', quality=92, subsampling=0)
        detail(hero, ink).save(d / '02-detail.jpg', quality=92, subsampling=0)
        back_sq.save(d / '03-back.jpg', quality=92, subsampling=0)
        sheet.paste(hero.resize((512, 512)), ((i % 4) * 512, (i // 4) * 512))
        print(f'{handle}: ok (ink {round((ink[2]-ink[0])/(SRC_PX_PER_IN*k),1)} x '
              f'{round((ink[3]-ink[1])/(SRC_PX_PER_IN*k),1)} in on the garment)')
    sheet.save(out_dir / f'qa-sheet-{args.colour}.jpg', quality=88)


if __name__ == '__main__':
    main()
