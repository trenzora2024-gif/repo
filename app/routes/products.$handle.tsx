import {Suspense} from 'react';
import {Await, Link, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  Analytics,
  getAdjacentAndFirstAvailableVariants,
  getProductOptions,
  getSelectedProductOptions,
  useOptimisticVariant,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductCard} from '~/components/ProductCard';
import {ProductForm} from '~/components/ProductForm';
import {ProductMedia} from '~/components/ProductMedia';
import {
  PRODUCT_TYPES,
  productHandle,
  resolveCatalogueEntry,
} from '~/data/catalogue';
import {FAQ, HOW_ITS_MADE, RETURNS, SHIPPING, SITE} from '~/data/site';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import {formatMoney} from '~/lib/money';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {absoluteUrl, breadcrumbJsonLd, seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data) return [{title: 'Product not found | Trenzora'}];
  const {product, entry} = data;
  const variant = product.selectedOrFirstAvailableVariant;
  const image = product.images.nodes[0];
  const path = `/products/${product.handle}`;
  const description =
    product.seo.description ||
    (entry
      ? `${entry.family.tagline} ${entry.type?.summary ?? ''}`
      : product.description);

  return seoMeta({
    title: product.seo.title || product.title,
    description,
    path,
    type: 'product',
    image: image
      ? {
          url: image.url,
          alt: image.altText ?? product.title,
          width: image.width ?? undefined,
          height: image.height ?? undefined,
        }
      : null,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description,
        sku: variant?.sku || undefined,
        brand: {'@type': 'Brand', name: SITE.name},
        image: product.images.nodes.map((node) => node.url),
        category: product.productType || undefined,
        url: absoluteUrl(path),
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: product.priceRange.minVariantPrice.currencyCode,
          lowPrice: product.priceRange.minVariantPrice.amount,
          highPrice: product.priceRange.maxVariantPrice.amount,
          offerCount: product.variantsCount?.count ?? 1,
          availability: product.availableForSale
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          seller: {'@type': 'Organization', name: SITE.name},
        },
      },
      breadcrumbJsonLd([
        {name: 'Home', path: '/'},
        ...(entry
          ? [{name: entry.family.name, path: `/designs/${entry.family.handle}`}]
          : [{name: 'Shop', path: '/collections/all'}]),
        {name: product.title, path},
      ]),
    ],
  });
};

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  if (!handle) throw new Error('Expected product handle to be defined');

  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle, selectedOptions: getSelectedProductOptions(request)},
  });

  if (!product?.id) throw new Response(null, {status: 404});
  redirectIfHandleIsLocalized(request, {handle, data: product});

  const entry = resolveCatalogueEntry(product);

  // Below the fold: same design on other products + recommendations.
  const siblings = entry
    ? storefront
        .query(SIBLINGS_QUERY, {
          variables: {query: `tag:'design:${entry.family.handle}'`},
          cache: storefront.CacheShort(),
        })
        .then((res) => res.products.nodes)
        .catch(() => [])
    : Promise.resolve([]);

  const related = storefront
    .query(RECOMMENDATIONS_QUERY, {
      variables: {productId: product.id},
      cache: storefront.CacheShort(),
    })
    .then((res) => (res.productRecommendations ?? []).slice(0, 4))
    .catch(() => []);

  return {product, entry, related, siblings: await siblings};
}

