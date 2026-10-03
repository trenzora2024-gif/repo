import {useEffect, useId, useMemo, useState} from 'react';
import {Link, useFetcher} from 'react-router';
import type {ProductCardFragment} from 'storefrontapi.generated';
import {ProductCard} from '~/components/ProductCard';
import {ProductMedia} from '~/components/ProductMedia';
import {
  LAUNCH_FAMILIES,
  PRODUCT_TYPES,
  getDesignFamily,
  productHandle,
  type DesignFamily,
} from '~/data/catalogue';
import {SITE} from '~/data/site';
import {track} from '~/lib/analytics';
import {formatMoney} from '~/lib/money';
import {DROP_DETAIL_VISUAL, HERO_VISUAL, familySetVisual} from '~/lib/visuals';

/** Section marker: "01 — The drop". */
function Kicker({n, children}: {n?: string; children: React.ReactNode}) {
  return (
    <p className="kicker">
      {n ? <span className="kicker__n">{n}</span> : null}
      {children}
    </p>
  );
}

/* ---------------------------------------------------------------- hero */
export function Hero() {
  return (
    <section className="hero-ed" aria-labelledby="hero-title">
      <div className="hero-ed__copy container">
        <Kicker>Drop 01 · Mumbai Made</Kicker>
        <h1 id="hero-title" className="hero-ed__title reveal reveal--2">
          Made for people <span className="serif">with</span> personality.
        </h1>
        <p className="hero-ed__sub reveal reveal--3">{SITE.supporting}</p>
        <div className="hero-ed__ctas reveal reveal--3">
          <Link
            to="/collections/mumbai-made"
            className="btn btn--primary btn--lg"
            prefetch="intent"
          >
            Explore Drop 01
          </Link>
          <Link to="/collections/all" className="link-arrow" prefetch="intent">
            All eight designs
          </Link>
        </div>
      </div>
      <figure className="hero-ed__media">
        <img
          src={HERO_VISUAL.portrait.src}
          width={HERO_VISUAL.portrait.width}
          height={HERO_VISUAL.portrait.height}
          alt={HERO_VISUAL.alt}
          // React 18 drops the camelCase prop; pass the HTML attribute as is.
          {...{fetchpriority: 'high'}}
          decoding="async"
        />
        <figcaption>Mumbai Made — tee, tote, tumbler</figcaption>
      </figure>
    </section>
  );
}

export function Ticker() {
  const lines = LAUNCH_FAMILIES.map((family) => family.headline);
  // Duplicated once so the CSS loop is seamless.
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {['a', 'b'].flatMap((pass) =>
          lines.map((line) => <span key={`${pass}-${line}`}>{line}</span>),
        )}
      </div>
    </div>
  );
}

