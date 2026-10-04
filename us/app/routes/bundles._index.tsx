import {useLoaderData} from 'react-router';
import type {Route} from './+types/bundles._index';
import {Breadcrumbs, BundleCard} from '~/components/Blocks';
import {BUNDLES} from '~/data/bundles';
import {byHandle, getCuratedProducts} from '~/lib/curated';
import {seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  seoMeta({
    title: 'Complete Camping Setups & Bundles',
    description:
      'Matched camping setups added to your cart in one click: weekend car camping, hot-tent basecamp, camp kitchen, tailgate, family comfort and off-grid power.',
    path: '/bundles',
  });

export async function loader({context}: Route.LoaderArgs) {
  return {
    curated: await getCuratedProducts(context.storefront),
    showSavings: context.env.PUBLIC_BUNDLE_DISCOUNTS === 'on',
  };
}

export default function Bundles() {
  const {curated, showSavings} = useLoaderData<typeof loader>();
  const products = byHandle(curated);
  return (
    <>
      <Breadcrumbs items={[{name: 'Home', path: '/'}, {name: 'Complete setups', path: '/bundles'}]} />
      <header className="container coll-hero stack">
        <p className="eyebrow">Complete setups</p>
        <h1 className="h1">Skip the research. Get the whole setup.</h1>
        <p className="lede">
          Each setup is the set of pieces one job needs, checked to work
          together and added to your cart in one click. Swap or remove anything
          in the cart.
        </p>
      </header>
      <section className="container section--tight" style={{paddingTop: 0}}>
        <div className="grid grid--3">
          {BUNDLES.map((b) => (
            <BundleCard key={b.handle} bundle={b} products={products} showSavings={showSavings} />
          ))}
        </div>
      </section>
    </>
  );
}
