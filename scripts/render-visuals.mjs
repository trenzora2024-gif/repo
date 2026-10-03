// Studio renders of the approved artwork on Trenzora blanks.
//   node scripts/render-visuals.mjs            (npm run visuals:render)
//
// Reads the locked production masters (artwork/masters/NN_*.png) and renders
// product images + homepage editorial images into public/visuals/. The master
// PNG is placed whole and scaled uniformly, exactly as a print file would be
// in a supplier designer; it is never cropped, recoloured, redrawn or edited.
// Blanks, fabric, light and backdrops are drawn here in SVG.
//
// These are STUDIO RENDERS, not photographs. Replace with supplier mockups /
// real photography as they become available (docs/GRAPHICS-ROADMAP.md).
import {createRequire} from 'node:module';
import {execFileSync, execSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({chromium} = require('playwright'));
} catch {
  const root = execSync('npm root -g').toString().trim();
  ({chromium} = require(join(root, 'playwright')));
}

const OUT = 'public/visuals';
const QUALITY = 78;
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));

/* V1 families: master file + studio tone (kept in sync with
 * app/data/catalogue/design-families.ts palette.bg). */
const FAMILIES = [
  ['mumbai-made', '01_mumbai_made.png', '#B4432C'],
  ['local-life', '02_local_life.png', '#D3A23B'],
  ['corporate-survivor', '03_corporate_survivor.png', '#2E3A4B'],
  ['coffee-personality', '04_coffee_personality.png', '#5B3A29'],
  ['bestie-energy', '05_bestie_energy.png', '#DFA3AE'],
  ['pet-parent', '07_pet_parent.png', '#6C8466'],
  ['campus-energy', '08_campus_energy.png', '#2E4593'],
  ['desi-roots', '09_desi_roots.png', '#1E5B57'],
].map(([handle, file, tone]) => ({handle, file, tone}));

const PAPER = '#DCD5C8'; // neutral studio sweep
const MASTER_W = 4500;
const MASTER_H = 5400;

const masters = Object.fromEntries(
  FAMILIES.map((f) => {
    const path = join('artwork/masters', f.file);
    if (!existsSync(path)) throw new Error(`Missing master ${path}`);
    return [
      f.handle,
      `data:image/png;base64,${readFileSync(path).toString('base64')}`,
    ];
  }),
);

/* ------------------------------------------------------------ SVG parts */
const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) =>
    Math.max(
      0,
      Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)),
    ),
  );
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

function defs(id, {grain = 1} = {}) {
  return `
  <filter id="${id}-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="18"/></filter>
  <filter id="${id}-softer" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="40"/></filter>
  <filter id="${id}-contact" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="4"/></filter>
  <filter id="${id}-fold" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="${id}-knit" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="${0.9 * grain}" numOctaves="2" seed="7"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 0.62"/>
  </filter>
  <filter id="${id}-canvas" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="turbulence" baseFrequency="${0.55 * grain} ${0.09 * grain}" numOctaves="1" seed="3" result="a"/>
    <feTurbulence type="turbulence" baseFrequency="${0.09 * grain} ${0.55 * grain}" numOctaves="1" seed="5" result="b"/>
    <feBlend in="a" in2="b" mode="multiply"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.28  0 0 0 0 0.18  0 0 0 -0.9 0.55"/>
  </filter>
  <filter id="${id}-paper" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed="11"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 0.5"/>
  </filter>
  <filter id="${id}-ink" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="2" seed="9" result="w"/>
    <feDisplacementMap in="SourceGraphic" in2="w" scale="5" xChannelSelector="R" yChannelSelector="G"/>
  </filter>`;
}

/** Backdrop: seamless paper with grain, a window-light pattern and vignette. */
function backdrop(id, w, h, tone, {light = true, angle = -28} = {}) {
  const bars = light
    ? `<g filter="url(#${id}-softer)" opacity="0.5" transform="rotate(${angle} ${w / 2} ${h / 2})">
        ${[0, 1, 2, 3]
          .map(
            (i) =>
              `<rect x="${-w * 0.2 + i * w * 0.34}" y="${-h * 0.5}" width="${w * 0.2}" height="${h * 2}" fill="#fff" opacity="0.22"/>`,
          )
          .join('')}
      </g>`
    : '';
  return `
  <rect width="${w}" height="${h}" fill="${tone}"/>
  <radialGradient id="${id}-vig" cx="0.42" cy="0.38" r="0.85">
    <stop offset="0" stop-color="#fff" stop-opacity="0.16"/>
    <stop offset="0.55" stop-color="#fff" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity="0.22"/>
  </radialGradient>
  ${bars}
  <rect width="${w}" height="${h}" fill="url(#${id}-vig)"/>
  <rect width="${w}" height="${h}" filter="url(#${id}-paper)" opacity="0.5"/>`;
}

