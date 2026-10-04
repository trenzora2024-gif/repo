import {redirect} from 'react-router';

/**
 * Customer accounts stay on Shopify. /account* hands off to Shopify's hosted
 * customer accounts on the checkout domain, so existing logins, order
 * history and order-status links keep working after the Hydrogen cut-over.
 */
export function redirectToShopifyAccount(env: Env, request: Request) {
  const url = new URL(request.url);
  const host = env.PUBLIC_CHECKOUT_DOMAIN;
  if (!host) throw new Response('Account unavailable', {status: 503});
  return redirect(`https://${host.replace(/^https?:\/\//, '')}${url.pathname}${url.search}`, 302);
}
