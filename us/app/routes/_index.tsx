import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {BundleCard, GuideCard, MissionTile, TrustStrip, pickProducts} from '~/components/Blocks';
import {ProductGrid} from '~/components/ProductCard';
import {BUNDLES} from '~/data/bundles';
import {CATALOG_BY_HANDLE, HERO_HANDLES} from '~/data/catalog';
import {GUIDES} from '~/data/guides';
import {GEAR, GEAR_ORDER, MISSIONS, MISSION_ORDER} from '~/data/missions';
import {SEASONAL, SITE} from '~/data/site';
import {byHandle, getCuratedProducts} from '~/lib/curated';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import {organizationJsonLd, seoMeta, websiteJsonLd} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  seoMeta({
    title: 'Trenzora | Car Camping & Basecamp Gear, Sorted by Mission',
    description:
      'Hand-picked car camping gear and complete setups: SUV tents, camp kitchens, hot-tent stoves, 12V fridges and lights. Free US shipping, 30-day returns.',
    path: '/',
    jsonLd: [organizationJsonLd(), websiteJsonLd()],
  });

export async function loader({context}: Route.LoaderArgs) {
  const {storefront, env} = context;
  const [curated, {popular, demo}] = await Promise.all([
    getCuratedProducts(storefront),
    storefront.query(HOME_QUERY, {cache: storefront.CacheShort()}),
  ]);
  const video = demo?.media.nodes.find(
    (m) => m.__typename === 'Video' || m.__typename === 'ExternalVideo',
  );
  return {
    curated,
    popular: popular.nodes,
    demo: demo && video ? {handle: demo.handle, title: demo.title, video} : null,
    showSavings: env.PUBLIC_BUNDLE_DISCOUNTS === 'on',
  };
}

