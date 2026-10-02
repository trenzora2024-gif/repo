/**
 * Trenzora analytics layer.
 *
 * - Shopify analytics (page views, product views, cart, checkout, purchase)
 *   is handled by Hydrogen's <Analytics.Provider> + Shopify Customer Events.
 * - This module adds a vendor-neutral event stream on `window.dataLayer`
 *   (GA4/GTM/Meta-ready) with Trenzora's own event names, without shipping
 *   any third-party script. Wire GTM or a Shopify custom pixel to it later.
 *
 * Key funnel: customization_start → customization_complete → add_to_cart
 *             → begin_checkout → purchase
 */
export type TrenzoraEvent =
  | 'page_view'
  | 'view_item'
  | 'customization_start'
  | 'customization_complete'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'purchase'
  | 'share_design'
  | 'email_signup';

export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  item_variant?: string;
  design_family?: string;
  price?: number;
  quantity?: number;
};

export type TrenzoraEventParams = {
  currency?: string;
  value?: number;
  items?: AnalyticsItem[];
  design_family?: string;
  method?: string;
  [key: string]: unknown;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function track(event: TrenzoraEvent, params: TrenzoraEventParams = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  // GA4 convention: clear the previous ecommerce object first.
  const {items, currency, value, ...rest} = params;
  if (items) window.dataLayer.push({ecommerce: null});
  window.dataLayer.push({
    event,
    ...rest,
    ...(items ? {ecommerce: {currency, value, items}} : {currency, value}),
  });
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', event, params);
  }
}
