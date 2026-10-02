import {Form, Link, useLoaderData} from 'react-router';
import type {Route} from './+types/search';
import {Analytics} from '@shopify/hydrogen';
import type {
  PredictiveProductsQuery,
  ProductCardFragment,
} from 'storefrontapi.generated';
import {ProductCard} from '~/components/ProductCard';
import {DESIGN_FAMILIES} from '~/data/catalogue';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import {seoMeta} from '~/lib/seo';

export type PredictiveResult = {
  products: NonNullable<
    PredictiveProductsQuery['predictiveSearch']
  >['products'];
};

export const meta: Route.MetaFunction = ({data}) => {
  const term = data && 'term' in data ? data.term : '';
  return seoMeta({
    title: term ? `Search: ${term}` : 'Search',
    description: 'Search Trenzora original designs — tees, totes and tumblers.',
    path: '/search',
    noindex: true,
  });
};

export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const term = (url.searchParams.get('q') ?? '').trim().slice(0, 100);
  const {storefront} = context;

  // Drawer suggestions (fetcher) — compact payload.
  if (url.searchParams.has('predictive')) {
    if (term.length < 2)
      return {type: 'predictive' as const, term, products: []};
    const {predictiveSearch} = await storefront.query(PREDICTIVE_QUERY, {
      variables: {term, limit: 6},
      cache: storefront.CacheShort(),
    });
    return {
      type: 'predictive' as const,
      term,
      products: predictiveSearch?.products ?? [],
    };
  }

  if (!term)
    return {
      type: 'regular' as const,
      term,
      products: [] as ProductCardFragment[],
    };

  const {search} = await storefront.query(SEARCH_QUERY, {
    variables: {term, first: 48},
    cache: storefront.CacheShort(),
  });
  const products = search.nodes.filter(
    (node): node is ProductCardFragment & {__typename: 'Product'} =>
      node.__typename === 'Product',
  );
  return {type: 'regular' as const, term, products};
}

export default function SearchPage() {
  const data = useLoaderData<typeof loader>();
  if (data.type === 'predictive') return null;
  const {term, products} = data;

  return (
    <div className="container page-end">
      <header className="page-hero">
        <p className="eyebrow">Search</p>
        <h1>{term ? <>Results for “{term}”</> : 'Find your design'}</h1>
        <Form
          method="get"
          action="/search"
          className="search-form"
          role="search"
        >
          <label htmlFor="search-page-input" className="sr-only">
            Search Trenzora
          </label>
          <input
            id="search-page-input"
            className="input"
            type="search"
            name="q"
            defaultValue={term}
            placeholder="Try “Mumbai”, “coffee” or “gift”"
          />
          <button type="submit" className="btn btn--primary">
            Search
          </button>
        </Form>
      </header>

      {term && products.length ? (
        <>
          <p className="meta" role="status">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
          <div className="grid-products grid-products--4 mt-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          {term ? (
            <p className="h3" role="status">
              Nothing for “{term}” yet.
            </p>
          ) : null}
          <p className="muted">Browse by design:</p>
          <div className="option-grid">
            {DESIGN_FAMILIES.map((family) => (
              <Link
                key={family.handle}
                to={`/designs/${family.handle}`}
                className="chip"
              >
                {family.name}
              </Link>
            ))}
          </div>
        </div>
      )}
      <Analytics.SearchView
        data={{searchTerm: term, searchResults: products}}
      />
    </div>
  );
}

const SEARCH_QUERY = `#graphql
  query StoreSearch(
    $term: String!
    $first: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    search(query: $term, first: $first, types: [PRODUCT], unavailableProducts: LAST) {
      nodes {
        __typename
        ... on Product {
          ...ProductCard
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

const PREDICTIVE_QUERY = `#graphql
  query PredictiveProducts(
    $term: String!
    $limit: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    predictiveSearch(query: $term, limit: $limit, types: [PRODUCT]) {
      products {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
