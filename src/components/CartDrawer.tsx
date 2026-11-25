import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import { useCart } from '../lib/cart';
import { store, whatsappLink, whatsappReady } from '../lib/config';
import { money } from '../lib/format';
import { Photo, WhatsAppIcon } from './ui';

export default function CartDrawer() {
  const { lines, count, total, hasUnavailable, setQty, clear, open, setOpen } = useCart();
  const ref = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const d = ref.current!;
    if (open && !d.open) { setSent(false); d.showModal(); }
    if (!open && d.open) d.close();
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  function message() {
    const items = lines.filter((l) => l.product.in_stock).map(({ product: p, qty }, i) =>
      `${i + 1}. ${p.name}\n   ${qty} x ${money(p.price)} = ${money(Math.round(p.price * 100) * qty / 100)}`);
    return [
      `Hello ${store.name}, I would like to order:`, '', ...items, '', `*Total: ${money(total)}*`, '',
      `Name: ${name.trim()}`, `Area: ${area.trim()}`, ...(note.trim() ? [`Note: ${note.trim()}`] : []),
    ].join('\n');
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!whatsappReady || count === 0) return;
    const link = whatsappLink(message());
    const tab = window.open(link, '_blank');
    if (tab) { tab.opener = null; setSent(true); } else window.location.href = link; // pop-up blocked
  }

  return (
    <dialog ref={ref} className="drawer" aria-label="Your cart" onClose={() => setOpen(false)}
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="drawer-in">
        <div className="drawer-head">
          <h2>Your cart</h2>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close cart"><X size={22} /></button>
        </div>

        {sent ? (
          <div className="drawer-empty">
            <p><b>Your order is ready in WhatsApp.</b></p>
            <p>Press send there and the store will confirm availability and delivery.</p>
            <button className="btn btn-red" onClick={() => { clear(); setSent(false); setOpen(false); }}>I sent it, empty my cart</button>
            <button className="btn btn-quiet" onClick={() => setSent(false)}>Back to cart</button>
          </div>
        ) : lines.length === 0 ? (
          <div className="drawer-empty">
            <p><b>Your cart is empty.</b></p>
            <p>Add products here, then send the whole order on WhatsApp.</p>
            <Link className="btn btn-red" to="/shop" onClick={() => setOpen(false)}>Browse products</Link>
          </div>
        ) : (
          <form className="drawer-form" onSubmit={submit}>
            <div className="drawer-scroll">
              <ul className="lines">
                {lines.map(({ product: p, qty }) => (
                  <li key={p.id} className={p.in_stock ? '' : 'is-out'}>
                    <div className="line-photo"><Photo src={p.images[0]} alt="" /></div>
                    <div className="line-main">
                      <Link to={`/product/${encodeURIComponent(p.slug)}`} onClick={() => setOpen(false)}>{p.name}</Link>
                      <div className="line-row">
                        {p.in_stock ? (
                          <div className="qty">
                            <button type="button" disabled={qty <= 1} onClick={() => setQty(p.id, qty - 1)} aria-label={`One less ${p.name}`}><Minus size={16} /></button>
                            <span aria-live="polite">{qty}</span>
                            <button type="button" onClick={() => setQty(p.id, qty + 1)} aria-label={`One more ${p.name}`}><Plus size={16} /></button>
                          </div>
                        ) : <span className="line-out">Out of stock</span>}
                        <b>{p.in_stock ? money(Math.round(p.price * 100) * qty / 100) : ''}</b>
                        <button type="button" className="icon-btn" onClick={() => setQty(p.id, 0)} aria-label={`Remove ${p.name}`}><Trash2 size={17} /></button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {hasUnavailable && <p className="hint">Out-of-stock items are left out of your order.</p>}
              <div className="fields">
                <label>Name<input id="order-name" required maxLength={80} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></label>
                <label>Delivery area<input id="order-area" required maxLength={120} placeholder="Town or neighbourhood" value={area} onChange={(e) => setArea(e.target.value)} /></label>
                <label>Note (optional)<textarea id="order-note" rows={2} maxLength={400} value={note} onChange={(e) => setNote(e.target.value)} /></label>
              </div>
            </div>
            <div className="drawer-foot">
              <div className="total"><span>Total</span><b>{money(total)}</b></div>
              <button className="btn btn-wa btn-wide" disabled={!whatsappReady || count === 0}><WhatsAppIcon /> Order on WhatsApp</button>
              <p className="hint">{whatsappReady ? 'No online payment. The store confirms price and delivery with you.' : 'Ordering opens once the store adds its WhatsApp number.'}</p>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
