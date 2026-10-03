import {Link} from 'react-router';
import type {Route} from './+types/personalize';
import {SignupForm} from '~/components/home/HomeSections';
import {DESIGN_FAMILIES} from '~/data/catalogue';
import {posterArtSvg, svgDataUri} from '~/lib/art';
import {seoMeta} from '~/lib/seo';

/**
 * V1: personalization isn't sold yet. This page presents the V2
 * personalization designs (Us, Make It Yours) as coming soon and collects
 * early-access emails. Nothing here can be added to cart.
 */
const UPCOMING = DESIGN_FAMILIES.filter(
  (family) => family.personalization.planned && family.release !== 'v1',
);

export const meta: Route.MetaFunction = () =>
  seoMeta({
    title: 'Personalize — Coming Soon',
    description:
      'Personalized Trenzora designs with your names, city and date are coming soon. Join the list for early access.',
    path: '/personalize',
  });

export default function Personalize() {
  return (
    <>
      <div className="container">
        <header className="page-hero">
          <p className="eyebrow">Personalize · Coming soon</p>
          <h1>
            Make it <span className="serif">yours.</span>
          </h1>
          <p className="lede">
            Designs made to carry your words: names, a city, a date, printed
            just for you. Personalized pieces aren’t available to order yet.
            Join the list and you’ll be first to know.
          </p>
        </header>

        <div className="grid-products page-end">
          {UPCOMING.map((family) => (
            <Link
              key={family.handle}
              to={`/designs/${family.handle}`}
              className="product-card"
              prefetch="intent"
            >
              <div
                className="media"
                style={{'--ratio': '4/5'} as React.CSSProperties}
              >
                <img
                  src={svgDataUri(posterArtSvg(family))}
                  alt={`${family.name} design concept`}
                  width={600}
                  height={750}
                  loading="eager"
                  data-placeholder="concept"
                />
              </div>
              <div className="product-card__body">
                <span className="product-card__design">{family.name}</span>
                <span className="product-card__type">{family.tagline}</span>
                <span className="product-card__price">Coming soon</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <section className="section section--ink" aria-labelledby="early-title">
        <div className="container weekly">
          <div className="stack">
            <p className="eyebrow">Early access</p>
            <h2 id="early-title" className="h2">
              Be first to <span className="serif">personalize.</span>
            </h2>
          </div>
          <div className="stack">
            <p className="lede">
              One email when personalized pieces go live. No spam.
            </p>
            <SignupForm source="personalize_waitlist" cta="Notify me" />
          </div>
        </div>
      </section>
    </>
  );
}
