import {Link} from 'react-router';
import {FOOTER_NAV, SITE} from '~/data/site';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <p className="h3">{SITE.positioning}</p>
            <p className="muted">
              {SITE.supporting} Designed in India, printed to order, delivered
              across India.
            </p>
            <p>
              <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
              {SITE.instagram ? (
                <>
                  {' · '}
                  <a
                    href={SITE.instagram.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Instagram
                  </a>
                </>
              ) : null}
            </p>
          </div>
          <div className="footer-grid">
            <FooterColumn title="Shop" links={FOOTER_NAV.shop} />
            <FooterColumn title="Help" links={FOOTER_NAV.help} />
            <FooterColumn title="Trenzora" links={FOOTER_NAV.brand} />
          </div>
        </div>
        <p className="footer-mark" aria-hidden="true">
          trenzora<span>.</span>
        </p>
        <div className="footer-bottom">
          <span>
            © {year} {SITE.name}. Made in India.
          </span>
          <span>Secure checkout by Shopify</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{title: string; to: string}>;
}) {
  return (
    <nav aria-label={title}>
      <h2>{title}</h2>
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} prefetch="intent">
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
