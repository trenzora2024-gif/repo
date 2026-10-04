import type {Storefront} from '@shopify/hydrogen';
import type {ProductCardFragment} from 'storefrontapi.generated';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';

/**
 * Products tagged `curated` are the Trenzora US assortment. Legacy products
 * from the old general store stay live at their URLs (Google listings keep
 * working) but never appear in listings, search grids or bundles unless
 * they're tagged. Curating = adding the tag; nothing is deleted.
 */
export const CURATED_TAG = 'curated';

export async function getCuratedProducts(storefront: Storefront) {
  const {products} = await storefront.query(CURATED_PRODUCTS_QUERY, {
    variables: {query: `tag:${CURATED_TAG}`},
    cache: storefront.CacheShort(),
  });
  return products.nodes;
}

export function byHandle(products: ProductCardFragment[]) {
  return new Map(products.map((p) => [p.handle, p]));
}

const CURATED_PRODUCTS_QUERY = `#graphql
  query CuratedProducts(
    $query: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: 100, query: $query) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
