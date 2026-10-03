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
import displayFontCss from '@fontsource-variable/bricolage-grotesque/wght.css?url';
import displayFontLatin from '@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2?url';
import serifFontCss from '@fontsource/instrument-serif/latin-400-italic.css?url';
import resetStyles from '~/styles/reset.css?url';
import tokenStyles from '~/styles/tokens.css?url';
import appStyles from '~/styles/app.css?url';
import {PageLayout} from '~/components/PageLayout';
import {AnalyticsBridge} from '~/components/AnalyticsBridge';
import {SITE} from '~/data/site';
import {Logo} from '~/components/Header';

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
      href: displayFontLatin,
      crossOrigin: 'anonymous',
    },
    {rel: 'icon', href: '/favicon.ico', sizes: '48x48'},
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/brand/favicon-32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '192x192',
      href: '/brand/icon-192.png',
    },
    {rel: 'apple-touch-icon', href: '/apple-touch-icon.png'},
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
      withPrivacyBanner: false,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();

  return (
    <html lang="en-IN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#fbf6ee" />
        <link rel="stylesheet" href={resetStyles} />
        <link rel="stylesheet" href={tokenStyles} />
        <link rel="stylesheet" href={displayFontCss} />
        <link rel="stylesheet" href={serifFontCss} />
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
    <Analytics.Provider
      cart={data.cart}
      shop={data.shop}
      consent={data.consent}
    >
      <AnalyticsBridge />
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
          <span />
          <Logo />
        </div>
      </header>
      <main id="main" className="container error-page">
        <p className="eyebrow">{notFound ? 'Error 404' : `Error ${status}`}</p>
        <h1 className="h1">
          {notFound ? 'This page took a wrong turn.' : 'Something went wrong.'}
        </h1>
        <p className="lede">
          {notFound
            ? 'The page you’re looking for doesn’t exist — but the drop does.'
            : `Please try again in a moment. If it keeps happening, write to ${SITE.contactEmail}.`}
        </p>
        <Link to="/" className="btn btn--primary">
          Back to Trenzora
        </Link>
      </main>
    </>
  );
}
