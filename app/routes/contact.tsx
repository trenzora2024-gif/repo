import {Link} from 'react-router';
import type {Route} from './+types/contact';
import {BUSINESS, SITE} from '~/data/site';
import {seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  seoMeta({
    title: 'Contact Trenzora',
    description: `Questions about an order, a design or a gift? Email ${SITE.contactEmail} or call ${BUSINESS.phone}.`,
    path: '/contact',
  });

export default function Contact() {
  const officer = BUSINESS.grievanceOfficer;
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
          <h2>Phone</h2>
          <p>
            <a className="link-arrow" href={BUSINESS.phoneHref}>
              {BUSINESS.phone}
            </a>
          </p>
          {BUSINESS.supportHours ? (
            <p className="meta">{BUSINESS.supportHours}</p>
          ) : null}
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
      </div>

      <section className="section section--tight split">
        <h2 className="h2">Order help</h2>
        <div className="prose">
          <p>
            <Link to="/track-order">Track your order</Link>, read the{' '}
            <Link to="/faq">FAQ</Link>, or see our{' '}
            <Link to="/shipping">shipping</Link>,{' '}
            <Link to="/policies/refund-policy">returns &amp; refunds</Link> and{' '}
            <Link to="/policies/cancellation-policy">cancellation</Link>{' '}
            policies.
          </p>
        </div>
      </section>

      <section
        className="section section--tight split"
        aria-labelledby="grievance-title"
      >
        <h2 id="grievance-title" className="h2">
          Business details &amp; grievances
        </h2>
        <div className="prose">
          <p>
            <strong>{BUSINESS.legalName ?? BUSINESS.tradingName}</strong>
            <br />
            {BUSINESS.address.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </p>
          <p>
            For complaints about an order or our service, email{' '}
            <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> or
            call <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>.
            {officer
              ? ` Grievance Officer: ${officer.name}, ${officer.designation}.`
              : null}
          </p>
        </div>
      </section>
    </div>
  );
}
