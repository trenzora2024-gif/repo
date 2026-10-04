import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  useRouteLoaderData,
  type ShouldRevalidateFunction,
} from 'react-router';
import type {Route} from './+types/root';
import favicon from '~/assets/favicon.svg';
import fontCss from '@fontsource-variable/archivo/index.css?url';
import fontLatin from '@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2?url';
import resetStyles from '~/styles/reset.css?url';
import tokenStyles from '~/styles/tokens.css?url';
import appStyles from '~/styles/app.css?url';
import {PageLayout} from '~/components/PageLayout';
import {Tracking} from '~/components/Tracking';
import {Logo} from '~/components/Header';
import {SITE} from '~/data/site';

export type RootLoader = typeof loader;

/** Root data (cart, analytics) only revalidates after mutations. */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  if (formMethod && formMethod !== 'GET') return true;
  if (currentUrl.toString() === nextUrl.toString()) return true;
  return false;
};

export function links() {
  return [
    {rel: 'preconnect', href: 'https://cdn.shopify.com'},
    {
      rel: 'preload',
      as: 'font',
      type: 'font/woff2',
      href: fontLatin,
      crossOrigin: 'anonymous',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

export async function loader({context}: Route.LoaderArgs) {
  const {storefront, env, cart} = context;

  return {
    cart: cart.get(),
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      // Shopify's banner shows only where a region requires it (configure
      // in Admin → Settings → Customer privacy).
      withPrivacyBanner: true,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
    pixels: {
      metaPixelId: env.PUBLIC_META_PIXEL_ID || undefined,
      ga4Id: env.PUBLIC_GA4_ID || undefined,
      googleAdsId: env.PUBLIC_GOOGLE_ADS_ID || undefined,
    },
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();

  return (
    <html lang="en-US">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#1f3f30" />
        <link rel="stylesheet" href={resetStyles} />
        <link rel="stylesheet" href={tokenStyles} />
        <link rel="stylesheet" href={fontCss} />
        <link rel="stylesheet" href={appStyles} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');

  if (!data) return <Outlet />;

  return (
    <Analytics.Provider cart={data.cart} shop={data.shop} consent={data.consent}>
      <Tracking {...data.pixels} />
      <PageLayout cart={data.cart}>
        <Outlet />
      </PageLayout>
    </Analytics.Provider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const notFound = status === 404;

  if (!notFound) console.error(error);

  return (
    <>
      <header className="site-header">
        <div className="container site-header__inner">
          <Logo />
        </div>
      </header>
      <main id="main" className="container error-page">
        <p className="eyebrow">{notFound ? 'Error 404' : `Error ${status}`}</p>
        <h1 className="h1">
          {notFound ? 'Off the trail.' : 'Something went wrong.'}
        </h1>
        <p className="lede">
          {notFound
            ? 'That page doesn’t exist. Let’s get you back to camp.'
            : `Please try again in a moment. If it keeps happening, email ${SITE.contactEmail}.`}
        </p>
        <Link to="/" className="btn btn--primary">
          Back to Trenzora
        </Link>
      </main>
    </>
  );
}
