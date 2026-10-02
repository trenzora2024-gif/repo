import type {DesignFamily, ProductTypeHandle} from '../data/catalogue/types.ts';

/**
 * Brand placeholder art.
 *
 * Until supplier mockups/photography are uploaded to Shopify, products render
 * a typographic "concept card": the design family's colours and name on the
 * product silhouette. It is deliberately graphic (not a fake photo) so nobody
 * mistakes it for production artwork.
 *
 * Framework-free so the dev mock Storefront API can serve the same SVGs.
 */

const SILHOUETTES: Record<ProductTypeHandle, string> = {
  // Boxy oversized tee, 600x600 canvas.
  'oversized-tee':
    'M210 120 L260 100 Q300 128 340 100 L390 120 L500 180 L462 270 L420 252 L420 520 L180 520 L180 252 L138 270 L100 180 Z',
  tote: 'M200 120 Q200 60 250 60 L350 60 Q400 60 400 120 L388 120 Q388 76 350 76 L250 76 Q212 76 212 120 Z M150 180 L450 180 L470 530 L130 530 Z',
  tumbler:
    'M220 92 L380 92 L384 128 L216 128 Z M222 132 L378 132 L356 532 Q300 546 244 532 Z',
};

const PRINT_AREA: Record<
  ProductTypeHandle,
  {x: number; y: number; w: number; size: number}
> = {
  'oversized-tee': {x: 300, y: 300, w: 200, size: 40},
  tote: {x: 300, y: 340, w: 230, size: 44},
  tumbler: {x: 300, y: 330, w: 110, size: 26},
};

function esc(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const FONT = `font-family="'Bricolage Grotesque Variable','Arial Black',Impact,system-ui,sans-serif" font-weight="800"`;

function wordLines(
  words: DesignFamily['artWords'],
  cx: number,
  cy: number,
  size: number,
  maxWidth: number,
  fill: string,
) {
  const lines = words.filter(Boolean) as string[];
  const lineHeight = size * 1.02;
  const start = cy - ((lines.length - 1) * lineHeight) / 2;
  return lines
    .map((line, index) => {
      // Shrink long words to fit the print area.
      const fitted = Math.min(size, (maxWidth / (line.length * 0.62)) | 0);
      return `<text x="${cx}" y="${start + index * lineHeight}" text-anchor="middle" dominant-baseline="middle" ${FONT} font-size="${fitted}" letter-spacing="-0.5" fill="${fill}">${esc(line)}</text>`;
    })
    .join('');
}

/** Product concept card: family palette + product silhouette + wordmark. */
export function productArtSvg(
  family: Pick<DesignFamily, 'palette' | 'artWords' | 'number'>,
  type: ProductTypeHandle,
) {
  const {bg, fg, accent} = family.palette;
  const area = PRINT_AREA[type];
  const number = String(family.number).padStart(2, '0');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600"><rect width="600" height="600" fill="${bg}"/><circle cx="520" cy="80" r="140" fill="${accent}" opacity="0.18"/><path d="${SILHOUETTES[type]}" fill="${fg}" fill-rule="evenodd"/>${wordLines(family.artWords, area.x, area.y, area.size, area.w, bg)}<text x="36" y="566" ${FONT} font-size="18" fill="${fg}" opacity="0.85">TRENZORA · ${number}</text></svg>`;
}

/** Large poster for editorial sections (no product silhouette). */
export function posterArtSvg(
  family: Pick<DesignFamily, 'palette' | 'artWords' | 'number'>,
  ratio: 'portrait' | 'square' = 'portrait',
) {
  const {bg, fg, accent} = family.palette;
  const w = 600;
  const h = ratio === 'portrait' ? 750 : 600;
  const number = String(family.number).padStart(2, '0');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${bg}"/><circle cx="${w - 80}" cy="${h - 120}" r="220" fill="${accent}" opacity="0.22"/><circle cx="80" cy="110" r="60" fill="none" stroke="${fg}" stroke-width="2" opacity="0.5"/>${wordLines(family.artWords, w / 2, h / 2, 120, w - 80, fg)}<text x="36" y="${h - 34}" ${FONT} font-size="20" fill="${fg}" opacity="0.85">TRENZORA · ${number}</text></svg>`;
}

export function svgDataUri(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
