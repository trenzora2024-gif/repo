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
  supporting: 'Original designs. Indian stories. Printed to order.',
  description:
    'Trenzora makes original-design oversized tees, totes and tumblers in India. Made for people with personality — printed to order and delivered across India.',
  locale: 'en_IN',
  country: 'IN',
  currency: 'INR',
  contactEmail: 'cs@trenzora.com',
  social: {
    instagram: 'https://www.instagram.com/trenzora.in',
  },
} as const;

/**
 * Business identity shown on Contact, policies and grievance details.
 * Address and phone are the values configured in Shopify (Settings → Store
 * details, read 2026-10-04). `null` = not provided yet: the page omits it and
 * the gap is listed in LAUNCH-BLOCKERS.md. Never fill these with guesses.
 */
export const BUSINESS = {
  tradingName: 'Trenzora',
  /** Registered legal name and entity type (e.g. proprietorship / LLP / Pvt Ltd). */
  legalName: null as string | null,
  /** GSTIN, shown on invoices; not required on the site. */
  gstin: null as string | null,
  phone: '+91 96196 57030',
  phoneHref: 'tel:+919619657030',
  address: [
    'Ground Floor, Shop No. 63, Panchavati Plaza',
    'Ghansoli, Navi Mumbai',
    'Maharashtra 400701, India',
  ],
  /** Grievance Officer (Consumer Protection (E-Commerce) Rules, 2020). */
  grievanceOfficer: null as {name: string; designation: string} | null,
  /** Support hours, once decided (e.g. 'Mon–Sat, 10am–6pm IST'). */
  supportHours: null as string | null,
  /**
   * Orders can be cancelled until they enter production. Set a fixed window
   * (in hours) only once the fulfilment flow guarantees it.
   */
  cancellationWindowHours: null as number | null,
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
    'Every piece is made to order, so we can’t accept returns for change of mind or size. If your order arrives damaged, defective, misprinted or wrong, tell us within 7 days of delivery with photos and we’ll replace it at no cost, or refund you if a replacement isn’t possible.',
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
    q: 'What is Trenzora?',
    a: 'Trenzora is an Indian design brand. We make original-design oversized tees, totes and tumblers, made for people with personality. Every design is a Trenzora original.',
  },
  {
    q: 'Where do you ship?',
    a: 'We currently deliver within India only.',
  },
  {
    q: 'How long does delivery take?',
    a: `Each piece is made to order. Production usually takes ${SHIPPING.productionDays}, and delivery usually takes ${SHIPPING.deliveryDays} after dispatch, depending on your pin code. These are estimates, not guarantees.`,
  },
  {
    q: 'How much is shipping?',
    a: 'The shipping charge for your order is shown at checkout before you pay.',
  },
  {
    q: 'How can I track my order?',
    a: 'When your order is dispatched, we email you a tracking link. Your order confirmation email also has a link to your order status page.',
  },
  {
    q: 'Can I cancel my order?',
    a: 'Write to us as soon as possible. If your order hasn’t gone into production yet, we’ll cancel it and refund you in full. Once production has started, we can’t cancel it.',
  },
  {
    q: 'Do you accept returns?',
    a: RETURNS.summary,
  },
  {
    q: 'What if my product arrives damaged?',
    a: `Email us within ${RETURNS.windowDays} days of delivery with your order number and clear photos of the product and its packaging. Once we’ve checked them, we’ll replace it at no cost, or refund you if a replacement isn’t possible.`,
  },
  {
    q: 'What if I receive the wrong product?',
    a: `Email us within ${RETURNS.windowDays} days of delivery with your order number and photos of what you received. We’ll send the right product at no cost, or refund you if we can’t.`,
  },
  {
    q: 'Can I change my size after ordering?',
    a: 'Only before your order goes into production, so write to us straight away. After that we can’t change or exchange sizes, because each piece is made for your order. Check the size details on the product page before you buy.',
  },
  {
    q: 'Are products made to order?',
    a: 'Yes. Nothing is printed until you order, which is why production takes a few working days.',
  },
  {
    q: 'How should I care for my products?',
    a: 'Tees: machine wash cold, inside out; don’t bleach; don’t iron directly on the print; line dry in shade. Totes: spot clean, or hand wash cold inside out if needed. Tumblers: hand wash only; not dishwasher or microwave safe. Full care notes are on each product page.',
  },
  {
    q: 'Can I add my own name?',
    a: 'Not yet. Personalized designs are coming soon. Every design available today is a Trenzora original, printed as shown.',
  },
  {
    q: 'How can I contact support?',
    a: 'Email cs@trenzora.com or call +91 96196 57030. Please include your order number.',
  },
] as const;

/** Primary navigation. Keep it short — this is the brand, not a mall. */
export const PRIMARY_NAV = [
  {title: 'Shop', to: '/collections/all'},
  {title: 'Drops', to: '/collections/drops'},
  {title: 'Personalize', to: '/personalize'},
  {title: 'Gifts', to: '/collections/gifts'},
  {title: 'About', to: '/about'},
] as const;

export const FOOTER_NAV = {
  shop: [
    {title: 'Shop all', to: '/collections/all'},
    {title: 'Mumbai Made', to: '/collections/mumbai-made'},
    {title: 'Drops', to: '/collections/drops'},
    {title: 'The Edit', to: '/collections/trending'},
    {title: 'Gifts', to: '/collections/gifts'},
  ],
  help: [
    {title: 'Contact', to: '/contact'},
    {title: 'Track your order', to: '/track-order'},
    {title: 'FAQ', to: '/faq'},
    {title: 'Shipping', to: '/shipping'},
    {title: 'Returns & refunds', to: '/policies/refund-policy'},
    {title: 'Cancellations', to: '/policies/cancellation-policy'},
    {title: 'Privacy policy', to: '/policies/privacy-policy'},
    {title: 'Terms of service', to: '/policies/terms-of-service'},
  ],
  brand: [
    {title: 'About Trenzora', to: '/about'},
    {title: 'Search', to: '/search'},
  ],
} as const;
