import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {Analytics, getPaginationVariables} from '@shopify/hydrogen';
import {CollectionView, collectionSort} from '~/components/CollectionView';
import {COLLECTIONS, type CollectionHandle} from '~/data/catalogue';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {breadcrumbJsonLd, seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data) return [{title: 'Collection not found | Trenzora'}];
  const {collection, editorial} = data;
  return seoMeta({
    title: collection.seo?.title || `${collection.title} — Original Designs`,
    description:
      collection.seo?.description ||
      collection.description ||
      editorial?.description ||
      `Shop ${collection.title} at Trenzora.`,
    path: `/collections/${collection.handle}`,
    image: collection.image,
    jsonLd: breadcrumbJsonLd([
      {name: 'Home', path: '/'},
      {name: 'Shop', path: '/collections/all'},
      {name: collection.title, path: `/collections/${collection.handle}`},
    ]),
  });
};

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  if (!handle) throw redirect('/collections/all');
  // V1: personalization is a coming-soon page, not a shoppable collection.
  if (handle === 'personalize') throw redirect('/personalize', 302);

  const {sortKey, reverse} = collectionSort(request);
  const pagination = getPaginationVariables(request, {pageBy: 24});

  const {collection} = await storefront.query(COLLECTION_QUERY, {
    variables: {handle, sortKey, reverse, ...pagination},
    cache: storefront.CacheShort(),
  });

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
    // Only customer-facing fields (not the internal smart-collection rule).
    editorial: COLLECTIONS[handle as CollectionHandle]
      ? {description: COLLECTIONS[handle as CollectionHandle].description}
      : null,
  };
}

export default function Collection() {
  const {collection, editorial} = useLoaderData<typeof loader>();

  return (
    <>
      <CollectionView
        handle={collection.handle}
        title={collection.title}
        description={collection.description || editorial?.description}
        eyebrow={collection.handle === 'mumbai-made' ? 'Drop 01' : 'Collection'}
        products={collection.products}
      />
      <Analytics.CollectionView
        data={{collection: {id: collection.id, handle: collection.handle}}}
      />
    </>
  );
}

const COLLECTION_QUERY = `#graphql
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      seo {
        title
        description
      }
      image {
        url
        altText
        width
        height
      }
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
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
