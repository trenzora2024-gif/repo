import type {Route} from './+types/account';
import {redirectToShopifyAccount} from '~/lib/account';

export function loader({context, request}: Route.LoaderArgs) {
  return redirectToShopifyAccount(context.env, request);
}
