import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {
  createContentSecurityPolicy,
  type HydrogenRouterContextProvider,
} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: HydrogenRouterContextProvider,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    // Meta Pixel and gtag load only when their IDs are set and consent
    // allows (components/Tracking.tsx); these hosts are what they need.
    // Added to default-src (which carries the nonce) rather than script-src,
    // so Hydrogen's nonce-based inline scripts keep working.
    defaultSrc: [
      'https://connect.facebook.net',
      'https://www.googletagmanager.com',
    ],
    connectSrc: [
      "'self'",
      'https://monorail-edge.shopifysvc.com',
      'https://www.facebook.com',
      'https://*.google-analytics.com',
      'https://*.analytics.google.com',
      'https://www.googletagmanager.com',
      'https://*.doubleclick.net',
      'https://www.google.com',
    ],
    imgSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'data:',
      'https://www.facebook.com',
      'https://*.google-analytics.com',
      'https://www.googletagmanager.com',
      'https://*.doubleclick.net',
      'https://www.google.com',
      ...(import.meta.env.DEV ? ['http://localhost:*'] : []),
    ],
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
