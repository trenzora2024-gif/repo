import {Image} from '@shopify/hydrogen';
import {ProductArt} from '~/components/ProductArt';
import {catalogEntry} from '~/data/catalog';

type ImageLike = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

/** Shopify image when present; otherwise the product's brand glyph. */
export function ProductMedia({
  image,
  handle,
  alt,
  sizes = '(min-width: 960px) 25vw, 50vw',
  loading = 'lazy',
}: {
  image?: ImageLike | null;
  handle: string;
  alt?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
}) {
  if (image?.url) {
    return (
      <Image
        data={image}
        alt={alt ?? image.altText ?? ''}
        sizes={sizes}
        aspectRatio="1/1"
        loading={loading}
      />
    );
  }
  const entry = catalogEntry(handle);
  return (
    <ProductArt
      icon={entry?.art.icon}
      tone={entry?.art.tone}
      label={alt || undefined}
    />
  );
}
