import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ImagePlus, Star, X } from 'lucide-react';
import { supabase } from '../lib/config';
import { useCatalog } from '../lib/catalog';
import { slugify } from '../lib/format';
import type { Product, Spec } from '../lib/types';
import { Photo } from '../components/ui';
import { deletePhotos, uploadPhoto } from './images';

export default function ProductForm() {
  const { id } = useParams();
  const { allProducts, status } = useCatalog();
  const product = id ? allProducts.find((p) => p.id === id) : undefined;
  if (id && !product) {
    return <div className="panel"><p>{status === 'error' ? "Products didn't load. Refresh the page." : "This product doesn't exist any more."}</p><Link to="/admin">Back to products</Link></div>;
  }
  return <Form key={id ?? 'new'} product={product} />;
}

const specsToText = (specs: Spec[]) => specs.map((s) => `${s.label}: ${s.value}`).join('\n');

function textToSpecs(text: string): Spec[] {
  return text.split('\n').map((l) => l.trim()).filter(Boolean).map((line) => {
    const at = line.indexOf(':');
    return at > 0 ? { label: line.slice(0, at).trim(), value: line.slice(at + 1).trim() } : { label: line, value: '' };
  });
}

function Form({ product }: { product?: Product }) {
  const { categories, reload } = useCatalog();
  const navigate = useNavigate();
  const [f, setF] = useState({
    name: product?.name ?? '',
    brand: product?.brand ?? 'TORNADO',
    price: product ? String(product.price) : '',
    was: product?.compare_at_price != null ? String(product.compare_at_price) : '',
    category: product?.category_id ?? '',
    description: product?.description ?? '',
    specs: specsToText(product?.specs ?? []),
    in_stock: product?.in_stock ?? true,
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
  });
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (patch: Partial<typeof f>) => setF((s) => ({ ...s, ...patch }));

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    const chosen = Array.from(files);
    setError(''); setUploading((n) => n + chosen.length);
    for (const file of chosen) {
      try {
        const url = await uploadPhoto(file);
        setImages((s) => [...s, url]);
      } catch (e) { setError((e as Error).message); }
      setUploading((n) => n - 1);
    }
  }

  function removePhoto(url: string) {
    setImages((s) => s.filter((x) => x !== url));
    // Photos already saved on the product are deleted only after saving.
    if (!product?.images.includes(url)) deletePhotos([url]);
  }

  async function cancel() {
    await deletePhotos(images.filter((u) => !product?.images.includes(u)));
    navigate('/admin');
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    const price = Number(f.price);
    const was = f.was.trim() === '' ? null : Number(f.was);
    if (was !== null && was <= price) { setError('The old price must be higher than the price. Leave it empty if there is no discount.'); return; }
    setBusy(true); setError('');

    const row = {
      name: f.name.trim(), brand: f.brand.trim(), description: f.description.trim(), price,
      compare_at_price: was, category_id: f.category || null, images, specs: textToSpecs(f.specs),
      in_stock: f.in_stock, is_active: f.is_active, is_featured: f.is_featured,
    };
    const run = (slug: string) => product
      ? supabase.from('products').update(row).eq('id', product.id).select('id').single()
      : supabase.from('products').insert({ ...row, slug }).select('id').single();

    const slug = slugify(row.name);
    let { error } = await run(slug);
    // 23505 = that link is already used by another product
    if (error?.code === '23505') ({ error } = await run(`${slug}-${crypto.randomUUID().slice(0, 6)}`));
    if (error) { setBusy(false); setError(`Not saved: ${error.message}`); return; }

    if (product) await deletePhotos(product.images.filter((u) => !images.includes(u)));
    await reload();
    navigate('/admin');
  }

  return (
    <form onSubmit={save}>
      <div className="admin-head">
        <h1>{product ? 'Edit product' : 'Add product'}</h1>
        <div className="head-actions">
          <button type="button" className="btn btn-quiet" onClick={cancel} disabled={busy || uploading > 0}>Cancel</button>
          <button className="btn btn-red" disabled={busy || uploading > 0}>{busy ? 'Saving…' : 'Save product'}</button>
        </div>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="form-grid">
        <div className="panel">
          <label>Name<input id="p-name" required maxLength={140} value={f.name} onChange={(e) => set({ name: e.target.value })} /></label>
          <div className="two">
            <label>Price (USD)<input id="p-price" type="number" inputMode="decimal" min="0" max="99999999" step="0.01" required value={f.price} onChange={(e) => set({ price: e.target.value })} /></label>
            <label>Old price (optional)<input id="p-was" type="number" inputMode="decimal" min="0" max="99999999" step="0.01" value={f.was} onChange={(e) => set({ was: e.target.value })} /></label>
          </div>
          <div className="two">
            <label>Category
              <select id="p-category" value={f.category} onChange={(e) => set({ category: e.target.value })}>
                <option value="">No category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label>Brand<input id="p-brand" maxLength={60} value={f.brand} onChange={(e) => set({ brand: e.target.value })} /></label>
          </div>
          <label>Description<textarea id="p-description" rows={4} maxLength={4000} value={f.description} onChange={(e) => set({ description: e.target.value })} /></label>
          <label>Specifications, one per line
            <textarea id="p-specs" rows={5} placeholder={'Capacity: 8 kg\nSpin speed: 1200 rpm'} value={f.specs} onChange={(e) => set({ specs: e.target.value })} />
          </label>
        </div>
        <div className="form-side">
          <div className="panel">
            <h2>Photos</h2>
            <div className="photos">
              {images.map((url, i) => (
                <div key={url} className="photo">
                  <Photo src={url} alt={`Photo ${i + 1}`} />
                  {i === 0 ? <span className="tag">Main</span>
                    : <button type="button" className="photo-main" onClick={() => setImages([url, ...images.filter((x) => x !== url)])} aria-label={`Make photo ${i + 1} the main photo`}><Star size={16} /></button>}
                  <button type="button" className="photo-x" onClick={() => removePhoto(url)} aria-label={`Remove photo ${i + 1}`}><X size={16} /></button>
                </div>
              ))}
              <label className="photo-add">
                <ImagePlus size={24} aria-hidden="true" /><span>{uploading ? `Uploading ${uploading}…` : 'Add photos'}</span>
                <input id="p-photos" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple disabled={uploading > 0}
                  onChange={(e) => { const input = e.target; addPhotos(input.files); input.value = ''; }} />
              </label>
            </div>
          </div>
          <div className="panel">
            <h2>In the store</h2>
            <label className="switch"><input id="p-stock" type="checkbox" role="switch" checked={f.in_stock} onChange={(e) => set({ in_stock: e.target.checked })} /><span>In stock</span></label>
            <label className="switch"><input id="p-active" type="checkbox" role="switch" checked={f.is_active} onChange={(e) => set({ is_active: e.target.checked })} /><span>Visible to customers</span></label>
            <label className="switch"><input id="p-featured" type="checkbox" role="switch" checked={f.is_featured} onChange={(e) => set({ is_featured: e.target.checked })} /><span>Show on home page</span></label>
          </div>
        </div>
      </div>
    </form>
  );
}
