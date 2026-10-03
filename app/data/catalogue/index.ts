import {DESIGN_FAMILIES, getDesignFamily} from './design-families.ts';
import {PRODUCT_TYPES, getProductType} from './product-types.ts';
import {PRICE_OVERRIDES_INR, RETAIL_PRICE_INR} from './pricing.ts';
import type {
  CatalogueProduct,
  CollectionHandle,
  DesignFamily,
  ProductTypeSpec,
  Release,
} from './types.ts';

export * from './types.ts';
export {DESIGN_FAMILIES, getDesignFamily} from './design-families.ts';
export {PRODUCT_TYPES, getProductType} from './product-types.ts';

export const VENDOR = 'Trenzora';

/**
 * Tag conventions pushed to Shopify. The storefront reads these to join a
 * Shopify product with its editorial content, and smart collections use them
 * as rules (see catalogue/collections.md).
 */
export const TAG = {
  design: (handle: string) => `design:${handle}`,
  type: (handle: string) => `type:${handle}`,
  collection: (handle: string) => `col:${handle}`,
  drop: (drop: string) => `drop:${drop}`,
  personalizable: 'personalizable',
} as const;

/**
 * Storefront API search filter for one tag. Values are double-quoted because
 * Trenzora tags contain colons (`design:mumbai-made`).
 */
export function tagQuery(tag: string) {
  return `tag:"${tag.replace(/"/g, '')}"`;
}

export const COLLECTIONS: Record<
  CollectionHandle,
  {
    title: string;
    description: string;
    /** Search title/description (Shopify collection SEO fields). */
    seo: {title: string; description: string};
    rule: string;
    release: Release;
  }
> = {
  all: {
    title: 'Shop All',
    description:
      'Eight originals. Tee, tote, tumbler. Printed to order in India.',
    seo: {
      title: 'Shop All — Oversized Tees, Totes & Tumblers',
      description:
        'Shop all eight Trenzora originals: premium oversized tees, canvas totes and 20oz tumblers. Designed in India, printed to order and delivered across India.',
    },
    rule: 'Built-in Shopify collection',
    release: 'v1',
  },
  'mumbai-made': {
    title: 'Mumbai Made',
    description: 'Drop 01. Four designs for the city that keeps moving.',
    seo: {
      title: 'Mumbai Made — Drop 01 Tees, Totes & Tumblers',
      description:
        'Drop 01: Mumbai Made, Local Legend, Bombay Coffee Club and माझी मुंबई on oversized tees, totes and tumblers. Original designs, printed to order in India.',
    },
    rule: 'Product tag equals col:mumbai-made',
    release: 'v1',
  },
  drops: {
    title: 'Drops',
    description: 'Original designs, released in drops.',
    seo: {
      title: 'Drops — Original Design Tees, Totes & Tumblers',
      description:
        'Original Trenzora designs, released in drops: premium oversized tees, canvas totes and 20oz tumblers, printed to order and delivered across India.',
    },
    rule: 'Product tag equals col:drops',
    release: 'v1',
  },
  personalize: {
    title: 'Personalize',
    description:
      'Designs made to carry your names, city and date, launching with personalization.',
    seo: {
      title: 'Personalize — Coming Soon',
      description:
        'Personalized Trenzora designs that carry your names, city and date are coming soon. Join the list for early access.',
    },
    rule: 'Product tag equals col:personalize',
    // V2: only personalization designs belong here; not created in V1.
    release: 'v2',
  },
  gifts: {
    title: 'Gifts',
    description: 'For the people who get the joke.',
    seo: {
      title: 'Gifts with Personality — Tees, Totes & Tumblers',
      description:
        'Gifts for besties, colleagues, coffee people, pet parents and Mumbaikars: original-design tees, totes and tumblers, printed to order in India.',
    },
    rule: 'Product tag equals col:gifts',
    release: 'v1',
  },
  trending: {
    title: 'The Edit',
    description: 'Where to start.',
    seo: {
      title: 'The Edit — Trenzora Originals to Start With',
      description:
        'The Edit: four Trenzora originals to start with, from Mumbai Made to Corporate Survivor, on oversized tees, canvas totes and 20oz tumblers.',
    },
    rule: 'Product tag equals col:trending (editorial until sales data exists)',
    release: 'v1',
  },
};

