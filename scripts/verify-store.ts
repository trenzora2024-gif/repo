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
import {isApprovedStoreHost, isBlockedStore} from '../app/lib/store-guard.ts';

const API_VERSION = '2026-04';
const args = process.argv.slice(2);
const envFile = args.includes('--env-file')
  ? args[args.indexOf('--env-file') + 1]
  : '.env';
const withCart = args.includes('--cart');
const argValue = (flag: string) =>
  args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined;
// Gate 1: the connection must be exactly this store, and nothing imported yet.
//   npm run verify:store -- --gate1 --expect-store trenzora-in.myshopify.com --expect-domain trenzora.in
const gate1 = args.includes('--gate1');
const expectStore = argValue('--expect-store');
const expectDomain = argValue('--expect-domain');
const hostOf = (value = '') =>
  value
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .toLowerCase();

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

async function gql<T>(
  query: string,
  variables: Record<string, unknown> = {},
  host = domain,
) {
  const base = host.includes('://') ? host : `https://${host}`;
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
  // --expect-store accepts a comma-separated list of the SAME store's
  // .myshopify.com addresses (permanent ID + renamed handle), e.g.
  // trenzora-in.myshopify.com,hetvyh-8e.myshopify.com
  const storeAliases = (expectStore ?? '')
    .toLowerCase()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (storeAliases.length) {
    const configured = hostOf(domain);
    // The first entry is the approved store; other entries, and the aliases
    // pinned in app/lib/store-guard.ts, must prove they are the same shop.
    const approved = storeAliases[0];
    const accepted =
      storeAliases.includes(configured) ||
      isApprovedStoreHost(configured, approved);
    if (!accepted || isBlockedStore(configured)) {
      report(
        'block',
        'identity',
        `PUBLIC_STORE_DOMAIN = ${configured} (expected ${approved} or a listed alias)`,
      );
      return;
    }
    if (configured === approved) {
      report('ok', 'identity', `PUBLIC_STORE_DOMAIN = ${configured}`);
    } else {
      // An alias: confirm live that both hosts serve the same shop.
      const query = `query { shop { id name } }`;
      const viaConfigured = await gql<{shop: {id: string; name: string}}>(
        query,
      );
      const viaApproved = await gql<{shop: {id: string; name: string}}>(
        query,
        {},
        approved,
      ).catch((error: Error) => error);
      if (viaApproved instanceof Error) {
        report(
          'warn',
          'identity',
          `PUBLIC_STORE_DOMAIN = ${configured}, a listed alias of ${approved}; live cross-check via ${approved} failed (${viaApproved.message})`,
        );
      } else if (viaApproved.shop.id !== viaConfigured.shop.id) {
        report(
          'block',
          'identity',
          `${configured} (${viaConfigured.shop.id}) and ${approved} (${viaApproved.shop.id}) are different shops`,
        );
        return;
      } else {
        report(
          'ok',
          'identity',
          `PUBLIC_STORE_DOMAIN = ${configured}, same shop as ${approved} (${viaConfigured.shop.id})`,
        );
      }
    }
  }
  if (gate1 && expectDomain) {
    const checkout = hostOf(env.PUBLIC_CHECKOUT_DOMAIN);
    const prod = expectDomain.toLowerCase();
    const approved = storeAliases[0];
    if (checkout === prod || checkout === `www.${prod}`) {
      // Fine while the apex still targets the Online Store; once Hydrogen
      // takes the apex (Gate 6), checkout needs its own subdomain.
      report(
        'warn',
        'checkout',
        `PUBLIC_CHECKOUT_DOMAIN = ${checkout}: OK while ${prod} serves the Online Store; switch to checkout.${prod} before ${prod} moves to Hydrogen (Gate 6)`,
      );
    } else if (
      checkout &&
      !checkout.endsWith(`.${prod}`) &&
      !storeAliases.includes(checkout) &&
      !(approved && isApprovedStoreHost(checkout, approved))
    ) {
      report(
        'block',
        'checkout',
        `PUBLIC_CHECKOUT_DOMAIN = ${checkout} is neither ${prod}, a ${prod} subdomain, nor the approved store`,
      );
    } else if (checkout) {
      report('ok', 'checkout', `PUBLIC_CHECKOUT_DOMAIN = ${checkout}`);
    }
  }

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
  if (expectDomain) {
    const primary = shop.primaryDomain.host.toLowerCase();
    const prod = expectDomain.toLowerCase();
    const level: Level =
      primary === prod || primary === `www.${prod}`
        ? 'ok'
        : storeAliases.includes(primary) ||
            (storeAliases.length > 0 &&
              isApprovedStoreHost(primary, storeAliases[0]))
          ? 'info'
          : 'block';
    report(
      level,
      'identity',
      level === 'ok'
        ? `Primary domain ${primary} = production domain`
        : level === 'info'
          ? `Primary domain is still ${primary}; ${prod} is not primary yet (expected before Gate 6, not now)`
          : `Primary domain ${primary} is neither ${prod} nor ${expectStore}`,
    );
  }
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

  if (gate1) {
    // Storefront API sees only published items; drafts are checked in Admin.
    const {products: anyProducts, collections: anyCollections} = await gql<{
      products: {nodes: Array<{handle: string}>};
      collections: {nodes: Array<{handle: string}>};
    }>(
      `query { products(first: 10) { nodes { handle } } collections(first: 10) { nodes { handle } } }`,
    );
    report(
      anyProducts.nodes.length ? 'block' : 'ok',
      'gate1',
      anyProducts.nodes.length
        ? `${anyProducts.nodes.length}+ products already visible: ${anyProducts.nodes.map((p) => p.handle).join(', ')}`
        : 'No products visible on the storefront (nothing imported/published)',
    );
    report(
      anyCollections.nodes.length ? 'warn' : 'ok',
      'gate1',
      anyCollections.nodes.length
        ? `Collections visible: ${anyCollections.nodes.map((c) => c.handle).join(', ')} (Shopify may create a default "frontpage")`
        : 'No collections visible on the storefront',
    );
    return;
  }

  // ----------------------------------------------------------- products
  const productFields = `id handle title tags availableForSale
    images(first: 10) { nodes { url } }
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
  let renderOnly = 0;
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
    const isRender = (url: string) => /\/visuals\/products\//.test(url);
    if (product.images.nodes.length) {
      withImages++;
      if (product.images.nodes.every((image) => isRender(image.url))) {
        renderOnly++;
      }
    } else
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
      `${withImages}/${visible} visible products have images`,
    );
  if (renderOnly)
    report(
      'warn',
      'images',
      `${renderOnly}/${visible} products only have studio renders (temporary) — replace with supplier mockups before launch (catalogue/image-replacement-map.csv)`,
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
