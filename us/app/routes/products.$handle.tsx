import {useState} from 'react';
import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  Analytics,
  getAdjacentAndFirstAvailableVariants,
  getProductOptions,
  getSelectedProductOptions,
  Image,
  useOptimisticVariant,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {Breadcrumbs, BundleCard, Faq, pickProducts} from '~/components/Blocks';
import {ProductGrid} from '~/components/ProductCard';
import {ProductForm} from '~/components/ProductForm';
import {ProductMedia} from '~/components/ProductMedia';
import {BUNDLES} from '~/data/bundles';
import {catalogEntry} from '~/data/catalog';
import {MISSIONS} from '~/data/missions';
import {RETURNS, SHIPPING, SITE} from '~/data/site';
import {byHandle, getCuratedProducts} from '~/lib/curated';
import {formatMoney} from '~/lib/money';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {breadcrumbJsonLd, faqJsonLd, productJsonLd, seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data) return [{title: 'Product not found | Trenzora'}];
  const {product} = data;
  const entry = catalogEntry(product.handle);
  const path = `/products/${product.handle}`;
  const mission = entry ? MISSIONS[entry.missions[0]] : null;
  const description =
    product.seo.description ||
    (entry ? `${entry.outcome} ${entry.whoFor}` : product.description);
  const faq = [...(entry?.faq ?? [])];

  return seoMeta({
    title: product.seo.title || product.title,
    description,
    path,
    type: 'product',
    image: product.images.nodes[0] ?? null,
    jsonLd: [
      productJsonLd({
        title: product.title,
        handle: product.handle,
        vendor: product.vendor,
        description: product.description || description,
        productType: product.productType,
        images: product.images.nodes,
        variants: product.variants.nodes,
      }),
      breadcrumbJsonLd([
        {name: 'Home', path: '/'},
        ...(mission
          ? [{name: mission.title, path: `/collections/${mission.handle}`}]
          : [{name: 'All gear', path: '/collections/all'}]),
        {name: product.title, path},
      ]),
      ...(faq.length ? [faqJsonLd(faq)] : []),
    ],
  });
};

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront, env} = context;
  if (!handle) throw new Error('Expected product handle to be defined');

  const [{product}, curated] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    getCuratedProducts(storefront),
  ]);

  if (!product?.id) throw new Response(null, {status: 404});
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {product, curated, showSavings: env.PUBLIC_BUNDLE_DISCOUNTS === 'on'};
}