/* Oversized tee, flat lay. Local units: 1000 × 1100, chest ≈ 540u ≈ 24in. */
const TEE_PATH =
  'M 420 92 C 450 150 550 150 580 92 L 775 135 L 918 388 L 834 458 L 772 432 L 776 1016 Q 500 1036 224 1016 L 228 432 L 166 458 L 82 388 L 225 135 Z';
const TEE_IN = 22.5; // units per inch

function tee(id, master, {colour = '#F2EFE7'} = {}) {
  // Print file 15 × 18 in, top 1 in below the front neckline.
  const pw = 15 * TEE_IN;
  const ph = 18 * TEE_IN;
  return `
  <g>
    <clipPath id="${id}-tee"><path d="${TEE_PATH}"/></clipPath>
    <path d="${TEE_PATH}" fill="#000" opacity="0.28" filter="url(#${id}-soft)" transform="translate(14 22)"/>
    <path d="${TEE_PATH}" fill="#000" opacity="0.2" filter="url(#${id}-contact)" transform="translate(2 4)"/>
    <path d="${TEE_PATH}" fill="${colour}"/>
    <g clip-path="url(#${id}-tee)">
      <path d="M 420 92 Q 500 64 580 92 C 555 150 445 150 420 92 Z" fill="${shade(colour, -0.12)}"/>
      <image href="${master}" x="${500 - pw / 2}" y="${150 + TEE_IN}" width="${pw}" height="${ph}"
        preserveAspectRatio="xMidYMid meet" style="mix-blend-mode:multiply" opacity="0.95" filter="url(#${id}-ink)"/>
      <g filter="url(#${id}-fold)" fill="none" stroke-linecap="round">
        <path d="M 300 470 C 330 640 300 820 330 1000" stroke="#000" stroke-opacity="0.07" stroke-width="34"/>
        <path d="M 700 500 C 660 690 700 860 680 1000" stroke="#000" stroke-opacity="0.06" stroke-width="40"/>
        <path d="M 250 180 C 300 260 330 340 300 430" stroke="#000" stroke-opacity="0.07" stroke-width="30"/>
        <path d="M 760 180 C 700 280 690 360 720 430" stroke="#000" stroke-opacity="0.06" stroke-width="30"/>
        <path d="M 420 600 C 470 640 540 650 600 620" stroke="#fff" stroke-opacity="0.35" stroke-width="40"/>
        <path d="M 360 300 C 430 330 560 330 640 300" stroke="#fff" stroke-opacity="0.3" stroke-width="46"/>
        <path d="M 230 980 C 400 960 600 970 770 990" stroke="#000" stroke-opacity="0.07" stroke-width="30"/>
      </g>
      <path d="${TEE_PATH}" fill="none" stroke="#000" stroke-opacity="0.16" stroke-width="44" filter="url(#${id}-fold)"/>
      <rect width="1000" height="1100" filter="url(#${id}-knit)" opacity="0.32"/>
      <path d="M 420 92 C 450 150 550 150 580 92" fill="none" stroke="${shade(colour, -0.1)}" stroke-width="16"/>
      <path d="M 428 100 C 455 154 545 154 572 100" fill="none" stroke="#000" stroke-opacity="0.12" stroke-width="1.5"/>
      <path d="M 225 135 C 235 250 232 350 228 432" fill="none" stroke="#000" stroke-opacity="0.09" stroke-width="2"/>
      <path d="M 775 135 C 765 250 768 350 772 432" fill="none" stroke="#000" stroke-opacity="0.09" stroke-width="2"/>
      <path d="M 176 446 L 94 378" stroke="#000" stroke-opacity="0.12" stroke-width="1.5" stroke-dasharray="4 5"/>
      <path d="M 824 446 L 906 378" stroke="#000" stroke-opacity="0.12" stroke-width="1.5" stroke-dasharray="4 5"/>
      <path d="M 166 458 L 82 388" stroke="#000" stroke-opacity="0.1" stroke-width="2"/>
      <path d="M 834 458 L 918 388" stroke="#000" stroke-opacity="0.1" stroke-width="2"/>
      <path d="M 232 996 Q 500 1016 768 996" fill="none" stroke="#000" stroke-opacity="0.1" stroke-width="1.5" stroke-dasharray="4 5"/>
    </g>
  </g>`;
}

