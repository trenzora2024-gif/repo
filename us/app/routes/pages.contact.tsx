import type {Route} from './+types/pages.contact';
import {Breadcrumbs} from '~/components/Blocks';
import {SITE} from '~/data/site';
import {seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  seoMeta({
    title: 'Contact',
    description: `Questions about fit, setup or an order? Email ${SITE.contactEmail}.`,
    path: '/pages/contact',
  });

export default function Contact() {
  return (
    <>
      <Breadcrumbs items={[{name: 'Home', path: '/'}, {name: 'Contact', path: '/pages/contact'}]} />
      <div className="container section--tight prose" style={{paddingTop: 0}}>
        <h1 className="h1">Talk to us</h1>
        <p className="lede" style={{marginTop: 16}}>
          Not sure a tent fits your vehicle, or which stove suits your tent?
          Ask before you buy. We answer within one business day.
        </p>
        <p style={{marginTop: 24}}>
          <a className="btn btn--primary btn--lg" href={`mailto:${SITE.contactEmail}`}>
            Email {SITE.contactEmail}
          </a>
        </p>
        <p className="meta" style={{marginTop: 16}}>
          For an existing order, include your order number so we can help faster.
        </p>
      </div>
    </>
  );
}
