import {Link} from 'react-router';
import type {Route} from './+types/policies._index';
import {POLICIES} from '~/data/legal';
import {seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  seoMeta({
    title: 'Policies',
    description:
      'Trenzora store policies: shipping, returns and refunds, cancellations, privacy and terms of service.',
    path: '/policies',
  });

const pathFor = (handle: string) =>
  handle === 'shipping-policy' ? '/shipping' : `/policies/${handle}`;

export default function Policies() {
  return (
    <div className="container page-end">
      <header className="page-hero">
        <p className="eyebrow">Help</p>
        <h1>Policies</h1>
      </header>
      <ul className="stack">
        {POLICIES.map((policy) => (
          <li key={policy.handle}>
            <Link className="link-arrow" to={pathFor(policy.handle)}>
              {policy.title}
            </Link>
          </li>
        ))}
        <li>
          <Link className="link-arrow" to="/faq">
            FAQ
          </Link>
        </li>
        <li>
          <Link className="link-arrow" to="/contact">
            Contact and grievances
          </Link>
        </li>
      </ul>
    </div>
  );
}
