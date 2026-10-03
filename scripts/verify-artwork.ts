/**
 * Validates the official Trenzora production master pack (read-only).
 *
 *   npm run verify:artwork                   # looks in artwork/masters/
 *   npm run verify:artwork -- --dir /path/to/pack
 *
 * Checks that every design family's master (01_mumbai_made.png …
 * 10_make_it_yours.png) is present and is a real PNG, and reports pixel size,
 * DPI metadata, alpha channel and checksum. Writes
 * catalogue/artwork-manifest.json (family → file → sha256) for traceability.
 * It never edits, resizes or regenerates artwork. Print-size requirements
 * come from the supplier templates; confirm them before mockups (step G).
 */
import {createHash} from 'node:crypto';
import {existsSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {inflateSync} from 'node:zlib';
import {DESIGN_FAMILIES} from '../app/data/catalogue/index.ts';
import {ARTWORK_REVISIONS, LOCKED_MASTERS} from '../ops/suppliers.ts';

const args = process.argv.slice(2);
const dir = args.includes('--dir')
  ? args[args.indexOf('--dir') + 1]
  : 'artwork/masters';

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
const COLOR_TYPES: Record<number, string> = {
  0: 'greyscale',
  2: 'RGB',
  3: 'indexed',
  4: 'greyscale+alpha',
  6: 'RGBA',
};

function inspectPng(buf: Buffer) {
  if (!buf.subarray(0, 8).equals(PNG_SIGNATURE)) return null;
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const bitDepth = buf[24];
  const colorType = buf[25];
  let dpi: number | null = null;
  let offset = 8;
  while (offset < buf.length - 12) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    if (type === 'pHYs' && buf[offset + 16] === 1) {
      dpi = Math.round(buf.readUInt32BE(offset + 8) * 0.0254);
      break;
    }
    if (type === 'IDAT') break;
    offset += 12 + length;
  }
  return {
    width,
    height,
    bitDepth,
    colorType: COLOR_TYPES[colorType] ?? String(colorType),
    alpha: colorType === 4 || colorType === 6,
    dpi,
  };
}

/**
 * Decodes 8-bit RGBA PNG pixels (read-only) to find the ink bounds and check
 * that the background is transparent and no artwork touches the canvas edge
 * (touching = text/graphics cut off inside the master itself).
 */
