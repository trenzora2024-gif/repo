import type {MetaDescriptor} from 'react-router';
import {RETURNS, SITE} from '~/data/site';

/**
 * One place to build page metadata: unique title, description, canonical,
 * Open Graph, Twitter and JSON-LD. Every route's `meta` calls `seoMeta`.
 */
type SeoInput = {
  title: string;
  description: string;
  /** Path (e.g. `/products/x`) or absolute URL. */
  path: string;
  image?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  type?: 'website' | 'product' | 'article';
  noindex?: boolean;
  jsonLd?: object | object[];
};

export function absoluteUrl(path: string, origin: string = SITE.url) {
  if (/^https?:\/\//.test(path)) return path;
  return `${origin.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

export function seoMeta({
  title,
  description,
  path,
  image,
  type = 'website',
  noindex,
  jsonLd,
}: SeoInput): MetaDescriptor[] {
  const url = absoluteUrl(path.split('?')[0]);
  const fullTitle = title.includes(SITE.name) ? title : `${title} | ${SITE.name}`;
  const desc =
    description.length > 160 ? `${description.slice(0, 157)}…` : description;

  const tags: MetaDescriptor[] = [
    {title: fullTitle},
    {name: 'description', content: desc},
    {tagName: 'link', rel: 'canonical', href: url},
    {property: 'og:site_name', content: SITE.name},
    {property: 'og:locale', content: SITE.locale},
    {property: 'og:type', content: type === 'product' ? 'product' : type},
    {property: 'og:title', content: fullTitle},
    {property: 'og:description', content: desc},
    {property: 'og:url', content: url},
    {name: 'twitter:card', content: image ? 'summary_large_image' : 'summary'},
    {name: 'twitter:title', content: fullTitle},
    {name: 'twitter:description', content: desc},
  ];

  if (image?.url) {
    tags.push(
      {property: 'og:image', content: image.url},
      {property: 'og:image:alt', content: image.altText ?? fullTitle},
      {name: 'twitter:image', content: image.url},
    );
    if (image.width)
      tags.push({property: 'og:image:width', content: String(image.width)});
    if (image.height)
      tags.push({property: 'og:image:height', content: String(image.height)});
  }

  if (noindex) tags.push({name: 'robots', content: 'noindex,follow'});

  const graphs = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  for (const graph of graphs) tags.push({'script:ld+json': graph});

  return tags;
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: SITE.name,
    url: SITE.url,
    slogan: SITE.positioning,
    email: SITE.contactEmail,
    sameAs: Object.values(SITE.social),
    hasMerchantReturnPolicy: merchantReturnPolicy(),
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbJsonLd(items: Array<{name: string; path: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Mirrors RETURNS in data/site.ts — keep the two in sync. */
export function merchantReturnPolicy() {
  return {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'US',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 30,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/FreeReturn',
    description: RETURNS.summary,
  };
}

/** Mirrors SHIPPING in data/site.ts (free, 1–3 + 3–7 business days). */
export function shippingDetails() {
  return {
    '@type': 'OfferShippingDetails',
    shippingRate: {'@type': 'MonetaryAmount', value: 0, currency: 'USD'},
    shippingDestination: {'@type': 'DefinedRegion', addressCountry: 'US'},
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: {'@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY'},
      transitTime: {'@type': 'QuantitativeValue', minValue: 3, maxValue: 7, unitCode: 'DAY'},
    },
  };
}

type ProductForLd = {
  title: string;
  handle: string;
  vendor: string;
  description: string;
  productType?: string | null;
  images: Array<{url: string}>;
  variants: Array<{
    id: string;
    sku?: string | null;
    barcode?: string | null;
    title: string;
    availableForSale: boolean;
    price: {amount: string; currencyCode: string};
  }>;
};

/**
 * Product structured data matching Google Merchant listings: brand is the
 * real manufacturer (Shopify vendor), GTIN from the variant barcode when
 * present, otherwise identifier_exists is left to the feed. Price and
 * availability come straight from the Storefront API so they always match
 * the Merchant Center feed.
 */
export function productJsonLd(product: ProductForLd) {
  const url = absoluteUrl(`/products/${product.handle}`);
  const offers = product.variants.map((variant) => {
    const offer: Record<string, unknown> = {
      '@type': 'Offer',
      url: product.variants.length > 1 ? `${url}?variant=${variant.id.split('/').pop()}` : url,
      price: Number(variant.price.amount).toFixed(2),
      priceCurrency: variant.price.currencyCode,
      availability: variant.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {'@type': 'Organization', name: SITE.name},
      shippingDetails: shippingDetails(),
      hasMerchantReturnPolicy: merchantReturnPolicy(),
    };
    if (variant.sku) offer.sku = variant.sku;
    const gtin = variant.barcode?.replace(/\D/g, '');
    if (gtin && [8, 12, 13, 14].includes(gtin.length)) offer.gtin = gtin;
    return offer;
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description.slice(0, 5000),
    url,
    image: product.images.map((i) => i.url),
    brand: {'@type': 'Brand', name: product.vendor},
    category: product.productType || undefined,
    sku: product.variants[0]?.sku || undefined,
    offers,
  };
}

export function articleJsonLd(guide: {
  title: string;
  description: string;
  handle: string;
  updated: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    dateModified: guide.updated,
    datePublished: guide.updated,
    mainEntityOfPage: absoluteUrl(`/guides/${guide.handle}`),
    author: {'@type': 'Organization', name: SITE.name},
    publisher: {'@type': 'Organization', name: SITE.name},
  };
}

export function faqJsonLd(faq: ReadonlyArray<{q: string; a: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {'@type': 'Answer', text: item.a},
    })),
  };
}

