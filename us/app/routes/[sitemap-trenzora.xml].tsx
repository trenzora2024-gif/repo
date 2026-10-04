import type {Route} from './+types/[sitemap-trenzora.xml]';
import {BUNDLES} from '~/data/bundles';
import {GUIDES} from '~/data/guides';

/** Child sitemap for routes that exist only in Hydrogen (not in Shopify). */
const STATIC_PATHS = [
  '/',
  '/collections',
  '/collections/all',
  '/bundles',
  '/guides',
  '/pages/about',
  '/pages/shipping-returns',
  '/pages/contact',
];

export async function loader({request}: Route.LoaderArgs) {
  const origin = new URL(request.url).origin;
  const paths = [
    ...STATIC_PATHS,
    ...BUNDLES.map((b) => `/bundles/${b.handle}`),
    ...GUIDES.map((g) => `/guides/${g.handle}`),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': `max-age=${60 * 60 * 24}`,
    },
  });
}