export default function Home() {
  const {curated, popular, demo, showSavings} = useLoaderData<typeof loader>();
  const products = byHandle(curated);
  const picks = pickProducts(HERO_HANDLES, products);
  const seasonalPicks = pickProducts(
    ['canvas-bell-tent-5m', 'tent-wood-stove', 'folding-cot-with-mattress', 'cold-weather-sleeping-bag'],
    products,
  );

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__art" aria-hidden="true">
          <Topo />
        </div>
        <div className="container hero__inner">
          <div className="hero__copy stack">
            <p className="eyebrow">Car camping &amp; basecamp gear</p>
            <h1 id="hero-title" className="h1">
              Your campsite, sorted.
            </h1>
            <p className="lede">
              Tell us what you’re planning: a weekend at the lake, a cold
              hunting camp, game day. We’ll show you the gear that does the job
              and works together. No 400-listing scroll.
            </p>
            <div className="btn-row">
              <a href="#missions" className="btn btn--accent btn--lg">
                Shop by mission
              </a>
              <Link to="/bundles" className="btn btn--light btn--lg">
                See complete setups
              </Link>
            </div>
            <ul className="hero-proof">
              <li>Free shipping in the contiguous US</li>
              <li>30-day returns</li>
              <li>Ships from US warehouses</li>
            </ul>
          </div>
          <nav className="hero-missions" aria-label="Popular missions">
            {(['weekend-car-camping', 'cold-weather-camping', 'camp-kitchen', 'tailgate-and-backyard'] as const).map(
              (h) => (
                <Link key={h} to={`/collections/${h}`} prefetch="intent">
                  <span>
                    {MISSIONS[h].title}
                    <small>{MISSIONS[h].job}</small>
                  </span>
                  <span aria-hidden="true">→</span>
                </Link>
              ),
            )}
          </nav>
        </div>
      </section>

      <section id="missions" className="section" aria-labelledby="missions-title">
        <div className="container">
          <div className="section-head">
            <div className="stack-sm">
              <p className="eyebrow">Shop by mission</p>
              <h2 id="missions-title" className="h2">
                What are you getting ready for?
              </h2>
            </div>
          </div>
          <div className="grid grid--4">
            {MISSION_ORDER.map((h) => (
              <MissionTile key={h} mission={MISSIONS[h]} />
            ))}
          </div>
        </div>
      </section>

      {picks.length ? (
        <section className="section section--paper2" aria-labelledby="picks-title">
          <div className="container">
            <div className="section-head">
              <div className="stack-sm">
                <p className="eyebrow">Featured solutions</p>
                <h2 id="picks-title" className="h2">
                  The ten pieces that solve the most camp problems
                </h2>
              </div>
              <Link to="/collections/all" className="link">
                All gear
              </Link>
            </div>
            <ProductGrid products={picks.slice(0, 8)} />
          </div>
        </section>
      ) : null}

      <section className="section section--ink" aria-labelledby="season-title">
        <div className="container two-col" style={{alignItems: 'center'}}>
          <div className="stack">
            <p className="eyebrow">{SEASONAL.eyebrow}</p>
            <h2 id="season-title" className="h2">
              {SEASONAL.title}
            </h2>
            <p className="lede">{SEASONAL.body}</p>
            <div className="btn-row">
              <Link to={SEASONAL.cta.to} className="btn btn--accent">
                {SEASONAL.cta.label}
              </Link>
              <Link to={SEASONAL.secondary.to} className="btn btn--light">
                {SEASONAL.secondary.label}
              </Link>
            </div>
          </div>
          {seasonalPicks.length ? (
            <ul className="hero-missions" style={{listStyle: 'none', padding: 0}}>
              {seasonalPicks.map((p) => (
                <li key={p.id}>
                  <Link to={`/products/${p.handle}`} prefetch="intent">
                    <span>
                      {p.title}
                      <small>{CATALOG_BY_HANDLE.get(p.handle)?.outcome}</small>
                    </span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <section className="section" aria-labelledby="bundles-title">
        <div className="container">
          <div className="section-head">
            <div className="stack-sm">
              <p className="eyebrow">Complete setups</p>
              <h2 id="bundles-title" className="h2">
                Skip the research. Get the whole setup.
              </h2>
              <p className="muted">
                Matched pieces for one job, added to your cart in one click.
              </p>
            </div>
            <Link to="/bundles" className="link">
              All setups
            </Link>
          </div>
          <div className="grid grid--3">
            {BUNDLES.slice(0, 3).map((b) => (
              <BundleCard key={b.handle} bundle={b} products={products} showSavings={showSavings} />
            ))}
          </div>
        </div>
      </section>

      {demo ? (
        <section className="section section--paper2" aria-labelledby="demo-title">
          <div className="container two-col" style={{alignItems: 'center'}}>
            <div className="stack">
              <p className="eyebrow">See it set up</p>
              <h2 id="demo-title" className="h2">
                {demo.title}
              </h2>
              <Link to={`/products/${demo.handle}`} className="btn btn--primary">
                Shop it
              </Link>
            </div>
            <DemoVideo video={demo.video} />
          </div>
        </section>
      ) : null}

      <section className="section section--tight" aria-labelledby="gear-title">
        <div className="container stack">
          <h2 id="gear-title" className="h3">
            Or shop by gear
          </h2>
          <div className="chips">
            {GEAR_ORDER.map((h) => (
              <Link key={h} to={`/collections/${h}`} className="chip">
                {GEAR[h].label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--paper2" aria-labelledby="why-title">
        <div className="container stack">
          <p className="eyebrow">Why Trenzora</p>
          <h2 id="why-title" className="h2" style={{maxWidth: '22ch'}}>
            Fewer products. Better matched. Honestly explained.
          </h2>
          <div className="pillars" style={{marginTop: 32}}>
            <div className="pillar">
              <h3 className="h3">Every product earns its place</h3>
              <p className="muted">
                We list a few dozen products, not thousands. Each one solves a
                specific camp problem, and we tell you what that is.
              </p>
            </div>
            <div className="pillar">
              <h3 className="h3">Built to work together</h3>
              <p className="muted">
                Tents that fit the cots, stoves matched to the tent, panels that
                plug into the power station. Setups remove the guesswork.
              </p>
            </div>
            <div className="pillar">
              <h3 className="h3">Straight answers</h3>
              <p className="muted">
                Who it’s for, who it isn’t for, what’s in the box and the safety
                rules, plus the maker’s name on every product.
              </p>
            </div>
          </div>
          <div style={{marginTop: 40}}>
            <TrustStrip />
          </div>
        </div>
      </section>

      {popular.length ? (
        <section className="section" aria-labelledby="popular-title">
          <div className="container">
            <div className="section-head">
              <div className="stack-sm">
                <p className="eyebrow">Most popular</p>
                <h2 id="popular-title" className="h2">
                  What campers are buying
                </h2>
              </div>
            </div>
            <ProductGrid products={popular} />
          </div>
        </section>
      ) : null}

      <section className="section section--paper2" aria-labelledby="guides-title">
        <div className="container">
          <div className="section-head">
            <div className="stack-sm">
              <p className="eyebrow">Guides</p>
              <h2 id="guides-title" className="h2">
                Know before you go
              </h2>
            </div>
            <Link to="/guides" className="link">
              All guides
            </Link>
          </div>
          <div className="grid grid--3">
            {GUIDES.slice(0, 3).map((g) => (
              <GuideCard key={g.handle} guide={g} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="final-title">
        <div className="container final-cta">
          <h2 id="final-title" className="h2">
            Planning a trip? Start with the mission.
          </h2>
          <p className="lede">{SITE.promise}</p>
          <div className="btn-row" style={{justifyContent: 'center'}}>
            <Link to="/collections/weekend-car-camping" className="btn btn--accent btn--lg">
              Weekend car camping
            </Link>
            <Link to="/collections/gifts-for-campers" className="btn btn--lg">
              Gifts for campers
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

type DemoMedia = NonNullable<
  Awaited<ReturnType<typeof loader>>['demo']
>['video'];

function DemoVideo({video}: {video: DemoMedia}) {
  if (video.__typename === 'Video') {
    const source = video.sources.find((s) => s.mimeType === 'video/mp4') ?? video.sources[0];
    return (
      <video
        controls
        muted
        playsInline
        preload="none"
        poster={video.previewImage?.url}
        style={{width: '100%', borderRadius: 18, background: '#000'}}
      >
        {source ? <source src={source.url} type={source.mimeType} /> : null}
      </video>
    );
  }
  if (video.__typename === 'ExternalVideo') {
    return (
      <iframe
        src={video.embedUrl}
        title="Product demonstration"
        loading="lazy"
        allow="encrypted-media; picture-in-picture"
        allowFullScreen
        style={{width: '100%', aspectRatio: '16 / 9', border: 0, borderRadius: 18}}
      />
    );
  }
  return null;
}

/** Topographic contour lines: the hero's only decoration. */
function Topo() {
  const rings = Array.from({length: 9}, (_, i) => i);
  return (
    <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#a9c7b4" strokeWidth="1.2">
      {rings.map((i) => (
        <ellipse key={`a${i}`} cx="980" cy="120" rx={70 + i * 62} ry={40 + i * 38} transform={`rotate(-12 980 120)`} />
      ))}
      {rings.slice(0, 6).map((i) => (
        <ellipse key={`b${i}`} cx="160" cy="560" rx={60 + i * 55} ry={30 + i * 30} />
      ))}
    </svg>
  );
}

const HOME_QUERY = `#graphql
  query Home($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    popular: products(first: 4, sortKey: BEST_SELLING, query: "tag:curated") {
      nodes {
        ...ProductCard
      }
    }
    demo: product(handle: "suv-tailgate-tent") {
      handle
      title
      media(first: 10) {
        nodes {
          __typename
          ... on Video {
            sources {
              url
              mimeType
            }
            previewImage {
              url
            }
          }
          ... on ExternalVideo {
            embedUrl
          }
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
