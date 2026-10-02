import {Link} from 'react-router';
import type {Route} from './+types/contact';
import {SHIPPING, SITE} from '~/data/site';
import {seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  seoMeta({
    title: 'Contact Trenzora',
    description: `Questions about an order, a design or a gift? Write to ${SITE.contactEmail}`,
    path: '/contact',
  });

export default function Contact() {
  return (
    <div className="container page-end">
      <header className="page-hero">
        <p className="eyebrow">Contact</p>
        <h1>Say hello.</h1>
        <p className="lede">
          Questions about an order, a design or a gift? Real people read every
          message.
        </p>
      </header>

      <div className="info-grid">
        <div className="info-card">
          <h2>Email</h2>
          <p>
            <a className="link-arrow" href={`mailto:${SITE.contactEmail}`}>
              {SITE.contactEmail}
            </a>
          </p>
          <p className="meta">Include your order number for a faster reply.</p>
        </div>
        <div className="info-card">
          <h2>Instagram</h2>
          <p>
            <a
              className="link-arrow"
              href={SITE.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              @trenzora.in
            </a>
          </p>
          <p className="meta">DMs open. Tag us to get featured.</p>
        </div>
        <div className="info-card">
          <h2>Order help</h2>
          <p className="muted">
            Include your order number. Orders ship in {SHIPPING.productionDays}{' '}
            and arrive in {SHIPPING.deliveryDays} — see{' '}
            <Link to="/shipping">shipping</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
