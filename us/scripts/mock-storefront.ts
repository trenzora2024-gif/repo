/**
 * DEV ONLY — local Storefront API mock serving the Trenzora US catalog.
 *
 * Lets the storefront be previewed and QA'd before the trenzora.com store is
 * connected. It executes real queries against the real Storefront API schema
 * shipped with Hydrogen, so a query the mock accepts is a query Shopify
 * accepts. Cart state is in-memory. Products have no images (none exist
 * yet), so pages show the brand glyphs, as they would in production for any
 * product without media.
 *
 * Never deployed. Run with:  npm run dev:mock
 */
import {createServer, type IncomingMessage, type ServerResponse} from 'node:http';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {
  buildClientSchema,
  execute,
  parse,
  validate,
  type GraphQLFieldResolver,
  type GraphQLTypeResolver,
  type IntrospectionQuery,
} from 'graphql';
import {CATALOG, type CatalogProduct} from '../app/data/catalog.ts';
import {BUNDLES} from '../app/data/bundles.ts';
import {GEAR, MISSIONS} from '../app/data/missions.ts';

const PORT = Number(process.env.MOCK_STOREFRONT_PORT ?? 4200);
const require = createRequire(import.meta.url);
const schemaPath = require.resolve('@shopify/hydrogen/storefront.schema.json');
const introspection = JSON.parse(readFileSync(schemaPath, 'utf8')) as
  | IntrospectionQuery
  | {data: IntrospectionQuery};
const schema = buildClientSchema('data' in introspection ? introspection.data : introspection);

type Obj = Record<string, unknown>;
const money = (amount: number) => ({__typename: 'MoneyV2', amount: amount.toFixed(2), currencyCode: 'USD'});

function connection<T>(items: T[], args: {first?: number; last?: number} = {}) {
  const sliced =
    args.first != null ? items.slice(0, args.first) : args.last != null ? items.slice(-args.last) : items;
  return {
    nodes: sliced,
    edges: sliced.map((node, i) => ({node, cursor: String(i)})),
    pageInfo: {
      hasNextPage: sliced.length < items.length,
      hasPreviousPage: false,
      startCursor: '0',
      endCursor: String(Math.max(sliced.length - 1, 0)),
    },
    filters: [],
    totalCount: items.length,
  };
}

// ---------------------------------------------------------------- products
type MockItem = CatalogProduct & {
  tags: string[];
  variantsSpec: Array<{title: string; price: number; sku: string}>;
};
const VARIANT_OVERRIDES: Record<string, Array<{title: string; price: number}>> = {
  'truck-bed-tent': [
    {title: '5.5 ft bed', price: 169},
    {title: '6.5 ft bed', price: 169},
    {title: '8 ft bed', price: 179},
  ],
};
const items: MockItem[] = CATALOG.map((p) => ({
  ...p,
  tags: ['curated', `tier:${p.tier}`, `gear:${p.gear}`, ...p.missions.map((m) => `mission:${m}`)],
  variantsSpec: (VARIANT_OVERRIDES[p.handle] ?? [{title: 'Default Title', price: p.priceUsd}]).map((v, i) => ({
    ...v,
    sku: `TZ-${String(p.rank).padStart(3, '0')}-${i + 1}`,
  })),
}));
// A product from the old general store: live at its URL, never listed.
const legacy: MockItem = {
  ...CATALOG[0],
  rank: 999,
  handle: 'legacy-garden-hose-reel',
  title: 'Garden Hose Reel (legacy listing)',
  vendor: 'Generic',
  missions: [],
  tags: ['legacy'],
  variantsSpec: [{title: 'Default Title', price: 39.99, sku: 'LEGACY-1'}],
};
const products: Obj[] = [...items, legacy].map((item, index) => buildProduct(item, index + 1));

