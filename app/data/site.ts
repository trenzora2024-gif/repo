/**
 * Site-wide brand + policy content. Every operational promise (dispatch
 * times, returns window, contact details) lives here so it can be updated in
 * one place once supplier SLAs are confirmed.
 */
export const SITE = {
  name: 'Trenzora',
  domain: 'trenzora.in',
  url: 'https://trenzora.in',
  positioning: 'Made for people with personality.',
  supporting: 'Original designs. Personalized products. Indian stories.',
  description:
    'Trenzora makes original-design oversized tees, totes and tumblers in India. Made for people with personality — printed to order and delivered across India.',
  locale: 'en_IN',
  country: 'IN',
  currency: 'INR',
  // TODO(brand): confirm the public support inbox + handles before launch.
  contactEmail: 'hello@trenzora.in',
  social: {
    instagram: 'https://www.instagram.com/trenzora.in',
  },
} as const;

/**
 * Fulfilment promise. Ranges are conservative POD norms for India and must be
 * validated against Printrove/Qikink SLAs during sampling.
 */
export const SHIPPING = {
  productionDays: '2–4 working days',
  deliveryDays: '3–7 working days',
  totalEstimate: '5–11 working days',
  coverage: 'We ship across India.',
  costNote: 'Shipping is calculated at checkout.',
} as const;

export const RETURNS = {
  windowDays: 7,
  summary:
    'Every piece is printed for you, so we can’t accept returns for change of mind or size. If your order arrives damaged, misprinted or wrong, tell us within 7 days of delivery with a photo and we’ll replace it at no cost.',
} as const;

export const HOW_ITS_MADE = [
  {
    title: 'You order',
    body: 'Nothing is printed until you place your order — no dead stock, no waste.',
  },
  {
    title: 'We print',
    body: `Your piece is printed to order by our production partners in India within ${SHIPPING.productionDays}.`,
  },
  {
    title: 'It ships',
    body: `We send tracking by email once it’s dispatched. Delivery usually takes ${SHIPPING.deliveryDays}.`,
  },
] as const;

export const FAQ = [
  {
    q: 'When will my order arrive?',
    a: `Each piece is made to order. Printing takes ${SHIPPING.productionDays} and delivery takes ${SHIPPING.deliveryDays} after dispatch, depending on your pin code.`,
  },
  {
    q: 'What happens after I order?',
    a: 'You get an order confirmation email straight away. When your piece is printed and dispatched, we email you a tracking link.',
  },
  {
    q: 'Can I return or exchange?',
    a: RETURNS.summary,
  },
  {
    q: 'Can I add my own name?',
    a: 'Not yet. Adding names, a city or a date is coming soon on the Us and Make It Yours designs. For now every design ships exactly as shown.',
  },
  {
    q: 'Is the design original?',
    a: 'Yes. Every Trenzora design is drawn in-house. We don’t resell stock graphics.',
  },
] as const;

/** Primary navigation. Keep it short — this is the brand, not a mall. */
export const PRIMARY_NAV = [
  {title: 'Shop', to: '/collections/all'},
  {title: 'Drops', to: '/collections/drops'},
  {title: 'Personalize', to: '/collections/personalize'},
  {title: 'Gifts', to: '/collections/gifts'},
  {title: 'About', to: '/about'},
] as const;

export const FOOTER_NAV = {
  shop: [
    {title: 'All products', to: '/collections/all'},
    {title: 'Mumbai Made', to: '/collections/mumbai-made'},
    {title: 'Drops', to: '/collections/drops'},
    {title: 'Trending', to: '/collections/trending'},
    {title: 'Gifts', to: '/collections/gifts'},
  ],
  help: [
    {title: 'Shipping', to: '/shipping'},
    {title: 'Contact', to: '/contact'},
    {title: 'Refund policy', to: '/policies/refund-policy'},
    {title: 'Privacy policy', to: '/policies/privacy-policy'},
    {title: 'Terms of service', to: '/policies/terms-of-service'},
  ],
  brand: [
    {title: 'About Trenzora', to: '/about'},
    {title: 'Search', to: '/search'},
  ],
} as const;
