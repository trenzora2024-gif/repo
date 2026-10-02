import {useEffect, useMemo, useState} from 'react';
import {Link, useFetcher} from 'react-router';
import type {ProductCardFragment} from 'storefrontapi.generated';
import {ProductCard} from '~/components/ProductCard';
import {ProductMedia} from '~/components/ProductMedia';
import {
  DESIGN_FAMILIES,
  PRODUCT_TYPES,
  getDesignFamily,
  productHandle,
  type DesignFamily,
} from '~/data/catalogue';
import {SITE} from '~/data/site';
import {posterArtSvg, svgDataUri} from '~/lib/art';
import {track} from '~/lib/analytics';

const poster = (handle: string, ratio: 'portrait' | 'square' = 'portrait') => {
  const family = getDesignFamily(handle)!;
  return svgDataUri(posterArtSvg(family, ratio));
};

/* ---------------------------------------------------------------- hero */
export function Hero() {
  const collage = ['bestie-energy', 'mumbai-made', 'coffee-personality'];
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="eyebrow reveal">Drop 01 is live — Mumbai Made</p>
          <h1 id="hero-title" className="display hero__title reveal reveal--2">
            Made for people <span className="serif">with</span> personality
          </h1>
          <p className="lede reveal reveal--3">
            {SITE.supporting} Oversized tees, totes and tumblers — drawn
            in-house, printed to order and shipped across India.
          </p>
          <div className="hero__ctas reveal reveal--3">
            <Link
              to="/collections/drops"
              className="btn btn--primary btn--lg"
              prefetch="intent"
            >
              Explore the drop
            </Link>
            <Link
              to="/collections/personalize"
              className="btn btn--lg"
              prefetch="intent"
            >
              Make it yours
            </Link>
          </div>
          <ul className="hero__proof">
            <li>Original designs</li>
            <li>Printed to order in India</li>
            <li>Secure Shopify checkout</li>
          </ul>
        </div>
        <div className="hero__collage" aria-hidden="true">
          {collage.map((handle) => (
            <div className="media" key={handle}>
              <img
                src={poster(handle)}
                alt=""
                width={600}
                height={750}
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Ticker() {
  const names = DESIGN_FAMILIES.map((family) => family.name);
  // Duplicated once so the CSS loop is seamless.
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {['a', 'b'].flatMap((pass) =>
          names.map((name) => <span key={`${pass}-${name}`}>{name}</span>),
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- vibes */
export function VibeSection() {
  const vibes = DESIGN_FAMILIES.filter((family) => family.vibe);
  // Brief order: Mumbai, Bestie, Couple, Coffee, Office, Pet Parent.
  const order = [
    'Mumbai',
    'Bestie',
    'Couple',
    'Coffee',
    'Office',
    'Pet Parent',
  ];
  vibes.sort((a, b) => order.indexOf(a.vibe!) - order.indexOf(b.vibe!));

  return (
    <section className="section" aria-labelledby="vibe-title">
      <div className="container">
        <div className="section-head">
          <div className="section-head__text">
            <p className="eyebrow">Find your design</p>
            <h2 id="vibe-title" className="h2">
              What’s your <span className="serif">vibe?</span>
            </h2>
          </div>
          <Link to="/collections/all" className="link-arrow">
            See everything
          </Link>
        </div>
        <div className="vibe-grid">
          {vibes.map((family) => (
            <Link
              key={family.handle}
              to={`/designs/${family.handle}`}
              className="vibe-tile"
              prefetch="intent"
              style={
                {
                  '--tile-bg': family.palette.bg,
                  '--tile-fg': family.palette.fg,
                  '--tile-accent': family.palette.accent,
                } as React.CSSProperties
              }
            >
              <span className="vibe-tile__num">
                {String(family.number).padStart(2, '0')} · {family.name}
              </span>
              <span>
                <span className="vibe-tile__name">{family.vibe}</span>
                <span className="vibe-tile__line block">{family.tagline}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------- first drop: mumbai */
export function FirstDrop({products}: {products: ProductCardFragment[]}) {
  const family = getDesignFamily('mumbai-made')!;
  return (
    <section className="section section--sand" aria-labelledby="drop-title">
      <div className="container split">
        <div className="feature__art">
          <div className="media">
            <img
              src={poster('mumbai-made')}
              alt="Mumbai Made — Trenzora Drop 01 artwork poster"
              width={600}
              height={750}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
        <div className="feature__copy">
          <p className="eyebrow">First drop · 01</p>
          <h2 id="drop-title" className="h1">
            {family.name}
          </h2>
          <p className="serif h3">{family.tagline}</p>
          <p className="lede">{family.story}</p>
          {products.length ? (
            <div className="feature__products">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  sizes="(min-width: 960px) 14vw, 30vw"
                />
              ))}
            </div>
          ) : null}
          <div>
            <Link
              to="/collections/mumbai-made"
              className="btn btn--primary"
              prefetch="intent"
            >
              Shop Mumbai Made
            </Link>
          </div>
        </div>
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
            <p className="eyebrow">Personalize</p>
            <h2 id="miy-title" className="h1">
              Make it <span className="serif">yours.</span>
            </h2>
            <p className="lede">
              Some designs are made to carry your words — names, dates, the
              nickname only your people use. The originals are ready now;
              personal text is launching soon.
            </p>
            <ol className="miy__steps">
              <li>
                Pick a design made for personalizing — Us or Make It Yours.
              </li>
              <li>Choose a tee, a tote or a tumbler.</li>
              <li>We print it for you and ship it across India.</li>
            </ol>
            <div className="hero__ctas">
              <Link
                to="/collections/personalize"
                className="btn btn--light"
                prefetch="intent"
              >
                Shop personalizable designs
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
            <p className="eyebrow">One design, your way</p>
            <h2 id="way-title" className="h2">
              Tee <span aria-hidden="true">→</span> Tote{' '}
              <span aria-hidden="true">→</span> Tumbler
            </h2>
            <p className="lede">
              Every Trenzora design is drawn once and made for all three. Wear
              it, carry it, sip from it.
            </p>
          </div>
        </div>
        <div
          className="chip-row design-switch"
          role="group"
          aria-label="Choose a design"
        >
          {DESIGN_FAMILIES.map((item) => (
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
                <span className="way__label">{type.shortName}</span>
              </Link>
            );
          })}
        </div>
        <p className="center way-foot">
          <Link to={`/designs/${family.handle}`} className="link-arrow">
            See {family.name}
          </Link>
        </p>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- trending */
export function Trending({products}: {products: ProductCardFragment[]}) {
  if (!products.length) return null;
  return (
    <section className="section" aria-labelledby="trending-title">
      <div className="container">
        <div className="section-head">
          <div className="section-head__text">
            <p className="eyebrow">Trending now</p>
            <h2 id="trending-title" className="h2">
              What people are <span className="serif">picking</span>
            </h2>
          </div>
          <Link to="/collections/trending" className="link-arrow">
            Shop trending
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
  {
    title: 'Your Mumbai Made fit',
    body: 'Local train, sea face or office lift — show us.',
  },
  {title: 'Desk + tumbler', body: 'Your Corporate Survivor setup, unfiltered.'},
  {title: 'Bestie twinning', body: 'Two tees, one inside joke.'},
  {title: 'Pet parent energy', body: 'Bonus points if the pet poses.'},
];

export function PeopleOfTrenzora({posts = []}: {posts?: PeoplePost[]}) {
  return (
    <section className="section" aria-labelledby="people-title">
      <div className="container">
        <div className="section-head">
          <div className="section-head__text">
            <p className="eyebrow">People of Trenzora</p>
            <h2 id="people-title" className="h2">
              Worn by people with <span className="serif">personality</span>
            </h2>
            <p className="lede">
              Wear it, tag <strong>@trenzora.in</strong>, and you could be
              featured here.
            </p>
          </div>
          <a
            href={SITE.social.instagram}
            className="link-arrow"
            target="_blank"
            rel="noopener noreferrer"
          >
            Follow on Instagram
          </a>
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
            : PEOPLE_PROMPTS.map((prompt) => (
                <div key={prompt.title} className="people-card">
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
          <p className="eyebrow">Every week</p>
          <h2 id="weekly-title" className="display weekly__title">
            New drop <span className="serif">every</span> week.
          </h2>
        </div>
        <div className="stack">
          <p className="lede">
            New designs, first. One email a week — no spam, unsubscribe any
            time.
          </p>
          <SignupForm />
        </div>
      </div>
    </section>
  );
}

export function SignupForm() {
  const fetcher = useFetcher<{ok: boolean; message: string}>({
    key: 'newsletter',
  });
  const done = fetcher.data?.ok;
  useEffect(() => {
    if (done) track('email_signup', {method: 'weekly_drop'});
  }, [done]);
  return (
    <fetcher.Form method="post" action="/newsletter" className="signup">
      <label htmlFor="signup-email" className="sr-only">
        Email address
      </label>
      <div className="signup__row">
        <input
          id="signup-email"
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
          {fetcher.state !== 'idle'
            ? 'Joining…'
            : done
              ? 'You’re in'
              : 'Get the drop'}
        </button>
      </div>
      <p className={`form-note${done ? ' form-note--ok' : ''}`} role="status">
        {fetcher.data?.message ?? ''}
      </p>
    </fetcher.Form>
  );
}
