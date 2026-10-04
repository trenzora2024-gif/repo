import {Link} from 'react-router';
import type {ProductCardFragment} from 'storefrontapi.generated';
import {Glyph} from '~/components/ProductArt';
import {ProductMedia} from '~/components/ProductMedia';
import {CATALOG_BY_HANDLE, type ArtIcon} from '~/data/catalog';
import {bundleListTotal, type Bundle} from '~/data/bundles';
import type {Guide} from '~/data/guides';
import type {CollectionContent} from '~/data/missions';
import {TRUST_POINTS} from '~/data/site';
import {formatMoney, usd} from '~/lib/money';

const MISSION_ICON: Record<string, ArtIcon> = {
  'weekend-car-camping': 'tent',
  'camp-kitchen': 'table',
  'cold-weather-camping': 'stove',
  'sleep-better-outside': 'cot',
  'power-and-light': 'lantern',
  'tailgate-and-backyard': 'wagon',
  'family-campsite': 'privacy',
  'gifts-for-campers': 'fire',
  shelter: 'tent',
  sleep: 'cot',
  'camp-kitchen-gear': 'pot',
  'seating-tables': 'chair',
  'heat-fire': 'fire',
  'power-light': 'battery',
  'haul-storage': 'wagon',
  'campsite-comfort': 'shower',
};

export function MissionTile({mission}: {mission: CollectionContent}) {
  return (
    <Link
      to={`/collections/${mission.handle}`}
      className={`tile tone-${mission.tone}`}
      prefetch="intent"
    >
      <Glyph icon={MISSION_ICON[mission.handle] ?? 'tent'} className="tile__icon" />
      <div className="stack-sm">
        {mission.job ? <p className="tile__job">{mission.job}</p> : null}
        <p className="tile__title">{mission.title}</p>
      </div>
    </Link>
  );
}

export function BundleCard({
  bundle,
  products,
  showSavings,
}: {
  bundle: Bundle;
  products: Map<string, ProductCardFragment>;
  showSavings: boolean;
}) {
  const live = bundle.items.every((i) => products.has(i.handle));
  const total = live
    ? bundle.items.reduce(
        (sum, i) =>
          sum +
          Number(
            products.get(i.handle)!.selectedOrFirstAvailableVariant?.price.amount ??
              products.get(i.handle)!.priceRange.minVariantPrice.amount,
          ) *
            i.quantity,
        0,
      )
    : bundleListTotal(bundle);
  return (
    <Link to={`/bundles/${bundle.handle}`} className="bundle-card" prefetch="intent">
      <div className="bundle-card__items">
        {bundle.items.map((item) => {
          const product = products.get(item.handle);
          return (
            <ProductMedia
              key={item.handle}
              image={product?.featuredImage}
              handle={item.handle}
              alt=""
              sizes="80px"
            />
          );
        })}
      </div>
      <div className="stack-sm">
        <p className="eyebrow">{bundle.items.length} pieces · {bundle.season}</p>
        <h3 className="h3">{bundle.title}</h3>
        <p className="muted">{bundle.promise}</p>
      </div>
      <p className="price">
        {showSavings ? (
          <>
            {usd(total - bundle.savingsUsd)} <span className="save">Save {usd(bundle.savingsUsd)} as a set</span>
          </>
        ) : (
          <>{usd(total)} for the complete setup</>
        )}
      </p>
    </Link>
  );
}

export function GuideCard({guide}: {guide: Guide}) {
  return (
    <Link to={`/guides/${guide.handle}`} className="guide-card" prefetch="intent">
      <p className="eyebrow">Guide · {guide.readMinutes} min read</p>
      <h3 className="h3">{guide.title}</h3>
      <p className="muted">{guide.description}</p>
      <span className="link">Read the guide</span>
    </Link>
  );
}

export function TrustStrip() {
  return (
    <div className="trust">
      {TRUST_POINTS.map((point) => (
        <div key={point.title} className="trust__item">
          <strong>{point.title}</strong>
          <p>{point.body}</p>
        </div>
      ))}
    </div>
  );
}

export function Breadcrumbs({items}: {items: Array<{name: string; path: string}>}) {
  return (
    <nav className="crumbs container" aria-label="Breadcrumb">
      <ol>
        {items.map((item, i) => (
          <li key={item.path}>
            {i === items.length - 1 ? (
              <span aria-current="page">{item.name}</span>
            ) : (
              <Link to={item.path}>{item.name}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Faq({items, title = 'Questions'}: {items: ReadonlyArray<{q: string; a: string}>; title?: string}) {
  if (!items.length) return null;
  return (
    <section className="faq" aria-labelledby="faq-title">
      <h2 id="faq-title" className="h2" style={{marginBottom: 16}}>
        {title}
      </h2>
      {items.map((item) => (
        <details key={item.q}>
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      ))}
    </section>
  );
}

/** Product cards for catalog handles that exist in Shopify (others are skipped). */
export function pickProducts(handles: string[], products: Map<string, ProductCardFragment>) {
  return handles.map((h) => products.get(h)).filter(Boolean) as ProductCardFragment[];
}

export function priceOf(product: ProductCardFragment) {
  return formatMoney(product.selectedOrFirstAvailableVariant?.price ?? product.priceRange.minVariantPrice);
}

export {CATALOG_BY_HANDLE};
