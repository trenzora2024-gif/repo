import {Link} from 'react-router';
import type {Route} from './+types/shipping';
import {FAQ, HOW_ITS_MADE, RETURNS, SHIPPING, SITE} from '~/data/site';
import {seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  seoMeta({
    title: 'Shipping & Delivery in India',
    description: `Every Trenzora piece is printed to order. Printing takes ${SHIPPING.productionDays}; delivery across India takes ${SHIPPING.deliveryDays}.`,
    path: '/shipping',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {'@type': 'Answer', text: item.a},
      })),
    },
  });

export default function Shipping() {
  return (
    <div className="container page-end">
      <header className="page-hero">
        <p className="eyebrow">Help</p>
        <h1>Shipping &amp; delivery</h1>
        <p className="lede">
          {SHIPPING.coverage} Every piece is printed to order, so here’s exactly
          what happens after you click “Checkout”.
        </p>
      </header>

      <div className="info-grid">
        <div className="info-card">
          <p className="eyebrow">Printing</p>
          <h2>{SHIPPING.productionDays}</h2>
          <p className="muted">
            Your piece is printed for you after you order.
          </p>
        </div>
        <div className="info-card">
          <p className="eyebrow">Delivery</p>
          <h2>{SHIPPING.deliveryDays}</h2>
          <p className="muted">
            From dispatch to your door, depending on pin code.
          </p>
        </div>
        <div className="info-card">
          <p className="eyebrow">Shipping cost</p>
          <h2>At checkout</h2>
          <p className="muted">{SHIPPING.costNote}</p>
        </div>
      </div>

      <section className="section section--tight split">
        <h2 className="h2">What happens after you order</h2>
        <ol className="steps">
          {HOW_ITS_MADE.map((step) => (
            <li key={step.title}>
              <span>
                <strong>{step.title}</strong>
                <span className="muted">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="split" aria-labelledby="returns-title">
        <h2 id="returns-title" className="h2">
          Returns &amp; replacements
        </h2>
        <div className="prose">
          <p>{RETURNS.summary}</p>
          <p>
            Write to{' '}
            <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> with
            your order number. Full terms:{' '}
            <Link to="/policies/refund-policy">refund policy</Link>.
          </p>
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="faq-title">
        <h2 id="faq-title" className="h2 section-head">
          FAQ
        </h2>
        <div className="accordion">
          {FAQ.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <div className="accordion__body">
                <p>{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
