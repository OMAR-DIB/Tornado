import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { supabase } from '../lib/config';
import { useCatalog } from '../lib/catalog';
import { money } from '../lib/format';
import type { Product } from '../lib/types';
import { Photo } from '../components/ui';
import { deletePhotos } from './images';

type Flag = 'in_stock' | 'is_active' | 'is_featured';
type Filter = 'all' | 'out' | 'hidden' | 'featured';

export default function Products() {
  const { allProducts, categories, reload, status } = useCatalog();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [confirming, setConfirming] = useState('');

  const tests: Record<Filter, (p: Product) => boolean> = {
    all: () => true,
    out: (p) => !p.in_stock,
    hidden: (p) => !p.is_active,
    featured: (p) => p.is_featured,
  };
  const labels: Record<Filter, string> = { all: 'All', out: 'Out of stock', hidden: 'Hidden', featured: 'On home page' };

  const list = allProducts.filter((p) =>
    tests[filter](p) && (!cat || p.category_id === cat) && p.name.toLowerCase().includes(q.trim().toLowerCase()));

  async function toggle(p: Product, flag: Flag) {
    setBusy(p.id); setError('');
    const { error } = await supabase.from('products').update({ [flag]: !p[flag] }).eq('id', p.id).select('id').single();
    if (error) setError(`“${p.name}” wasn't changed: ${error.message}`);
    await reload();
    setBusy('');
  }

  async function remove(p: Product) {
    setBusy(p.id); setError('');
    const { error } = await supabase.from('products').delete().eq('id', p.id).select('id').single();
    if (error) setError(`“${p.name}” wasn't deleted: ${error.message}`);
    else await deletePhotos(p.images);
    setConfirming('');
    await reload();
    setBusy('');
  }

  const toggleCell = (p: Product, flag: Flag, label: string) => (
    <label className="switch">
      <input type="checkbox" role="switch" checked={p[flag]} disabled={busy === p.id} onChange={() => toggle(p, flag)} aria-label={`${p.name}: ${label}`} />
      <span>{label}</span>
    </label>
  );

  return (
    <>
      <div className="admin-head"><h1>Products</h1><Link className="btn btn-red" to="/admin/products/new"><Plus size={18} /> Add product</Link></div>

      <div className="filters" role="group" aria-label="Show">
        {(Object.keys(tests) as Filter[]).map((f) => (
          <button key={f} className={filter === f ? 'on' : ''} aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {labels[f]} <b>{allProducts.filter(tests[f]).length}</b>
          </button>
        ))}
      </div>
      <div className="admin-tools">
        <div className="search"><Search size={18} aria-hidden="true" /><input id="admin-search" type="search" placeholder="Search by name" aria-label="Search by name" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select id="admin-category" aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      {error && <p className="error" role="alert">{error}</p>}

      {status === 'error' ? (
        <div className="panel"><p>Products didn't load.</p><div><button className="btn btn-quiet" onClick={reload}>Try again</button></div></div>
      ) : list.length === 0 ? (
        <div className="panel"><p>{allProducts.length === 0 ? 'No products yet. Add the first one to open the store.' : 'No products match these filters.'}</p></div>
      ) : (
        <ul className="rows">
          {list.map((p) => (
            <li key={p.id} className={p.is_active ? '' : 'hidden-row'}>
              <div className="row-photo"><Photo src={p.images[0]} alt="" /></div>
              <div className="row-name">
                <Link to={`/admin/products/${p.id}`}>{p.name}</Link>
                <span className="muted">{categories.find((c) => c.id === p.category_id)?.name ?? 'No category'}</span>
              </div>
              <div className="row-price"><b>{money(p.price)}</b>{p.compare_at_price != null && <s>{money(p.compare_at_price)}</s>}</div>
              <div className="row-flags">{toggleCell(p, 'in_stock', 'In stock')}{toggleCell(p, 'is_active', 'Visible')}{toggleCell(p, 'is_featured', 'Home page')}</div>
              <div className="row-actions">
                {confirming === p.id ? (
                  <><button className="btn btn-red btn-sm" disabled={busy === p.id} onClick={() => remove(p)}>Delete</button>
                    <button className="btn btn-quiet btn-sm" onClick={() => setConfirming('')}>Keep</button></>
                ) : (
                  <><Link className="icon-btn" to={`/admin/products/${p.id}`} aria-label={`Edit ${p.name}`}><Pencil size={18} /></Link>
                    <button className="icon-btn" onClick={() => setConfirming(p.id)} aria-label={`Delete ${p.name}`}><Trash2 size={18} /></button></>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
