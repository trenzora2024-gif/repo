import {Link} from 'react-router';
import {Logo} from '~/components/Header';
import {GEAR, GEAR_ORDER, MISSIONS, MISSION_ORDER} from '~/data/missions';
import {SITE} from '~/data/site';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand stack-sm">
            <Logo />
            <p>{SITE.positioning}</p>
            <p>
              Questions about fit or setup?{' '}
              <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
            </p>
          </div>
          <div>
            <h2>Shop by mission</h2>
            <ul>
              {MISSION_ORDER.map((h) => (
                <li key={h}>
                  <Link to={`/collections/${h}`}>{MISSIONS[h].label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Gear</h2>
            <ul>
              {GEAR_ORDER.map((h) => (
                <li key={h}>
                  <Link to={`/collections/${h}`}>{GEAR[h].label}</Link>
                </li>
              ))}
              <li>
                <Link to="/bundles">Complete setups</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2>Help</h2>
            <ul>
              <li>
                <Link to="/pages/shipping-returns">Shipping &amp; returns</Link>
              </li>
              <li>
                <Link to="/pages/contact">Contact</Link>
              </li>
              <li>
                <Link to="/pages/about">Why Trenzora</Link>
              </li>
              <li>
                <Link to="/guides">Guides</Link>
              </li>
              <li>
                <a href="/account">Your account &amp; orders</a>
              </li>
              <li>
                <Link to="/policies">Policies</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Trenzora. Ships within the US.</span>
          <span>
            <Link to="/policies/privacy-policy">Privacy</Link> ·{' '}
            <Link to="/policies/terms-of-service">Terms</Link> ·{' '}
            <Link to="/policies/refund-policy">Refunds</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
