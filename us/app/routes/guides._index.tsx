import type {Route} from './+types/guides._index';
import {Breadcrumbs, GuideCard} from '~/components/Blocks';
import {GUIDES} from '~/data/guides';
import {seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  seoMeta({
    title: 'Car Camping Guides & Checklists',
    description:
      'Practical car camping guides: what to pack, heating a hot tent safely, building a camp kitchen, tailgate setups and gifts for campers.',
    path: '/guides',
  });

export default function Guides() {
  return (
    <>
      <Breadcrumbs items={[{name: 'Home', path: '/'}, {name: 'Guides', path: '/guides'}]} />
      <header className="container coll-hero stack">
        <p className="eyebrow">Guides</p>
        <h1 className="h1">Know before you go</h1>
        <p className="lede">Short, practical guides written to answer the questions we get most.</p>
      </header>
      <section className="container section--tight" style={{paddingTop: 0}}>
        <div className="grid grid--3">
          {GUIDES.map((g) => (
            <GuideCard key={g.handle} guide={g} />
          ))}
        </div>
      </section>
    </>
  );
}
