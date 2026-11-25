import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCatalog } from '../lib/catalog';
import CatalogState from '../components/CatalogState';
import { ProductCard } from '../components/ProductCard';
import { useTitle, WhatsAppIcon, WhatsAppLink } from '../components/ui';

const STEP = 24;

export default function Shop() {
  const { status, products, categories } = useCatalog();
  const [params, setParams] = useSearchParams();
  const slug = params.get('category') ?? '';
  const q = (params.get('q') ?? '').trim();
  const sort = params.get('sort') ?? 'new';
  const stock = params.get('stock') === '1';
  const show = Math.max(STEP, Number(params.get('show')) || STEP);
  const category = categories.find((c) => c.slug === slug);
  const title = q ? `Results for “${q}”` : category?.name ?? 'All products';
  useTitle(title);

  function set(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'show') next.delete('show');
    setParams(next, { replace: true, preventScrollReset: true });
  }

  const list = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const categoryName = new Map(categories.map((c) => [c.id, c.name]));
    const out = products.filter((p) => {
      if (slug && p.category_id !== category?.id) return false;
      if (stock && !p.in_stock) return false;
      const text = `${p.name} ${p.brand} ${p.description} ${categoryName.get(p.category_id ?? '') ?? ''}`.toLowerCase();
      return words.every((w) => text.includes(w) || (w.length > 3 && w.endsWith('s') && text.includes(w.slice(0, -1))));
    });
    if (sort === 'low') out.sort((a, b) => a.price - b.price);
    if (sort === 'high') out.sort((a, b) => b.price - a.price);
    if (sort === 'new') out.sort((a, b) => Number(b.in_stock) - Number(a.in_stock));
    return out;
  }, [products, categories, category, slug, q, sort, stock]);

  return (
    <div className="wrap section shop">
      <div className="shop-head">
        <div><h1>{title}</h1>{status === 'ready' && <p className="muted">{list.length} {list.length === 1 ? 'product' : 'products'}</p>}</div>
        <div className="shop-tools">
          <label className="check"><input id="in-stock" type="checkbox" checked={stock} onChange={(e) => set('stock', e.target.checked ? '1' : '')} /> In stock only</label>
          <label className="select"><span className="sr">Sort by</span>
            <select id="sort" value={sort} onChange={(e) => set('sort', e.target.value === 'new' ? '' : e.target.value)}>
              <option value="new">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option>
            </select>
          </label>
        </div>
      </div>
      {status !== 'ready' ? <CatalogState /> : list.length === 0 ? (
        <div className="state">
          <h2>Nothing matches yet</h2>
          <p>Try another word or category, or ask us. The showroom may have it.</p>
          <WhatsAppLink className="btn btn-wa" message={`Hello AL HAJ, do you have: ${q || category?.name || ''}`}><WhatsAppIcon /> Ask on WhatsApp</WhatsAppLink>
        </div>
      ) : (
        <>
          <div className="grid">{list.slice(0, show).map((p) => <ProductCard key={p.id} product={p} />)}</div>
          {list.length > show && <div className="center"><button className="btn btn-quiet" onClick={() => set('show', String(show + STEP))}>Show more products</button></div>}
        </>
      )}
    </div>
  );
}
