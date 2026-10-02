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
import {productNameParts} from '~/components/ProductCard';
import {SHIPPING} from '~/data/site';
import {track} from '~/lib/analytics';
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
    (line) =>
      !('parentRelationship' in line && line.parentRelationship?.parent),
  ) as CartLine[];

  if (!lines.length) return <CartEmpty layout={layout} />;

  return (
    <div className={layout === 'page' ? 'cart-page' : 'cart-aside'}>
      <ul className="cart-lines" aria-label="Items in your cart">
        {lines.map((line) => (
          <CartLineItem key={line.id} line={line} layout={layout} />
        ))}
      </ul>
      <CartSummary cart={cart} />
    </div>
  );
}

function CartEmpty({layout}: {layout: CartLayout}) {
  const {close} = useDrawer();
  return (
    <div className="empty-state">
      <p className="h3">Your cart is empty.</p>
      <p className="muted">
        Every Trenzora piece is an original design, printed for you.
      </p>
      <Link
        to="/collections/drops"
        className="btn btn--primary"
        onClick={layout === 'aside' ? close : undefined}
        prefetch="viewport"
      >
        Explore the drop
      </Link>
    </div>
  );
}

function CartLineItem({line, layout}: {line: CartLine; layout: CartLayout}) {
  const {close} = useDrawer();
  const {merchandise, quantity, isOptimistic} = line;
  const {product, image, selectedOptions} = merchandise;
  const {design, type} = productNameParts(product);
  const variant = selectedOptions
    .filter((option) => option.value !== 'Default Title')
    .map((option) => `${option.name}: ${option.value}`)
    .join(' · ');
  const personal = (line.attributes ?? []).filter(
    (attribute) => !attribute.key.startsWith('_') && attribute.value,
  );
  const url = `/products/${product.handle}${
    variant
      ? `?${new URLSearchParams(selectedOptions.map((o) => [o.name, o.value])).toString()}`
      : ''
  }`;

  return (
    <li className="cart-line">
      <Link
        to={url}
        onClick={layout === 'aside' ? close : undefined}
        tabIndex={-1}
        aria-hidden="true"
      >
        <ProductMedia
          image={image}
          handle={product.handle}
          alt=""
          sizes="88px"
        />
      </Link>
      <div className="cart-line__main">
        <div className="cart-line__top">
          <Link
            to={url}
            className="cart-line__title"
            onClick={layout === 'aside' ? close : undefined}
          >
            {design}
            {type ? <span className="cart-line__type">{type}</span> : null}
          </Link>
          <strong>{formatMoney(line.cost?.totalAmount)}</strong>
        </div>
        {variant ? <span className="cart-line__variant">{variant}</span> : null}
        {personal.map((attribute) => (
          <span key={attribute.key} className="cart-line__variant">
            {attribute.key}: {attribute.value}
          </span>
        ))}
        <div className="cart-line__controls">
          <div
            className="qty"
            role="group"
            aria-label={`Quantity for ${product.title}`}
          >
            <LineUpdate
              lines={[{id: line.id, quantity: Math.max(0, quantity - 1)}]}
            >
              <button
                type="submit"
                aria-label="Decrease quantity"
                disabled={quantity <= 1 || !!isOptimistic}
              >
                −
              </button>
            </LineUpdate>
            <output aria-live="polite">{quantity}</output>
            <LineUpdate lines={[{id: line.id, quantity: quantity + 1}]}>
              <button
                type="submit"
                aria-label="Increase quantity"
                disabled={!!isOptimistic}
              >
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
            <button
              type="submit"
              className="text-btn"
              disabled={!!isOptimistic}
            >
              Remove
            </button>
          </CartForm>
        </div>
      </div>
    </li>
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
}: {
  cart: ReturnType<typeof useOptimisticCart<CartApiQueryFragment | null>>;
}) {
  const subtotal = cart?.cost?.subtotalAmount;
  const checkoutUrl = cart?.checkoutUrl;

  return (
    <section className="cart-summary" aria-label="Order summary">
      <div className="cart-summary__row">
        <span>Subtotal</span>
        <span>{subtotal?.amount ? formatMoney(subtotal) : '—'}</span>
      </div>
      <p className="meta">
        Taxes included. {SHIPPING.costNote} Printed to order — ships in{' '}
        {SHIPPING.productionDays}, delivered in {SHIPPING.deliveryDays}.
      </p>
      {checkoutUrl ? (
        <a
          href={checkoutUrl}
          className="btn btn--accent btn--lg btn--block"
          onClick={() => {
            const lines = (cart?.lines?.nodes ?? []) as CartLine[];
            track('begin_checkout', {
              currency: subtotal?.currencyCode,
              value: Number(subtotal?.amount ?? 0),
              items: lines.map((line) => ({
                item_id: line.merchandise.sku || line.merchandise.id,
                item_name: line.merchandise.product.title,
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
      <p className="meta center">Secure checkout powered by Shopify</p>
    </section>
  );
}
