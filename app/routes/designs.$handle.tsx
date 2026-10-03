import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/designs.$handle';
import {ProductCard} from '~/components/ProductCard';
import {SignupForm} from '~/components/home/HomeSections';
import {
  LAUNCH_FAMILIES,
  TAG,
  getDesignFamily,
  tagQuery,
} from '~/data/catalogue';
import {familySetVisual} from '~/lib/visuals';
import {posterArtSvg, svgDataUri} from '~/lib/art';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import {breadcrumbJsonLd, seoMeta} from '~/lib/seo';

/**
 * Design family page: one design concept, all its products.
 * Editorial content comes from the catalogue; products from Shopify by tag.
 */
export const meta: Route.MetaFunction = ({data}) => {
  if (!data) return [{title: 'Design not found | Trenzora'}];
  const family = getDesignFamily(data.handle)!;
  return seoMeta({
    title:
      family.release === 'v1'
        ? `${family.name} — Tees, Totes & Tumblers`
        : `${family.name} — Personalized, Coming Soon`,
    description: `${family.tagline} ${family.story}`,
    path: `/designs/${family.handle}`,
    jsonLd: breadcrumbJsonLd([
      {name: 'Home', path: '/'},
      {name: 'Drops', path: '/collections/drops'},
      {name: family.name, path: `/designs/${family.handle}`},
    ]),
  });
};

export async function loader({params, context}: Route.LoaderArgs) {
  const family = getDesignFamily(params.handle);
  if (!family) throw new Response('Design not found', {status: 404});

  // V2 personalization designs are not sold in V1: never list products.
  if (family.release !== 'v1') return {handle: family.handle, products: []};

  const {products} = await context.storefront.query(DESIGN_PRODUCTS_QUERY, {
    variables: {query: tagQuery(TAG.design(family.handle))},
    cache: context.storefront.CacheShort(),
  });

  return {handle: family.handle, products: products.nodes};
}

export default function DesignFamilyPage() {
  const {handle, products} = useLoaderData<typeof loader>();
  const family = getDesignFamily(handle)!;
  const isLaunch = family.release === 'v1';
  const others = LAUNCH_FAMILIES.filter(
    (item) => item.handle !== family.handle,
  );

  const visual = familySetVisual(family);
  return (
    <>
      <section
        className="design-hero"
        style={
          {
            '--tone': family.palette.bg,
            '--tone-fg': family.palette.fg,
          } as React.CSSProperties
        }
        aria-labelledby="design-title"
      >
        <div className="container design-hero__grid">
          <div className="design-hero__copy">
            <p className="kicker">
              <span className="kicker__n">
                {String(family.number).padStart(2, '0')}
              </span>
              {isLaunch ? `Drop ${family.drop}` : 'Coming with personalization'}
            </p>
            <h1 id="design-title" className="design-hero__title">
              {family.headline}
            </h1>
            <p className="design-hero__name">{family.name}</p>
            <p className="serif h3">{family.line}</p>
          </div>
          <figure className="design-hero__media">
            <img
              src={visual?.src ?? svgDataUri(posterArtSvg(family))}
              alt={visual?.alt ?? `${family.name} design poster`}
              width={visual?.width ?? 600}
              height={visual?.height ?? 750}
              loading="eager"
            />
          </figure>
        </div>
      </section>

      <section className="section" aria-labelledby="story-title">
        <div className="container split">
          <div className="stack">
            <p className="kicker">The story</p>
            <h2 id="story-title" className="h1">
              Why we <span className="serif">drew it.</span>
            </h2>
          </div>
          <div className="prose">
            <p>{family.story}</p>
            <p>{family.concept}</p>
            <p>
              <strong>For:</strong> {family.forWho}
            </p>
            {family.personalization.planned &&
            family.personalization.comingSoonNote ? (
              <p>
                <span className="badge">Coming soon</span>{' '}
                {family.personalization.comingSoonNote}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {isLaunch ? (
        <section
          className="section section--sand"
          aria-labelledby="products-title"
        >
          <div className="container">
            <div className="section-head">
              <div className="section-head__text">
                <p className="eyebrow">One design, your way</p>
                <h2 id="products-title" className="h2">
                  Wear it. Carry it. <span className="serif">Sip from it.</span>
                </h2>
              </div>
            </div>
            {products.length ? (
              <div className="grid-products">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <p className="muted">This design is coming to the store soon.</p>
            )}
          </div>
        </section>
      ) : (
        <section
          className="section section--ink"
          aria-labelledby="waitlist-title"
        >
          <div className="container weekly">
            <div className="stack">
              <p className="eyebrow">Personalize · Coming soon</p>
              <h2 id="waitlist-title" className="h2">
                {family.name} launches with{' '}
                <span className="serif">personalization.</span>
              </h2>
            </div>
            <div className="stack">
              <p className="lede">
                It isn’t available to order yet. Leave your email and we’ll tell
                you the day personalized pieces go live.
              </p>
              <SignupForm
                source={`personalize_${family.handle}`}
                cta="Notify me"
              />
            </div>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="more-title">
        <div className="container">
          <h2
            id="more-title"
            className="h3"
            style={{marginBottom: 'var(--s-4)'}}
          >
            More designs
          </h2>
          <div className="option-grid">
            {others.map((item) => (
              <Link
                key={item.handle}
                to={`/designs/${item.handle}`}
                className="chip"
                prefetch="intent"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const DESIGN_PRODUCTS_QUERY = `#graphql
  query DesignProducts(
    $query: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: 12, query: $query) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
