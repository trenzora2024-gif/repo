import {data} from 'react-router';
import type {Route} from './+types/newsletter';

/**
 * Email signup (resource route, POST only).
 *
 * The Storefront API has no standalone "subscribe" mutation, so we create a
 * customer with `acceptsMarketing: true` (Shopify's documented headless
 * pattern). The random password is never shown; the customer can claim the
 * account later via password reset. Contacts appear in Shopify Admin →
 * Customers → "Email subscribers" for Shopify Email / any ESP.
 */
export async function action({request, context}: Route.ActionArgs) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '')
    .trim()
    .toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return data(
      {ok: false, message: 'Please enter a valid email address.'},
      {status: 400},
    );
  }

  try {
    const password = `${crypto.randomUUID()}Aa1!`;
    const {customerCreate} = await context.storefront.mutate(
      SUBSCRIBE_MUTATION,
      {
        variables: {input: {email, password, acceptsMarketing: true}},
      },
    );
    const errors = customerCreate?.customerUserErrors ?? [];
    const alreadyExists = errors.some((error) => error.code === 'TAKEN');

    if (customerCreate?.customer?.id || alreadyExists) {
      return {
        ok: true,
        message: 'You’re on the list. See you at the next drop.',
      };
    }
    console.error('[newsletter]', errors);
  } catch (error) {
    console.error('[newsletter]', error);
  }

  return data(
    {
      ok: false,
      message: 'We couldn’t sign you up right now. Please try again.',
    },
    {status: 500},
  );
}

export async function loader() {
  return new Response(null, {status: 405, headers: {Allow: 'POST'}});
}

const SUBSCRIBE_MUTATION = `#graphql
  mutation NewsletterSubscribe($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      customerUserErrors {
        code
        message
      }
    }
  }
` as const;
