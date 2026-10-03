import {Link} from 'react-router';
import type {Route} from './+types/faq';
import {FAQ} from '~/data/site';
import {seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  seoMeta({
    title: 'FAQ',
    description:
      'Answers about Trenzora orders: delivery, tracking, cancellations, returns, sizes, care and how to reach us.',
    path: '/faq',
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

export default function Faq() {
  return (
    <div className="container page-end">
      <header className="page-hero">
        <p className="eyebrow">Help</p>
        <h1>FAQ</h1>
        <p className="lede">
          Can’t find your answer? <Link to="/contact">Contact us</Link>.
        </p>
      </header>
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
    </div>
  );
}
