import type {Route} from './+types/collections._index';
import {Breadcrumbs, MissionTile} from '~/components/Blocks';
import {GEAR, GEAR_ORDER, MISSIONS, MISSION_ORDER} from '~/data/missions';
import {seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  seoMeta({
    title: 'Shop Car Camping Gear by Mission',
    description:
      'Shop by what you’re planning: weekend car camping, camp kitchen, cold-weather and hot-tent camping, power and light, tailgating, family camping and gifts.',
    path: '/collections',
  });

export default function Collections() {
  return (
    <>
      <Breadcrumbs items={[{name: 'Home', path: '/'}, {name: 'Shop', path: '/collections'}]} />
      <header className="container coll-hero stack">
        <p className="eyebrow">Shop by mission</p>
        <h1 className="h1">What are you getting ready for?</h1>
        <p className="lede">
          Start with the job. Every mission collection explains the problem, how
          to choose, and the setup that solves it.
        </p>
      </header>
      <section className="container" aria-label="Missions">
        <div className="grid grid--4">
          {MISSION_ORDER.map((h) => (
            <MissionTile key={h} mission={MISSIONS[h]} />
          ))}
        </div>
      </section>
      <section className="section" aria-labelledby="gear-title">
        <div className="container stack">
          <h2 id="gear-title" className="h2">
            Shop by gear
          </h2>
          <div className="grid grid--4">
            {GEAR_ORDER.map((h) => (
              <MissionTile key={h} mission={GEAR[h]} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
