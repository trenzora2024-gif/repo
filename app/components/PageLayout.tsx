import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {CartMain} from '~/components/CartMain';
import {Drawer, DrawerProvider} from '~/components/Drawer';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import {SearchPanel} from '~/components/SearchPanel';
import {PRIMARY_NAV, SITE} from '~/data/site';

export function PageLayout({
  cart,
  children,
}: {
  cart: Promise<CartApiQueryFragment | null>;
  children?: React.ReactNode;
}) {
  return (
    <DrawerProvider>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header cart={cart} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />

      <Drawer type="cart" title="Your cart">
        <Suspense fallback={<p className="muted">Loading your cart…</p>}>
          <Await resolve={cart}>
            {(resolved) => <CartMain cart={resolved} layout="aside" />}
          </Await>
        </Suspense>
      </Drawer>

      <Drawer type="search" title="Search" side="top">
        <SearchPanel />
      </Drawer>

      <Drawer type="menu" title="Menu" side="left">
        <nav className="mobile-nav" aria-label="Mobile">
          <NavLink to="/" end prefetch="intent">
            Home
          </NavLink>
          {PRIMARY_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} prefetch="intent" end>
              {item.title}
            </NavLink>
          ))}
        </nav>
        <div className="mobile-nav__foot">
          <p className="serif h3">{SITE.positioning}</p>
          <p className="meta">
            <NavLink to="/shipping">Shipping</NavLink> ·{' '}
            <NavLink to="/contact">Contact</NavLink>
          </p>
        </div>
      </Drawer>
    </DrawerProvider>
  );
}
