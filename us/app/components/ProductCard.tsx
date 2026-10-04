import {Link} from 'react-router';
import type {ProductCardFragment} from 'storefrontapi.generated';
import {ProductMedia} from '~/components/ProductMedia';
import {catalogEntry} from '~/data/catalog';
import {formatMoney} from '~/lib/money';

export function ProductCard({
  product,
  loading,
}: {
  product: ProductCardFragment;
  loading?: 'eager' | 'lazy';
}) {
  const entry = catalogEntry(product.handle);
  const variant = product.selectedOrFirstAvailableVariant;
  const price = variant?.price ?? product.priceRange.minVariantPrice;
  const compareAt = variant?.compareAtPrice;
  const onSale =
    compareAt && Number(compareAt.amount) > Number(price.amount);
  const soldOut = variant && !variant.availableForSale;

  return (
    <Link to={`/products/${product.handle}`} className="card" prefetch="intent">
      <div className="card__media">
        <ProductMedia
          image={product.featuredImage}
          handle={product.handle}
          alt={product.featuredImage?.altText ?? product.title}
          loading={loading}
        />
        {soldOut ? (
          <span className="badge card__badge">Sold out</span>
        ) : entry?.tier === 'hero' ? (
          <span className="badge card__badge">Trenzora pick</span>
        ) : null}
      </div>
      <span className="card__vendor">{product.vendor}</span>
      <span className="card__title">{product.title}</span>
      {entry ? <span className="card__outcome">{entry.outcome}</span> : null}
      <span className="price">
        {formatMoney(price)}
        {onSale ? <s>{formatMoney(compareAt)}</s> : null}
      </span>
    </Link>
  );
}

export function ProductGrid({
  products,
  eager = 0,
}: {
  products: ProductCardFragment[];
  eager?: number;
}) {
  return (
    <div className="grid grid--products">
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          loading={i < eager ? 'eager' : 'lazy'}
        />
      ))}
    </div>
  );
}
