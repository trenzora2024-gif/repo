import {Link} from 'react-router';
import type {Route} from './+types/pages.about';
import {Breadcrumbs, TrustStrip} from '~/components/Blocks';
import {SITE} from '~/data/site';
import {seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  seoMeta({
    title: 'Why Trenzora',
    description:
      'Trenzora picks a small range of car camping and basecamp gear, matches it into complete setups and explains who each product is for.',
    path: '/pages/about',
  });

export default function About() {
  return (
    <>
      <Breadcrumbs items={[{name: 'Home', path: '/'}, {name: 'Why Trenzora', path: '/pages/about'}]} />
      <div className="container section--tight prose" style={{paddingTop: 0}}>
        <p className="eyebrow">Why Trenzora</p>
        <h1 className="h1">We pick fewer things, on purpose.</h1>
        <p className="lede" style={{marginTop: 16}}>
          Search “camping gear” on a marketplace and you get thousands of
          near-identical listings with spec-dump titles. Trenzora exists to do
          the narrowing for you.
        </p>
        <h2>How we choose</h2>
        <ul>
          <li>It has to solve a specific problem campers actually have, and we say which one.</li>
          <li>It has to work with the rest of a setup: tents that fit cots, stoves matched to tents, panels that plug into the power station.</li>
          <li>It has to ship from a US warehouse with a clear return path.</li>
          <li>Anything with safety implications (stoves, heaters, gas) carries the rules, not just the specs.</li>
        </ul>
        <h2>What we don’t do</h2>
        <ul>
          <li>We don’t hide who makes our products. The maker’s name is on every page.</li>
          <li>We don’t invent “was” prices or countdown timers.</li>
          <li>We don’t list products just because they’re trending.</li>
        </ul>
        <p>
          Questions? Email <a className="link" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>. Or{' '}
          <Link className="link" to="/collections">
            start with a mission
          </Link>
          .
        </p>
      </div>
      <section className="section section--paper2">
        <div className="container">
          <TrustStrip />
        </div>
      </section>
    </>
  );
}
