import {
  CartForm,
  useOptimisticCart,
  type OptimisticCartLine,
} from '@shopify/hydrogen';
import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useDrawer} from '~/components/Drawer';
import {ProductMedia} from '~/components/ProductMedia';
import {catalogEntry} from '~/data/catalog';
import {RETURNS, SHIPPING} from '~/data/site';
import {catalogItemId, track} from '~/lib/analytics';
import {formatMoney} from '~/lib/money';

export type CartLayout = 'page' | 'aside';
type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/** Cart contents shared by the cart drawer and the /cart page. */
export function CartMain({
  cart: originalCart,
  layout,
}: {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
}) {
  const cart = useOptimisticCart(originalCart);
  const lines = (cart?.lines?.nodes ?? []).filter(
    (line) => !('parentRelationship' in line && line.parentRelationship?.parent),
  ) as CartLine[];

  if (!lines.length) return <CartEmpty layout={layout} />;

  return (
    <div className={layout === 'page' ? 'cart-page' : 'cart-aside'}>
      <div>
        <ul className="cart-lines" aria-label="Items in your cart">
          {lines.map((line) => (
            <CartLineItem key={line.id} line={line} layout={layout} />
          ))}
        </ul>
        <CompleteTheSetup lines={lines} layout={layout} />
      </div>
      <CartSummary cart={cart} lines={lines} />
    </div>
  );
}

function CartEmpty({layout}: {layout: CartLayout}) {
  const {close} = useDrawer();
  return (
    <div className="empty-state">
      <p className="h3">Your cart is empty.</p>
      <p className="muted">Not sure where to start? Pick what you’re planning.</p>
      <div className="btn-row">
        <Link
          to="/collections/weekend-car-camping"
          className="btn btn--primary"
          onClick={layout === 'aside' ? close : undefined}
        >
          Weekend car camping
        </Link>
        <Link to="/bundles" className="btn" onClick={layout === 'aside' ? close : undefined}>
          Complete setups
        </Link>
      </div>
    </div>
  );
}

function CartLineItem({line, layout}: {line: CartLine; layout: CartLayout}) {
  const {close} = useDrawer();
  const {merchandise, quantity, isOptimistic} = line;
  const {product, image, selectedOptions} = merchandise;
  const variant = selectedOptions
    .filter((option) => option.value !== 'Default Title')
    .map((option) => `${option.name}: ${option.value}`)
    .join(' · ');
  const bundle = (line.attributes ?? []).find((a) => a.key === '_bundle')?.value;
  const url = `/products/${product.handle}`;

  return (
    <li className="cart-line">
      <Link
        to={url}
        className="cart-line__media"
        onClick={layout === 'aside' ? close : undefined}
        tabIndex={-1}
        aria-hidden="true"
      >
        <ProductMedia image={image} handle={product.handle} alt="" sizes="80px" />
      </Link>
      <div>
        <div className="cart-line__top">
          <Link
            to={url}
            className="cart-line__title"
            onClick={layout === 'aside' ? close : undefined}
          >
            {product.title}
          </Link>
          <strong>{formatMoney(line.cost?.totalAmount)}</strong>
        </div>
        {variant ? <span className="cart-line__variant">{variant}</span> : null}
        {bundle ? (
          <span className="cart-line__variant">Part of: {bundle.replace(/-/g, ' ')}</span>
        ) : null}
        <div className="cart-line__controls">
          <div className="qty" role="group" aria-label={`Quantity for ${product.title}`}>
            <LineUpdate lines={[{id: line.id, quantity: Math.max(0, quantity - 1)}]}>
              <button type="submit" aria-label="Decrease quantity" disabled={quantity <= 1 || !!isOptimistic}>
                −
              </button>
            </LineUpdate>
            <output aria-live="polite">{quantity}</output>
            <LineUpdate lines={[{id: line.id, quantity: quantity + 1}]}>
              <button type="submit" aria-label="Increase quantity" disabled={!!isOptimistic}>
                +
              </button>
            </LineUpdate>
          </div>
          <CartForm
            fetcherKey={`remove-${line.id}`}
            route="/cart"
            action={CartForm.ACTIONS.LinesRemove}
            inputs={{lineIds: [line.id]}}
          >
            <button type="submit" className="text-btn" disabled={!!isOptimistic}>
              Remove
            </button>
          </CartForm>
        </div>
      </div>
    </li>
  );
}

