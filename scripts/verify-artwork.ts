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
      if (line[x * 4 + 3]) {
        if (rowMin < 0) rowMin = x;
        rowMax = x;
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
  return {
    transparentBackground: cornersTransparent,
    inkBounds: {x: [minX, maxX], y: [minY, maxY]},
    margins: {
      left: minX,
      right: width - 1 - maxX,
      top: minY,
      bottom: height - 1 - maxY,
    },
    edgeClipped:
      rowsTouchingLeft > 0 ||
      rowsTouchingRight > 0 ||
      minY === 0 ||
      maxY === height - 1,
    rowsTouchingLeft,
    rowsTouchingRight,
  };
}

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
    if (!pixels) {
      lines.push('  ! pixel checks skipped (expected 8-bit RGBA)');
    } else {
      if (!pixels.transparentBackground) {
        lines.push('  ✗ background is not transparent');
        problems++;
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
