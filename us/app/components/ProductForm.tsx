import {useEffect, useRef, useState} from 'react';
import {Link, useNavigate, type FetcherWithComponents} from 'react-router';
import {
  CartForm,
  type MappedProductOptions,
  type OptimisticCartLineInput,
} from '@shopify/hydrogen';
import {useDrawer} from '~/components/Drawer';
import {formatMoney} from '~/lib/money';

type Money = {amount: string; currencyCode: string};
type Variant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice?: Money | null;
};

export function ProductForm({
  productTitle,
  productOptions,
  selectedVariant,
}: {
  productTitle: string;
  productOptions: MappedProductOptions[];
  selectedVariant: Variant | null;
}) {
  const {open} = useDrawer();
  const atcRef = useRef<HTMLDivElement>(null);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Sticky add-to-cart once the main button scrolls out of view.
  useEffect(() => {
    const node = atcRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setStickyVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      {threshold: 0},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const available = Boolean(selectedVariant?.availableForSale);
  const lines: OptimisticCartLineInput[] = selectedVariant
    ? [{merchandiseId: selectedVariant.id, quantity, selectedVariant}]
    : [];
  const label = !selectedVariant ? 'Select an option' : !available ? 'Sold out' : 'Add to cart';

  return (
    <div className="stack">
      {productOptions.map((option) =>
        option.optionValues.length > 1 ? <OptionPicker key={option.name} option={option} /> : null,
      )}

      <div ref={atcRef} className="buy-row">
        <div className="qty" role="group" aria-label="Quantity">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
          >
            −
          </button>
          <output aria-live="polite">{quantity}</output>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
          >
            +
          </button>
        </div>
        <AddToCart lines={lines} disabled={!available} onClick={() => open('cart')}>
          {label}
          {available && selectedVariant ? ` · ${formatMoney(selectedVariant.price)}` : ''}
        </AddToCart>
      </div>

      <div className={`sticky-atc${stickyVisible ? ' is-visible' : ''}`} aria-hidden={!stickyVisible}>
        <div className="sticky-atc__info">
          <strong>{productTitle}</strong>
          <span className="meta">{formatMoney(selectedVariant?.price)}</span>
        </div>
        <AddToCart
          lines={lines}
          disabled={!available}
          onClick={() => open('cart')}
          tabIndex={stickyVisible ? 0 : -1}
          compact
        >
          {label}
        </AddToCart>
      </div>
    </div>
  );
}

function OptionPicker({option}: {option: MappedProductOptions}) {
  const navigate = useNavigate();
  const selected = option.optionValues.find((value) => value.selected);

  return (
    <fieldset className="option-group">
      <legend>
        {option.name}: <strong>{selected?.name ?? 'Select'}</strong>
      </legend>
      <div className="option-grid" role="radiogroup" aria-label={option.name}>
        {option.optionValues.map((value) => {
          const {name, variantUriQuery, selected: isSelected, available, exists, isDifferentProduct, handle} =
            value;
          const common = {
            className: 'option-btn',
            role: 'radio',
            'aria-checked': isSelected,
            'data-unavailable': !available,
            'aria-label': available ? name : `${name} (sold out)`,
          } as const;
          if (isDifferentProduct) {
            return (
              <Link
                key={name}
                {...common}
                to={`/products/${handle}?${variantUriQuery}`}
                replace
                preventScrollReset
                prefetch="intent"
              >
                {name}
              </Link>
            );
          }
          return (
            <button
              key={name}
              type="button"
              {...common}
              disabled={!exists}
              onClick={() => {
                if (!isSelected) {
                  void navigate(`?${variantUriQuery}`, {replace: true, preventScrollReset: true});
                }
              }}
            >
              {name}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function AddToCart({
  lines,
  disabled,
  onClick,
  children,
  tabIndex,
  compact,
  action,
  inputs,
}: {
  lines: OptimisticCartLineInput[];
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tabIndex?: number;
  compact?: boolean;
  action?: `Custom${string}`;
  inputs?: Record<string, unknown>;
}) {
  const render = (fetcher: FetcherWithComponents<unknown>) => (
    <button
      type="submit"
      className={`btn btn--accent ${compact ? '' : 'btn--lg btn--block'}`}
      disabled={disabled || fetcher.state !== 'idle'}
      onClick={onClick}
      tabIndex={tabIndex}
    >
      {fetcher.state !== 'idle' ? 'Adding…' : children}
    </button>
  );
  // A `Custom…` action (bundles) takes free-form inputs.
  if (action && inputs) {
    return (
      <CartForm route="/cart" action={action} inputs={inputs}>
        {render}
      </CartForm>
    );
  }
  return (
    <CartForm route="/cart" action={CartForm.ACTIONS.LinesAdd} inputs={{lines}}>
      {render}
    </CartForm>
  );
}