function analysePixels(buf: Buffer, width: number, height: number) {
  const chunks: Buffer[] = [];
  let offset = 8;
  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    if (buf.toString('ascii', offset + 4, offset + 8) === 'IDAT') {
      chunks.push(buf.subarray(offset + 8, offset + 8 + length));
    }
    offset += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(chunks));
  const bpp = 4;
  const stride = width * bpp;
  let prev = new Uint8Array(stride);
  let line = new Uint8Array(stride);
  let minX = width;
  let maxX = -1;
  let minY = -1;
  let maxY = -1;
  // Accent-rule clearance: per row, red pixel extent + a 10px-binned map of
  // dark ink, so we can measure the gap between the red rule and the text.
  const BIN = 10;
  const bins = Math.ceil(width / BIN);
  const darkBins = new Uint8Array(bins * height);
  const redCount = new Uint32Array(height);
  const redMin = new Int32Array(height).fill(-1);
  const redMax = new Int32Array(height).fill(-1);
  // Erased-strip ("cut glyph") detection: per column, the last row with
  // ink and whether a short transparent gap followed it. A gap of
  // CUT_MIN..CUT_MAX px with ink on both sides, repeated across many columns
  // at the same rows, is a horizontal cut through letters, not typography.
  const lastInk = new Int32Array(width).fill(-1);
  const runLen = new Uint32Array(width); // ink run ending at lastInk
  const cutHits = new Uint32Array(height);
  let rowsTouchingLeft = 0;
  let rowsTouchingRight = 0;
  let cornersTransparent = true;
  for (let y = 0; y < height; y++) {
    const start = y * (stride + 1);
    const filter = raw[start];
    for (let x = 0; x < stride; x++) {
      const v = raw[start + 1 + x];
      const a = x >= bpp ? line[x - bpp] : 0;
      const b = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      let out = v;
      if (filter === 1) out = v + a;
      else if (filter === 2) out = v + b;
      else if (filter === 3) out = v + ((a + b) >> 1);
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        out = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      }
      line[x] = out & 255;
    }
    let rowMin = -1;
    let rowMax = -1;
    for (let x = 0; x < width; x++) {
      const i = x * 4;
      if (line[i + 3]) {
        if (rowMin < 0) rowMin = x;
        rowMax = x;
      }
      if (line[i + 3] > 128) {
        if (lastInk[x] === y - 1) runLen[x]++;
        else {
          const gap = lastInk[x] >= 0 ? y - lastInk[x] - 1 : 0;
          // Only gaps that slice through a tall stroke: normal letterforms
          // never have a short gap inside a vertical stem.
          const resumesOnRule =
            line[i] > 170 && line[i + 1] < 120 && line[i + 2] < 100;
          if (
            gap >= CUT_MIN &&
            gap <= CUT_MAX &&
            runLen[x] >= CUT_STEM &&
            !resumesOnRule // rule proximity is measured by the rule check
          ) {
            for (let gy = lastInk[x] + 1; gy < y; gy++) cutHits[gy]++;
          }
          runLen[x] = 1;
        }
        lastInk[x] = y;
        const [r, g, b] = [line[i], line[i + 1], line[i + 2]];
        if (r < 90 && g < 90 && b < 90)
          darkBins[y * bins + ((x / BIN) | 0)] = 1;
        else if (r > 170 && g < 120 && b < 100) {
          redCount[y]++;
          if (redMin[y] < 0) redMin[y] = x;
          redMax[y] = x;
        }
      }
    }
    if ((y === 0 || y === height - 1) && (line[3] || line[stride - 1])) {
      cornersTransparent = false;
    }
    if (rowMin >= 0) {
      if (minY < 0) minY = y;
      maxY = y;
      minX = Math.min(minX, rowMin);
      maxX = Math.max(maxX, rowMax);
      if (rowMin === 0) rowsTouchingLeft++;
      if (rowMax === width - 1) rowsTouchingRight++;
    }
    [prev, line] = [line, prev];
  }
  /** Bands of rows where many columns share a short gap = erased strip. */
  function findCuts() {
    const bands: Array<{from: number; to: number; columns: number}> = [];
    for (let y = 0; y < height; y++) {
      if (cutHits[y] < CUT_COLUMNS) continue;
      const last = bands[bands.length - 1];
      if (last && y - last.to <= 1) {
        last.to = y;
        last.columns = Math.max(last.columns, cutHits[y]);
      } else bands.push({from: y, to: y, columns: cutHits[y]});
    }
    return bands;
  }

  /** Finds the red accent rule and the clear space above/below it. */
  function measureRule() {
    let top = -1;
    let bottom = -1;
    for (let y = 0; y < height; y++) {
      if (redCount[y] > width * 0.05) {
        if (top < 0) top = y;
        bottom = y;
      } else if (top >= 0) break;
    }
    if (top < 0) return null;
    let x0 = width;
    let x1 = -1;
    for (let y = top; y <= bottom; y++) {
      x0 = Math.min(x0, redMin[y]);
      x1 = Math.max(x1, redMax[y]);
    }
    const b0 = Math.floor(x0 / BIN);
    const b1 = Math.floor(x1 / BIN);
    const inkInRow = (y: number) => {
      for (let b = b0; b <= b1; b++) if (darkBins[y * bins + b]) return true;
      return false;
    };
    let overlapRows = 0;
    for (let y = top; y <= bottom; y++) if (inkInRow(y)) overlapRows++;
    let above = 0;
    for (let y = top - 1; y >= 0 && !inkInRow(y); y--) above++;
    let below = 0;
    for (let y = bottom + 1; y < height && !inkInRow(y); y++) below++;
    return {
      top,
      bottom,
      x: [x0, x1],
      overlapRows,
      clearAbove: above,
      clearBelow: below,
    };
  }

  return {
    transparentBackground: cornersTransparent,
    inkBounds: {x: [minX, maxX], y: [minY, maxY]},
    margins: {
      left: minX,
      right: width - 1 - maxX,
      top: minY,
      bottom: height - 1 - maxY,
    },
    rule: measureRule(),
    cuts: findCuts(),
    edgeClipped:
      rowsTouchingLeft > 0 ||
      rowsTouchingRight > 0 ||
      minY === 0 ||
      maxY === height - 1,
    rowsTouchingLeft,
    rowsTouchingRight,
  };
}

/**
 * Clear space between the red accent rule and text, in px at 300 DPI.
 * Below COLLISION (≈1.3 mm) or any overlap fails; below COMFORT (≈3.4 mm)
 * is reported as tight for a design review.
 */
const RULE_COLLISION = 15;
/** Erased-strip detector: gap height range (px) and min columns affected. */
const CUT_MIN = 2;
const CUT_MAX = 30;
const CUT_COLUMNS = 120;
const CUT_STEM = 40;
const RULE_COMFORT = 40;

const lines: string[] = [`Trenzora artwork pack check (${dir})`, ''];
let problems = 0;

