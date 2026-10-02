import type {Route} from './+types/[sitemap.xml]';
import {getSitemapIndex} from '@shopify/hydrogen';

export async function loader({
  request,
  context: {storefront},
}: Route.LoaderArgs) {
  const response = await getSitemapIndex({
    storefront,
    request,
    types: ['products', 'collections', 'pages'],
    // Brand pages + design-family pages that live only in Hydrogen.
    customChildSitemaps: ['/sitemap-trenzora.xml'],
  });

  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return response;
}
