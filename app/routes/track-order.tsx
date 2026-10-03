import {Link} from 'react-router';
import type {Route} from './+types/track-order';
import {BUSINESS, SHIPPING, SITE} from '~/data/site';
import {seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  seoMeta({
    title: 'Track your order',
    description:
      'How to track a Trenzora order: your order status page, the dispatch email with tracking, and how to get help.',
    path: '/track-order',
  });

export default function TrackOrder() {
  return (
    <div className="container page-end">
      <header className="page-hero">
        <p className="eyebrow">Help</p>
        <h1>Track your order</h1>
        <p className="lede">
          Every piece is made to order, so tracking starts once your order is
          dispatched.
        </p>
      </header>
      <ol className="steps">
        <li>
          <span>
            <strong>Order confirmed</strong>
            <span className="muted">
              Your confirmation email has a link to your order status page.
              Check your spam folder if you can’t find it.
            </span>
          </span>
        </li>
        <li>
          <span>
            <strong>In production</strong>
            <span className="muted">
              Production usually takes {SHIPPING.productionDays}.
            </span>
          </span>
        </li>
        <li>
          <span>
            <strong>Dispatched</strong>
            <span className="muted">
              We email you a tracking link. Delivery usually takes{' '}
              {SHIPPING.deliveryDays} from dispatch.
            </span>
          </span>
        </li>
      </ol>
      <div className="prose">
        <h2>Need help with an order?</h2>
        <p>
          Email <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>{' '}
          or call <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a> with your
          order number. For delivery problems, see our{' '}
          <Link to="/shipping">shipping policy</Link>. For damaged or wrong
          items, see our <Link to="/policies/refund-policy">refund policy</Link>
          .
        </p>
      </div>
    </div>
  );
}