function buildProduct(item: MockItem, n: number): Obj {
  const description = `${item.outcome} ${item.whoFor}`;
  const product: Obj = {
    __typename: 'Product',
    id: `gid://shopify/Product/${8000 + n}`,
    handle: item.handle,
    title: item.title,
    vendor: item.vendor.includes('confirm') ? 'Trenzora Select' : item.vendor,
    tags: item.tags,
    productType: item.gear,
    description,
    descriptionHtml: `<p>${description}</p><p>[Mock] The manufacturer description from the supplier listing appears here — rewrite it before launch.</p>`,
    availableForSale: true,
    publishedAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
    createdAt: '2026-10-01T00:00:00Z',
    onlineStoreUrl: null,
    trackingParameters: null,
    isGiftCard: false,
    requiresSellingPlan: false,
    seo: {title: null, description: null},
    featuredImage: null,
    images: (args: {first?: number}) => connection([], args),
    media: (args: {first?: number}) => connection([], args),
    metafield: () => null,
    metafields: () => [],
    collections: () => connection([]),
    sellingPlanGroups: () => connection([]),
    priceRange: {
      minVariantPrice: money(Math.min(...item.variantsSpec.map((v) => v.price))),
      maxVariantPrice: money(Math.max(...item.variantsSpec.map((v) => v.price))),
    },
    compareAtPriceRange: {minVariantPrice: money(0), maxVariantPrice: money(0)},
    _item: item,
  };

  const optionName = item.variantsSpec.length > 1 ? 'Bed length' : 'Title';
  const variants = item.variantsSpec.map((spec, i) => ({
    __typename: 'ProductVariant',
    id: `gid://shopify/ProductVariant/${(8000 + n) * 10 + i}`,
    sku: spec.sku,
    barcode: null,
    title: spec.title,
    availableForSale: true,
    currentlyNotInStock: false,
    quantityAvailable: 50,
    requiresShipping: true,
    price: money(spec.price),
    compareAtPrice: null,
    unitPrice: null,
    image: null,
    weight: 0,
    weightUnit: 'POUNDS',
    selectedOptions: [{name: optionName, value: spec.title}],
    product,
    metafield: () => null,
  }));

  const optionValues = variants.map((variant) => ({
    __typename: 'ProductOptionValue',
    id: `${variant.id}-ov`,
    name: variant.title,
    swatch: null,
    firstSelectableVariant: variant,
  }));
  const encoded = variants.length > 1 ? `v1_0-${variants.length - 1}` : 'v1_0';
  const pick = (selected: Array<{name: string; value: string}> = []) =>
    variants.find((variant) =>
      selected.some(
        (s) =>
          s.name.toLowerCase() === variant.selectedOptions[0].name.toLowerCase() &&
          s.value.toLowerCase() === variant.selectedOptions[0].value.toLowerCase(),
      ),
    ) ?? variants[0];

  Object.assign(product, {
    options: [
      {
        __typename: 'ProductOption',
        id: `${product.id}-opt`,
        name: optionName,
        optionValues,
        values: optionValues.map((v) => v.name),
      },
    ],
    encodedVariantExistence: encoded,
    encodedVariantAvailability: encoded,
    variants: (args: {first?: number}) => connection(variants, args),
    variantsCount: {count: variants.length, precision: 'EXACT'},
    selectedOrFirstAvailableVariant: (args: {selectedOptions?: Array<{name: string; value: string}>}) =>
      pick(args.selectedOptions),
    variantBySelectedOptions: (args: {selectedOptions?: Array<{name: string; value: string}>}) =>
      pick(args.selectedOptions),
    adjacentVariants: () => variants,
    _variants: variants,
  });
  return product;
}

const allVariants = products.flatMap((p) => p._variants as Obj[]);

