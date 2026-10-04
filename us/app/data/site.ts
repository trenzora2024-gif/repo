/**
 * Brand, promises and navigation for trenzora.com.
 *
 * Every customer promise lives here, in one place. Items marked
 * OWNER TO CONFIRM must be checked against Doba supplier policies before
 * launch (us/docs/LAUNCH-CHECKLIST.md §C).
 */
export const SITE = {
  name: 'Trenzora',
  url: 'https://trenzora.com',
  locale: 'en_US',
  positioning: 'Car camping and basecamp gear, sorted by what you’re trying to do.',
  valueProp: 'Hand-picked gear and complete setups for car camping, cold nights and weekends off-grid.',
  promise:
    'Every product here earns its place: it solves a real camp problem, works with the rest of your setup, and is explained honestly.',
  // OWNER TO CONFIRM: mailbox must exist before launch.
  contactEmail: 'support@trenzora.com',
  social: {
    instagram: 'https://www.instagram.com/trenzora',
    facebook: 'https://www.facebook.com/trenzora',
  } as Record<string, string>,
} as const;

export const SHIPPING = {
  // OWNER TO CONFIRM against each Doba supplier's free-shipping terms.
  headline: 'Free shipping in the contiguous US',
  costNote: 'Free shipping to the contiguous US.',
  regionNote: 'We don’t currently ship to Alaska, Hawaii, PO boxes or outside the US.',
  processingDays: '1–3 business days',
  deliveryDays: '3–7 business days',
  shipsFrom: 'US warehouses',
  holidayCutoff: 'Order by December 15 for the best chance of Christmas delivery.',
} as const;

export const RETURNS = {
  // OWNER TO CONFIRM against Doba supplier return policies (VEVOR has one).
  headline: '30-day returns',
  summary:
    'Changed your mind? Return unused items in their original packaging within 30 days of delivery. Arrived damaged or defective? Tell us within 7 days with a photo and we’ll make it right at no cost to you.',
  holiday: 'Holiday orders placed from November 1 can be returned until January 31.',
} as const;

export const TRUST_POINTS = [
  {title: SHIPPING.headline, body: `Ships from ${SHIPPING.shipsFrom} in ${SHIPPING.processingDays}.`},
  {title: RETURNS.headline, body: 'Unused items, original packaging. Damaged on arrival? We fix it.'},
  {title: 'Secure Shopify checkout', body: 'Shop Pay, Apple Pay, Google Pay and major cards.'},
  {title: 'Real answers', body: `Questions about fit or setup? ${SITE.contactEmail}`},
] as const;

export const NAV = [
  {label: 'Shop by mission', to: '/collections', key: 'missions'},
  {label: 'Gear', to: '/collections/all', key: 'gear'},
  {label: 'Complete setups', to: '/bundles', key: 'bundles'},
  {label: 'Guides', to: '/guides', key: 'guides'},
  {label: 'Gifts', to: '/collections/gifts-for-campers', key: 'gifts'},
] as const;

export const SEASONAL = {
  // Update monthly (see us/docs/STRATEGY.md §23 holiday calendar).
  eyebrow: 'October: hunting camp & cold nights',
  title: 'Heat your camp this fall',
  body: 'Canvas bell tents with stove jacks, tent wood stoves and cold-rated sleep systems, matched so they work together.',
  cta: {label: 'Shop cold-weather camping', to: '/collections/cold-weather-camping'},
  secondary: {label: 'Read the hot-tent guide', to: '/guides/hot-tent-camping-guide'},
} as const;

export const FAQ = [
  {q: 'Where do orders ship from?', a: `From ${SHIPPING.shipsFrom}. Orders leave in ${SHIPPING.processingDays} and arrive in ${SHIPPING.deliveryDays}.`},
  {q: 'Is shipping free?', a: `${SHIPPING.costNote} ${SHIPPING.regionNote}`},
  {q: 'What’s your return policy?', a: `${RETURNS.summary} ${RETURNS.holiday}`},
  {q: 'Will I see other brand names on my gear?', a: 'Yes. We pick products from established manufacturers such as VEVOR and show the maker on every product page — we don’t relabel other people’s products as our own.'},
  {q: 'Why buy from Trenzora?', a: 'We pick fewer products, check that they work together, explain who each one is for and sell complete setups so you don’t have to research 400 listings.'},
] as const;
