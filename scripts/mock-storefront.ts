/**
 * DEV ONLY — local Storefront API mock serving the Trenzora catalogue.
 *
 * Lets the storefront be previewed and QA'd before the Trenzora Shopify store
 * is connected (or where mock.shop is unreachable). It executes real queries
 * against the real Storefront API schema shipped with Hydrogen, so a query the
 * mock accepts is a query Shopify accepts. Cart state is in-memory.
 *
 * Never deployed. Run with:  npm run dev:mock
 */
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {
  buildClientSchema,
  execute,
  parse,
  validate,
  type GraphQLFieldResolver,
  type IntrospectionQuery,
  type GraphQLTypeResolver,
} from 'graphql';
import {
  CATALOGUE,
  COLLECTIONS,
  LAUNCH_CATALOGUE,
  LAUNCH_COLLECTIONS,
  type CatalogueProduct,
  type CollectionHandle,
} from '../app/data/catalogue/index.ts';

const PORT = Number(process.env.MOCK_STOREFRONT_PORT ?? 4100);
const require = createRequire(import.meta.url);
const schemaPath = require.resolve('@shopify/hydrogen/storefront.schema.json');
const introspection = JSON.parse(readFileSync(schemaPath, 'utf8')) as
  IntrospectionQuery | {data: IntrospectionQuery};
const schema = buildClientSchema(
  'data' in introspection ? introspection.data : introspection,
);

type Obj = Record<string, unknown>;
const money = (amount: number) => ({
  __typename: 'MoneyV2',
  amount: amount.toFixed(1),
  currencyCode: 'INR',
});

function connection<T>(items: T[], args: {first?: number; last?: number} = {}) {
  const sliced =
    args.first != null
      ? items.slice(0, args.first)
      : args.last != null
        ? items.slice(-args.last)
        : items;
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
// Mirrors the real V1 import: only the 24 launch products exist.
// MOCK_INCLUDE_V2=1 simulates V2 products being wrongly published, to test
// that verify:store blocks it and the product page refuses to sell them.
const SOURCE =
  process.env.MOCK_INCLUDE_V2 === '1' ? CATALOGUE : LAUNCH_CATALOGUE;
const products: Obj[] = SOURCE.map((item, index) =>
  buildProduct(item, index + 1),
);

function buildProduct(item: CatalogueProduct, n: number): Obj {
  const product: Obj = {
    __typename: 'Product',
    id: `gid://shopify/Product/${1000 + n}`,
    handle: item.handle,
    title: item.title,
    vendor: item.vendor,
    tags: item.tags,
    productType: item.type.shopifyProductType,
    description: item.descriptionHtml.replace(/<[^>]+>/g, ' ').trim(),
    descriptionHtml: item.descriptionHtml,
    availableForSale: true,
    publishedAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
    createdAt: '2026-10-01T00:00:00Z',
    onlineStoreUrl: null,
    trackingParameters: null,
    isGiftCard: false,
    requiresSellingPlan: false,
    seo: {title: item.seo.title, description: item.seo.description},
    featuredImage: null,
    images: () => connection([]),
    media: () => connection([]),
    metafield: () => null,
    metafields: () => [],
    collections: () => connection([]),
    sellingPlanGroups: () => connection([]),
    priceRange: {
      minVariantPrice: money(item.priceInr),
      maxVariantPrice: money(item.priceInr),
    },
    compareAtPriceRange: {
      minVariantPrice: money(0),
      maxVariantPrice: money(0),
    },
    _catalogue: item,
  };

  const variants = item.variants.map((variant, i) => ({
    __typename: 'ProductVariant',
    id: `gid://shopify/ProductVariant/${(1000 + n) * 10 + i}`,
    sku: variant.sku,
    title: variant.option?.value ?? 'Default Title',
    availableForSale: true,
    currentlyNotInStock: false,
    quantityAvailable: 100,
    requiresShipping: true,
    price: money(variant.priceInr),
    compareAtPrice: null,
    unitPrice: null,
    image: null,
    weight: item.type.weightGrams,
    weightUnit: 'GRAMS',
    selectedOptions: [
      variant.option
        ? {name: variant.option.name, value: variant.option.value}
        : {name: 'Title', value: 'Default Title'},
    ],
    product,
    metafield: () => null,
  }));

  const optionName = item.type.option?.name ?? 'Title';
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
          s.name.toLowerCase() ===
            variant.selectedOptions[0].name.toLowerCase() &&
          s.value.toLowerCase() ===
            variant.selectedOptions[0].value.toLowerCase(),
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
    selectedOrFirstAvailableVariant: (args: {
      selectedOptions?: Array<{name: string; value: string}>;
    }) => pick(args.selectedOptions),
    variantBySelectedOptions: (args: {
      selectedOptions?: Array<{name: string; value: string}>;
    }) => pick(args.selectedOptions),
    adjacentVariants: () => variants,
    _variants: variants,
  });
  return product;
}

const allVariants = products.flatMap((p) => p._variants as Obj[]);