function matchesQuery(product: Obj, rawQuery?: string) {
  if (!rawQuery) return true;
  const item = product._item as MockItem;
  const tags = [...rawQuery.matchAll(/tag:([\w:-]+)/g)].map((m) => m[1]);
  const text = rawQuery
    .replace(/tag:[\w:-]+/g, ' ')
    .replace(/\b(AND|OR)\b|[()]/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (!tags.every((t) => item.tags.includes(t))) return false;
  const haystack = [item.title, item.outcome, item.problem, item.searchIntent, item.gear, ...item.tags]
    .join(' ')
    .toLowerCase();
  return text.every((term) => haystack.includes(term.replace(/\*$/, '')));
}

const priceOf = (p: Obj) => Number((p.priceRange as {minVariantPrice: {amount: string}}).minVariantPrice.amount);
function sortProducts(list: Obj[], args: {sortKey?: string; reverse?: boolean}) {
  const sorted = [...list];
  if (args.sortKey === 'PRICE') sorted.sort((a, b) => priceOf(a) - priceOf(b));
  else if (args.sortKey === 'TITLE') sorted.sort((a, b) => String(a.title).localeCompare(String(b.title)));
  else sorted.sort((a, b) => (a._item as MockItem).rank - (b._item as MockItem).rank);
  if (args.reverse) sorted.reverse();
  return sorted;
}

// ------------------------------------------------------------- collections
const collectionDefs = [
  ...Object.values(MISSIONS).map((c) => ({handle: c.handle, title: c.title, description: c.intro, tag: `mission:${c.handle}`})),
  ...Object.values(GEAR).map((c) => ({handle: c.handle, title: c.title, description: c.intro, tag: `gear:${c.handle}`})),
  {handle: 'trenzora-picks', title: 'Trenzora Picks', description: 'Hero products.', tag: 'tier:hero'},
];
const collections: Obj[] = collectionDefs.map((def, index) => {
  const members = products.filter((p) => (p._item as MockItem).tags.includes(def.tag));
  return {
    __typename: 'Collection',
    id: `gid://shopify/Collection/${700 + index}`,
    handle: def.handle,
    title: def.title,
    description: def.description,
    descriptionHtml: `<p>${def.description}</p>`,
    image: null,
    seo: {title: null, description: null},
    updatedAt: '2026-10-01T00:00:00Z',
    trackingParameters: null,
    metafield: () => null,
    products: (args: {first?: number; last?: number; sortKey?: string; reverse?: boolean}) =>
      connection(sortProducts(members, args), args),
  };
});

// -------------------------------------------------------------------- cart
type MockLine = {id: string; variant: Obj; quantity: number; attributes: Array<{key: string; value: string}>};
type MockCart = {lines: MockLine[]; note: string; attributes: Array<{key: string; value: string}>; codes: string[]};
const carts = new Map<string, MockCart>();
const BUNDLE_SAVINGS = new Map(BUNDLES.map((b) => [b.discountCode, b.savingsUsd]));
let lineSeq = 1;

function cartView(id: string) {
  const cart = carts.get(id);
  if (!cart) return null;
  const lines = cart.lines.map((line) => {
    const unit = Number((line.variant.price as {amount: string}).amount);
    return {
      __typename: 'CartLine',
      id: line.id,
      quantity: line.quantity,
      attributes: line.attributes,
      merchandise: line.variant,
      parentRelationship: null,
      cost: {
        totalAmount: money(unit * line.quantity),
        amountPerQuantity: money(unit),
        compareAtAmountPerQuantity: null,
        subtotalAmount: money(unit * line.quantity),
      },
      discountAllocations: [],
    };
  });
  const subtotal = lines.reduce((sum, l) => sum + Number(l.cost.totalAmount.amount), 0);
  const discount = cart.codes.reduce((sum, c) => sum + (BUNDLE_SAVINGS.get(c) ?? 0), 0);
  const total = Math.max(0, subtotal - discount);
  return {
    __typename: 'Cart',
    id,
    checkoutUrl: `http://localhost:${PORT}/checkout?cart=${encodeURIComponent(id)}`,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    totalQuantity: lines.reduce((sum, l) => sum + l.quantity, 0),
    note: cart.note,
    attributes: cart.attributes,
    discountCodes: cart.codes.map((code) => ({code, applicable: BUNDLE_SAVINGS.has(code)})),
    appliedGiftCards: [],
    discountAllocations: [],
    buyerIdentity: {countryCode: 'US', customer: null, email: null, phone: null, deliveryAddressPreferences: []},
    lines: (args: {first?: number}) => connection(lines, args),
    cost: {
      subtotalAmount: money(subtotal),
      totalAmount: money(total),
      totalTaxAmount: null,
      totalDutyAmount: null,
      checkoutChargeAmount: money(total),
      subtotalAmountEstimated: false,
      totalAmountEstimated: false,
    },
    metafield: () => null,
    metafields: () => [],
  };
}

type LineInput = {merchandiseId: string; quantity?: number; attributes?: Array<{key: string; value: string}>};
function addLines(cartId: string, inputs: LineInput[] = []) {
  const cart = carts.get(cartId);
  if (!cart) return;
  for (const input of inputs) {
    const variant = allVariants.find((v) => v.id === input.merchandiseId);
    if (!variant) continue;
    const attributes = input.attributes ?? [];
    const existing = cart.lines.find(
      (l) => l.variant.id === variant.id && JSON.stringify(l.attributes) === JSON.stringify(attributes),
    );
    if (existing) existing.quantity += input.quantity ?? 1;
    else cart.lines.push({id: `gid://shopify/CartLine/${lineSeq++}`, variant, quantity: input.quantity ?? 1, attributes});
  }
}

const cartPayload = (id: string) => ({cart: cartView(id), userErrors: [], warnings: []});

// ------------------------------------------------------------------- roots
function mockPolicy(handle: string, title: string) {
  return {
    __typename: 'ShopPolicy',
    id: `gid://shopify/ShopPolicy/${handle}`,
    handle,
    title,
    url: `/policies/${handle}`,
    body: `<p>[Mock] ${title} placeholder. The real policy comes from Shopify Admin → Settings → Policies.</p>`,
  };
}

const shop = {
  __typename: 'Shop',
  id: 'gid://shopify/Shop/2',
  name: 'Trenzora',
  description: 'Car camping and basecamp gear, sorted by mission.',
  primaryDomain: {url: 'http://localhost:3000', host: 'localhost'},
  brand: null,
  moneyFormat: '${{amount}}',
  paymentSettings: {
    currencyCode: 'USD',
    countryCode: 'US',
    acceptedCardBrands: [],
    supportedDigitalWallets: [],
    enabledPresentmentCurrencies: ['USD'],
  },
  privacyPolicy: mockPolicy('privacy-policy', 'Privacy policy'),
  refundPolicy: mockPolicy('refund-policy', 'Refund policy'),
  shippingPolicy: mockPolicy('shipping-policy', 'Shipping policy'),
  termsOfService: mockPolicy('terms-of-service', 'Terms of service'),
  subscriptionPolicy: null,
};

const rootValue = {
  shop,
  localization: {
    country: {
      isoCode: 'US',
      name: 'United States',
      currency: {isoCode: 'USD', name: 'US Dollar', symbol: '$'},
      availableLanguages: [],
    },
    language: {isoCode: 'EN', name: 'English', endonymName: 'English'},
    availableCountries: [],
    availableLanguages: [],
  },
  menu: () => null,
  product: (args: {handle?: string; id?: string}) =>
    products.find((p) => p.handle === args.handle || p.id === args.id) ?? null,
  products: (args: {first?: number; last?: number; query?: string; sortKey?: string; reverse?: boolean}) =>
    connection(sortProducts(products.filter((p) => matchesQuery(p, args.query)), args), args),
  productRecommendations: () => [],
  collection: (args: {handle?: string; id?: string}) =>
    collections.find((c) => c.handle === args.handle || c.id === args.id) ?? null,
  collections: (args: {first?: number}) => connection(collections, args),
  page: () => null,
  pages: (args: {first?: number}) => connection([], args),
  blogs: (args: {first?: number}) => connection([], args),
  articles: (args: {first?: number}) => connection([], args),
  urlRedirects: (args: {first?: number}) => connection([], args),
  sitemap: (args: {type: string}) => {
    const list = args.type === 'PRODUCT' ? products : args.type === 'COLLECTION' ? collections : [];
    return {
      pagesCount: {count: list.length ? 1 : 0},
      resourcesCount: {count: list.length},
      resources: () => ({
        hasNextPage: false,
        items: list.map((item) => ({
          __typename: 'SitemapResource',
          handle: item.handle,
          updatedAt: '2026-10-01T00:00:00Z',
          title: item.title,
          image: null,
        })),
      }),
    };
  },
  cart: (args: {id: string}) => cartView(args.id),
  cartCreate: (args: {input?: {lines?: LineInput[]; note?: string; attributes?: Array<{key: string; value: string}>}}) => {
    const id = `gid://shopify/Cart/mock-${Date.now().toString(36)}?key=dev`;
    carts.set(id, {lines: [], note: args.input?.note ?? '', attributes: args.input?.attributes ?? [], codes: []});
    addLines(id, args.input?.lines);
    return cartPayload(id);
  },
  cartLinesAdd: (args: {cartId: string; lines: LineInput[]}) => {
    addLines(args.cartId, args.lines);
    return cartPayload(args.cartId);
  },
  cartLinesUpdate: (args: {cartId: string; lines: Array<{id: string; quantity?: number}>}) => {
    const cart = carts.get(args.cartId);
    if (cart) {
      for (const update of args.lines) {
        const line = cart.lines.find((l) => l.id === update.id);
        if (line && update.quantity != null) line.quantity = update.quantity;
      }
      cart.lines = cart.lines.filter((l) => l.quantity > 0);
    }
    return cartPayload(args.cartId);
  },
  cartLinesRemove: (args: {cartId: string; lineIds: string[]}) => {
    const cart = carts.get(args.cartId);
    if (cart) cart.lines = cart.lines.filter((l) => !args.lineIds.includes(l.id));
    return cartPayload(args.cartId);
  },
  cartDiscountCodesUpdate: (args: {cartId: string; discountCodes?: string[]}) => {
    const cart = carts.get(args.cartId);
    if (cart) cart.codes = [...new Set(args.discountCodes ?? [])];
    return cartPayload(args.cartId);
  },
  cartNoteUpdate: (args: {cartId: string; note: string}) => {
    const cart = carts.get(args.cartId);
    if (cart) cart.note = args.note;
    return cartPayload(args.cartId);
  },
  cartAttributesUpdate: (args: {cartId: string; attributes: Array<{key: string; value: string}>}) => {
    const cart = carts.get(args.cartId);
    if (cart) cart.attributes = args.attributes;
    return cartPayload(args.cartId);
  },
  cartGiftCardCodesAdd: (args: {cartId: string}) => cartPayload(args.cartId),
  cartGiftCardCodesRemove: (args: {cartId: string}) => cartPayload(args.cartId),
  cartBuyerIdentityUpdate: (args: {cartId: string}) => cartPayload(args.cartId),
};

const fieldResolver: GraphQLFieldResolver<unknown, unknown> = (
  source,
  args,
  _ctx,
  info,
) => {
  if (source && typeof source === 'object') {
    const value = (source as Obj)[info.fieldName];
    if (typeof value === 'function') return value(args);
    return value ?? null;
  }
  return null;
};

const typeResolver: GraphQLTypeResolver<unknown, unknown> = (value) =>
  (value as Obj)?.__typename as string;

async function handle(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);

  if (url.pathname === '/checkout') {
    res.writeHead(200, {'content-type': 'text/html; charset=utf-8'});
    res.end(
      `<!doctype html><title>Shopify checkout (mock)</title><body style="font-family:system-ui;padding:40px"><h1>Shopify checkout handoff ✓</h1><p>In production this is Shopify checkout for cart:</p><code>${url.searchParams.get('cart')?.replace(/</g, '')}</code></body>`,
    );
    return;
  }

  if (
    !/\/api\/[^/]+\/graphql\.json$/.test(url.pathname) ||
    req.method !== 'POST'
  ) {
    res.writeHead(404).end('Not found');
    return;
  }

  let body = '';
  for await (const chunk of req) body += chunk;
  const {query, variables, operationName} = JSON.parse(body || '{}') as {
    query: string;
    variables?: Record<string, unknown>;
    operationName?: string;
  };

  let result;
  try {
    const document = parse(query);
    const errors = validate(schema, document);
    if (errors.length) {
      console.error(
        '[mock-storefront] validation',
        errors.map((e) => e.message),
      );
      result = {errors: errors.map((e) => ({message: e.message}))};
    } else {
      result = await execute({
        schema,
        document,
        rootValue,
        variableValues: variables,
        operationName,
        fieldResolver,
        typeResolver,
      });
      if (result.errors?.length) {
        console.error(
          '[mock-storefront] execution',
          result.errors.map((e) => `${e.message} @ ${e.path?.join('.')}`),
        );
      }
    }
  } catch (error) {
    result = {errors: [{message: (error as Error).message}]};
  }

  res.writeHead(200, {'content-type': 'application/json'});
  res.end(JSON.stringify(result));
}

createServer((req, res) => {
  void handle(req, res);
}).listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(
    `[mock-storefront] Trenzora US catalog (${products.length} products) on http://localhost:${PORT}`,
  );
});