export function productHandle(family: DesignFamily, type: ProductTypeSpec) {
  return `${family.handle}-${type.handle}`;
}

export function productTitle(family: DesignFamily, type: ProductTypeSpec) {
  return `${family.name} — ${type.name}`;
}

function priceFor(family: DesignFamily, type: ProductTypeSpec) {
  return (
    PRICE_OVERRIDES_INR[`${family.handle}:${type.handle}`] ??
    RETAIL_PRICE_INR[type.handle]
  );
}

function skuBase(family: DesignFamily, type: ProductTypeSpec) {
  return `TRZ-${family.code}-${type.skuCode}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildProduct(
  family: DesignFamily,
  type: ProductTypeSpec,
): CatalogueProduct {
  const price = priceFor(family, type);
  const base = skuBase(family, type);
  const title = productTitle(family, type);
  const collections: CollectionHandle[] = ['all', ...family.collections];

  const tags = [
    TAG.design(family.handle),
    TAG.type(type.handle),
    TAG.drop(family.drop),
    ...family.collections.map(TAG.collection),
    ...(family.personalization.planned ? [TAG.personalizable] : []),
  ];

  const variants = type.option
    ? type.option.values.map((value) => ({
        sku: `${base}-${value}`,
        option: {name: type.option!.name, value},
        priceInr: price,
      }))
    : [{sku: base, priceInr: price}];

  return {
    handle: productHandle(family, type),
    title,
    family,
    type,
    vendor: VENDOR,
    tags,
    collections,
    priceInr: price,
    variants,
    seo: {
      title: `${title} | Trenzora`,
      description:
        `${family.tagline} ${type.summary} Original Trenzora design, made to order in India.`.slice(
          0,
          160,
        ),
    },
    descriptionHtml: `<p>${escapeHtml(family.story)}</p><p>${escapeHtml(type.summary)}</p>`,
    imageAlt: `${family.name} — “${family.artworkText}” typographic design printed on a Trenzora ${type.shortName.toLowerCase()}`,
  };
}

/** Every design record: 10 designs × 3 hero products (V1 + V2). */
export const CATALOGUE: CatalogueProduct[] = DESIGN_FAMILIES.flatMap((family) =>
  PRODUCT_TYPES.map((type) => buildProduct(family, type)),
);

/** V1 design families (8) — the only ones sold at launch. */
export const LAUNCH_FAMILIES = DESIGN_FAMILIES.filter(
  (f) => f.release === 'v1',
);

/** The V1 sellable catalogue: 8 designs × 3 products = 24 products. */
export const LAUNCH_CATALOGUE = CATALOGUE.filter(
  (product) => product.family.release === 'v1',
);

/** Collections that exist in Shopify at launch. */
export const LAUNCH_COLLECTIONS = (
  Object.keys(COLLECTIONS) as CollectionHandle[]
).filter((handle) => COLLECTIONS[handle].release === 'v1');

export function getCatalogueProduct(handle: string | undefined | null) {
  return CATALOGUE.find((product) => product.handle === handle);
}

/**
 * Join a Shopify product to its editorial content. Prefers tags (so handles
 * can change in Shopify without breaking content), falls back to the handle
 * convention `{design}-{type}`.
 */
export function resolveCatalogueEntry(input: {
  handle: string;
  tags?: string[] | null;
}): {family: DesignFamily; type?: ProductTypeSpec} | null {
  const tags = input.tags ?? [];
  const designTag = tags.find((tag) => tag.startsWith('design:'));
  const typeTag = tags.find((tag) => tag.startsWith('type:'));
  const familyFromTag = getDesignFamily(designTag?.slice('design:'.length));
  const typeFromTag = getProductType(typeTag?.slice('type:'.length));

  if (familyFromTag) {
    return {family: familyFromTag, type: typeFromTag};
  }

  const fromHandle = getCatalogueProduct(input.handle);
  if (fromHandle) return {family: fromHandle.family, type: fromHandle.type};
  return null;
}
