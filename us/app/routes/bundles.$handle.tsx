import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/bundles.$handle';
import {Breadcrumbs, TrustStrip} from '~/components/Blocks';
import {useDrawer} from '~/components/Drawer';
import {ProductMedia} from '~/components/ProductMedia';
import {AddToCart} from '~/components/ProductForm';
import {BUNDLE_BY_HANDLE} from '~/data/bundles';
import {catalogEntry} from '~/data/catalog';
import {MISSIONS} from '~/data/missions';
import type {MissionHandle} from '~/data/catalog';
import {BUNDLE_ADD} from '~/lib/cart-actions';
import {catalogItemId, track} from '~/lib/analytics';
import {byHandle, getCuratedProducts} from '~/lib/curated';
import {formatMoney, usd} from '~/lib/money';
import {breadcrumbJsonLd, seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data) return [{title: 'Setup not found | Trenzora'}];
  const {bundle} = data;
  return seoMeta({
    title: `${bundle.title}: Complete Setup`,
    description: `${bundle.promise} ${bundle.why}`,
    path: `/bundles/${bundle.handle}`,
    jsonLd: breadcrumbJsonLd([
      {name: 'Home', path: '/'},
      {name: 'Complete setups', path: '/bundles'},
      {name: bundle.title, path: `/bundles/${bundle.handle}`},
    ]),
  });
};

export async function loader({context, params}: Route.LoaderArgs) {
  const bundle = BUNDLE_BY_HANDLE.get(params.handle ?? '');
  if (!bundle) throw new Response(null, {status: 404});
  const curated = await getCuratedProducts(context.storefront);
  return {bundle, curated, showSavings: context.env.PUBLIC_BUNDLE_DISCOUNTS === 'on'};
}

export default function BundlePage() {
  const {bundle, curated, showSavings} = useLoaderData<typeof loader>();
  const {open} = useDrawer();
  const products = byHandle(curated);
  const rows = bundle.items.map((item) => ({item, product: products.get(item.handle), entry: catalogEntry(item.handle)}));
  const purchasable = rows.every((r) => r.product?.selectedOrFirstAvailableVariant?.availableForSale);
  const total = rows.reduce(
    (sum, r) =>
      sum +
      Number(r.product?.selectedOrFirstAvailableVariant?.price.amount ?? r.entry?.priceUsd ?? 0) * r.item.quantity,
    0,
  );
  const currency = rows[0]?.product?.selectedOrFirstAvailableVariant?.price.currencyCode ?? 'USD';
  const lines = rows
    .filter((r) => r.product?.selectedOrFirstAvailableVariant)
    .map((r) => ({
      merchandiseId: r.product!.selectedOrFirstAvailableVariant!.id,
      quantity: r.item.quantity,
      attributes: [{key: '_bundle', value: bundle.handle}],
    }));
  const mission = MISSIONS[bundle.mission as MissionHandle];

  return (
    <>
      <Breadcrumbs
        items={[
          {name: 'Home', path: '/'},
          {name: 'Complete setups', path: '/bundles'},
          {name: bundle.title, path: `/bundles/${bundle.handle}`},
        ]}
      />
      <div className="container pdp">
        <div className="stack">
          <p className="eyebrow">Complete setup · {bundle.season}</p>
          <h1 className="h1">{bundle.title}</h1>
          <p className="lede">{bundle.promise}</p>
          <p className="muted">{bundle.why}</p>
          <ul className="bundle-list">
            {rows.map(({item, product, entry}) => (
              <li key={item.handle} className="bundle-line">
                <ProductMedia image={product?.featuredImage} handle={item.handle} alt="" sizes="72px" />
                <div>
                  <p className="eyebrow">{item.role}</p>
                  {product ? (
                    <Link to={`/products/${item.handle}`} className="card__title">
                      {product.title}
                    </Link>
                  ) : (
                    <span className="card__title">{entry?.title}</span>
                  )}
                  <p className="meta">{entry?.outcome}</p>
                </div>
                <span className="price">
                  {item.quantity > 1 ? `${item.quantity} × ` : ''}
                  {product
                    ? formatMoney(product.selectedOrFirstAvailableVariant?.price)
                    : entry
                      ? usd(entry.priceUsd)
                      : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="pdp__info stack callout">
          <div className="bundle-total">
            <span>Setup total</span>
            <strong>{usd(showSavings ? total - bundle.savingsUsd : total)}</strong>
          </div>
          {showSavings ? (
            <p className="save">
              Saves {usd(bundle.savingsUsd)} versus buying separately — applied
              automatically in your cart.
            </p>
          ) : (
            <p className="meta">The sum of the pieces. Remove anything you already own in the cart.</p>
          )}
          <AddToCart
            lines={[]}
            action={BUNDLE_ADD}
            inputs={{lines, discountCode: bundle.discountCode}}
            disabled={!purchasable}
            onClick={() => {
              track('add_bundle_to_cart', {
                currency,
                value: total,
                bundle: bundle.handle,
                items: rows
                  .filter((r) => r.product)
                  .map((r) => ({
                    item_id: catalogItemId(r.product!.id, r.product!.selectedOrFirstAvailableVariant!.id),
                    item_name: r.product!.title,
                    item_brand: r.product!.vendor,
                    price: Number(r.product!.selectedOrFirstAvailableVariant!.price.amount),
                    quantity: r.item.quantity,
                  })),
              });
              open('cart');
            }}
          >
            {purchasable ? 'Add the complete setup' : 'Not available right now'}
          </AddToCart>
          <p className="meta">
            Already own a piece? Add the setup, then remove it in the cart.
          </p>
          {mission ? (
            <Link to={`/collections/${mission.handle}`} className="link">
              Browse all {mission.label.toLowerCase()} gear
            </Link>
          ) : null}
        </div>
      </div>
      <section className="section section--paper2">
        <div className="container">
          <TrustStrip />
        </div>
      </section>
    </>
  );
}
