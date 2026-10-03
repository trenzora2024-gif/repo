import {Suspense} from 'react';
import {Await, Link, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useDrawer} from '~/components/Drawer';
import {BagIcon, MenuIcon, SearchIcon} from '~/components/Icons';
import {PRIMARY_NAV} from '~/data/site';

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Trenzora home" prefetch="intent">
      <img
        src="/brand/trenzora-logo.webp"
        alt="Trenzora"
        width={348}
        height={156}
        decoding="async"
      />
    </Link>
  );
}

export function Header({cart}: {cart: Promise<CartApiQueryFragment | null>}) {
  const {open} = useDrawer();
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <div className="header-start">
          <button
            type="button"
            className="icon-btn menu-toggle"
            aria-label="Open menu"
            onClick={() => open('menu')}
          >
            <MenuIcon />
          </button>
        </div>
        <Logo />
        <nav className="nav-primary" aria-label="Primary">
          {PRIMARY_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} prefetch="intent" end>
              {item.title}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <a
            href="/search"
            className="icon-btn"
            aria-label="Search"
            onClick={(event) => {
              event.preventDefault();
              open('search');
            }}
          >
            <SearchIcon />
          </a>
          <Suspense fallback={<CartButton count={0} />}>
            <Await resolve={cart} errorElement={<CartButton count={0} />}>
              <CartButtonResolved />
            </Await>
          </Suspense>
        </div>
      </div>
    </header>
  );
}

function CartButtonResolved() {
  const original = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(original);
  return <CartButton count={cart?.totalQuantity ?? 0} />;
}

function CartButton({count}: {count: number}) {
  const {open} = useDrawer();
  const {publish, shop, cart, prevCart} = useAnalytics();
  return (
    <a
      href="/cart"
      className="icon-btn"
      aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}
      onClick={(event) => {
        event.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <BagIcon />
      {count > 0 ? (
        <span className="cart-count" aria-hidden="true">
          {count}
        </span>
      ) : null}
    </a>
  );
}
