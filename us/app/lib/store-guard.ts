/**
 * Safety rails for which Shopify store this storefront may talk to.
 *
 * trenzora.com (US, USD) is a different store from trenzora.in (India, INR)
 * and from MaternEase. This app refuses both, so a copied .env can never
 * point the US storefront at the wrong catalog, prices or checkout.
 * In production builds it also fails loudly when credentials are missing
 * (otherwise Hydrogen silently falls back to the mock.shop demo catalog).
 */
export const BLOCKED_STORE_PATTERNS: RegExp[] = [
  /maternease/i,
  /trenzora-in\.myshopify\.com/i,
  /hetvyh-8e\.myshopify\.com/i,
  /trenzora\.in$/i,
];

export function isBlockedStore(value: string | undefined | null) {
  return Boolean(value && BLOCKED_STORE_PATTERNS.some((re) => re.test(value)));
}

type StoreEnv = {
  PUBLIC_STORE_DOMAIN?: string;
  PUBLIC_STOREFRONT_API_TOKEN?: string;
  PUBLIC_CHECKOUT_DOMAIN?: string;
};

export function assertStoreEnv(
  env: StoreEnv,
  {production}: {production: boolean},
) {
  for (const value of [env.PUBLIC_STORE_DOMAIN, env.PUBLIC_CHECKOUT_DOMAIN]) {
    if (isBlockedStore(value)) {
      throw new Error(
        `Refusing to start: "${value}" is not the trenzora.com (US) store. Check PUBLIC_STORE_DOMAIN / PUBLIC_CHECKOUT_DOMAIN.`,
      );
    }
  }

  if (production) {
    const missing = (
      [
        'PUBLIC_STORE_DOMAIN',
        'PUBLIC_STOREFRONT_API_TOKEN',
        'PUBLIC_CHECKOUT_DOMAIN',
      ] as const
    ).filter((key) => !env[key]);
    if (missing.length) {
      throw new Error(
        `Missing Shopify environment variables: ${missing.join(', ')}. Run \`npx shopify hydrogen env pull\` or set them in the Hydrogen channel.`,
      );
    }
  }
}
