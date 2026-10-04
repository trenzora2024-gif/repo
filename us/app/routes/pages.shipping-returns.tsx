import {Link} from 'react-router';
import type {Route} from './+types/pages.shipping-returns';
import {Breadcrumbs, Faq} from '~/components/Blocks';
import {FAQ, RETURNS, SHIPPING, SITE} from '~/data/site';
import {faqJsonLd, seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  seoMeta({
    title: 'Shipping & Returns',
    description: `${SHIPPING.headline}. Ships in ${SHIPPING.processingDays}, arrives in ${SHIPPING.deliveryDays}. ${RETURNS.headline}.`,
    path: '/pages/shipping-returns',
    jsonLd: faqJsonLd(FAQ),
  });

export default function ShippingReturns() {
  return (
    <>
      <Breadcrumbs items={[{name: 'Home', path: '/'}, {name: 'Shipping & returns', path: '/pages/shipping-returns'}]} />
      <div className="container section--tight prose" style={{paddingTop: 0}}>
        <h1 className="h1">Shipping &amp; returns</h1>
        <h2>Shipping</h2>
        <ul>
          <li>
            <strong>{SHIPPING.headline}.</strong> {SHIPPING.regionNote}
          </li>
          <li>Orders ship from {SHIPPING.shipsFrom} within {SHIPPING.processingDays}.</li>
          <li>Delivery takes {SHIPPING.deliveryDays} after dispatch. You’ll get tracking by email.</li>
          <li>Large items (tents, kitchens, fridges) may arrive in more than one box.</li>
          <li>{SHIPPING.holidayCutoff}</li>
        </ul>
        <h2>Returns</h2>
        <p>{RETURNS.summary}</p>
        <p>{RETURNS.holiday}</p>
        <p>
          To start a return, email <a className="link" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>{' '}
          with your order number. Full terms: <Link className="link" to="/policies/refund-policy">refund policy</Link>.
        </p>
        <div style={{marginTop: 40}}>
          <Faq items={FAQ} />
        </div>
      </div>
    </>
  );
}
