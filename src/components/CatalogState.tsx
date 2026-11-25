import { useCatalog } from '../lib/catalog';

/** Loading skeleton or error message while the catalogue is not ready. */
export default function CatalogState() {
  const { status, reload } = useCatalog();
  if (status === 'error') {
    return (
      <div className="state">
        <h2>Products didn't load</h2>
        <p>Check your connection and try again.</p>
        <button className="btn btn-red" onClick={reload}>Try again</button>
      </div>
    );
  }
  return <div className="grid" aria-busy="true" aria-label="Loading products">{Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton" />)}</div>;
}
