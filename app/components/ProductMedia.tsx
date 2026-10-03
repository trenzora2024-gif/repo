import {Image} from '@shopify/hydrogen';
import type {Image as ImageType} from '@shopify/hydrogen/storefront-api-types';
import {resolveCatalogueEntry} from '~/data/catalogue';
import {productArtSvg, svgDataUri} from '~/lib/art';

type MediaImage = Pick<ImageType, 'url' | 'altText' | 'width' | 'height'> & {
  id?: string | null;
};

/**
 * Product image with brand fallback: real Shopify media when uploaded,
 * otherwise the design family's concept card (never a broken image).
 */
export function ProductMedia({
  image,
  handle,
  tags,
  alt,
  sizes = '(min-width: 960px) 30vw, 50vw',
  loading = 'lazy',
  ratio = '1/1',
  className = '',
}: {
  image?: MediaImage | null;
  handle: string;
  tags?: string[] | null;
  alt: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  ratio?: string;
  className?: string;
}) {
  const style = {'--ratio': ratio} as React.CSSProperties;

  if (image?.url) {
    return (
      <div className={`media ${className}`} style={style}>
        <Image
          data={image}
          alt={image.altText || alt}
          sizes={sizes}
          loading={loading}
          aspectRatio={ratio}
        />
      </div>
    );
  }

  const entry = resolveCatalogueEntry({handle, tags});
  const src = entry
    ? svgDataUri(
        productArtSvg(entry.family, entry.type?.handle ?? 'oversized-tee'),
      )
    : null;

  return (
    <div className={`media ${className}`} style={style}>
      {src ? (
        <img
          src={src}
          alt={alt}
          width={600}
          height={600}
          loading={loading}
          decoding="async"
          data-placeholder="concept"
        />
      ) : null}
    </div>
  );
}