/* Canvas tote, flat. Local units 1000 × 1100; body 15 in wide (400u). */
const TOTE_BODY = 'M 300 360 L 700 360 L 708 900 Q 500 912 292 900 Z';
const TOTE_IN = 400 / 15;

function tote(id, master, {colour = '#E8DDC7'} = {}) {
  // Print file scaled to 10 in wide, centred, 1.2 in below the top hem.
  const pw = 10 * TOTE_IN;
  const ph = pw * (MASTER_H / MASTER_W);
  const strap = (x1, x2, lift) =>
    `<path d="M ${x1} 372 C ${x1 - 10} ${lift} ${x2 + 10} ${lift} ${x2} 372" fill="none" stroke="${colour}" stroke-width="30"/>
     <path d="M ${x1} 372 C ${x1 - 10} ${lift} ${x2 + 10} ${lift} ${x2} 372" fill="none" stroke="#000" stroke-opacity="0.08" stroke-width="30" filter="url(#${id}-contact)"/>`;
  return `
  <g>
    <clipPath id="${id}-tote"><path d="${TOTE_BODY}"/></clipPath>
    <g opacity="0.26" filter="url(#${id}-soft)" transform="translate(14 22)">
      <path d="${TOTE_BODY}" fill="#000"/>
      <path d="M 370 372 C 360 90 640 90 630 372" fill="none" stroke="#000" stroke-width="30"/>
    </g>
    ${strap(370, 630, 90)}
    ${strap(395, 605, 150)}
    <path d="${TOTE_BODY}" fill="${colour}"/>
    <g clip-path="url(#${id}-tote)">
      <image href="${master}" x="${500 - pw / 2}" y="${360 + 1.2 * TOTE_IN}" width="${pw}" height="${ph}"
        style="mix-blend-mode:multiply" opacity="0.93" filter="url(#${id}-ink)"/>
      <g filter="url(#${id}-fold)" fill="none">
        <path d="M 330 420 C 360 600 340 760 360 890" stroke="#000" stroke-opacity="0.06" stroke-width="30"/>
        <path d="M 640 430 C 620 600 660 760 640 890" stroke="#fff" stroke-opacity="0.3" stroke-width="40"/>
      </g>
      <path d="${TOTE_BODY}" fill="none" stroke="#000" stroke-opacity="0.14" stroke-width="36" filter="url(#${id}-fold)"/>
      <rect width="1000" height="1100" filter="url(#${id}-canvas)" opacity="0.45"/>
      <path d="M 300 392 L 700 392" stroke="#000" stroke-opacity="0.12" stroke-width="1.5" stroke-dasharray="5 6"/>
    </g>
  </g>`;
}

/* 20oz skinny tumbler, front view. Local units 1000 × 1100; body ≈ 3 in. */
function tumbler(id, master, {colour = '#F4F3EF'} = {}) {
  const x = 380;
  const w = 240;
  const top = 250;
  const bottom = 960;
  // Whole print file scaled so the ink fits the front face (≈2.6 in of 3 in).
  const pw = 400;
  const ph = pw * (MASTER_H / MASTER_W);
  const body = `M ${x} ${top} L ${x + w} ${top} L ${x + w - 8} ${bottom} Q 500 ${bottom + 10} ${x + 8} ${bottom} Z`;
  return `
  <g>
    <clipPath id="${id}-cup"><path d="${body}"/></clipPath>
    <linearGradient id="${id}-cyl" x1="0" x2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0.34"/>
      <stop offset="0.12" stop-color="#000" stop-opacity="0.08"/>
      <stop offset="0.3" stop-color="#fff" stop-opacity="0.55"/>
      <stop offset="0.42" stop-color="#fff" stop-opacity="0.05"/>
      <stop offset="0.8" stop-color="#000" stop-opacity="0.1"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.38"/>
    </linearGradient>
    <linearGradient id="${id}-lid" x1="0" x2="1">
      <stop offset="0" stop-color="#9a9a96"/><stop offset="0.3" stop-color="#e9e9e5"/>
      <stop offset="0.5" stop-color="#c7c7c2"/><stop offset="1" stop-color="#8d8d89"/>
    </linearGradient>
    <ellipse cx="520" cy="${bottom + 6}" rx="190" ry="26" fill="#000" opacity="0.3" filter="url(#${id}-soft)"/>
    <ellipse cx="500" cy="${bottom + 2}" rx="118" ry="9" fill="#000" opacity="0.35" filter="url(#${id}-contact)"/>
    <path d="${body}" fill="${colour}"/>
    <g clip-path="url(#${id}-cup)">
      <image href="${master}" x="${500 - pw / 2}" y="${top + 20}" width="${pw}" height="${ph}"
        style="mix-blend-mode:multiply" opacity="0.96" transform="translate(500 0) scale(0.92 1) translate(-500 0)"/>
      <rect x="${x - 10}" y="${top}" width="${w + 20}" height="${bottom - top + 20}" fill="url(#${id}-cyl)"/>
      <rect x="${x}" y="${bottom - 18}" width="${w}" height="30" fill="#000" opacity="0.12"/>
    </g>
    <path d="M ${x - 6} ${top - 52} L ${x + w + 6} ${top - 52} L ${x + w + 4} ${top + 4} L ${x - 4} ${top + 4} Z" fill="url(#${id}-lid)"/>
    <rect x="${x - 6}" y="${top - 60}" width="${w + 12}" height="14" rx="6" fill="#bdbdb8"/>
    <rect x="${x + 70}" y="${top - 58}" width="70" height="8" rx="4" fill="#6f6f6b"/>
    <path d="M ${x - 4} ${top + 4} L ${x + w + 4} ${top + 4}" stroke="#000" stroke-opacity="0.25" stroke-width="3"/>
  </g>`;
}

