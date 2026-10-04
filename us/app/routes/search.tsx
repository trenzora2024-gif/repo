import {Form, Link, useLoaderData} from 'react-router';
import type {Route} from './+types/search';
import {Analytics} from '@shopify/hydrogen';
import {Breadcrumbs, MissionTile} from '~/components/Blocks';
import {ProductGrid} from '~/components/ProductCard';
import {MISSIONS} from '~/data/missions';
import {CURATED_TAG} from '~/lib/curated';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import {seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) =>
  seoMeta({
    title: data?.term ? `Search: ${data.term}` : 'Search',
    description: 'Search Trenzora car camping gear.',
    path: '/search',
    noindex: true,
  });

export async function loader({request, context}: Route.LoaderArgs) {
  const term = (new URL(request.url).searchParams.get('q') ?? '').trim().slice(0, 100);
  if (!term) return {term, products: []};
  const safe = term.replace(/[():"\\]/g, ' ');
  const {products} = await context.storefront.query(SEARCH_QUERY, {
    variables: {query: `(${safe}) AND tag:${CURATED_TAG}`},
    cache: context.storefront.CacheShort(),
  });
  return {term, products: products.nodes};
}

export default function Search() {
  const {term, products} = useLoaderData<typeof loader>();
  return (
    <>
      <Breadcrumbs items={[{name: 'Home', path: '/'}, {name: 'Search', path: '/search'}]} />
      <div className="container stack section--tight" style={{paddingTop: 0}}>
        <h1 className="h1">{term ? `Results for “${term}”` : 'Search'}</h1>
        <Form method="get" className="search-form" role="search" style={{maxWidth: 560}}>
          <label htmlFor="search-page" className="visually-hidden">
            Search products
          </label>
          <input id="search-page" className="input" type="search" name="q" defaultValue={term} placeholder="Search tents, stoves, fridges…" />
          <button className="btn btn--primary" type="submit">
            Search
          </button>
        </Form>
        {term && !products.length ? (
          <div className="stack">
            <p className="lede">Nothing matched. Try a mission instead:</p>
            <div className="grid grid--4">
              {(['weekend-car-camping', 'camp-kitchen', 'cold-weather-camping', 'gifts-for-campers'] as const).map((h) => (
                <MissionTile key={h} mission={MISSIONS[h]} />
              ))}
            </div>
          </div>
        ) : null}
        {products.length ? (
          <ProductGrid products={products} />
        ) : !term ? (
          <p className="muted">
            Try “tailgate tent”, “wood stove” or <Link to="/collections" className="link">shop by mission</Link>.
          </p>
        ) : null}
      </div>
      <Analytics.SearchView data={{searchTerm: term}} />
    </>
  );
}

const SEARCH_QUERY = `#graphql
  query SearchProducts(
    $query: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: 24, query: $query, sortKey: RELEVANCE) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
