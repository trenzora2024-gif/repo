import {useLoaderData, data, type HeadersFunction} from 'react-router';
import type {Route} from './+types/cart';
import {
  Analytics,
  CartForm,
  type CartQueryDataReturn,
  type OptimisticCartLineInput,
} from '@shopify/hydrogen';
import {CartMain} from '~/components/CartMain';
import {BUNDLE_ADD} from '~/lib/cart-actions';
import {seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  seoMeta({
    title: 'Your cart',
    description: 'Review your Trenzora cart and check out securely with Shopify.',
    path: '/cart',
    noindex: true,
  });

export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;

export async function action({request, context}: Route.ActionArgs) {
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result: CartQueryDataReturn;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];
      discountCodes.push(...(inputs.discountCodes as string[]));
      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case BUNDLE_ADD: {
      // One click adds every piece of a setup; the setup's discount code is
      // applied only when PUBLIC_BUNDLE_DISCOUNTS=on (the code must exist in
      // Shopify Admin first, see catalog/bundles.md).
      result = await cart.addLines(inputs.lines as OptimisticCartLineInput[]);
      const code = String(inputs.discountCode ?? '');
      if (code && context.env.PUBLIC_BUNDLE_DISCOUNTS === 'on' && result.cart) {
        const existing = (result.cart.discountCodes ?? []).map((d) => d.code);
        if (!existing.includes(code)) {
          result = await cart.updateDiscountCodes([...existing, code]);
        }
      }
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

export async function loader({context}: Route.LoaderArgs) {
  const {cart} = context;
  return await cart.get();
}

export default function Cart() {
  const cart = useLoaderData<typeof loader>();

  return (
    <div className="container section--tight">
      <header className="coll-hero" style={{paddingTop: 0}}>
        <h1 className="h1">Your cart</h1>
      </header>
      <CartMain layout="page" cart={cart} />
      <Analytics.CartView />
    </div>
  );
}