const subDefs = (id) => ['a', 'b', 'c'].map((k) => defs(id + k)).join('');

const PRODUCT_DRAW = {'oversized-tee': tee, tote, tumbler};

/** Wrap a product (local 1000×1100 units) into a canvas. */
function place(draw, {x, y, scale, rotate = 0}) {
  return `<g transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale}) translate(-500 -550)">${draw}</g>`;
}

function svg(w, h, body, view = `0 0 ${w} ${h}`) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${view}">${body}</svg>`;
}

/* ---------------------------------------------------------------- scenes */
const scenes = [];
const add = (path, w, h, make) => scenes.push({path, w, h, make});

for (const f of FAMILIES) {
  const m = masters[f.handle];
  for (const [type, handle] of [
    ['oversized-tee', `${f.handle}-oversized-tee`],
    ['tote', `${f.handle}-tote`],
    ['tumbler', `${f.handle}-tumbler`],
  ]) {
    const draw = PRODUCT_DRAW[type];
    const S = 1200;
    // 01: neutral studio, straight on.
    add(`products/${handle}/01-studio.webp`, S, S, (id) =>
      svg(
        S,
        S,
        `<defs>${defs(id)}</defs>${backdrop(id, S, S, PAPER, {light: false})}
        ${place(draw(id, m), {x: S / 2, y: S / 2 + 20, scale: type === 'tumbler' ? 1.18 : 1.2})}`,
      ),
    );
    // 02: macro on the print, fabric visible.
    const focus =
      type === 'oversized-tee'
        ? {cx: 500, cy: 330, span: 300}
        : type === 'tote'
          ? {cx: 500, cy: 520, span: 260}
          : {cx: 500, cy: 400, span: 230};
    add(`products/${handle}/02-detail.webp`, S, S, (id) => {
      const scale = S / focus.span;
      return svg(
        S,
        S,
        `<defs>${defs(id, {grain: scale})}</defs>
        <rect width="${S}" height="${S}" fill="${PAPER}"/>
        <g transform="translate(${S / 2} ${S / 2}) scale(${scale}) translate(${-focus.cx} ${-focus.cy})">${draw(id, m)}</g>`,
      );
    });
    // 03: editorial colour set, window light, slight angle.
    add(`products/${handle}/03-editorial.webp`, S, S, (id) =>
      svg(
        S,
        S,
        `<defs>${defs(id)}</defs>${backdrop(id, S, S, f.tone)}
        ${place(draw(id, m), {x: S / 2 + 10, y: S / 2 + 30, scale: type === 'tumbler' ? 1.1 : 1.08, rotate: type === 'tumbler' ? 0 : -6})}
        <g filter="url(#${id}-softer)" opacity="0.35" transform="rotate(-28 ${S / 2} ${S / 2})">
          <rect x="${S * 0.62}" y="${-S}" width="${S * 0.09}" height="${S * 3}" fill="#000"/>
        </g>`,
      ),
    );
  }

  // Family editorial card (4:5): tee hero with tote + tumbler, colour set.
  add(`editorial/${f.handle}-set.webp`, 1200, 1500, (id) =>
    svg(
      1200,
      1500,
      `<defs>${defs(id)}${subDefs(id)}</defs>${backdrop(id, 1200, 1500, f.tone)}
      ${place(tote(id + 'b', m), {x: 930, y: 1130, scale: 0.9, rotate: 7})}
      ${place(tee(id + 'a', m), {x: 520, y: 640, scale: 1.12, rotate: -5})}
      ${place(tumbler(id + 'c', m), {x: 250, y: 1080, scale: 0.74})}`,
    ),
  );
}

