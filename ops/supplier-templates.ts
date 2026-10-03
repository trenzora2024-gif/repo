import type {
  ProductTypeHandle,
  SupplierKey,
} from '../app/data/catalogue/types.ts';
import {SUPPLIER_BY_PRODUCT_TYPE} from './suppliers.ts';

/**
 * OPERATIONS-ONLY: supplier blank/template mapping per product type.
 *
 * Every supplier-specific fact starts as `null` and is filled in only from
 * the supplier's own spec sheet or designer tool, with the source and date
 * recorded. Nothing here is guessed. `npm run supplier:check` reports what's
 * still missing and, once a print area is known, checks how the locked
 * production master fits it (effective DPI). The artwork is never modified:
 * placement and scale are set in the supplier's designer, not by editing PNGs.
 */
export type PrintArea = {
  /** Printable width and height in inches, from the supplier template. */
  widthIn: number;
  heightIn: number;
};

export type SupplierTemplate = {
  productType: ProductTypeHandle;
  supplier: SupplierKey;
  /** Supplier's product/blank name exactly as listed in their catalogue. */
  blankName: string | null;
  /** Supplier's product or template ID. */
  blankRef: string | null;
  /** Blank colour (owner decision; it must suit the transparent masters). */
  blankColour: string | null;
  /** Where the design sits. Our intent; confirm the supplier supports it. */
  placement: string;
  printArea: PrintArea | null;
  /** Supplier variant ref per size (tee) or 'default'. */
  variantRefs: Record<string, string | null>;
  /** Where the facts above came from, e.g. "Printrove spec sheet, 2026-10-05". */
  source: string | null;
  verified: boolean;
};

/** Effective print resolution below which a fit is flagged. */
export const MIN_EFFECTIVE_DPI = 150;
/** Resolution the masters are authored at (4500×5400 px @ 300 DPI). */
export const MASTER_DPI = 300;

export const SUPPLIER_TEMPLATES: Record<ProductTypeHandle, SupplierTemplate> = {
  'oversized-tee': {
    productType: 'oversized-tee',
    supplier: SUPPLIER_BY_PRODUCT_TYPE['oversized-tee'],
    // Working mapping (Gate 4D), pending Printrove's written quote.
    blankName: 'Oversized T-shirts',
    blankRef: null,
    // Owner decision 2026-10-03: White only for V1 (no other colours).
    blankColour: 'White',
    placement: 'Front, centred, below the collar',
    // "Design Template 15.60 x 19.60 inches (W x H) – Front".
    printArea: {widthIn: 15.6, heightIn: 19.6},
    // XXL ↔ Printrove 2XL is unconfirmed (no Printrove page says "XXL").
    variantRefs: {S: null, M: null, L: null, XL: null, XXL: null},
    source:
      'https://printrove.com/products/oversized-t-shirts (product page, 2026-10-03)',
    verified: false,
  },
  tote: {
    productType: 'tote',
    supplier: SUPPLIER_BY_PRODUCT_TYPE.tote,
    // Working mapping (Gate 4D), pending Qikink's written quote.
    blankName: 'Unisex Tote Bag Zipper (type Standard)',
    blankRef: 'TbZp',
    // Owner decision 2026-10-03: White (Qikink's lightest colour) only for V1.
    blankColour: 'White',
    placement: 'One side, centred',
    // "maxPrintableAreaInches": DTF, DTG "10 x 12 inches"; POD prints the front.
    printArea: {widthIn: 10, heightIn: 12},
    variantRefs: {default: null},
    source:
      'https://qikink.com/custom/bags/tote-bag/ (product page, 2026-10-03)',
    verified: false,
  },
  tumbler: {
    productType: 'tumbler',
    supplier: SUPPLIER_BY_PRODUCT_TYPE.tumbler,
    // Working mapping (Gate 4D). Owner decision 2026-10-03: White, the only
    // colour Qikink lists.
    blankName: 'Tumbler Bottle (20 Oz)',
    blankRef: 'Tumb',
    blankColour: 'White',
    placement:
      'Wrap: design centred on the front face of the wrap, transparent elsewhere',
    // "maxPrintableAreaInches": "9.5 x 8 inches", printed around the tumbler.
    printArea: {widthIn: 9.5, heightIn: 8},
    variantRefs: {default: null},
    source:
      'https://qikink.com/custom/drinkware/tumbler-bottle/ (product page, 2026-10-03)',
    verified: false,
  },
};

/** Fields that must be filled before a template counts as confirmed. */
export function missingTemplateFields(template: SupplierTemplate) {
  const missing: string[] = [];
  if (!template.blankName) missing.push('blankName');
  if (!template.blankRef) missing.push('blankRef');
  if (!template.blankColour) missing.push('blankColour');
  if (!template.printArea) missing.push('printArea');
  for (const [key, value] of Object.entries(template.variantRefs)) {
    if (!value) missing.push(`variantRefs.${key}`);
  }
  if (!template.source) missing.push('source');
  if (!template.verified) missing.push('verified');
  return missing;
}

/**
 * How a master's inked area fits a print area when scaled uniformly to the
 * largest size that fits. Returns the print size in inches and the effective
 * DPI. Read-only arithmetic on the artwork's measured ink bounds.
 */
export function fitArtwork(
  ink: {widthPx: number; heightPx: number},
  area: PrintArea,
) {
  const scale = Math.min(
    area.widthIn / ink.widthPx,
    area.heightIn / ink.heightPx,
  );
  const printedWidthIn = ink.widthPx * scale;
  const printedHeightIn = ink.heightPx * scale;
  const effectiveDpi = 1 / scale;
  return {
    printedWidthIn: Math.round(printedWidthIn * 100) / 100,
    printedHeightIn: Math.round(printedHeightIn * 100) / 100,
    effectiveDpi: Math.round(effectiveDpi),
    ok: effectiveDpi >= MIN_EFFECTIVE_DPI,
  };
}
