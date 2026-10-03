import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/policies.$handle';
import {PolicyPage} from '~/components/PolicyPage';
import {getPolicy} from '~/data/legal';
import {seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data, params}) =>
  seoMeta({
    title: data?.policy.title ?? 'Policy',
    description: data?.policy.description ?? 'Trenzora store policy.',
    path: `/policies/${params.handle}`,
  });

export function loader({params}: Route.LoaderArgs) {
  // The shipping policy lives at /shipping (linked from the footer).
  if (params.handle === 'shipping-policy') throw redirect('/shipping', 301);
  const policy = params.handle ? getPolicy(params.handle) : undefined;
  if (!policy) throw new Response('Policy not found', {status: 404});
  return {policy};
}

export default function Policy() {
  const {policy} = useLoaderData<typeof loader>();
  return <PolicyPage policy={policy} />;
}
