import { useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/config';
import { useCatalog } from '../lib/catalog';
import { slugify } from '../lib/format';
import type { Category } from '../lib/types';
import { Photo } from '../components/ui';
import { deletePhotos, uploadPhoto } from './images';

export default function Categories() {
  const { categories, allProducts, reload } = useCatalog();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState('');

  /** Runs one change, shows its error, then refreshes the list. */
  async function act(change: () => Promise<void>) {
    setBusy(true); setError('');
    try { await change(); } catch (e) { setError(`Not saved: ${(e as Error).message}`); }
    await reload();
    setBusy(false);
  }

  async function update(id: string, patch: Partial<Category>) {
    const { error } = await supabase.from('categories').update(patch).eq('id', id).select('id').single();
    if (error) throw error;
  }

  function add(e: FormEvent) {
    e.preventDefault();
    act(async () => {
      const row = { name: name.trim(), sort_order: Math.max(0, ...categories.map((c) => c.sort_order)) + 1 };
      let { error } = await supabase.from('categories').insert({ ...row, slug: slugify(row.name) });
      if (error?.code === '23505') ({ error } = await supabase.from('categories').insert({ ...row, slug: `${slugify(row.name)}-${crypto.randomUUID().slice(0, 4)}` }));
      if (error) throw error;
      setName('');
    });
  }

  const rename = (c: Category, value: string) => {
    const next = value.trim();
    if (next && next !== c.name) act(() => update(c.id, { name: next }));
  };

  function move(i: number, by: -1 | 1) {
    const order = [...categories];
    [order[i], order[i + by]] = [order[i + by], order[i]];
    act(async () => {
      for (const [n, c] of order.entries()) if (c.sort_order !== n + 1) await update(c.id, { sort_order: n + 1 });
    });
  }

  function setPhoto(c: Category, file?: File) {
    if (!file) return;
    act(async () => {
      const url = await uploadPhoto(file);
      try { await update(c.id, { image_url: url }); } catch (e) { await deletePhotos([url]); throw e; }
      if (c.image_url) await deletePhotos([c.image_url]);
    });
  }

  const remove = (c: Category) => act(async () => {
    const { error } = await supabase.from('categories').delete().eq('id', c.id).select('id').single();
    if (error) throw error;
    if (c.image_url) await deletePhotos([c.image_url]);
    setConfirming('');
  });

  return (
    <>
      <div className="admin-head"><h1>Categories</h1></div>
      <form className="panel add-cat" onSubmit={add}>
        <label>New category<input id="c-name" required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} /></label>
        <button className="btn btn-red" disabled={busy || !name.trim()}>Add category</button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      <ul className="rows cat-rows">
        {categories.map((c, i) => {
          const n = allProducts.filter((p) => p.category_id === c.id).length;
          return (
            <li key={c.id}>
              <label className="row-photo row-photo-edit" title="Change photo">
                {c.image_url ? <Photo src={c.image_url} alt="" /> : <ImagePlus size={20} />}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} aria-label={`Change photo for ${c.name}`}
                  onChange={(e) => { setPhoto(c, e.target.files?.[0]); e.target.value = ''; }} />
              </label>
              <input id={`cat-${c.id}`} key={c.name} className="row-input" defaultValue={c.name} maxLength={60} aria-label={`Name of ${c.name}`}
                onBlur={(e) => { if (!e.target.value.trim()) e.target.value = c.name; rename(c, e.target.value); }}
                onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
              <span className="muted">{n} {n === 1 ? 'product' : 'products'}</span>
              <div className="row-actions">
                {confirming === c.id ? (
                  <><span className="muted">Its products stay, without a category.</span>
                    <button className="btn btn-red btn-sm" disabled={busy} onClick={() => remove(c)}>Delete</button>
                    <button className="btn btn-quiet btn-sm" onClick={() => setConfirming('')}>Keep</button></>
                ) : (
                  <><button className="icon-btn" disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label={`Move ${c.name} up`}><ArrowUp size={18} /></button>
                    <button className="icon-btn" disabled={busy || i === categories.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${c.name} down`}><ArrowDown size={18} /></button>
                    <button className="icon-btn" disabled={busy} onClick={() => setConfirming(c.id)} aria-label={`Delete ${c.name}`}><Trash2 size={18} /></button></>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
