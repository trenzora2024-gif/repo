import type {MetaDescriptor} from 'react-router';
import {SITE} from '~/data/site';

/**
 * One place to build page metadata: unique title, description, canonical,
 * Open Graph, Twitter and JSON-LD. Every route's `meta` calls `seoMeta`.
 */
type SeoInput = {
  title: string;
  description: string;
  /** Path (e.g. `/products/x`) or absolute URL. */
  path: string;
  /** Canonical origin; defaults to the production domain. */
  origin?: string;
  image?: {
    url: string;
    alt?: string | null;
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
  origin,
  image,
  type = 'website',
  noindex,
  jsonLd,
}: SeoInput): MetaDescriptor[] {
  // Pages without their own image share the brand card.
  image = image?.url
    ? image
    : {
        url: absoluteUrl('/brand/og-default.jpg', origin),
        alt: `${SITE.name}: made for people with personality`,
        width: 1200,
        height: 630,
      };
  const url = absoluteUrl(path.split('?')[0], origin);
  const fullTitle = title.includes(SITE.name)
    ? title
    : `${title} | ${SITE.name}`;
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
      {
        property: 'og:image:alt',
        content: image.alt ?? image.altText ?? fullTitle,
      },
      {name: 'twitter:image', content: image.url},
    );
    if (image.width)
      tags.push({property: 'og:image:width', content: String(image.width)});
    if (image.height)
      tags.push({property: 'og:image:height', content: String(image.height)});
  }

  if (noindex) tags.push({name: 'robots', content: 'noindex,follow'});

  const graphs = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  for (const graph of graphs) {
    tags.push({'script:ld+json': graph});
  }

  return tags;
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    slogan: SITE.positioning,
    email: SITE.contactEmail,
    sameAs: Object.values(SITE.social),
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

export function breadcrumbJsonLd(
  items: Array<{name: string; path: string}>,
  origin?: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, origin),
    })),
  };
}
