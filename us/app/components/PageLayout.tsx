import {Suspense, useState} from 'react';
import {Await, Form, Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {CartMain} from '~/components/CartMain';
import {Drawer, DrawerProvider} from '~/components/Drawer';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import {GEAR, GEAR_ORDER, MISSIONS, MISSION_ORDER} from '~/data/missions';
import {NAV} from '~/data/site';

export function PageLayout({
  cart,
  children,
}: {
  cart: Promise<CartApiQueryFragment | null>;
  children: React.ReactNode;
}) {
  return (
    <DrawerProvider>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header cart={cart} />
      <main id="main">{children}</main>
      <Footer />

      <Drawer type="cart" title="Your cart">
        <Suspense fallback={<p className="muted">Loading cart…</p>}>
          <Await resolve={cart}>
            {(resolved) => <CartMain cart={resolved} layout="aside" />}
          </Await>
        </Suspense>
      </Drawer>

      <Drawer type="search" title="Search" side="top">
        <SearchPanel />
      </Drawer>

      <Drawer type="menu" title="Menu" side="left">
        <ul className="menu-list">
          {NAV.map((item) => (
            <li key={item.key}>
              <Link to={item.to}>{item.label}</Link>
            </li>
          ))}
        </ul>
        <p className="eyebrow" style={{marginTop: 24}}>
          Missions
        </p>
        <ul className="menu-list menu-list--small">
          {MISSION_ORDER.map((h) => (
            <li key={h}>
              <Link to={`/collections/${h}`}>{MISSIONS[h].label}</Link>
            </li>
          ))}
        </ul>
        <p className="eyebrow" style={{marginTop: 24}}>
          Gear
        </p>
        <ul className="menu-list menu-list--small">
          {GEAR_ORDER.map((h) => (
            <li key={h}>
              <Link to={`/collections/${h}`}>{GEAR[h].label}</Link>
            </li>
          ))}
        </ul>
      </Drawer>
    </DrawerProvider>
  );
}

const POPULAR = ['tailgate tent', 'camp kitchen', 'wood stove', 'car fridge', 'lantern'];

function SearchPanel() {
  const [q, setQ] = useState('');
  return (
    <div className="container stack" style={{paddingInline: 0}}>
      <Form method="get" action="/search" className="search-form" role="search">
        <label htmlFor="drawer-search" className="visually-hidden">
          Search products
        </label>
        <input
          id="drawer-search"
          className="input"
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tents, stoves, fridges…"
          data-autofocus
        />
        <button type="submit" className="btn btn--primary">
          Search
        </button>
      </Form>
      <div className="chips" aria-label="Popular searches">
        {POPULAR.map((term) => (
          <Link key={term} className="chip" to={`/search?q=${encodeURIComponent(term)}`}>
            {term}
          </Link>
        ))}
      </div>
    </div>
  );
}