export default function Product() {
  const {product, curated, showSavings} = useLoaderData<typeof loader>();
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);
  const productOptions = getProductOptions({...product, selectedOrFirstAvailableVariant: selectedVariant});

  const entry = catalogEntry(product.handle);
  const products = byHandle(curated);
  const mission = entry ? MISSIONS[entry.missions[0]] : null;
  const crossSell = pickProducts(entry?.crossSell ?? [], products);
  const bundles = BUNDLES.filter((b) => b.items.some((i) => i.handle === product.handle));
  const compareAt = selectedVariant?.compareAtPrice;
  const onSale = compareAt && Number(compareAt.amount) > Number(selectedVariant.price.amount);

  return (
    <>
      <Breadcrumbs
        items={[
          {name: 'Home', path: '/'},
          ...(mission
            ? [{name: mission.title, path: `/collections/${mission.handle}`}]
            : [{name: 'All gear', path: '/collections/all'}]),
          {name: product.title, path: `/products/${product.handle}`},
        ]}
      />
      <div className="container pdp">
        <Gallery images={product.images.nodes} handle={product.handle} title={product.title} />

        <div className="pdp__info stack">
          <p className="card__vendor">By {product.vendor}</p>
          <h1 className="h1 pdp__title">{product.title}</h1>
          {entry ? <p className="pdp__outcome">{entry.outcome}</p> : null}
          <p className="pdp__price">
            {formatMoney(selectedVariant?.price)}
            {onSale ? (
              <s className="muted" style={{fontSize: '1rem', marginLeft: 10, fontWeight: 400}}>
                {formatMoney(compareAt)}
              </s>
            ) : null}
          </p>
          {entry ? (
            <div className="problem-box">
              <p>The problem it solves</p>
              <p>“{entry.problem}”</p>
            </div>
          ) : null}
          {entry ? (
            <ul className="checks">
              {entry.benefits.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : null}

          <ProductForm
            productTitle={product.title}
            productOptions={productOptions}
            selectedVariant={selectedVariant}
          />

          <div className="mini-trust">
            <span>
              <strong>{SHIPPING.headline}.</strong> Ships from {SHIPPING.shipsFrom} in{' '}
              {SHIPPING.processingDays}; arrives in {SHIPPING.deliveryDays}.
            </span>
            <span>
              <strong>{RETURNS.headline}.</strong> Damaged on arrival? We make it right.
            </span>
            <span>
              Questions about fit or setup?{' '}
              <a className="link" href={`mailto:${SITE.contactEmail}`}>
                {SITE.contactEmail}
              </a>
            </span>
          </div>
        </div>
      </div>

      <div className="container pdp-sections section--tight">
        {entry ? (
          <section className="two-col" aria-label="Who it's for and what's included">
            <div className="stack">
              <h2 className="h2">Who it’s for</h2>
              <p className="lede">{entry.whoFor}</p>
              {entry.missions.length ? (
                <div className="chips">
                  {entry.missions.map((m) => (
                    <Link key={m} to={`/collections/${m}`} className="chip">
                      {MISSIONS[m].label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="stack">
              <h2 className="h2">Specs &amp; what’s included</h2>
              <table className="spec-table">
                <tbody>
                  <tr>
                    <th scope="row">Brand</th>
                    <td>{product.vendor}</td>
                  </tr>
                  {entry.specs.map((s, i) => (
                    <tr key={s}>
                      <th scope="row">{i === 0 ? 'Key specs' : <span className="visually-hidden">Spec</span>}</th>
                      <td>{s}</td>
                    </tr>
                  ))}
                  <tr>
                    <th scope="row">In the box</th>
                    <td>{entry.included.join(', ')}</td>
                  </tr>
                  {selectedVariant?.sku ? (
                    <tr>
                      <th scope="row">SKU</th>
                      <td>{selectedVariant.sku}</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {product.descriptionHtml ? (
          <section className="stack" aria-labelledby="details-title">
            <h2 id="details-title" className="h2">
              Details from the maker
            </h2>
            <div className="rte" dangerouslySetInnerHTML={{__html: product.descriptionHtml}} />
          </section>
        ) : null}

        {bundles.length ? (
          <section className="stack" aria-labelledby="setup-title">
            <h2 id="setup-title" className="h2">
              Complete the setup
            </h2>
            <div className="grid grid--3">
              {bundles.map((b) => (
                <BundleCard key={b.handle} bundle={b} products={products} showSavings={showSavings} />
              ))}
            </div>
          </section>
        ) : null}

        {crossSell.length ? (
          <section className="stack" aria-labelledby="pairs-title">
            <h2 id="pairs-title" className="h2">
              Pairs well with
            </h2>
            <ProductGrid products={crossSell} />
          </section>
        ) : null}

        <Faq
          title="Questions"
          items={[
            ...(entry?.faq ?? []),
            {q: 'When will it arrive?', a: `Orders ship from ${SHIPPING.shipsFrom} in ${SHIPPING.processingDays} and arrive in ${SHIPPING.deliveryDays}. ${SHIPPING.regionNote}`},
            {q: 'Can I return it?', a: `${RETURNS.summary} ${RETURNS.holiday}`},
          ]}
        />
      </div>

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
            },
          ],
        }}
      />
    </>
  );
}

function Gallery({
  images,
  handle,
  title,
}: {
  images: Array<{id?: string | null; url: string; altText?: string | null; width?: number | null; height?: number | null}>;
  handle: string;
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const current = images[index];
  return (
    <div>
      <div className="gallery__main">
        <ProductMedia
          image={current}
          handle={handle}
          alt={current?.altText ?? title}
          sizes="(min-width: 960px) 55vw, 100vw"
          loading="eager"
        />
      </div>
      {images.length > 1 ? (
        <div className="gallery__thumbs" role="group" aria-label="Product images">
          {images.map((image, i) => (
            <button
              key={image.id ?? image.url}
              type="button"
              aria-pressed={i === index}
              aria-label={`Show image ${i + 1} of ${images.length}`}
              onClick={() => setIndex(i)}
            >
              <Image data={image} alt="" sizes="72px" aspectRatio="1/1" />
            </button>
          ))}
        </div>
      ) : null}
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
    barcode
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
    productType
    description
    descriptionHtml
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 10) {
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
    selectedOrFirstAvailableVariant(
      selectedOptions: $selectedOptions
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      ...ProductVariant
    }
    adjacentVariants(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    variants(first: 50) {
      nodes {
        id
        sku
        barcode
        title
        availableForSale
        price {
          amount
          currencyCode
        }
      }
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
