import {useEffect, useRef, useState} from 'react';
import {Form, Link, useFetcher} from 'react-router';
import {useDrawer} from '~/components/Drawer';
import {ProductMedia} from '~/components/ProductMedia';
import {productNameParts} from '~/components/ProductCard';
import {LAUNCH_FAMILIES} from '~/data/catalogue';
import {formatMoney} from '~/lib/money';
import type {PredictiveResult} from '~/routes/search';

/** Search drawer: instant product suggestions, full results on submit. */
export function SearchPanel() {
  const {close} = useDrawer();
  const fetcher = useFetcher<PredictiveResult>({key: 'predictive-search'});
  const [term, setTerm] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onChange = (value: string) => {
    setTerm(value);
    clearTimeout(timer.current);
    if (value.trim().length < 2) return;
    timer.current = setTimeout(() => {
      void fetcher.load(
        `/search?predictive=1&q=${encodeURIComponent(value.trim())}`,
      );
    }, 180);
  };

  const products =
    term.trim().length >= 2 ? (fetcher.data?.products ?? []) : [];
  const loading = fetcher.state === 'loading';

  return (
    <div>
      <Form
        method="get"
        action="/search"
        className="search-form"
        role="search"
        onSubmit={close}
      >
        <label htmlFor="drawer-search" className="sr-only">
          Search Trenzora
        </label>
        <input
          id="drawer-search"
          data-autofocus
          className="input"
          type="search"
          name="q"
          placeholder="Try “Mumbai”, “coffee” or “gift”"
          autoComplete="off"
          value={term}
          onChange={(event) => onChange(event.target.value)}
        />
        <button type="submit" className="btn btn--primary">
          Search
        </button>
      </Form>

      <div className="search-suggest" aria-live="polite">
        {products.length ? (
          <>
            <p className="eyebrow">Products</p>
            <div>
              {products.map((product) => {
                const {design, type} = productNameParts(product);
                return (
                  <Link
                    key={product.id}
                    to={`/products/${product.handle}`}
                    className="search-hit"
                    onClick={close}
                  >
                    <ProductMedia
                      image={product.featuredImage}
                      handle={product.handle}
                      tags={product.tags}
                      alt=""
                      sizes="64px"
                    />
                    <span>
                      <strong>{design}</strong>
                      <span className="meta block">{type}</span>
                    </span>
                    <span className="meta">
                      {formatMoney(product.priceRange.minVariantPrice)}
                    </span>
                  </Link>
                );
              })}
            </div>
            <Link
              to={`/search?q=${encodeURIComponent(term)}`}
              className="link-arrow"
              onClick={close}
            >
              See all results
            </Link>
          </>
        ) : term.trim().length >= 2 && !loading && fetcher.data ? (
          <p className="muted">No matches for “{term}”. Try a design below.</p>
        ) : null}

        {!products.length ? (
          <>
            <p className="eyebrow">Browse by design</p>
            <div className="option-grid">
              {LAUNCH_FAMILIES.map((family) => (
                <Link
                  key={family.handle}
                  to={`/designs/${family.handle}`}
                  className="chip"
                  onClick={close}
                >
                  {family.name}
                </Link>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
