import {Link} from 'react-router';
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
      <section className="section">
        <div className="container stack">
          <p className="eyebrow">About Trenzora</p>
          <h1 className="display">
            Made for people <span className="serif">with</span> personality
          </h1>
          <p className="lede">{SITE.supporting}</p>
        </div>
      </section>

      <section className="section section--sand">
        <div className="container split">
          <h2 className="h2">
            Part streetwear brand. Part design studio. Part{' '}
            <span className="serif">gifting</span> brand.
          </h2>
          <div className="prose">
            <p>
              Trenzora started with a simple idea: the things we wear and carry
              every day should say something about who we are — and where we’re
              from.
            </p>
            <p>
              Every design is drawn in-house around a real Indian story: the
              city that raised you, the friend who knows the plan, the coffee
              order that needs a paragraph. We don’t resell stock graphics and
              we don’t do cheap meme tees.
            </p>
            <p>
              Each design is made to work across three pieces — a premium
              oversized tee, an everyday tote and a 20oz tumbler — so you can
              wear it, carry it, or gift it.
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
                {LAUNCH_FAMILIES.length} launch designs, from Mumbai Made to
                Desi Roots. New designs drop every week.
              </p>
            </div>
            <div className="info-card">
              <h2>Printed to order</h2>
              <p className="muted">
                Nothing is printed until you order it. Less waste, no dead
                stock, and every piece made fresh for you in India.
              </p>
            </div>
            <div className="info-card">
              <h2>Personal by design</h2>
              <p className="muted">
                Designs like Us and Make It Yours are built to carry your names
                and words. Personal text is launching soon.
              </p>
            </div>
          </div>
          <p className="center way-foot">
            <Link to="/collections/drops" className="btn btn--primary btn--lg">
              Explore the drop
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
