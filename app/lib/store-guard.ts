/**
 * Safety rails for which Shopify store this storefront may talk to.
 *
 * - Never connect to a store on the blocklist (another business on the same
 *   Shopify account).
 * - In production builds, fail loudly when Shopify credentials are missing.
 *   Otherwise Hydrogen silently falls back to the public mock.shop demo
 *   catalogue.
 *
 * Framework-free so scripts/verify-store.ts can share it.
 */
export const BLOCKED_STORE_PATTERNS: RegExp[] = [/maternease/i];

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
        `Refusing to start: "${value}" is not the Trenzora store. Check PUBLIC_STORE_DOMAIN / PUBLIC_CHECKOUT_DOMAIN.`,
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
