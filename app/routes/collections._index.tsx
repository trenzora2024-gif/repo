import {redirect} from 'react-router';

/** /collections → the Shop page. Keeps one canonical listing URL. */
export async function loader() {
  return redirect('/collections/all', 301);
}
