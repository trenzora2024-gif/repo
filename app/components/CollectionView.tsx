import {Pagination} from '@shopify/hydrogen';
import {DROP_DETAIL_VISUAL, HERO_VISUAL} from '~/lib/visuals';
import {Link, useNavigate, useSearchParams} from 'react-router';
import type {ProductCardFragment} from 'storefrontapi.generated';
import type {
  PageInfo,
  ProductCollectionSortKeys,
  ProductSortKeys,
} from '@shopify/hydrogen/storefront-api-types';
import {ProductCard} from '~/components/ProductCard';
import {COLLECTIONS, type CollectionHandle} from '~/data/catalogue';

/** Editorial banners for collections that have one (public/visuals). */
const COLLECTION_BANNERS: Record<
  string,
  {src: string; width: number; height: number} | undefined
> = {
  'mumbai-made': HERO_VISUAL.wide,
  drops: DROP_DETAIL_VISUAL,
};

export const SORT_OPTIONS = [
  {value: 'featured', label: 'Featured'},
  {value: 'newest', label: 'Newest'},
  {value: 'price-asc', label: 'Price: low to high'},
  {value: 'price-desc', label: 'Price: high to low'},
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]['value'];

function sortParam(request: Request): SortValue {
  const value = new URL(request.url).searchParams.get('sort');
  return SORT_OPTIONS.some((option) => option.value === value)
    ? (value as SortValue)
    : 'featured';
}

/** Sort variables for `collection.products`. */
export function collectionSort(request: Request): {
  sortKey: ProductCollectionSortKeys;
  reverse: boolean;
} {
  switch (sortParam(request)) {
    case 'newest':
      return {sortKey: 'CREATED', reverse: true};
    case 'price-asc':
      return {sortKey: 'PRICE', reverse: false};
    case 'price-desc':
      return {sortKey: 'PRICE', reverse: true};
    default:
      return {sortKey: 'COLLECTION_DEFAULT', reverse: false};
  }
}

/** Sort variables for the top-level `products` query. */
export function productSort(request: Request): {
  sortKey: ProductSortKeys;
  reverse: boolean;
} {
  switch (sortParam(request)) {
    case 'newest':
      return {sortKey: 'CREATED_AT', reverse: true};
    case 'price-asc':
      return {sortKey: 'PRICE', reverse: false};
    case 'price-desc':
      return {sortKey: 'PRICE', reverse: true};
    default:
      return {sortKey: 'BEST_SELLING', reverse: false};
  }
}

const NAV_ORDER: CollectionHandle[] = [
  'all',
  'mumbai-made',
  'drops',
  'gifts',
  'trending',
];

type Connection = {
  nodes: ProductCardFragment[];
  pageInfo: Pick<
    PageInfo,
    'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'
  >;
};

export function CollectionView({
  handle,
  title,
  description,
  eyebrow = 'Shop',
  products,
}: {
  handle: string;
  title: string;
  description?: string | null;
  eyebrow?: string;
  products: Connection;
}) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sort = params.get('sort') ?? 'featured';
  const banner = COLLECTION_BANNERS[handle];

  return (
    <div className="container page-end">
      <header className={`page-hero${banner ? ' page-hero--banner' : ''}`}>
        <div className="page-hero__text">
          <p className="kicker">{eyebrow}</p>
          <h1>{title}</h1>
          {description ? <p className="lede">{description}</p> : null}
        </div>
        {banner ? (
          <figure className="page-hero__media">
            <img
              src={banner.src}
              width={banner.width}
              height={banner.height}
              alt=""
              loading="eager"
              decoding="async"
            />
          </figure>
        ) : null}
      </header>

      <nav className="chip-row" aria-label="Collections">
        {NAV_ORDER.map((item) => (
          <Link
            key={item}
            to={`/collections/${item}`}
            className="chip"
            aria-current={item === handle ? 'page' : undefined}
            prefetch="intent"
            viewTransition
          >
            {COLLECTIONS[item].title}
          </Link>
        ))}
      </nav>

      <form className="collection-toolbar" method="get">
        <span className="meta">
          {products.nodes.length}
          {products.pageInfo.hasNextPage ? '+' : ''} products
        </span>
        <label className="field field--inline">
          <span className="label">Sort</span>
          <select
            name="sort"
            className="select"
            value={sort}
            onChange={(event) => {
              const next = new URLSearchParams(params);
              next.set('sort', event.target.value);
              next.delete('cursor');
              next.delete('direction');
              void navigate(`?${next.toString()}`, {preventScrollReset: true});
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <noscript>
          <button type="submit" className="btn">
            Apply
          </button>
        </noscript>
      </form>

      {products.nodes.length ? (
        <Pagination connection={products}>
          {({nodes, isLoading, NextLink, PreviousLink}) => (
            <>
              <div className="pagination">
                <PreviousLink className="btn">
                  {isLoading ? 'Loading…' : 'Show previous'}
                </PreviousLink>
              </div>
              <div className="grid-products grid-products--4">
                {nodes.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    loading={index < 4 ? 'eager' : 'lazy'}
                    sizes="(min-width: 1280px) 22vw, (min-width: 960px) 30vw, 50vw"
                  />
                ))}
              </div>
              <div className="pagination">
                <NextLink className="btn btn--primary">
                  {isLoading ? 'Loading…' : 'Load more'}
                </NextLink>
              </div>
            </>
          )}
        </Pagination>
      ) : (
        <div className="empty-state">
          <p className="h3">New pieces are on their way.</p>
          <p className="muted">
            This collection is being restocked with the next drop.
          </p>
          <Link to="/collections/all" className="btn btn--primary">
            Shop everything
          </Link>
        </div>
      )}
    </div>
  );
}
