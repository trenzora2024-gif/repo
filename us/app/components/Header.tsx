import {Suspense} from 'react';
import {Await, Link, NavLink} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useDrawer} from '~/components/Drawer';
import {BagIcon, MenuIcon, PeakIcon, SearchIcon} from '~/components/Icons';
import {NAV, RETURNS, SHIPPING} from '~/data/site';

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Trenzora home">
      <PeakIcon size={26} />
      Trenzora
    </Link>
  );
}

export function Header({cart}: {cart: Promise<CartApiQueryFragment | null>}) {
  const {open} = useDrawer();
  return (
    <>
      <p className="announce">
        {SHIPPING.headline} · {RETURNS.headline} · Gear picked for car camping
      </p>
      <header className="site-header">
        <div className="container site-header__inner">
          <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
            <button
              type="button"
              className="icon-btn menu-toggle"
              aria-label="Open menu"
              onClick={() => open('menu')}
            >
              <MenuIcon />
            </button>
            <Logo />
          </div>
          <nav className="site-nav" aria-label="Main">
            {NAV.map((item) => (
              <NavLink key={item.key} to={item.to} prefetch="intent" end>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <button
              type="button"
              className="icon-btn"
              aria-label="Search"
              onClick={() => open('search')}
            >
              <SearchIcon />
            </button>
            <Suspense fallback={<CartButton count={0} />}>
              <Await resolve={cart} errorElement={<CartButton count={0} />}>
                {(resolved) => (
                  <CartButton count={resolved?.totalQuantity ?? 0} />
                )}
              </Await>
            </Suspense>
          </div>
        </div>
      </header>
    </>
  );
}

function CartButton({count}: {count: number}) {
  const {open} = useDrawer();
  return (
    <a
      href="/cart"
      className="icon-btn"
      aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
      onClick={(event) => {
        event.preventDefault();
        open('cart');
      }}
    >
      <BagIcon />
      {count > 0 ? <span className="count-badge">{count}</span> : null}
    </a>
  );
}
