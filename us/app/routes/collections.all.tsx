import {useLoaderData} from 'react-router';
import type {Route} from './+types/collections.all';
import {Breadcrumbs} from '~/components/Blocks';
import {ProductGrid} from '~/components/ProductCard';
import {CATALOG_BY_HANDLE} from '~/data/catalog';
import {getCuratedProducts} from '~/lib/curated';
import {seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  seoMeta({
    title: 'All Car Camping Gear',
    description:
      'Every product in the Trenzora assortment: tents, sleep, camp kitchen, heat, power and light, hand-picked for car camping and basecamps.',
    path: '/collections/all',
  });

export async function loader({context}: Route.LoaderArgs) {
  const curated = await getCuratedProducts(context.storefront);
  // Curated catalog order (rank) first, then anything else that's tagged.
  const rank = (h: string) => CATALOG_BY_HANDLE.get(h)?.rank ?? 999;
  return {products: [...curated].sort((a, b) => rank(a.handle) - rank(b.handle))};
}

export default function AllProducts() {
  const {products} = useLoaderData<typeof loader>();
  return (
    <>
      <Breadcrumbs items={[{name: 'Home', path: '/'}, {name: 'All gear', path: '/collections/all'}]} />
      <header className="container coll-hero stack">
        <p className="eyebrow">All gear</p>
        <h1 className="h1">The whole assortment</h1>
        <p className="lede">
          {products.length} products. Each one is here because it solves a
          specific camp problem.
        </p>
      </header>
      <section className="container section--tight" style={{paddingTop: 0}}>
        <ProductGrid products={products} eager={4} />
      </section>
    </>
  );
}
