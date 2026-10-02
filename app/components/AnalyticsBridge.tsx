import {useEffect} from 'react';
import {AnalyticsEvent, useAnalytics} from '@shopify/hydrogen';
import {track} from '~/lib/analytics';
import {resolveCatalogueEntry} from '~/data/catalogue';

/**
 * Mirrors Hydrogen's standard analytics events onto Trenzora's dataLayer
 * event names. Custom events (customization_*, begin_checkout, share_design,
 * email_signup) are tracked directly where they happen.
 */
export function AnalyticsBridge() {
  const {subscribe, register} = useAnalytics();
  const {ready} = register('Trenzora dataLayer');

  useEffect(() => {
    subscribe(AnalyticsEvent.PAGE_VIEWED, (payload) => {
      track('page_view', {page_location: payload.url});
    });

    subscribe(AnalyticsEvent.PRODUCT_VIEWED, (payload) => {
      const product = payload.products[0];
      if (!product) return;
      const handle = String(product.handle ?? '');
      const entry = handle ? resolveCatalogueEntry({handle}) : null;
      track('view_item', {
        currency: String(product.currency ?? 'INR'),
        value: Number(product.price),
        design_family: entry?.family.handle,
        items: [
          {
            item_id: product.sku || product.variantId,
            item_name: product.title,
            item_brand: product.vendor,
            item_category: product.productType ?? undefined,
            item_variant: product.variantTitle,
            design_family: entry?.family.handle,
            price: Number(product.price),
            quantity: 1,
          },
        ],
      });
    });

    subscribe(AnalyticsEvent.PRODUCT_ADD_TO_CART, ({currentLine, prevLine}) => {
      if (!currentLine) return;
      const added = currentLine.quantity - (prevLine?.quantity ?? 0);
      const merchandise = currentLine.merchandise;
      const unit = Number(currentLine.cost?.amountPerQuantity?.amount ?? 0);
      const entry = resolveCatalogueEntry({handle: merchandise.product.handle});
      const personalized = (currentLine.attributes ?? []).some(
        (attribute) => !attribute.key.startsWith('__'),
      );
      track('add_to_cart', {
        currency: currentLine.cost?.amountPerQuantity?.currencyCode ?? 'INR',
        value: unit * added,
        design_family: entry?.family.handle,
        personalized,
        items: [
          {
            item_id: merchandise.sku || merchandise.id,
            item_name: merchandise.product.title,
            item_variant: merchandise.title,
            design_family: entry?.family.handle,
            price: unit,
            quantity: added,
          },
        ],
      });
    });

    ready();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
