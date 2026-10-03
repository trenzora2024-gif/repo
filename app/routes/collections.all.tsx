import {useLoaderData} from 'react-router';
import type {Route} from './+types/collections.all';
import {getPaginationVariables} from '@shopify/hydrogen';
import {CollectionView, productSort} from '~/components/CollectionView';
import {COLLECTIONS} from '~/data/catalogue';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import {breadcrumbJsonLd, seoMeta} from '~/lib/seo';

/** "Shop" — every product. Shopify has no API collection for `all`. */
export const meta: Route.MetaFunction = () =>
  seoMeta({
    title: COLLECTIONS.all.seo.title,
    description: COLLECTIONS.all.seo.description,
    path: '/collections/all',
    jsonLd: breadcrumbJsonLd([
      {name: 'Home', path: '/'},
      {name: 'Shop', path: '/collections/all'},
    ]),
  });

export async function loader({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const {sortKey, reverse} = productSort(request);
  const pagination = getPaginationVariables(request, {pageBy: 24});

  const {products} = await storefront.query(CATALOG_QUERY, {
    variables: {sortKey, reverse, ...pagination},
    cache: storefront.CacheShort(),
  });

  return {products};
}

export default function ShopAll() {
  const {products} = useLoaderData<typeof loader>();
  return (
    <CollectionView
      handle="all"
      title="Shop all"
      description={COLLECTIONS.all.description}
      products={products}
    />
  );
}

const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      last: $last
      before: $startCursor
      after: $endCursor
      sortKey: $sortKey
      reverse: $reverse
    ) {
      nodes {
        ...ProductCard
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
