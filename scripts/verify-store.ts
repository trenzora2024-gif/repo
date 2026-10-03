/**
 * Read-only readiness check against the connected Storefront API.
 *
 *   npm run verify:store                       # uses .env
 *   npm run verify:store -- --env-file .env.mock
 *   npm run verify:store -- --cart             # also creates a throwaway cart
 *                                              # to verify the checkout URL
 *
 * It never writes store data. `--cart` creates an anonymous cart, which
 * Shopify expires automatically; no products, orders or settings change.
 *
 * Exit code 1 when a blocker is found. Draft products are invisible to the
 * Storefront API, so "missing" products are expected until they're
 * published to the Hydrogen channel.
 */
import {existsSync, readFileSync} from 'node:fs';
import {
  CATALOGUE,
  COLLECTIONS,
  LAUNCH_CATALOGUE,
  LAUNCH_COLLECTIONS,
  TAG,
  tagQuery,
} from '../app/data/catalogue/index.ts';
import {isBlockedStore} from '../app/lib/store-guard.ts';

const API_VERSION = '2026-04';
const args = process.argv.slice(2);
const envFile = args.includes('--env-file')
  ? args[args.indexOf('--env-file') + 1]
  : '.env';
const withCart = args.includes('--cart');

type Level = 'ok' | 'info' | 'warn' | 'block';
const results: Array<{level: Level; area: string; message: string}> = [];
const report = (level: Level, area: string, message: string) =>
  results.push({level, area, message});

function loadEnv(path: string) {
  const env: Record<string, string> = {
    ...(process.env as Record<string, string>),
  };
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (match) env[match[1]] = match[2];
  }
  return env;
}

const env = loadEnv(envFile);
const domain = env.PUBLIC_STORE_DOMAIN ?? '';
const token = env.PUBLIC_STOREFRONT_API_TOKEN ?? '';

