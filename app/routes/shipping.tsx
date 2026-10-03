import type {Route} from './+types/shipping';
import {PolicyPage} from '~/components/PolicyPage';
import {getPolicy} from '~/data/legal';
import {SHIPPING} from '~/data/site';
import {seoMeta} from '~/lib/seo';

const policy = getPolicy('shipping-policy')!;

export const meta: Route.MetaFunction = () =>
  seoMeta({
    title: 'Shipping & Delivery in India',
    description: policy.description,
    path: '/shipping',
  });

export default function Shipping() {
  return (
    <PolicyPage policy={policy} eyebrow="Help">
      <div className="info-grid">
        <div className="info-card">
          <p className="eyebrow">Production</p>
          <h2>{SHIPPING.productionDays}</h2>
          <p className="muted">Every piece is made after you order.</p>
        </div>
        <div className="info-card">
          <p className="eyebrow">Delivery</p>
          <h2>{SHIPPING.deliveryDays}</h2>
          <p className="muted">
            Usually, from dispatch to your door, depending on pin code.
          </p>
        </div>
        <div className="info-card">
          <p className="eyebrow">Shipping cost</p>
          <h2>At checkout</h2>
          <p className="muted">{SHIPPING.costNote}</p>
        </div>
      </div>
    </PolicyPage>
  );
}
