import {Link} from 'react-router';
import type {Policy} from '~/data/legal';

/** A customer policy in the shared page-hero + prose layout. */
export function PolicyPage({
  policy,
  eyebrow = 'Policies',
  children,
}: {
  policy: Policy;
  eyebrow?: 'Policies' | 'Help';
  children?: React.ReactNode;
}) {
  return (
    <div className="container page-end">
      <header className="page-hero">
        <p className="eyebrow">
          {eyebrow === 'Policies' ? (
            <Link to="/policies">Policies</Link>
          ) : (
            eyebrow
          )}
        </p>
        <h1>{policy.title}</h1>
      </header>
      {children}
      <div
        className="prose"
        // Trusted, repo-authored HTML from app/data/legal.ts.
        dangerouslySetInnerHTML={{__html: policy.html}}
      />
    </div>
  );
}
