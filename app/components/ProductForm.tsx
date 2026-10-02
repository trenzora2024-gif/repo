import {useEffect, useRef, useState} from 'react';
import {Link, useNavigate, type FetcherWithComponents} from 'react-router';
import {
  CartForm,
  type MappedProductOptions,
  type OptimisticCartLineInput,
} from '@shopify/hydrogen';
import type {AttributeInput} from '@shopify/hydrogen/storefront-api-types';
import type {ProductFragment} from 'storefrontapi.generated';
import {useDrawer} from '~/components/Drawer';
import type {DesignFamily, ProductTypeSpec} from '~/data/catalogue';
import {track} from '~/lib/analytics';
import {formatMoney} from '~/lib/money';

type Variant = NonNullable<ProductFragment['selectedOrFirstAvailableVariant']>;

export function ProductForm({
  productTitle,
  productOptions,
  selectedVariant,
  family,
  type,
}: {
  productTitle: string;
  productOptions: MappedProductOptions[];
  selectedVariant: Variant | null;
  family?: DesignFamily;
  type?: ProductTypeSpec;
}) {
  const {open} = useDrawer();
  const atcRef = useRef<HTMLDivElement>(null);
  const [stickyVisible, setStickyVisible] = useState(false);
  const personalization = family?.personalization;
  const [values, setValues] = useState<Record<string, string>>({});
  const startedRef = useRef(false);

  // Sticky add-to-cart on mobile once the main button scrolls away.
  useEffect(() => {
    const node = atcRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setStickyVisible(
          !entry.isIntersecting && entry.boundingClientRect.top < 0,
        ),
      {threshold: 0},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const fields = personalization?.enabled ? personalization.fields : [];
  const personalizationValid = fields.every(
    (field) => !field.required || (values[field.key] ?? '').trim().length > 0,
  );
  const available = Boolean(selectedVariant?.availableForSale);
  const canAdd = available && personalizationValid;

  const attributes: AttributeInput[] = fields.length
    ? [
        ...fields
          .filter((field) => (values[field.key] ?? '').trim())
          .map((field) => ({key: field.key, value: values[field.key].trim()})),
        // Hidden (underscore) attributes for the artwork pipeline.
        {key: '_design_family', value: family!.handle},
        {key: '_artwork_master', value: family!.artworkFile},
      ]
    : [];

  const lines = selectedVariant
    ? [
        {
          merchandiseId: selectedVariant.id,
          quantity: 1,
          ...(attributes.length ? {attributes} : {}),
          selectedVariant,
        },
      ]
    : [];

  const onAdd = () => {
    if (fields.length) {
      track('customization_complete', {
        design_family: family?.handle,
        fields: fields.map((field) => field.key),
      });
    }
    open('cart');
  };

  const label = !selectedVariant
    ? 'Select an option'
    : !available
      ? 'Sold out'
      : !personalizationValid
        ? 'Add your text to continue'
        : 'Add to cart';

  return (
    <div className="stack">
      {productOptions.map((option) =>
        option.optionValues.length > 1 ? (
          <OptionPicker key={option.name} option={option} fitNote={type?.fit} />
        ) : null,
      )}

      {personalization?.enabled ? (
        <fieldset className="personalize">
          <legend className="personalize__title">Make it yours</legend>
          {fields.map((field) => (
            <label key={field.key} className="field">
              <span className="label">
                {field.label}
                {field.required ? '' : ' (optional)'}
              </span>
              <input
                className="input"
                name={field.key}
                maxLength={field.maxLength}
                placeholder={field.placeholder}
                required={field.required}
                value={values[field.key] ?? ''}
                onChange={(event) => {
                  if (!startedRef.current) {
                    startedRef.current = true;
                    track('customization_start', {
                      design_family: family?.handle,
                    });
                  }
                  setValues((prev) => ({
                    ...prev,
                    [field.key]: event.target.value,
                  }));
                }}
              />
              <span className="meta">
                {(values[field.key] ?? '').length}/{field.maxLength} characters
              </span>
            </label>
          ))}
          <p className="meta">
            Personalised pieces are printed just for you and can’t be returned
            unless damaged or misprinted.
          </p>
        </fieldset>
      ) : personalization?.planned && personalization.comingSoonNote ? (
        <div className="personalize">
          <p className="personalize__title">
            <span className="badge">Coming soon</span> Personal text
          </p>
          <p className="meta">{personalization.comingSoonNote}</p>
        </div>
      ) : null}

      <div ref={atcRef} className="atc">
        <AddToCart lines={lines} disabled={!canAdd} onClick={onAdd}>
          {label}
          {canAdd && selectedVariant
            ? ` · ${formatMoney(selectedVariant.price)}`
            : ''}
        </AddToCart>
      </div>

      <div
        className={`sticky-atc${stickyVisible ? ' is-visible' : ''}`}
        aria-hidden={!stickyVisible}
      >
        <div className="sticky-atc__info">
          <strong>{productTitle}</strong>
          <span className="meta">
            {selectedVariant?.title !== 'Default Title'
              ? `${selectedVariant?.title} · `
              : ''}
            {formatMoney(selectedVariant?.price)}
          </span>
        </div>
        <AddToCart
          lines={lines}
          disabled={!canAdd}
          onClick={onAdd}
          tabIndex={stickyVisible ? 0 : -1}
          compact
        >
          {canAdd ? 'Add to cart' : label}
        </AddToCart>
      </div>
    </div>
  );
}

function OptionPicker({
  option,
  fitNote,
}: {
  option: MappedProductOptions;
  fitNote?: string;
}) {
  const navigate = useNavigate();
  const selected = option.optionValues.find((value) => value.selected);

  return (
    <fieldset className="option-group">
      <legend>
        <span>
          {option.name}: <strong>{selected?.name ?? 'Select'}</strong>
        </span>
      </legend>
      <div className="option-grid" role="radiogroup" aria-label={option.name}>
        {option.optionValues.map((value) => {
          const {
            name,
            variantUriQuery,
            selected: isSelected,
            available,
            exists,
            isDifferentProduct,
            handle,
          } = value;
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
                  void navigate(`?${variantUriQuery}`, {
                    replace: true,
                    preventScrollReset: true,
                  });
                }
              }}
            >
              {name}
            </button>
          );
        })}
      </div>
      {fitNote && option.name.toLowerCase() === 'size' ? (
        <p className="meta">{fitNote}</p>
      ) : null}
    </fieldset>
  );
}

function AddToCart({
  lines,
  disabled,
  onClick,
  children,
  tabIndex,
  compact,
}: {
  lines: OptimisticCartLineInput[];
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tabIndex?: number;
  compact?: boolean;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<unknown>) => (
        <button
          type="submit"
          className={`btn btn--accent ${compact ? '' : 'btn--lg btn--block'}`}
          disabled={disabled || fetcher.state !== 'idle'}
          onClick={onClick}
          tabIndex={tabIndex}
        >
          {fetcher.state !== 'idle' ? 'Adding…' : children}
        </button>
      )}
    </CartForm>
  );
}