function matchesQuery(product: Obj, rawQuery?: string) {
  if (!rawQuery) return true;
  const item = product._catalogue as CatalogueProduct;
  const terms = rawQuery
    .toLowerCase()
    .split(/\s+(?:and\s+)?/)
    .filter(Boolean);
  return terms.every((term) => {
    const [field, value] =
      term.includes(':') && !term.startsWith('design:')
        ? [term.slice(0, term.indexOf(':')), term.slice(term.indexOf(':') + 1)]
        : ['', term];
    const clean = value.replace(/['"]/g, '');
    if (field === 'tag') return item.tags.includes(clean);
    if (field === 'product_type')
      return item.type.shopifyProductType.toLowerCase() === clean;
    const haystack = [
      item.title,
      item.family.name,
      item.family.tagline,
      ...item.family.keywords,
      ...item.tags,
      item.type.name,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(clean.replace(/\*$/, ''));
  });
}

function sortProducts(
  list: Obj[],
  args: {sortKey?: string; reverse?: boolean},
) {
  const sorted = [...list];
  if (args.sortKey === 'PRICE') {
    sorted.sort(
      (a, b) =>
        (a._catalogue as CatalogueProduct).priceInr -
        (b._catalogue as CatalogueProduct).priceInr,
    );
  } else if (args.sortKey === 'TITLE') {
    sorted.sort((a, b) => String(a.title).localeCompare(String(b.title)));
  }
  if (args.reverse) sorted.reverse();
  return sorted;
}

// ------------------------------------------------------------- collections
const collections: Obj[] = LAUNCH_COLLECTIONS.map((handle, index) => {
  const meta = COLLECTIONS[handle];
  const members = products.filter((p) =>
    (p._catalogue as CatalogueProduct).collections.includes(handle),
  );
  return {
    __typename: 'Collection',
    id: `gid://shopify/Collection/${500 + index}`,
    handle,
    title: meta.title,
    description: meta.description,
    descriptionHtml: `<p>${meta.description}</p>`,
    image: null,
    seo: {title: null, description: null},
    updatedAt: '2026-10-01T00:00:00Z',
    trackingParameters: null,
    metafield: () => null,
    products: (args: {
      first?: number;
      last?: number;
      sortKey?: string;
      reverse?: boolean;
    }) => connection(sortProducts(members, args), args),
  };
});

// -------------------------------------------------------------------- cart
type MockLine = {
  id: string;
  variant: Obj;
  quantity: number;
  attributes: Array<{key: string; value: string}>;
};
const carts = new Map<
  string,
  {
    lines: MockLine[];
    note: string;
    attributes: Array<{key: string; value: string}>;
  }
>();
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
  const subtotal = lines.reduce(
    (sum, l) => sum + Number(l.cost.totalAmount.amount),
    0,
  );
  return {
    __typename: 'Cart',
    id,
    checkoutUrl: `http://localhost:${PORT}/checkout?cart=${encodeURIComponent(id)}`,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    totalQuantity: lines.reduce((sum, l) => sum + l.quantity, 0),
    note: cart.note,
    attributes: cart.attributes,
    discountCodes: [],
    appliedGiftCards: [],
    discountAllocations: [],
    buyerIdentity: {
      countryCode: 'IN',
      customer: null,
      email: null,
      phone: null,
      deliveryAddressPreferences: [],
    },
    lines: (args: {first?: number}) => connection(lines, args),
    cost: {
      subtotalAmount: money(subtotal),
      totalAmount: money(subtotal),
      totalTaxAmount: null,
      totalDutyAmount: null,
      checkoutChargeAmount: money(subtotal),
      subtotalAmountEstimated: false,
      totalAmountEstimated: false,
    },
    metafield: () => null,
    metafields: () => [],
  };
}

type LineInput = {
  merchandiseId: string;
  quantity?: number;
  attributes?: Array<{key: string; value: string}>;
};
function addLines(cartId: string, inputs: LineInput[] = []) {
  const cart = carts.get(cartId);
  if (!cart) return;
  for (const input of inputs) {
    const variant = allVariants.find((v) => v.id === input.merchandiseId);
    if (!variant) continue;
    const attributes = input.attributes ?? [];
    const existing = cart.lines.find(
      (l) =>
        l.variant.id === variant.id &&
        JSON.stringify(l.attributes) === JSON.stringify(attributes),
    );
    if (existing) existing.quantity += input.quantity ?? 1;
    else
      cart.lines.push({
        id: `gid://shopify/CartLine/${lineSeq++}`,
        variant,
        quantity: input.quantity ?? 1,
        attributes,
      });
  }
}

const cartPayload = (id: string) => ({
  cart: cartView(id),
  userErrors: [],
  warnings: [],
});

// ------------------------------------------------------------------- roots
function mockPolicy(handle: string, title: string) {
  return {
    __typename: 'ShopPolicy',
    id: `gid://shopify/ShopPolicy/${handle}`,
    handle,
    title,
    url: `/policies/${handle}`,
    body: `<p>[Mock] ${title} placeholder. Write the real policy in Shopify Admin.</p>`,
  };
}

const shop = {
  __typename: 'Shop',
  id: 'gid://shopify/Shop/1',
  name: 'Trenzora',
  description: 'Made for people with personality.',
  primaryDomain: {url: 'http://localhost:3000', host: 'localhost'},
  brand: null,
  moneyFormat: '₹{{amount}}',
  paymentSettings: {
    currencyCode: 'INR',
    countryCode: 'IN',
    acceptedCardBrands: [],
    supportedDigitalWallets: [],
    enabledPresentmentCurrencies: ['INR'],
  },
  // Mock only — real policies are written in Shopify Admin → Settings → Policies.
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
      isoCode: 'IN',
      name: 'India',
      currency: {isoCode: 'INR', name: 'Indian Rupee', symbol: '₹'},
      availableLanguages: [],
    },
    language: {isoCode: 'EN', name: 'English', endonymName: 'English'},
    availableCountries: [],
    availableLanguages: [],
  },
  menu: () => null,
  product: (args: {handle?: string; id?: string}) =>
    products.find((p) => p.handle === args.handle || p.id === args.id) ?? null,
  products: (args: {
    first?: number;
    last?: number;
    query?: string;
    sortKey?: string;
    reverse?: boolean;
  }) =>
    connection(
      sortProducts(
        products.filter((p) => matchesQuery(p, args.query)),
        args,
      ),
      args,
    ),
  productRecommendations: (args: {
    productHandle?: string;
    productId?: string;
  }) => {
    const current = products.find(
      (p) => p.handle === args.productHandle || p.id === args.productId,
    );
    if (!current) return [];
    const family = (current._catalogue as CatalogueProduct).family.handle;
    return products
      .filter(
        (p) =>
          p !== current &&
          (p._catalogue as CatalogueProduct).family.handle !== family,
      )
      .slice(0, 8);
  },
  collection: (args: {handle?: string; id?: string}) =>
    collections.find((c) => c.handle === args.handle || c.id === args.id) ??
    null,
  collections: (args: {first?: number}) => connection(collections, args),
  page: () => null,
  pages: (args: {first?: number}) => connection([], args),
  blogs: (args: {first?: number}) => connection([], args),
  articles: (args: {first?: number}) => connection([], args),
  search: (args: {
    query: string;
    types?: string[];
    first?: number;
    last?: number;
  }) => {
    const types = args.types ?? ['PRODUCT'];
    const found = types.includes('PRODUCT')
      ? products.filter((p) => matchesQuery(p, args.query))
      : [];
    return connection(found, args);
  },
  predictiveSearch: (args: {query: string; limit?: number}) => {
    const limit = args.limit ?? 10;
    const term = args.query.toLowerCase();
    return {
      products: products
        .filter((p) => matchesQuery(p, args.query))
        .slice(0, limit),
      collections: collections
        .filter((c) => String(c.title).toLowerCase().includes(term))
        .slice(0, limit),
      pages: [],
      articles: [],
      queries: [],
    };
  },
  urlRedirects: (args: {first?: number}) => connection([], args),
  sitemap: (args: {type: string}) => {
    const list =
      args.type === 'PRODUCT'
        ? products
        : args.type === 'COLLECTION'
          ? collections
          : [];
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
  cartCreate: (args: {
    input?: {
      lines?: LineInput[];
      note?: string;
      attributes?: Array<{key: string; value: string}>;
    };
  }) => {
    const id = `gid://shopify/Cart/mock-${Date.now().toString(36)}?key=dev`;
    carts.set(id, {
      lines: [],
      note: args.input?.note ?? '',
      attributes: args.input?.attributes ?? [],
    });
    addLines(id, args.input?.lines);
    return cartPayload(id);
  },
  cartLinesAdd: (args: {cartId: string; lines: LineInput[]}) => {
    addLines(args.cartId, args.lines);
    return cartPayload(args.cartId);
  },
  cartLinesUpdate: (args: {
    cartId: string;
    lines: Array<{id: string; quantity?: number}>;
  }) => {
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
    if (cart)
      cart.lines = cart.lines.filter((l) => !args.lineIds.includes(l.id));
    return cartPayload(args.cartId);
  },
  cartNoteUpdate: (args: {cartId: string; note: string}) => {
    const cart = carts.get(args.cartId);
    if (cart) cart.note = args.note;
    return cartPayload(args.cartId);
  },
  cartAttributesUpdate: (args: {
    cartId: string;
    attributes: Array<{key: string; value: string}>;
  }) => {
    const cart = carts.get(args.cartId);
    if (cart) cart.attributes = args.attributes;
    return cartPayload(args.cartId);
  },
  customerCreate: (args: {input: {email: string}}) => ({
    customer: {
      __typename: 'Customer',
      id: `gid://shopify/Customer/${Buffer.from(args.input.email).toString('hex').slice(0, 12)}`,
    },
    customerUserErrors: [],
    userErrors: [],
  }),
  cartDiscountCodesUpdate: (args: {cartId: string}) => cartPayload(args.cartId),
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
    `[mock-storefront] Trenzora catalogue (${products.length} products) on http://localhost:${PORT}`,
  );
});