export default function ProductPage() {
  const {product, entry, related, siblings} = useLoaderData<typeof loader>();
  const family = entry?.family;
  const type = entry?.type;

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const images = product.images.nodes;
  const variantImage = selectedVariant?.image;
  const gallery = variantImage
    ? [
        variantImage,
        ...images.filter((image) => image.url !== variantImage.url),
      ]
    : images;
  const name = family?.name ?? product.title.split(' — ')[0];
  const subtitle = type?.name ?? product.title.split(' — ')[1];
  const siblingByHandle = Object.fromEntries(
    siblings.map((s) => [s.handle, s]),
  );

  return (
    <div className="container">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <Link to="/">Home</Link>
          </li>
          {family ? (
            <li>
              <Link to={`/designs/${family.handle}`}>{family.name}</Link>
            </li>
          ) : (
            <li>
              <Link to="/collections/all">Shop</Link>
            </li>
          )}
          <li aria-current="page">{subtitle ?? product.title}</li>
        </ol>
      </nav>

      <div className="pdp">
        <div className="pdp__gallery" aria-label="Product images">
          {gallery.length ? (
            gallery.map((image, index) => (
              <ProductMedia
                key={image.url}
                image={image}
                handle={product.handle}
                alt={image.altText || `${product.title} — image ${index + 1}`}
                loading={index === 0 ? 'eager' : 'lazy'}
                sizes="(min-width: 960px) 55vw, 100vw"
              />
            ))
          ) : (
            <ProductMedia
              handle={product.handle}
              tags={product.tags}
              alt={`${product.title} — design concept`}
              loading="eager"
              sizes="(min-width: 960px) 55vw, 100vw"
            />
          )}
        </div>

        <div className="pdp__info">
          {family ? (
            <p className="eyebrow">
              Design {String(family.number).padStart(2, '0')} · Drop{' '}
              {family.drop}
            </p>
          ) : null}
          <h1 className="pdp__title">
            {name}
            {subtitle ? <small> {subtitle}</small> : null}
          </h1>
          <p className="pdp__price">
            {formatMoney(selectedVariant?.price)}
            <span className="pdp__price-note">incl. of all taxes</span>
          </p>

          {family ? (
            <>
              <p className="pdp__story">{family.story}</p>
              <dl className="facts">
                <div>
                  <dt>The design</dt>
                  <dd>{family.concept}</dd>
                </div>
                <div>
                  <dt>Made for</dt>
                  <dd>{family.forWho}</dd>
                </div>
              </dl>
            </>
          ) : (
            <div
              className="pdp__story"
              dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
            />
          )}

          {family ? (
            <div className="stack">
              <p className="label">Also on</p>
              <nav
                className="type-switch"
                aria-label={`${family.name} products`}
              >
                {PRODUCT_TYPES.map((item) => {
                  const handle = productHandle(family, item);
                  const sibling = siblingByHandle[handle];
                  if (!sibling && handle !== product.handle) return null;
                  return (
                    <Link
                      key={handle}
                      to={`/products/${handle}`}
                      aria-current={
                        handle === product.handle ? 'page' : undefined
                      }
                      prefetch="intent"
                      preventScrollReset={false}
                    >
                      <ProductMedia
                        image={sibling?.featuredImage}
                        handle={handle}
                        alt=""
                        sizes="96px"
                      />
                      {item.shortName}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ) : null}

          <ProductForm
            productTitle={product.title}
            productOptions={productOptions}
            selectedVariant={selectedVariant}
            family={family}
            type={type}
          />

          <ul className="assurance">
            <li>
              Printed to order for you — ships in {SHIPPING.productionDays}
            </li>
            <li>
              Delivered across India in {SHIPPING.deliveryDays} after dispatch
            </li>
            <li>Damaged or misprinted? Free replacement</li>
          </ul>

          <div className="accordion">
            {type ? (
              <details open>
                <summary>Details &amp; materials</summary>
                <div className="accordion__body">
                  <p>{type.summary}</p>
                  <ul>
                    {type.materials.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                    <li>{type.printMethod}</li>
                  </ul>
                </div>
              </details>
            ) : null}
            <details>
              <summary>How it’s made</summary>
              <div className="accordion__body">
                <ol className="steps">
                  {HOW_ITS_MADE.map((step) => (
                    <li key={step.title}>
                      <span>
                        <strong>{step.title}</strong>
                        {step.body}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </details>
            <details>
              <summary>Shipping &amp; delivery</summary>
              <div className="accordion__body">
                <p>
                  {SHIPPING.coverage} Every piece is made to order: printing
                  takes {SHIPPING.productionDays}, then delivery takes{' '}
                  {SHIPPING.deliveryDays}. You’ll get a confirmation email right
                  away and a tracking link when it ships. {SHIPPING.costNote}
                </p>
                <p>
                  <Link to="/shipping">Shipping details</Link>
                </p>
              </div>
            </details>
            {type ? (
              <details>
                <summary>Care</summary>
                <div className="accordion__body">
                  <ul>
                    {type.care.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </details>
            ) : null}
            <details>
              <summary>Returns</summary>
              <div className="accordion__body">
                <p>{RETURNS.summary}</p>
              </div>
            </details>
            <details>
              <summary>FAQ</summary>
              <div className="accordion__body">
                {FAQ.map((item) => (
                  <div key={item.q} className="faq-item">
                    <p>
                      <strong>{item.q}</strong>
                    </p>
                    <p>{item.a}</p>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <Await resolve={related} errorElement={null}>
          {(products) =>
            products.length ? (
              <section
                className="section section--tight"
                aria-labelledby="related-title"
              >
                <div className="section-head">
                  <h2 id="related-title" className="h2">
                    You might <span className="serif">also like</span>
                  </h2>
                </div>
                <div className="rail">
                  {products.map((item) => (
                    <ProductCard
                      key={item.id}
                      product={item}
                      sizes="(min-width: 960px) 23vw, 68vw"
                    />
                  ))}
                </div>
              </section>
            ) : null
          }
        </Await>
      </Suspense>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
              sku: selectedVariant?.sku ?? undefined,
              productType: product.productType,
              handle: product.handle,
              currency: selectedVariant?.price.currencyCode,
            },
          ],
        }}
      />
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    tags
    productType
    availableForSale
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    variantsCount {
      count
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 8) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const SIBLINGS_QUERY = `#graphql
  query ProductSiblings(
    $query: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: 6, query: $query) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

const RECOMMENDATIONS_QUERY = `#graphql
  query ProductRecommendations(
    $productId: ID!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId) {
      ...ProductCard
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
