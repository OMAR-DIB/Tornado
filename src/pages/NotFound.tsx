import { Link } from 'react-router-dom';
import { useTitle } from '../components/ui';

export default function NotFound() {
  useTitle('Page not found');
  return (
    <div className="wrap state">
      <h1>We couldn't find that page</h1>
      <p>The product may have been removed, or the link is wrong.</p>
      <Link className="btn btn-red" to="/shop">Browse all products</Link>
    </div>
  );
}
