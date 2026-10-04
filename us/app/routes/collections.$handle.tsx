import {Link, useLoaderData, useSearchParams, useNavigate} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {Analytics, getPaginationVariables} from '@shopify/hydrogen';
import type {ProductCollectionSortKeys} from '@shopify/hydrogen/storefront-api-types';
import {Breadcrumbs, BundleCard, Faq, GuideCard, MissionTile} from '~/components/Blocks';
import {ProductGrid} from '~/components/ProductCard';
import {BUNDLE_BY_HANDLE} from '~/data/bundles';
import {GUIDE_BY_HANDLE} from '~/data/guides';
import {collectionContent} from '~/data/missions';
import {byHandle, getCuratedProducts} from '~/lib/curated';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {breadcrumbJsonLd, faqJsonLd, seoMeta} from '~/lib/seo';

const SORTS: Record<string, {label: string; key: ProductCollectionSortKeys; reverse: boolean}> = {
  featured: {label: 'Featured', key: 'COLLECTION_DEFAULT', reverse: false},
  'best-selling': {label: 'Best selling', key: 'BEST_SELLING', reverse: false},
  'price-asc': {label: 'Price: low to high', key: 'PRICE', reverse: false},
  'price-desc': {label: 'Price: high to low', key: 'PRICE', reverse: true},
};

export const meta: Route.MetaFunction = ({data}) => {
  if (!data) return [{title: 'Collection not found | Trenzora'}];
  const {collection, content} = data;
  const path = `/collections/${collection.handle}`;
  const title = content?.seo.title ?? collection.seo?.title ?? collection.title;
  const description =
    content?.seo.description ??
    collection.seo?.description ??
    (collection.description || `${collection.title} at Trenzora.`);
  return seoMeta({
    title,
    description,
    path,
    image: collection.image,
    // Sorted views are duplicates of the default listing.
    noindex: data.sorted,
    jsonLd: [
      breadcrumbJsonLd([
        {name: 'Home', path: '/'},
        {name: 'Shop', path: '/collections'},
        {name: collection.title, path},
      ]),
      ...(content?.faq.length ? [faqJsonLd(content.faq)] : []),
    ],
  });
};

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront, env} = context;
  if (!handle) throw new Response(null, {status: 404});

  const url = new URL(request.url);
  const sortParam = url.searchParams.get('sort') ?? 'featured';
  const sort = SORTS[sortParam] ?? SORTS.featured;
  const paginationVariables = getPaginationVariables(request, {pageBy: 24});

  const [{collection}, curated] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, sortKey: sort.key, reverse: sort.reverse, ...paginationVariables},
    }),
    getCuratedProducts(storefront),
  ]);

  // Never render an empty shell: a collection must exist in Shopify.
  if (!collection) throw new Response(`Collection ${handle} not found`, {status: 404});
  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
    content: collectionContent(collection.handle),
    curated,
    sort: sortParam in SORTS ? sortParam : 'featured',
    sorted: url.searchParams.has('sort'),
    showSavings: env.PUBLIC_BUNDLE_DISCOUNTS === 'on',
  };
}

export default function Collection() {
  const {collection, content, curated, sort, showSavings} = useLoaderData<typeof loader>();
  const products = collection.products.nodes;
  const bundle = content?.bundle ? BUNDLE_BY_HANDLE.get(content.bundle) : undefined;
  const guide = content?.guide ? GUIDE_BY_HANDLE.get(content.guide) : undefined;
  const related = (content?.related ?? []).map(collectionContent).filter(Boolean);

  return (
    <>
      <Breadcrumbs
        items={[
          {name: 'Home', path: '/'},
          {name: 'Shop', path: '/collections'},
          {name: collection.title, path: `/collections/${collection.handle}`},
        ]}
      />
      <header className="container coll-hero">
        <div className="coll-hero__grid">
          <div className="stack">
            <p className="eyebrow">{content?.kind === 'mission' ? 'Mission' : 'Gear'}</p>
            <h1 className="h1">{collection.title}</h1>
            {content?.job ? <p className="h3" style={{fontWeight: 500}}>{content.job}</p> : null}
            <p className="lede">{content?.intro ?? collection.description}</p>
          </div>
          {content?.problem ? (
            <div className="callout callout--problem stack-sm">
              <p className="eyebrow" style={{color: 'var(--ember-deep)'}}>
                The problem
              </p>
              <p>{content.problem}</p>
              {guide ? (
                <Link to={`/guides/${guide.handle}`} className="link">
                  Read: {guide.title}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>

      <section className="container" aria-label="Products">
        <div className="toolbar">
          <p className="meta">
            {products.length} product{products.length === 1 ? '' : 's'}, hand-picked
          </p>
          <SortSelect value={sort} />
        </div>
        {products.length ? (
          <ProductGrid products={products} eager={4} />
        ) : (
          <div className="callout">
            <p>We’re still choosing the right gear for this mission.</p>
            <Link to="/collections/all" className="link">
              See all gear
            </Link>
          </div>
        )}
        {collection.products.pageInfo.hasNextPage ? (
          <p style={{marginTop: 24}}>
            <Link
              className="btn"
              to={`?${new URLSearchParams({
                ...(sort !== 'featured' ? {sort} : {}),
                cursor: collection.products.pageInfo.endCursor ?? '',
                direction: 'next',
              }).toString()}`}
              preventScrollReset
            >
              Load more
            </Link>
          </p>
        ) : null}
      </section>

      {content?.guidance.length ? (
        <section className="section" aria-labelledby="guidance-title">
          <div className="container">
            <h2 id="guidance-title" className="h2" style={{marginBottom: 24}}>
              How to choose
            </h2>
            <ol className="guidance" style={{padding: 0}}>
              {content.guidance.map((g) => (
                <li key={g.title}>
                  <h3 className="h3">{g.title}</h3>
                  <p className="muted">{g.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {bundle || guide ? (
        <section className="section section--paper2">
          <div className="container grid grid--3">
            {bundle ? (
              <BundleCard bundle={bundle} products={byHandle(curated)} showSavings={showSavings} />
            ) : null}
            {guide ? <GuideCard guide={guide} /> : null}
          </div>
        </section>
      ) : null}

      {content?.faq.length ? (
        <section className="section">
          <div className="container">
            <Faq items={content.faq} />
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="section section--tight">
          <div className="container stack">
            <h2 className="h3">Related missions</h2>
            <div className="grid grid--3">
              {related.map((r) => (
                <MissionTile key={r!.handle} mission={r!} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <Analytics.CollectionView
        data={{collection: {id: collection.id, handle: collection.handle}}}
      />
    </>
  );
}

function SortSelect({value}: {value: string}) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  return (
    <label className="meta" style={{display: 'flex', gap: 8, alignItems: 'center'}}>
      Sort
      <select
        className="select"
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(params);
          next.delete('cursor');
          next.delete('direction');
          if (e.target.value === 'featured') next.delete('sort');
          else next.set('sort', e.target.value);
          void navigate(`?${next.toString()}`, {preventScrollReset: true});
        }}
      >
        {Object.entries(SORTS).map(([k, s]) => (
          <option key={k} value={k}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
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
          endCursor
          startCursor
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
