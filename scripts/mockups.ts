// Product mockup pipeline: validate supplier mockups and build the upload plan.
//   npm run mockups:check            (add -- --dir <path> to check elsewhere)
//
// Expects supplier-generated mockups (exported from the supplier's designer
// using the locked production masters) at:
//   artwork/mockups/<product-handle>/<NN>[-label].jpg|png|webp
// e.g. artwork/mockups/mumbai-made-oversized-tee/01-front.jpg
//
// Checks every V1 product has at least one image, rejects V2 handles and
// unknown folders, and checks format, pixel size, square ratio and file size.
// Writes catalogue/mockup-manifest.json: the per-product upload plan (order +
// alt text) for catalogue/admin/product-media.graphql. Images are only read,
// never modified; concept cards are never part of the plan.
import {createHash} from 'node:crypto';
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import {join} from 'node:path';
import {CATALOGUE, LAUNCH_CATALOGUE} from '../app/data/catalogue/index.ts';

const args = process.argv.slice(2);
const dir = args.includes('--dir')
  ? args[args.indexOf('--dir') + 1]
  : 'artwork/mockups';

/** Shopify accepts up to 20 MB / 20 MP; 2048 px square is its recommendation. */
const MIN_SIDE = 2048;
const MAX_BYTES = 20 * 1024 * 1024;
const MAX_MEGAPIXELS = 20;
const SQUARE_TOLERANCE = 0.02;
const FILE_RE = /^(\d{2})(?:-([a-z0-9-]+))?\.(jpe?g|png|webp)$/i;

function imageSize(
  buf: Buffer,
): {width: number; height: number; format: string} | null {
  // PNG
  if (buf.readUInt32BE(0) === 0x89504e47) {
    return {
      width: buf.readUInt32BE(16),
      height: buf.readUInt32BE(20),
      format: 'png',
    };
  }
  // JPEG: walk segments to the first SOFn marker.
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) return null;
      const marker = buf[i + 1];
      const length = buf.readUInt16BE(i + 2);
      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        ![0xc4, 0xc8, 0xcc].includes(marker)
      ) {
        return {
          height: buf.readUInt16BE(i + 5),
          width: buf.readUInt16BE(i + 7),
          format: 'jpeg',
        };
      }
      i += 2 + length;
    }
    return null;
  }
  // WebP
  if (
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    const chunk = buf.toString('ascii', 12, 16);
    if (chunk === 'VP8X') {
      return {
        width: 1 + buf.readUIntLE(24, 3),
        height: 1 + buf.readUIntLE(27, 3),
        format: 'webp',
      };
    }
    if (chunk === 'VP8 ') {
      return {
        width: buf.readUInt16LE(26) & 0x3fff,
        height: buf.readUInt16LE(28) & 0x3fff,
        format: 'webp',
      };
    }
    if (chunk === 'VP8L') {
      const bits = buf.readUInt32LE(21);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
        format: 'webp',
      };
    }
  }
  return null;
}

const launch = new Map(LAUNCH_CATALOGUE.map((p) => [p.handle, p]));
const v2 = new Set(
  CATALOGUE.filter((p) => !launch.has(p.handle)).map((p) => p.handle),
);
const errors: string[] = [];
const warnings: string[] = [];
const plan: {
  handle: string;
  title: string;
  images: {
    file: string;
    position: number;
    alt: string;
    width: number;
    height: number;
    bytes: number;
    sha256: string;
    mimeType: string;
  }[];
}[] = [];

const folders = existsSync(dir)
  ? readdirSync(dir).filter((f) => statSync(join(dir, f)).isDirectory())
  : [];

for (const folder of folders) {
  if (v2.has(folder))
    errors.push(`${folder}: V2 product — not part of V1, remove it`);
  else if (!launch.has(folder))
    errors.push(`${folder}: no V1 product with this handle`);
}

for (const product of LAUNCH_CATALOGUE) {
  const folder = join(dir, product.handle);
  const files = existsSync(folder) ? readdirSync(folder).sort() : [];
  const images: (typeof plan)[number]['images'] = [];
  for (const file of files) {
    if (file.startsWith('.')) continue;
    const where = `${product.handle}/${file}`;
    const match = FILE_RE.exec(file);
    if (!match) {
      errors.push(`${where}: name must be NN[-label].jpg|png|webp`);
      continue;
    }
    const buf = readFileSync(join(folder, file));
    const size = imageSize(buf);
    if (!size) {
      errors.push(`${where}: not a readable JPEG/PNG/WebP`);
      continue;
    }
    const {width, height, format} = size;
    if (buf.length > MAX_BYTES)
      errors.push(`${where}: ${(buf.length / 1048576).toFixed(1)} MB > 20 MB`);
    if ((width * height) / 1e6 > MAX_MEGAPIXELS)
      errors.push(`${where}: over 20 megapixels`);
    if (Math.min(width, height) < MIN_SIDE)
      warnings.push(
        `${where}: ${width}×${height}; ${MIN_SIDE}px+ square recommended`,
      );
    if (Math.abs(width / height - 1) > SQUARE_TOLERANCE)
      warnings.push(
        `${where}: ${width}×${height} is not square; the storefront crops to 1:1`,
      );
    const label = match[2] ? ` (${match[2].replace(/-/g, ' ')})` : '';
    images.push({
      file: where,
      position: Number(match[1]),
      alt:
        images.length === 0 ? product.imageAlt : `${product.imageAlt}${label}`,
      width,
      height,
      bytes: buf.length,
      sha256: createHash('sha256').update(buf).digest('hex'),
      mimeType: `image/${format}`,
    });
  }
  const positions = images.map((i) => i.position);
  if (new Set(positions).size !== positions.length)
    errors.push(`${product.handle}: duplicate NN prefixes`);
  if (!images.length) errors.push(`${product.handle}: no mockups yet`);
  plan.push({handle: product.handle, title: product.title, images});
}

const withImages = plan.filter((p) => p.images.length).length;
writeFileSync(
  'catalogue/mockup-manifest.json',
  JSON.stringify(
    {dir, products: plan.length, productsWithImages: withImages, plan},
    null,
    2,
  ) + '\n',
);

const lines = [
  `Trenzora mockups (${dir}): ${withImages}/${plan.length} V1 products have images`,
  ...errors.map((e) => `  ✗ ${e}`),
  ...warnings.map((w) => `  ! ${w}`),
  errors.length ? '' : 'Mockup set complete.',
];
// eslint-disable-next-line no-console
console.log(lines.join('\n'));
if (errors.length) process.exitCode = 1;
