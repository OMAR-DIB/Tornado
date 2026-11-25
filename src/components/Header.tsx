import { useEffect, useState, type FormEvent } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ShoppingCart } from 'lucide-react';
import { useCart } from '../lib/cart';
import { useCatalog } from '../lib/catalog';
import { Brand, WhatsAppIcon, WhatsAppLink } from './ui';

export default function Header() {
  const { count, setOpen } = useCart();
  const { categories } = useCatalog();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const active = params.get('category');
  const urlQuery = params.get('q') ?? '';

  useEffect(() => setQ(urlQuery), [urlQuery]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/shop?q=${encodeURIComponent(term)}` : '/shop');
  }

  return (
    <header className="header">
      <div className="wrap header-row">
        <Link to="/" aria-label="AL HAJ, TORNADO agent: home"><Brand /></Link>
        <form className="search" role="search" onSubmit={submit}>
          <Search size={18} aria-hidden="true" />
          <input id="site-search" type="search" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search fridges, TVs, cookers" aria-label="Search products" />
        </form>
        <div className="header-actions">
          <WhatsAppLink className="btn btn-quiet header-wa" message="Hello AL HAJ, I have a question.">
            <WhatsAppIcon /> <span>Chat with us</span>
          </WhatsAppLink>
          <button className="btn btn-dark cart-btn" onClick={() => setOpen(true)} aria-label={`Open cart, ${count} items`}>
            <ShoppingCart size={19} aria-hidden="true" /> <span className="cart-word">Cart</span>
            {count > 0 && <span className="cart-count">{count}</span>}
          </button>
        </div>
      </div>
      <nav className="catnav" aria-label="Categories">
        <div className="wrap catnav-row">
          <NavLink to="/shop" end className={({ isActive }) => (isActive && !active ? 'on' : '')}>All products</NavLink>
          {categories.map((c) => (
            <Link key={c.id} to={`/shop?category=${encodeURIComponent(c.slug)}`} className={active === c.slug ? 'on' : ''}>{c.name}</Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