if (!existsSync(dir)) {
  lines.push(
    `✗ Folder not found. Put the official production masters in ${dir}/ (or pass --dir).`,
  );
  problems++;
} else {
  const expected = new Set(DESIGN_FAMILIES.map((f) => f.artworkFile));
  const present = readdirSync(dir).filter(
    (f) => !f.startsWith('.') && f !== 'README.md',
  );
  const manifest: Array<Record<string, unknown>> = [];

  for (const family of DESIGN_FAMILIES) {
    const path = join(dir, family.artworkFile);
    if (!existsSync(path)) {
      lines.push(`✗ ${family.artworkFile} — missing (${family.name})`);
      problems++;
      continue;
    }
    const buf = readFileSync(path);
    const info = inspectPng(buf);
    if (!info) {
      lines.push(`✗ ${family.artworkFile} — not a valid PNG`);
      problems++;
      continue;
    }
    const pixels =
      info.bitDepth === 8 && info.colorType === 'RGBA'
        ? analysePixels(buf, info.width, info.height)
        : null;
    const sha256 = createHash('sha256').update(buf).digest('hex');
    const mb = (buf.length / 1024 / 1024).toFixed(1);
    lines.push(
      `✓ ${family.artworkFile} — ${info.width}×${info.height}px, ${info.colorType}${info.alpha ? ' (transparent bg possible)' : ' (no alpha)'}, ${info.bitDepth}-bit, ${info.dpi ? `${info.dpi} DPI` : 'no DPI metadata'}, ${mb} MB`,
    );
    if (family.release !== 'v1') {
      lines.push(
        '  · V2 personalization-ready master: kept and checked, not for V1 sale',
      );
    }
    const locked = LOCKED_MASTERS[family.artworkFile];
    if (locked) {
      const sha = createHash('sha256').update(buf).digest('hex');
      if (sha !== locked.sha256) {
        lines.push(
          `  ✗ locked master changed (${locked.reason}): expected ${locked.sha256.slice(0, 12)}…, got ${sha.slice(0, 12)}…`,
        );
        problems++;
      } else {
        lines.push(`  ✓ matches locked version (${locked.reason})`);
      }
    }
    const revision = ARTWORK_REVISIONS[family.handle];
    if (revision) {
      lines.push(`  ✗ content revision required: ${revision}`);
      problems++;
    }
    if (!pixels) {
      lines.push('  ! pixel checks skipped (expected 8-bit RGBA)');
    } else {
      if (!pixels.transparentBackground) {
        lines.push('  ✗ background is not transparent');
        problems++;
      }
      if (pixels.cuts.length) {
        const where = pixels.cuts
          .map((c) => `rows ${c.from}–${c.to} (${c.columns} columns)`)
          .join(', ');
        lines.push(
          `  ✗ erased strips cut through artwork: ${where} — letters have missing sections`,
        );
        problems++;
      }
      const rule = pixels.rule;
      if (rule) {
        const minGap = Math.min(rule.clearAbove, rule.clearBelow);
        const detail = rule.overlapRows
          ? `text runs through the red rule (${rule.overlapRows} rows of overlap)`
          : `clear space ${rule.clearAbove}px above, ${rule.clearBelow}px below`;
        if (rule.overlapRows > 0 || minGap < RULE_COLLISION) {
          lines.push(`  ✗ red rule collides with text: ${detail}`);
          problems++;
        } else if (minGap < RULE_COMFORT && family.release === 'v1') {
          // V1 brand standard: at least 40px clear space, no exceptions.
          lines.push(
            `  ✗ red rule too close to text: ${detail} (V1 minimum ${RULE_COMFORT}px)`,
          );
          problems++;
        } else if (minGap < RULE_COMFORT) {
          lines.push(
            `  ! red rule is tight: ${detail} (V2 master; ${RULE_COMFORT}px recommended)`,
          );
        } else {
          lines.push(`  ✓ red rule clear of text: ${detail}`);
        }
      }
      if (pixels.edgeClipped) {
        lines.push(
          `  ✗ artwork touches the canvas edge (left rows ${pixels.rowsTouchingLeft}, right rows ${pixels.rowsTouchingRight}) — text/graphics are cut off in the master`,
        );
        problems++;
      } else {
        const m = pixels.margins;
        lines.push(
          `  ✓ safe margins L${m.left} R${m.right} T${m.top} B${m.bottom}px, transparent background`,
        );
      }
    }
    manifest.push({
      family: family.handle,
      name: family.name,
      file: family.artworkFile,
      ...info,
      ...pixels,
      bytes: buf.length,
      sha256,
    });
  }

  const unexpected = present.filter((f) => !expected.has(f));
  for (const file of unexpected) {
    lines.push(
      `! ${file} — not a recognised production master (moodboards/mockups must not be sent to suppliers)`,
    );
  }

  if (manifest.length) {
    writeFileSync(
      'catalogue/artwork-manifest.json',
      JSON.stringify(manifest, null, 2) + '\n',
    );
    lines.push('', 'Wrote catalogue/artwork-manifest.json');
  }
}

lines.push(
  '',
  problems
    ? `${problems} problem(s).`
    : 'All 10 production masters present and print-safe.',
);
// eslint-disable-next-line no-console
console.log(lines.join('\n'));
process.exitCode = problems ? 1 : 0;
