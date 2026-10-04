import {useEffect, useRef} from 'react';
import {AnalyticsEvent, useAnalytics} from '@shopify/hydrogen';
import {catalogItemId, track} from '~/lib/analytics';

/**
 * Loads Meta Pixel and gtag (GA4 + Google Ads) when their IDs are set and
 * Shopify's Customer Privacy API allows it, then mirrors Hydrogen analytics
 * events onto them (see lib/analytics.ts for the event map).
 */
export function Tracking({
  metaPixelId,
  ga4Id,
  googleAdsId,
}: {
  metaPixelId?: string;
  ga4Id?: string;
  googleAdsId?: string;
}) {
  const {subscribe, register, customerPrivacy} = useAnalytics();
  const {ready} = register('Trenzora pixels');
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current || !customerPrivacy) return;
    loaded.current = true;
    const marketing = customerPrivacy.marketingAllowed?.() ?? false;
    const analytics = customerPrivacy.analyticsProcessingAllowed?.() ?? false;
    window.__trenzoraPixels = {meta: false, google: false};

    if (metaPixelId && marketing) {
      loadMetaPixel(metaPixelId);
      window.__trenzoraPixels.meta = true;
    }
    const googleIds = [ga4Id && analytics ? ga4Id : '', googleAdsId && marketing ? googleAdsId : ''].filter(Boolean);
    if (googleIds.length) {
      loadGtag(googleIds);
      window.__trenzoraPixels.google = true;
    }
    // Hydrogen holds events until every registered listener is ready, so
    // the first PageView reaches the pixels configured above.
    ready();
  }, [customerPrivacy, metaPixelId, ga4Id, googleAdsId, ready]);

  useEffect(() => {
    subscribe(AnalyticsEvent.PAGE_VIEWED, (payload) => {
      track('page_view', {page_location: payload.url});
    });

    subscribe(AnalyticsEvent.PRODUCT_VIEWED, (payload) => {
      const p = payload.products[0];
      if (!p) return;
      track('view_item', {
        currency: payload.shop?.currency ?? 'USD',
        value: Number(p.price),
        items: [
          {
            item_id: catalogItemId(p.id, p.variantId),
            item_name: p.title,
            item_brand: p.vendor,
            item_category: p.productType ?? undefined,
            item_variant: p.variantTitle,
            price: Number(p.price),
            quantity: 1,
          },
        ],
      });
    });

    subscribe(AnalyticsEvent.COLLECTION_VIEWED, (payload) => {
      track('view_item_list', {item_list_name: payload.collection.handle});
    });

    subscribe(AnalyticsEvent.SEARCH_VIEWED, (payload) => {
      if (payload.searchTerm) track('search', {search_term: payload.searchTerm});
    });

    subscribe(AnalyticsEvent.CART_VIEWED, (payload) => {
      const cost = payload.cart?.cost?.totalAmount;
      track('view_cart', {currency: cost?.currencyCode, value: Number(cost?.amount ?? 0)});
    });

    subscribe(AnalyticsEvent.PRODUCT_ADD_TO_CART, ({currentLine, prevLine}) => {
      if (!currentLine) return;
      const added = currentLine.quantity - (prevLine?.quantity ?? 0);
      if (added <= 0) return;
      const m = currentLine.merchandise;
      const unit = Number(currentLine.cost?.amountPerQuantity?.amount ?? 0);
      track('add_to_cart', {
        currency: currentLine.cost?.amountPerQuantity?.currencyCode ?? 'USD',
        value: unit * added,
        items: [
          {
            item_id: catalogItemId(m.product.id, m.id),
            item_name: m.product.title,
            item_brand: m.product.vendor,
            item_variant: m.title,
            price: unit,
            quantity: added,
          },
        ],
      });
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

function inject(src: string) {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function loadMetaPixel(id: string) {
  if (window.fbq) return;
  const fbq: NonNullable<Window['fbq']> = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue!.push(args);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;
  inject('https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', id);
}

function loadGtag(ids: string[]) {
  if (window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  // gtag must push the `arguments` object itself.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  inject(`https://www.googletagmanager.com/gtag/js?id=${ids[0]}`);
  window.gtag('js', new Date());
  // page_view is sent by <Tracking/> on every client-side navigation.
  for (const id of ids) window.gtag('config', id, {send_page_view: false});
}
