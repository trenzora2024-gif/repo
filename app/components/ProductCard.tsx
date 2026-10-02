import {Link} from 'react-router';
import type {ProductCardFragment} from 'storefrontapi.generated';
import {ProductMedia} from '~/components/ProductMedia';
import {resolveCatalogueEntry} from '~/data/catalogue';
import {formatMoney} from '~/lib/money';

/** Splits "Mumbai Made — Premium Oversized Tee" into design + product. */
export function productNameParts(product: {
  handle: string;
  title: string;
  tags?: string[] | null;
}) {
  const entry = resolveCatalogueEntry(product);
  if (entry?.type) return {design: entry.family.name, type: entry.type.name};
  const [design, type] = product.title.split(/\s+—\s+/);
  return {design, type: type ?? ''};
}

export function ProductCard({
  product,
  loading = 'lazy',
  sizes,
}: {
  product: ProductCardFragment;
  loading?: 'lazy' | 'eager';
  sizes?: string;
}) {
  const {design, type} = productNameParts(product);
  const price =
    product.selectedOrFirstAvailableVariant?.price ??
    product.priceRange.minVariantPrice;
  const soldOut =
    product.selectedOrFirstAvailableVariant?.availableForSale === false;

  return (
    <Link
      className="product-card"
      to={`/products/${product.handle}`}
      prefetch="intent"
    >
      <ProductMedia
        image={product.featuredImage}
        handle={product.handle}
        tags={product.tags}
        alt={product.featuredImage?.altText || product.title}
        loading={loading}
        sizes={sizes}
      />
      <div className="product-card__body">
        <span className="product-card__design">{design}</span>
        {type ? <span className="product-card__type">{type}</span> : null}
        <span className="product-card__price">
          {soldOut ? 'Sold out' : formatMoney(price)}
        </span>
      </div>
    </Link>
  );
}
