import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { isConfigured } from './lib/config';
import { CatalogProvider } from './lib/catalog';
import { CartProvider } from './lib/cart';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductPage from './pages/ProductPage';
import NotFound from './pages/NotFound';

const Admin = lazy(() => import('./admin/Admin'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function StoreLayout() {
  return (
    <CartProvider>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main"><Outlet /></main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}

function Setup() {
  return (
    <div className="setup">
      <img src="/logo-ah.png" alt="AL HAJ" width={150} />
      <h1>Connect the database</h1>
      <p>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env</code> (or to the
        Vercel project's environment variables), then restart or redeploy.</p>
    </div>
  );
}

export default function App() {
  if (!isConfigured) return <Setup />;
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <CatalogProvider>
        <Routes>
          <Route element={<StoreLayout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:slug" element={<ProductPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="admin/*" element={<Suspense fallback={<div className="loading">Loading…</div>}><Admin /></Suspense>} />
        </Routes>
      </CatalogProvider>
    </BrowserRouter>
  );
}