/* --------------------------------------------------------- personalities */
export function VibeSection() {
  return (
    <section className="section" aria-labelledby="vibe-title">
      <div className="container">
        <div className="section-head">
          <div className="section-head__text">
            <Kicker n="01">The designs</Kicker>
            <h2 id="vibe-title" className="h1">
              Pick your <span className="serif">personality.</span>
            </h2>
          </div>
          <Link to="/collections/all" className="link-arrow">
            See all eight
          </Link>
        </div>
      </div>
      <div className="persona-rail container">
        {LAUNCH_FAMILIES.map((family) => {
          const visual = familySetVisual(family);
          return (
            <Link
              key={family.handle}
              to={`/designs/${family.handle}`}
              className="persona-card"
              prefetch="intent"
              style={{'--tone': family.palette.bg} as React.CSSProperties}
            >
              <div className="persona-card__media">
                {visual ? (
                  <img
                    src={visual.src}
                    width={visual.width}
                    height={visual.height}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
                <span className="persona-card__num">
                  {String(family.number).padStart(2, '0')}
                </span>
              </div>
              <div className="persona-card__body">
                <span className="persona-card__name">{family.name}</span>
                <span className="persona-card__headline">
                  {family.headline}
                </span>
                <span className="persona-card__line">{family.line}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ----------------------------------------------------- first drop: mumbai */
export function FirstDrop({products}: {products: ProductCardFragment[]}) {
  const family = getDesignFamily('mumbai-made')!;
  return (
    <section className="drop" aria-labelledby="drop-title">
      <figure className="drop__band">
        <img
          src={DROP_DETAIL_VISUAL.src}
          width={DROP_DETAIL_VISUAL.width}
          height={DROP_DETAIL_VISUAL.height}
          alt={DROP_DETAIL_VISUAL.alt}
          loading="lazy"
          decoding="async"
        />
        <span className="drop__mark" aria-hidden="true">
          01
        </span>
      </figure>
      <div className="container drop__grid">
        <div className="drop__copy">
          <Kicker n="02">The first drop</Kicker>
          <h2 id="drop-title" className="drop__title">
            {family.headline}
          </h2>
          <p className="drop__line serif">{family.line}</p>
          <p className="drop__story">{family.story}</p>
          <div className="drop__ctas">
            <Link
              to="/collections/mumbai-made"
              className="btn btn--primary"
              prefetch="intent"
            >
              Explore Mumbai Made
            </Link>
          </div>
        </div>
        {products.length ? (
          <div className="drop__products">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                sizes="(min-width: 960px) 18vw, 45vw"
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- make it yours */
export function MakeItYours() {
  const [text, setText] = useState('');
  const preview = text.trim() || 'Your name';
  return (
    <section className="section" aria-labelledby="miy-title" id="make-it-yours">
      <div className="container">
        <div className="miy split">
          <div className="stack">
            <Kicker n="03">Coming soon</Kicker>
            <h2 id="miy-title" className="h1">
              Make it <span className="serif">yours.</span>
            </h2>
            <p className="lede">
              Your names, your city, your date. Printed on a Trenzora original.
            </p>
            <div className="hero-ed__ctas">
              <Link
                to="/personalize"
                className="btn btn--light"
                prefetch="intent"
              >
                Get early access
              </Link>
            </div>
          </div>
          <div className="stack">
            <div className="miy__preview" aria-live="polite">
              <span className="miy__preview-text">{preview}</span>
            </div>
            <label className="field">
              <span className="label">Try a name — preview only</span>
              <input
                className="input"
                maxLength={18}
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Type a name"
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------- one design, your way */
export function OneDesignYourWay({
  imagesByHandle,
}: {
  imagesByHandle: Record<string, ProductCardFragment | undefined>;
}) {
  const [active, setActive] = useState<DesignFamily['handle']>('mumbai-made');
  const family = useMemo(() => getDesignFamily(active)!, [active]);

  return (
    <section className="section section--sand" aria-labelledby="way-title">
      <div className="container">
        <div className="section-head">
          <div className="section-head__text">
            <Kicker n="04">One design, three ways</Kicker>
            <h2 id="way-title" className="h1">
              Wear it. Carry it. <span className="serif">Sip it.</span>
            </h2>
          </div>
        </div>
        <div
          className="chip-row design-switch"
          role="group"
          aria-label="Choose a design"
        >
          {LAUNCH_FAMILIES.map((item) => (
            <button
              key={item.handle}
              type="button"
              className={`chip${item.handle === active ? ' is-active' : ''}`}
              aria-pressed={item.handle === active}
              onClick={() => setActive(item.handle)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="way">
          {PRODUCT_TYPES.map((type) => {
            const handle = productHandle(family, type);
            const product = imagesByHandle[handle];
            const price =
              product?.selectedOrFirstAvailableVariant?.price ??
              product?.priceRange.minVariantPrice;
            return (
              <Link
                key={handle}
                to={`/products/${handle}`}
                className="way__item"
                prefetch="intent"
              >
                <ProductMedia
                  image={product?.featuredImage}
                  handle={handle}
                  alt={`${family.name} ${type.shortName}`}
                  sizes="(min-width: 960px) 30vw, 33vw"
                />
                <span className="way__label">
                  {type.shortName}
                  {price ? (
                    <span className="way__price">{formatMoney(price)}</span>
                  ) : null}
                </span>
              </Link>
            );
          })}
        </div>
        <p className="way-foot">
          <Link to={`/designs/${family.handle}`} className="link-arrow">
            The {family.name} story
          </Link>
        </p>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- the edit */
export function Trending({products}: {products: ProductCardFragment[]}) {
  if (!products.length) return null;
  return (
    <section className="section" aria-labelledby="trending-title">
      <div className="container">
        <div className="section-head">
          <div className="section-head__text">
            <Kicker n="05">The edit</Kicker>
            <h2 id="trending-title" className="h1">
              Where to <span className="serif">start.</span>
            </h2>
          </div>
          <Link to="/collections/trending" className="link-arrow">
            See the edit
          </Link>
        </div>
        <div className="rail">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              sizes="(min-width: 960px) 23vw, 68vw"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------ people of trenzora */
/**
 * UGC slot. Populate `posts` from a Shopify metaobject (`ugc_post`) or an
 * Instagram feed later. Until real posts exist we show honest prompts — no
 * fake testimonials.
 */
export type PeoplePost = {
  id: string;
  imageUrl: string;
  alt: string;
  handle: string; // instagram handle of the customer
  productHandle?: string;
};

const PEOPLE_PROMPTS = [
  {title: 'The Mumbai Made fit', body: 'Local train, sea face, office lift.'},
  {title: 'Desk + tumbler', body: 'Your Corporate Survivor setup.'},
  {title: 'Bestie twinning', body: 'Two tees, one inside joke.'},
  {title: 'Pet parent energy', body: 'Bonus points if the pet poses.'},
];

export function PeopleOfTrenzora({posts = []}: {posts?: PeoplePost[]}) {
  return (
    <section className="section" aria-labelledby="people-title">
      <div className="container">
        <div className="section-head">
          <div className="section-head__text">
            <Kicker n="06">People of Trenzora</Kicker>
            <h2 id="people-title" className="h1">
              Your <span className="serif">turn.</span>
            </h2>
            <p className="lede">
              {SITE.instagram ? (
                <>
                  Wear it. Tag <strong>@{SITE.instagram.handle}</strong>. The
                  best ones live here.
                </>
              ) : (
                <>Wear it, share it. The best ones live here.</>
              )}
            </p>
          </div>
          {SITE.instagram ? (
            <a
              href={SITE.instagram.url}
              className="link-arrow"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          ) : null}
        </div>
        <div className="people-grid">
          {posts.length
            ? posts.map((post) => (
                <figure
                  key={post.id}
                  className="media"
                  style={{'--ratio': '4/5'} as React.CSSProperties}
                >
                  <img src={post.imageUrl} alt={post.alt} loading="lazy" />
                </figure>
              ))
            : PEOPLE_PROMPTS.map((prompt, index) => (
                <div key={prompt.title} className="people-card">
                  <span className="people-card__n">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <strong>{prompt.title}</strong>
                    {prompt.body}
                  </span>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------- new drop every week */
export function WeeklyDrop() {
  return (
    <section className="section section--ink" aria-labelledby="weekly-title">
      <div className="container weekly">
        <div className="stack">
          <Kicker>The list</Kicker>
          <h2 id="weekly-title" className="display weekly__title">
            New drop <span className="serif">every</span> week.
          </h2>
        </div>
        <div className="stack">
          <p className="lede">New designs, first. One email a week.</p>
          <SignupForm />
        </div>
      </div>
    </section>
  );
}

export function SignupForm({
  source = 'weekly_drop',
  cta = 'Get the drop',
}: {
  /** Button label. */
  cta?: string;
  /** Reported as the `method` of the email_signup analytics event. */
  source?: string;
}) {
  const fetcher = useFetcher<{ok: boolean; message: string}>({
    key: `newsletter-${source}`,
  });
  const inputId = useId();
  const done = fetcher.data?.ok;
  useEffect(() => {
    if (done) track('email_signup', {method: source});
  }, [done, source]);
  return (
    <fetcher.Form method="post" action="/newsletter" className="signup">
      <label htmlFor={inputId} className="sr-only">
        Email address
      </label>
      <div className="signup__row">
        <input
          id={inputId}
          className="input"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          disabled={done}
        />
        <button
          type="submit"
          className="btn btn--light"
          disabled={fetcher.state !== 'idle' || done}
        >
          {fetcher.state !== 'idle' ? 'Joining…' : done ? 'You’re in' : cta}
        </button>
      </div>
      <p className={`form-note${done ? ' form-note--ok' : ''}`} role="status">
        {fetcher.data?.message ?? ''}
      </p>
    </fetcher.Form>
  );
}
