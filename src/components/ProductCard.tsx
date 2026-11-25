import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useCart } from '../lib/cart';
import { money } from '../lib/format';
import type { Product } from '../lib/types';
import { Photo } from './ui';

export function Price({ product }: { product: Product }) {
  return (
    <span className="price">
      <b>{money(product.price)}</b>
      {product.compare_at_price != null && <s>{money(product.compare_at_price)}</s>}
    </span>
  );
}

export function ProductCard({ product: p }: { product: Product }) {
  const { add } = useCart();
  return (
    <article className={`card ${p.in_stock ? '' : 'is-out'}`}>
      <div className="card-photo">
        <Photo src={p.images[0]} alt="" />
        {!p.in_stock ? <span className="tag tag-out">Out of stock</span>
          : p.compare_at_price != null && <span className="tag">Save {money(Math.round((p.compare_at_price - p.price) * 100) / 100)}</span>}
      </div>
      <div className="card-body">
        <h3><Link to={`/product/${encodeURIComponent(p.slug)}`}>{p.name}</Link></h3>
        <div className="card-foot">
          <Price product={p} />
          <button className="add" disabled={!p.in_stock} onClick={() => add(p.id)} aria-label={`Add ${p.name} to cart`}>
            <Plus size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
