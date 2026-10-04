import {Link, data} from 'react-router';
import type {Route} from './+types/$';
import {seoMeta} from '~/lib/seo';

/** Branded 404 that keeps the header, footer and cart. */
export async function loader() {
  return data(null, {status: 404});
}

export const meta: Route.MetaFunction = () =>
  seoMeta({
    title: 'Page not found',
    description: 'This page doesn’t exist.',
    path: '/404',
    noindex: true,
  });

export default function NotFound() {
  return (
    <div className="container error-page">
      <p className="eyebrow">Error 404</p>
      <h1 className="h1">Off the trail.</h1>
      <p className="lede">That page doesn’t exist. Let’s get you back to camp.</p>
      <div className="btn-row">
        <Link to="/collections" className="btn btn--primary">
          Shop by mission
        </Link>
        <Link to="/" className="btn">
          Home
        </Link>
      </div>
    </div>
  );
}
