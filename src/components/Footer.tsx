import { Link } from 'react-router-dom';
import { phoneDisplay, store } from '../lib/config';
import { useCatalog } from '../lib/catalog';
import { Brand, WhatsAppIcon, WhatsAppLink } from './ui';

export default function Footer() {
  const { categories } = useCatalog();
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Brand />
          <p lang="ar" dir="rtl">{store.sloganAr}</p>
        </div>
        <nav aria-label="Footer">
          {categories.map((c) => <Link key={c.id} to={`/shop?category=${encodeURIComponent(c.slug)}`}>{c.name}</Link>)}
        </nav>
        <div className="footer-contact">
          <WhatsAppLink message="Hello AL HAJ, I have a question."><WhatsAppIcon size={18} /> {phoneDisplay}</WhatsAppLink>
          <span>Retail and wholesale, Lebanon</span>
        </div>
      </div>
      <div className="wrap footer-end"><span>© {new Date().getFullYear()} AL HAJ</span><Link to="/admin">Staff login</Link></div>
      <WhatsAppLink className="wa-float" message="Hello AL HAJ, I have a question." aria-label="Chat with us on WhatsApp">
        <WhatsAppIcon size={28} />
      </WhatsAppLink>
    </footer>
  );
}