/** Cross-sells from the curated catalog that aren't already in the cart. */
function CompleteTheSetup({lines, layout}: {lines: CartLine[]; layout: CartLayout}) {
  const {close} = useDrawer();
  const inCart = new Set(lines.map((l) => l.merchandise.product.handle));
  const picks: string[] = [];
  for (const line of lines) {
    for (const h of catalogEntry(line.merchandise.product.handle)?.crossSell ?? []) {
      if (!inCart.has(h) && !picks.includes(h)) picks.push(h);
    }
  }
  const items = picks.slice(0, 3).map(catalogEntry).filter(Boolean);
  if (!items.length) return null;
  return (
    <section className="cart-upsell" aria-label="Complete your setup">
      <p className="h3">Complete your setup</p>
      {items.map((item) => (
        <div key={item!.handle} className="cart-upsell__item">
          <ProductMedia handle={item!.handle} alt="" />
          <div>
            <strong style={{display: 'block', fontSize: '0.92rem'}}>{item!.title}</strong>
            <span className="meta">{item!.outcome}</span>
          </div>
          <Link
            to={`/products/${item!.handle}`}
            className="link"
            onClick={layout === 'aside' ? close : undefined}
          >
            View
          </Link>
        </div>
      ))}
    </section>
  );
}

function LineUpdate({
  lines,
  children,
}: {
  lines: CartLineUpdateInput[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      fetcherKey={`update-${lines.map((l) => l.id).join('-')}`}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

function CartSummary({
  cart,
  lines,
}: {
  cart: ReturnType<typeof useOptimisticCart<CartApiQueryFragment | null>>;
  lines: CartLine[];
}) {
  const subtotal = cart?.cost?.subtotalAmount;
  const total = cart?.cost?.totalAmount;
  const checkoutUrl = cart?.checkoutUrl;
  const codes = (cart?.discountCodes ?? []).filter((c) => c.applicable);
  const savings = Number(subtotal?.amount ?? 0) - Number(total?.amount ?? 0);

  return (
    <section className="cart-summary" aria-label="Order summary">
      <div className="cart-summary__row">
        <span>Subtotal</span>
        <span>{subtotal?.amount ? formatMoney(subtotal) : '—'}</span>
      </div>
      {codes.length && savings > 0 ? (
        <p className="save">
          Setup savings applied ({codes.map((c) => c.code).join(', ')}): −
          {formatMoney({amount: savings, currencyCode: subtotal?.currencyCode})}
        </p>
      ) : null}
      <p className="meta">
        {SHIPPING.costNote} Ships in {SHIPPING.processingDays}, arrives in{' '}
        {SHIPPING.deliveryDays}. {RETURNS.headline}. Taxes calculated at checkout.
      </p>
      {checkoutUrl ? (
        <a
          href={checkoutUrl}
          className="btn btn--accent btn--lg btn--block"
          onClick={() => {
            track('begin_checkout', {
              currency: subtotal?.currencyCode,
              value: Number(total?.amount ?? subtotal?.amount ?? 0),
              items: lines.map((line) => ({
                item_id: catalogItemId(line.merchandise.product.id, line.merchandise.id),
                item_name: line.merchandise.product.title,
                item_brand: line.merchandise.product.vendor,
                item_variant: line.merchandise.title,
                price: Number(line.cost?.amountPerQuantity?.amount ?? 0),
                quantity: line.quantity,
              })),
            });
          }}
        >
          Checkout securely
        </a>
      ) : null}
      <p className="meta center">Shop Pay · Apple Pay · Google Pay · Cards — via Shopify checkout</p>
    </section>
  );
}