async function gql<T>(query: string, variables: Record<string, unknown> = {}) {
  const base = domain.includes('://') ? domain : `https://${domain}`;
  const res = await fetch(`${base}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({query, variables}),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const json = (await res.json()) as {
    data?: T;
    errors?: Array<{message: string}>;
  };
  if (json.errors?.length)
    throw new Error(json.errors.map((e) => e.message).join('; '));
  return json.data as T;
}

async function main() {
  // ---------------------------------------------------------------- env
  for (const key of [
    'SESSION_SECRET',
    'PUBLIC_STORE_DOMAIN',
    'PUBLIC_STOREFRONT_API_TOKEN',
    'PUBLIC_CHECKOUT_DOMAIN',
  ]) {
    if (!env[key]) report('block', 'env', `${key} is not set (${envFile})`);
  }
  for (const key of ['PRIVATE_STOREFRONT_API_TOKEN', 'PUBLIC_STOREFRONT_ID']) {
    if (!env[key])
      report(
        'warn',
        'env',
        `${key} is not set — recommended (server token / Shopify analytics)`,
      );
  }
  if (isBlockedStore(domain) || isBlockedStore(env.PUBLIC_CHECKOUT_DOMAIN)) {
    report(
      'block',
      'safety',
      `Configured store "${domain}" is on the blocklist — aborting.`,
    );
    return;
  }
  if (!domain || !token) return;

  // --------------------------------------------------------------- shop
  const {shop} = await gql<{
    shop: {
      name: string;
      primaryDomain: {url: string; host: string};
      paymentSettings: {currencyCode: string; countryCode: string};
      privacyPolicy: {handle: string} | null;
      refundPolicy: {handle: string} | null;
      shippingPolicy: {handle: string} | null;
      termsOfService: {handle: string} | null;
    };
  }>(`query { shop {
      name primaryDomain { url host }
      paymentSettings { currencyCode countryCode }
      privacyPolicy { handle } refundPolicy { handle } shippingPolicy { handle } termsOfService { handle }
    } }`);

  if (isBlockedStore(shop.name) || isBlockedStore(shop.primaryDomain.host)) {
    report(
      'block',
      'safety',
      `Connected shop is "${shop.name}" (${shop.primaryDomain.host}) — NOT Trenzora. Stop and fix credentials.`,
    );
    return;
  }
  report(
    /trenzora/i.test(shop.name) ? 'ok' : 'warn',
    'shop',
    `Connected to "${shop.name}" — ${shop.primaryDomain.url}`,
  );
  report(
    shop.paymentSettings.currencyCode === 'INR' ? 'ok' : 'block',
    'shop',
    `Store currency ${shop.paymentSettings.currencyCode}, country ${shop.paymentSettings.countryCode}`,
  );
  for (const [name, policy] of Object.entries({
    'Privacy policy': shop.privacyPolicy,
    'Refund policy': shop.refundPolicy,
    'Shipping policy': shop.shippingPolicy,
    'Terms of service': shop.termsOfService,
  })) {
    report(
      policy ? 'ok' : 'warn',
      'policies',
      `${name}: ${policy ? `/policies/${policy.handle}` : 'not set (footer links will 404)'}`,
    );
  }

  // ----------------------------------------------------------- products
  const productFields = `id handle title tags availableForSale
    images(first: 1) { nodes { url } }
    variants(first: 10) { nodes { sku availableForSale price { amount currencyCode } compareAtPrice { amount } selectedOptions { name value } } }`;
  const productQuery = `query { ${CATALOGUE.map((p, i) => `p${i}: product(handle: "${p.handle}") { ${productFields} }`).join('\n')} }`;
  type SfProduct = {
    handle: string;
    tags: string[];
    availableForSale: boolean;
    images: {nodes: Array<{url: string}>};
    variants: {
      nodes: Array<{
        sku: string;
        availableForSale: boolean;
        price: {amount: string; currencyCode: string};
        compareAtPrice: {amount: string} | null;
      }>;
    };
  } | null;
  const products = await gql<Record<string, SfProduct>>(productQuery);

  let visible = 0;
  let withImages = 0;
  CATALOGUE.forEach((expected, i) => {
    const product = products[`p${i}`];
    if (!product) return;
    if (expected.family.release !== 'v1') {
      report(
        'block',
        'release',
        `${expected.handle}: V2 design is visible on the storefront — V2 (Us, Make It Yours) must not be published or sold in V1`,
      );
      return;
    }
    visible++;
    if (product.images.nodes.length) withImages++;
    else
      report(
        'block',
        'images',
        `${expected.handle}: no product images (concept card would show — not launch-ready)`,
      );
    for (const tag of expected.tags) {
      if (!product.tags.includes(tag))
        report('block', 'tags', `${expected.handle}: missing tag "${tag}"`);
    }
    const skus = product.variants.nodes.map((v) => v.sku);
    for (const variant of expected.variants) {
      if (!skus.includes(variant.sku))
        report(
          'warn',
          'variants',
          `${expected.handle}: SKU ${variant.sku} not found`,
        );
    }
    for (const v of product.variants.nodes) {
      if (Number(v.price.amount) !== expected.priceInr)
        report(
          'info',
          'pricing',
          `${expected.handle} ${v.sku}: store ₹${v.price.amount} vs provisional ₹${expected.priceInr}`,
        );
      if (v.compareAtPrice)
        report(
          'warn',
          'pricing',
          `${expected.handle} ${v.sku}: has compare-at price (brand rule: no fake discounts)`,
        );
      if (!v.availableForSale)
        report(
          'warn',
          'inventory',
          `${expected.handle} ${v.sku}: not available for sale (POD should use "continue selling")`,
        );
    }
  });
  report(
    visible === LAUNCH_CATALOGUE.length ? 'ok' : 'info',
    'catalogue',
    `${visible}/${LAUNCH_CATALOGUE.length} V1 launch products visible to the storefront (drafts/unpublished are hidden)`,
  );
  if (visible)
    report(
      withImages === visible ? 'ok' : 'block',
      'images',
      `${withImages}/${visible} visible products have real images`,
    );

  // -------------------------------------------------------- collections
  const handles = LAUNCH_COLLECTIONS.filter((h) => h !== 'all');
  const colQuery = `query { ${handles.map((h, i) => `c${i}: collection(handle: "${h}") { handle products(first: 100) { nodes { handle } } }`).join('\n')} }`;
  const cols =
    await gql<
      Record<
        string,
        {handle: string; products: {nodes: Array<{handle: string}>}} | null
      >
    >(colQuery);
  handles.forEach((handle, i) => {
    const col = cols[`c${i}`];
    const expected = LAUNCH_CATALOGUE.filter((p) =>
      p.collections.includes(handle),
    ).length;
    if (!col)
      report(
        visible ? 'block' : 'info',
        'collections',
        `${handle}: not found / not published`,
      );
    else
      report(
        col.products.nodes.length === expected ? 'ok' : 'warn',
        'collections',
        `${handle}: ${col.products.nodes.length} products (expected ${expected})`,
      );
  });

  // ------------------------------------------------- tag search syntax
  const {products: dropProducts} = await gql<{
    products: {nodes: Array<{handle: string}>};
  }>(
    `query($q: String!) { products(first: 100, query: $q) { nodes { handle } } }`,
    {q: tagQuery(TAG.drop('01'))},
  );
  const expectedDrop = LAUNCH_CATALOGUE.filter((p) =>
    p.tags.includes(TAG.drop('01')),
  ).length;
  report(
    !visible || dropProducts.nodes.length === visible ? 'ok' : 'block',
    'search',
    `Tag query ${tagQuery(TAG.drop('01'))} → ${dropProducts.nodes.length} products (visible ${visible}, catalogue ${expectedDrop})`,
  );

  // ---------------------------------------------------- cart / checkout
  if (withCart) {
    const variantId = await gql<{
      products: {nodes: Array<{variants: {nodes: Array<{id: string}>}}>};
    }>(
      `query { products(first: 1) { nodes { variants(first: 1) { nodes { id } } } } }`,
    ).then((d) => d.products.nodes[0]?.variants.nodes[0]?.id);
    if (!variantId) {
      report('info', 'checkout', 'No visible product to test a cart with');
    } else {
      const {cartCreate} = await gql<{
        cartCreate: {
          cart: {checkoutUrl: string} | null;
          userErrors: Array<{message: string}>;
        };
      }>(
        `mutation($id: ID!) { cartCreate(input: { lines: [{ merchandiseId: $id, quantity: 1 }] }) { cart { checkoutUrl } userErrors { message } } }`,
        {id: variantId},
      );
      const url = cartCreate.cart?.checkoutUrl;
      if (!url)
        report(
          'block',
          'checkout',
          `cartCreate failed: ${cartCreate.userErrors.map((e) => e.message).join('; ')}`,
        );
      else {
        const host = new URL(url).host;
        const expectedHost = (env.PUBLIC_CHECKOUT_DOMAIN ?? '').replace(
          /^https?:\/\//,
          '',
        );
        report(
          host === expectedHost ? 'ok' : 'warn',
          'checkout',
          `checkoutUrl host ${host} (PUBLIC_CHECKOUT_DOMAIN=${expectedHost})`,
        );
      }
    }
  }
}

main()
  .catch((error: Error) =>
    report('block', 'api', `Storefront API error: ${error.message}`),
  )
  .finally(() => {
    const icon: Record<Level, string> = {
      ok: '✓',
      info: '·',
      warn: '!',
      block: '✗',
    };
    // eslint-disable-next-line no-console
    console.log(
      [
        `Trenzora store readiness (${envFile})`,
        '',
        ...results.map((r) => `${icon[r.level]} [${r.area}] ${r.message}`),
      ].join('\n'),
    );
    const blockers = results.filter((r) => r.level === 'block').length;
    // eslint-disable-next-line no-console
    console.log(`\n${blockers ? `${blockers} blocker(s)` : 'No blockers'}.`);
    process.exitCode = blockers ? 1 : 0;
  });
