import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '../lib/cart';
import { useCatalog } from '../lib/catalog';
import { money } from '../lib/format';
import CatalogState from '../components/CatalogState';
import { Price, ProductCard } from '../components/ProductCard';
import { Photo, useTitle, WhatsAppIcon, WhatsAppLink } from '../components/ui';
import NotFound from './NotFound';

export default function ProductPage() {
  const { slug } = useParams();
  const { status, products, categories } = useCatalog();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [shot, setShot] = useState(0);
  const p = products.find((x) => x.slug === slug);
  useTitle(p?.name);
  useEffect(() => { setQty(1); setShot(0); }, [slug]);

  if (!p) return status === 'ready' ? <NotFound /> : <div className="wrap section"><CatalogState /></div>;

  const category = categories.find((c) => c.id === p.category_id);
  const related = products.filter((x) => x.id !== p.id && x.category_id === p.category_id && x.in_stock).slice(0, 4);

  return (
    <div className="wrap section">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/shop">All products</Link>
        {category && <> / <Link to={`/shop?category=${encodeURIComponent(category.slug)}`}>{category.name}</Link></>}
      </nav>
      <div className="pdp">
        <div className="pdp-media">
          <div className="pdp-photo"><Photo src={p.images[shot]} alt={p.name} loading="eager" /></div>
          {p.images.length > 1 && (
            <div className="thumbs">
              {p.images.map((src, i) => (
                <button key={src} className={i === shot ? 'on' : ''} onClick={() => setShot(i)} aria-label={`Photo ${i + 1}`}><Photo src={src} alt="" /></button>
              ))}
            </div>
          )}
        </div>
        <div className="pdp-info">
          {p.brand && <p className="pdp-brand">{p.brand}</p>}
          <h1>{p.name}</h1>
          <Price product={p} />
          <p className={`stock ${p.in_stock ? '' : 'out'}`}>{p.in_stock ? 'In stock' : 'Out of stock'}</p>
          {p.description && <p className="pdp-desc">{p.description}</p>}
          {p.in_stock && (
            <div className="buy">
              <div className="qty qty-lg">
                <button disabled={qty <= 1} onClick={() => setQty(qty - 1)} aria-label="One less"><Minus size={18} /></button>
                <span aria-live="polite">{qty}</span>
                <button disabled={qty >= 99} onClick={() => setQty(qty + 1)} aria-label="One more"><Plus size={18} /></button>
              </div>
              <button className="btn btn-red" onClick={() => add(p.id, qty)}><ShoppingCart size={19} aria-hidden="true" /> Add to cart</button>
            </div>
          )}
          <WhatsAppLink className="btn btn-wa" message={`Hello AL HAJ, I'm interested in ${p.name} (${money(p.price)}).\n${window.location.href}`}>
            <WhatsAppIcon /> Ask about this product
          </WhatsAppLink>
          {p.specs.length > 0 && (
            <table className="specs"><caption>Specifications</caption><tbody>
              {p.specs.map((s, i) => <tr key={i}><th scope="row">{s.label}</th><td>{s.value}</td></tr>)}
            </tbody></table>
          )}
        </div>
      </div>
      {related.length > 0 && <section className="related"><h2>More in {category?.name ?? 'the store'}</h2><div className="grid">{related.map((r) => <ProductCard key={r.id} product={r} />)}</div></section>}
    </div>
  );
}