// Homepage hero: Mumbai Made, oversized crop, two formats.
const mm = masters['mumbai-made'];
const mmTone = FAMILIES[0].tone;
add('editorial/hero-portrait.webp', 1400, 1750, (id) =>
  svg(
    1400,
    1750,
    `<defs>${defs(id)}${subDefs(id)}</defs>${backdrop(id, 1400, 1750, mmTone)}
    ${place(tote(id + 'b', mm), {x: 1110, y: 1340, scale: 1.05, rotate: 8})}
    ${place(tee(id + 'a', mm), {x: 640, y: 720, scale: 1.45, rotate: -5})}
    ${place(tumbler(id + 'c', mm), {x: 290, y: 1290, scale: 0.88})}`,
  ),
);
add('editorial/hero-wide.webp', 2400, 1500, (id) =>
  svg(
    2400,
    1500,
    `<defs>${defs(id)}${subDefs(id)}</defs>${backdrop(id, 2400, 1500, mmTone)}
    ${place(tote(id + 'b', mm), {x: 1900, y: 820, scale: 1.15, rotate: 8})}
    ${place(tee(id + 'a', mm), {x: 1180, y: 700, scale: 1.4, rotate: -4})}
    ${place(tumbler(id + 'c', mm), {x: 540, y: 880, scale: 1.05})}`,
  ),
);
// Drop 01 story: macro of the Mumbai Made print, wide.
add('editorial/drop01-detail.webp', 2000, 1250, (id) =>
  svg(
    2000,
    1250,
    `<defs>${defs(id, {grain: 5.2})}</defs><rect width="2000" height="1250" fill="${PAPER}"/>
    <g transform="translate(1000 625) scale(5.2) translate(-500 -300)">${tee(id, mm)}</g>
    <g filter="url(#${id}-softer)" transform="rotate(-24 1000 625)" style="mix-blend-mode:multiply">
      ${[0, 1, 2, 3, 4]
        .map(
          (i) =>
            `<rect x="${-600 + i * 640}" y="-1200" width="${150 + (i % 2) * 70}" height="3600" fill="#6b4a35" opacity="0.32"/>`,
        )
        .join('')}
    </g>`,
  ),
);
// One design, three products, neutral (used in "One design, your way").
for (const f of FAMILIES) {
  add(`editorial/${f.handle}-trio.webp`, 2100, 1000, (id) =>
    svg(
      2100,
      1000,
      `<defs>${defs(id)}${subDefs(id)}</defs>${backdrop(id, 2100, 1000, PAPER, {light: false})}
      ${place(tee(id + 'a', masters[f.handle]), {x: 420, y: 500, scale: 0.85})}
      ${place(tote(id + 'b', masters[f.handle]), {x: 1050, y: 470, scale: 0.85})}
      ${place(tumbler(id + 'c', masters[f.handle]), {x: 1680, y: 470, scale: 0.85})}`,
    ),
  );
}

/* ---------------------------------------------------------------- render */
const todo = only.length
  ? scenes.filter((s) => only.some((o) => s.path.includes(o)))
  : scenes;
const browser = await chromium.launch();
const page = await browser.newPage({deviceScaleFactor: 1});
let n = 0;
for (const scene of todo) {
  await page.setViewportSize({width: scene.w, height: scene.h});
  await page.setContent(
    `<html><body style="margin:0;background:#fff">${scene.make('s' + n)}</body></html>`,
  );
  await page.evaluate(async () => {
    await Promise.all(
      [...document.querySelectorAll('image')].map(
        (el) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = img.onerror = resolve;
            img.src = el.getAttribute('href');
          }),
      ),
    );
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );
  });
  const png = await page.screenshot({
    clip: {x: 0, y: 0, width: scene.w, height: scene.h},
  });
  const out = join(OUT, scene.path);
  mkdirSync(dirname(out), {recursive: true});
  execFileSync(
    'convert',
    ['png:-', '-strip', '-quality', String(QUALITY), out],
    {input: png},
  );
  n++;
}
await browser.close();
writeFileSync(
  join(OUT, 'README.md'),
  `# Studio renders (generated)\n\nGenerated by \`npm run visuals:render\` from the locked masters in \`artwork/masters/\`. Masters are placed whole and scaled uniformly; never edited. These are renders, not photographs: replace with supplier mockups and real photography (see docs/GRAPHICS-ROADMAP.md).\n`,
);
// eslint-disable-next-line no-console
console.log(`Rendered ${n} image(s) → ${OUT}/`);
