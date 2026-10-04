import {CATALOG_BY_HANDLE} from './catalog.ts';

/**
 * Complete setups. Each bundle adds its component products to the cart in
 * one action (cart lines carry a `_bundle` attribute for reporting).
 *
 * Savings are shown only when PUBLIC_BUNDLE_DISCOUNTS=on, i.e. after the
 * matching discount code exists in Shopify Admin (us/catalog/bundles.md has
 * the exact settings). Until then bundles are sold at the sum of their parts:
 * the value is convenience, never a fake "was" price.
 */
export type Bundle = {
  handle: string;
  title: string;
  mission: string;
  promise: string;
  why: string;
  items: Array<{handle: string; quantity: number; role: string}>;
  /** Fixed amount off the bundle, applied by `discountCode`. */
  savingsUsd: number;
  discountCode: string;
  season: string;
  tone: 'pine' | 'clay' | 'sand' | 'slate' | 'ember';
};

export const BUNDLES: Bundle[] = [
  {
    handle: 'weekend-car-camping-setup',
    title: 'Weekend Car Camping Setup',
    mission: 'weekend-car-camping',
    promise: 'Shelter, sleep, light and a good chair — the four things first trips get wrong.',
    why: 'Built around the SUV tailgate tent so your vehicle becomes part of camp.',
    items: [
      {handle: 'suv-tailgate-tent', quantity: 1, role: 'Shelter'},
      {handle: 'folding-cot-with-mattress', quantity: 1, role: 'Sleep'},
      {handle: 'rechargeable-lantern-power-bank', quantity: 1, role: 'Light'},
      {handle: 'reclining-camp-chair', quantity: 1, role: 'Comfort'},
    ],
    savingsUsd: 17,
    discountCode: 'SETUP-WEEKEND',
    season: 'Mar–Oct',
    tone: 'pine',
  },
  {
    handle: 'hot-tent-basecamp',
    title: 'Hot-Tent Basecamp',
    mission: 'cold-weather-camping',
    promise: 'A heated canvas basecamp for hunting season and cold nights.',
    why: 'Tent and stove are matched, plus the sleep system that keeps you off cold ground.',
    items: [
      {handle: 'canvas-bell-tent-5m', quantity: 1, role: 'Shelter'},
      {handle: 'tent-wood-stove', quantity: 1, role: 'Heat'},
      {handle: 'folding-cot-with-mattress', quantity: 1, role: 'Sleep'},
      {handle: 'cold-weather-sleeping-bag', quantity: 1, role: 'Warmth'},
    ],
    savingsUsd: 37,
    discountCode: 'SETUP-HOTTENT',
    season: 'Sep–Feb',
    tone: 'ember',
  },
  {
    handle: 'camp-kitchen-kit',
    title: 'Camp Kitchen Kit',
    mission: 'camp-kitchen',
    promise: 'Cook standing up, with water on tap and a bin that keeps it all packed.',
    why: 'Pack it once; it lives in the bin between trips.',
    items: [
      {handle: 'camp-kitchen-table', quantity: 1, role: 'Cook station'},
      {handle: 'camp-cookware-set', quantity: 1, role: 'Cookware'},
      {handle: 'collapsible-water-jug', quantity: 1, role: 'Water'},
      {handle: 'camp-storage-box', quantity: 1, role: 'Storage'},
    ],
    savingsUsd: 12,
    discountCode: 'SETUP-KITCHEN',
    season: 'Apr–Oct',
    tone: 'clay',
  },
  {
    handle: 'tailgate-ready-kit',
    title: 'Tailgate-Ready Kit',
    mission: 'tailgate-and-backyard',
    promise: 'One trip from the car, a cook station and a chair worth sitting in.',
    why: 'Solves the logistics that ruin tailgates: hauling, prep space, seating.',
    items: [
      {handle: 'collapsible-wagon', quantity: 1, role: 'Haul'},
      {handle: 'camp-kitchen-table', quantity: 1, role: 'Cook station'},
      {handle: 'reclining-camp-chair', quantity: 1, role: 'Seat'},
      {handle: 'camp-side-table', quantity: 1, role: 'Table'},
    ],
    savingsUsd: 16,
    discountCode: 'SETUP-TAILGATE',
    season: 'Aug–Nov',
    tone: 'clay',
  },
  {
    handle: 'family-comfort-kit',
    title: 'Family Comfort Kit',
    mission: 'family-campsite',
    promise: 'Bathroom, hot shower and running water at your own site.',
    why: 'Removes the comfort complaints that end family trips early.',
    items: [
      {handle: 'pop-up-privacy-tent', quantity: 1, role: 'Privacy'},
      {handle: 'portable-camp-toilet', quantity: 1, role: 'Bathroom'},
      {handle: 'portable-propane-water-heater', quantity: 1, role: 'Hot water'},
      {handle: 'collapsible-water-jug', quantity: 1, role: 'Water'},
    ],
    savingsUsd: 16,
    discountCode: 'SETUP-FAMILY',
    season: 'Apr–Sep',
    tone: 'pine',
  },
  {
    handle: 'off-grid-power-kit',
    title: 'Off-Grid Power Kit',
    mission: 'power-and-light',
    promise: 'Silent power for camp and for the next outage, recharged by the sun.',
    why: 'Panel and station are paired so the connectors match.',
    items: [
      {handle: 'portable-power-station-300w', quantity: 1, role: 'Power'},
      {handle: 'foldable-solar-panel-100w', quantity: 1, role: 'Recharge'},
      {handle: 'rechargeable-lantern-power-bank', quantity: 1, role: 'Light'},
    ],
    savingsUsd: 17,
    discountCode: 'SETUP-POWER',
    season: 'Year-round (outage season Nov–Mar, Jun–Oct)',
    tone: 'slate',
  },
];

export const BUNDLE_BY_HANDLE = new Map(BUNDLES.map((b) => [b.handle, b]));

/** Sum of recommended prices; the live price comes from Shopify. */
export function bundleListTotal(bundle: Bundle) {
  return bundle.items.reduce((sum, item) => {
    const product = CATALOG_BY_HANDLE.get(item.handle);
    return sum + (product?.priceUsd ?? 0) * item.quantity;
  }, 0);
}
