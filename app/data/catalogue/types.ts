/**
 * Trenzora catalogue model.
 *
 * Shopify is the source of truth for anything transactional (price charged,
 * inventory, variants, images, checkout). This catalogue is the source of
 * truth for the *editorial* layer (design stories, product-type specs) and
 * for the structure we push into Shopify (handles, SKUs, tags, SEO).
 *
 * Files in this folder are imported by the storefront AND by Node scripts
 * (`scripts/*.ts`), so they must stay framework-free and use explicit `.ts`
 * import extensions.
 */

export type DesignFamilyHandle =
  | 'mumbai-made'
  | 'local-life'
  | 'corporate-survivor'
  | 'coffee-personality'
  | 'bestie-energy'
  | 'us'
  | 'pet-parent'
  | 'campus-energy'
  | 'desi-roots'
  | 'make-it-yours';

export type ProductTypeHandle = 'oversized-tee' | 'tote' | 'tumbler';

/** Shopify collection handles used at launch. `all` is built into Shopify. */
export type CollectionHandle =
  'all' | 'mumbai-made' | 'drops' | 'personalize' | 'gifts' | 'trending';

export type Release = 'v1' | 'v2';

export type SupplierKey = 'printrove' | 'qikink' | 'vistaprint' | 'kraftix';

export interface Palette {
  /** Background / dominant colour of the design family. */
  bg: string;
  /** Foreground colour that passes contrast on `bg`. */
  fg: string;
  /** Small accent used for highlights. */
  accent: string;
}

export interface PersonalizationField {
  /** Cart line attribute key, shown to the customer at checkout (no leading underscore). */
  key: string;
  label: string;
  maxLength: number;
  placeholder?: string;
  required: boolean;
}

export interface PersonalizationConfig {
  /**
   * Whether the storefront collects personalization at add-to-cart.
   * Kept `false` for V1: static designs launch first. Flip per family once
   * the order-specific artwork pipeline is live (see docs/PERSONALIZATION.md).
   */
  enabled: boolean;
  /** The design is structurally ready for personalization later. */
  planned: boolean;
  fields: PersonalizationField[];
  /** Customer-facing copy shown while personalization is not yet live. */
  comingSoonNote?: string;
}

export interface DesignFamily {
  handle: DesignFamilyHandle;
  /** Sort order + production master prefix (01..10). */
  number: number;
  name: string;
  /** 3-letter SKU code. */
  code: string;
  /** Production master artwork filename (supplier upload, not a mockup). */
  artworkFile: string;
  /**
   * Text as it appears on the production master (verbatim, from the
   * official pack). Used for image alt text and catalogue records.
   */
  artworkText: string;
  /** One-line hook. */
  tagline: string;
  /** Short product story (2–3 sentences). */
  story: string;
  /** What the design is about — the idea behind the artwork. */
  concept: string;
  /** Who it is for. */
  forWho: string;
  /** Words used in the brand-art placeholder and vibe tiles. */
  artWords: [string, string?];
  palette: Palette;
  /** Collections (besides `all`) this family appears in. */
  collections: Exclude<CollectionHandle, 'all'>[];
  /** Short vibe label used by the homepage "What's your vibe?" chips. */
  vibe?: string;
  /** Extra search keywords — written for humans, not stuffing. */
  keywords: string[];
  personalization: PersonalizationConfig;
  drop: string;
  /**
   * `v1`: sellable at launch. `v2`: kept as a design record and
   * personalization-ready concept, but never imported or sold in V1.
   */
  release: Release;
}

export interface ProductTypeSpec {
  handle: ProductTypeHandle;
  /** Name appended to the design: "Mumbai Made — Premium Oversized Tee". */
  name: string;
  shortName: string;
  /** Shopify `productType`. */
  shopifyProductType: string;
  skuCode: string;
  summary: string;
  materials: string[];
  fit?: string;
  printMethod: string;
  care: string[];
  /** Variant option — only apparel has sizes at launch. */
  option?: {name: string; values: string[]};
  /** Grams, used for Shopify shipping weight. Confirm with supplier. */
  weightGrams: number;
}

export interface CatalogueVariant {
  sku: string;
  option?: {name: string; value: string};
  priceInr: number;
}

export interface CatalogueProduct {
  handle: string;
  title: string;
  family: DesignFamily;
  type: ProductTypeSpec;
  vendor: string;
  tags: string[];
  collections: CollectionHandle[];
  priceInr: number;
  variants: CatalogueVariant[];
  seo: {title: string; description: string};
  descriptionHtml: string;
  imageAlt: string;
}
