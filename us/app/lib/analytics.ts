/**
 * Trenzora US analytics.
 *
 * Three layers, none of which replaces the others:
 * 1. Shopify analytics — Hydrogen's <Analytics.Provider> (page, product,
 *    collection, search, cart events → Shopify Admin reports).
 * 2. Storefront pixels — Meta Pixel and GA4/Google Ads, loaded by
 *    <Tracking/> only when their IDs are set AND the visitor's Shopify
 *    consent allows it. Fires PageView, ViewContent, Search, AddToCart and
 *    InitiateCheckout.
 * 3. Checkout — Purchase (and checkout steps) fire inside Shopify checkout
 *    via the Facebook & Instagram app (Pixel + Conversions API) and the
 *    Google & YouTube app. We never fire Purchase from the storefront, so
 *    nothing double-counts.
 *
 * Item IDs use Shopify's catalog format `shopify_US_<product>_<variant>`,
 * the ID the Facebook & Instagram and Google & YouTube apps send to the
 * Meta catalog and Merchant Center, so dynamic ads and remarketing match.
 * Every event is also pushed to window.dataLayer for GTM/QA.
 */
export type StoreEvent =
  | 'page_view'
  | 'view_item'
  | 'view_item_list'
  | 'search'
  | 'add_to_cart'
  | 'view_cart'
  | 'begin_checkout'
  | 'add_bundle_to_cart'
  | 'email_signup';

export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
};

export type EventParams = {
  currency?: string;
  value?: number;
  items?: AnalyticsItem[];
  search_term?: string;
  item_list_name?: string;
  [key: string]: unknown;
};

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: unknown;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: Fbq;
    _fbq?: Fbq;
    gtag?: (...args: unknown[]) => void;
    __trenzoraPixels?: {meta: boolean; google: boolean};
  }
}

const numericId = (gid: string | null | undefined) =>
  String(gid ?? '').split('/').pop()?.split('?')[0] ?? '';

/** Shopify channel catalog ID: shopify_US_<productId>_<variantId>. */
export function catalogItemId(productGid: string, variantGid: string) {
  return `shopify_US_${numericId(productGid)}_${numericId(variantGid)}`;
}

const META_EVENTS: Partial<Record<StoreEvent, string>> = {
  page_view: 'PageView',
  view_item: 'ViewContent',
  search: 'Search',
  add_to_cart: 'AddToCart',
  add_bundle_to_cart: 'AddToCart',
  begin_checkout: 'InitiateCheckout',
  email_signup: 'Lead',
};

export function eventId() {
  return `tz-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function track(event: StoreEvent, params: EventParams = {}) {
  if (typeof window === 'undefined') return;
  const id = eventId();
  const {items, currency, value, ...rest} = params;

  window.dataLayer = window.dataLayer || [];
  if (items) window.dataLayer.push({ecommerce: null});
  window.dataLayer.push({
    event,
    event_id: id,
    ...rest,
    ...(items ? {ecommerce: {currency, value, items}} : {currency, value}),
  });

  const pixels = window.__trenzoraPixels;
  if (pixels?.google && window.gtag) {
    const gaEvent = event === 'add_bundle_to_cart' ? 'add_to_cart' : event;
    window.gtag('event', gaEvent, {currency, value, items, ...rest});
  }
  const metaEvent = META_EVENTS[event];
  if (pixels?.meta && window.fbq && metaEvent) {
    const custom: Record<string, unknown> = {};
    if (items?.length) {
      custom.content_ids = items.map((i) => i.item_id);
      custom.content_type = 'product';
      custom.contents = items.map((i) => ({id: i.item_id, quantity: i.quantity ?? 1}));
      custom.num_items = items.reduce((n, i) => n + (i.quantity ?? 1), 0);
    }
    if (value != null) custom.value = value;
    if (currency) custom.currency = currency;
    if (params.search_term) custom.search_string = params.search_term;
    window.fbq('track', metaEvent, custom, {eventID: id});
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', event, params);
  }
}
