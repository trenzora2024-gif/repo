import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/guides.$handle';
import {Breadcrumbs, BundleCard, pickProducts} from '~/components/Blocks';
import {ProductCard} from '~/components/ProductCard';
import {BUNDLE_BY_HANDLE} from '~/data/bundles';
import {GUIDE_BY_HANDLE} from '~/data/guides';
import {collectionContent} from '~/data/missions';
import {byHandle, getCuratedProducts} from '~/lib/curated';
import {articleJsonLd, breadcrumbJsonLd, seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data) return [{title: 'Guide not found | Trenzora'}];
  const {guide} = data;
  return seoMeta({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.handle}`,
    type: 'article',
    jsonLd: [
      articleJsonLd(guide),
      breadcrumbJsonLd([
        {name: 'Home', path: '/'},
        {name: 'Guides', path: '/guides'},
        {name: guide.title, path: `/guides/${guide.handle}`},
      ]),
    ],
  });
};

export async function loader({context, params}: Route.LoaderArgs) {
  const guide = GUIDE_BY_HANDLE.get(params.handle ?? '');
  if (!guide) throw new Response(null, {status: 404});
  return {
    guide,
    curated: await getCuratedProducts(context.storefront),
    showSavings: context.env.PUBLIC_BUNDLE_DISCOUNTS === 'on',
  };
}

export default function GuidePage() {
  const {guide, curated, showSavings} = useLoaderData<typeof loader>();
  const products = byHandle(curated);
  const bundle = guide.bundle ? BUNDLE_BY_HANDLE.get(guide.bundle) : undefined;
  const mission = collectionContent(guide.mission);

  return (
    <>
      <Breadcrumbs
        items={[
          {name: 'Home', path: '/'},
          {name: 'Guides', path: '/guides'},
          {name: guide.title, path: `/guides/${guide.handle}`},
        ]}
      />
      <article className="container article section--tight" style={{paddingTop: 0}}>
        <div className="prose">
          <p className="eyebrow">
            Guide · {guide.readMinutes} min read · Updated{' '}
            {new Date(guide.updated).toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}
          </p>
          <h1 className="h1" style={{marginTop: 8}}>
            {guide.title}
          </h1>
          <p className="lede" style={{marginTop: 16}}>
            {guide.intro}
          </p>
          {guide.sections.map((section) => {
            const inline = pickProducts(section.products ?? [], products);
            return (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {inline.length ? (
                  <div className="inline-products">
                    {inline.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })}
          {guide.checklist ? (
            <section>
              <h2>Checklist</h2>
              <ul className="checklist">
                {guide.checklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        <aside className="stack">
          {bundle ? <BundleCard bundle={bundle} products={products} showSavings={showSavings} /> : null}
          {mission ? (
            <Link to={`/collections/${mission.handle}`} className="btn btn--primary btn--block">
              Shop {mission.label.toLowerCase()}
            </Link>
          ) : null}
        </aside>
      </article>
    </>
  );
}
