import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCatalog } from '../lib/catalog';
import { store } from '../lib/config';
import CatalogState from '../components/CatalogState';
import { ProductCard } from '../components/ProductCard';
import { Photo, useTitle, WhatsAppIcon, WhatsAppLink } from '../components/ui';

export default function Home() {
  useTitle();
  const { status, products, categories } = useCatalog();
  const featured = products.filter((p) => p.is_featured);
  const picks = (featured.length ? featured : products).slice(0, 8);
  const offers = products.filter((p) => p.compare_at_price != null && p.in_stock && !picks.includes(p)).slice(0, 4);

  return (
    <>
      <section className="hero">
        <div className="hero-panel">
          <div className="hero-copy">
            <p className="hero-ar" lang="ar" dir="rtl">جودة تلبي<br />احتياجاتك</p>
            <h1>{store.slogan}.</h1>
            <p>The TORNADO showroom at AL HAJ, now online. Choose what your home needs and order on WhatsApp.</p>
            <div className="hero-cta">
              <Link className="btn btn-white" to="/shop">Shop all products <ArrowRight size={18} aria-hidden="true" /></Link>
              <WhatsAppLink className="btn btn-outline" message="Hello AL HAJ, I have a question."><WhatsAppIcon /> Ask us</WhatsAppLink>
            </div>
          </div>
        </div>
        <div className="hero-photo"><img src="/showroom.jpg" alt="The TORNADO showroom building" width={1077} height={1599} /></div>
      </section>

      {categories.length > 0 && (
        <section className="wrap section">
          <h2>Shop by category</h2>
          <div className="cats">
            {categories.map((c) => (
              <Link key={c.id} className="cat" to={`/shop?category=${encodeURIComponent(c.slug)}`}>
                <span className="cat-photo"><Photo src={c.image_url ?? undefined} alt="" /></span>
                <span>{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="wrap section">
        <div className="section-head"><h2>Picked from the showroom</h2><Link className="more" to="/shop">See all products <ArrowRight size={17} aria-hidden="true" /></Link></div>
        {status !== 'ready' ? <CatalogState /> : picks.length === 0
          ? <p className="muted">Products will appear here as soon as the store adds them.</p>
          : <div className="grid">{picks.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
      </section>

      <section className="trade">
        <div className="wrap trade-in">
          <div>
            <h2>Buying for a shop, a building or a project?</h2>
            <p>We sell wholesale as well as retail. Tell us what you need and how many, and we will send you a price.</p>
            <WhatsAppLink className="btn btn-white" message="Hello AL HAJ, I would like a wholesale price for: "><WhatsAppIcon /> Ask for a wholesale price</WhatsAppLink>
          </div>
        </div>
      </section>

      {offers.length > 0 && (
        <section className="wrap section">
          <div className="section-head"><h2>Reduced right now</h2></div>
          <div className="grid">{offers.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}
    </>
  );
}
