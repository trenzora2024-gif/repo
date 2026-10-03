import {Link} from 'react-router';
import {HERO_VISUAL} from '~/lib/visuals';
import type {Route} from './+types/about';
import {LAUNCH_FAMILIES} from '~/data/catalogue';
import {SITE} from '~/data/site';
import {organizationJsonLd, seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  seoMeta({
    title: 'About Trenzora — Made for People with Personality',
    description:
      'Trenzora is an Indian design brand making original-design tees, totes and tumblers — printed to order and personal by design.',
    path: '/about',
    jsonLd: organizationJsonLd(),
  });

export default function About() {
  return (
    <>
      <section
        className="design-hero"
        style={
          {'--tone': '#B4432C', '--tone-fg': '#F6EFE4'} as React.CSSProperties
        }
      >
        <div className="container design-hero__grid">
          <div className="design-hero__copy">
            <p className="kicker">About Trenzora</p>
            <h1 className="design-hero__title">
              Made for people <span className="serif">with</span> personality.
            </h1>
            <p className="serif h3">{SITE.supporting}</p>
          </div>
          <figure className="design-hero__media">
            <img
              src={HERO_VISUAL.portrait.src}
              width={HERO_VISUAL.portrait.width}
              height={HERO_VISUAL.portrait.height}
              alt={HERO_VISUAL.alt}
              loading="eager"
            />
          </figure>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <h2 className="h1">
            Part fashion label. Part design{' '}
            <span className="serif">studio.</span>
          </h2>
          <div className="prose">
            <p>
              Clothes and objects should say something about who you are, and
              where you’re from.
            </p>
            <p>
              Every Trenzora design is drawn in-house around a real Indian
              story: the city that raised you, the friend who knows too much,
              the coffee that starts the day. No stock graphics.
            </p>
            <p>
              One design, three pieces: an oversized tee, a canvas tote, a 20oz
              tumbler. Wear it, carry it, sip from it.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <h2>Original designs</h2>
              <p className="muted">
                {LAUNCH_FAMILIES.length} originals, from Mumbai Made to Desi
                Roots, with more drops to come.
              </p>
            </div>
            <div className="info-card">
              <h2>Printed to order</h2>
              <p className="muted">
                Nothing is printed until you order, so there’s no dead stock.
                Made in India.
              </p>
            </div>
            <div className="info-card">
              <h2>Personal by design</h2>
              <p className="muted">
                Your names, your city, your date. Personalization is coming
                soon.
              </p>
            </div>
          </div>
          <p className="center way-foot">
            <Link
              to="/collections/mumbai-made"
              className="btn btn--primary btn--lg"
            >
              Explore Drop 01
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
