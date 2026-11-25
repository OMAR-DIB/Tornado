import { useEffect, useState, type FormEvent } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { ExternalLink, FolderTree, KeyRound, LogOut, Package } from 'lucide-react';
import { supabase } from '../lib/config';
import { useCatalog } from '../lib/catalog';
import { Brand, useTitle } from '../components/ui';
import Products from './Products';
import ProductForm from './ProductForm';
import Categories from './Categories';
import './admin.css';

type Access = 'checking' | 'out' | 'denied' | 'failed' | 'in';

export default function Admin() {
  useTitle('Admin');
  const { reload } = useCatalog();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [access, setAccess] = useState<Access>('checking');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUserId(session?.user.id ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userId === undefined) return;
    if (userId === null) { setAccess('out'); reload(); return; }
    let live = true;
    setAccess('checking');
    // Screen access only. The database rules enforce the real permissions.
    supabase.rpc('is_admin').then(async ({ data, error }) => {
      if (!live) return;
      if (error) { setAccess('failed'); return; }
      if (data === true) await reload(); // now includes hidden products
      if (live) setAccess(data === true ? 'in' : 'denied');
    });
    return () => { live = false; };
  }, [userId, reload, attempt]);

  const signOut = () => supabase.auth.signOut({ scope: 'local' });

  if (access === 'checking') return <div className="loading">Loading…</div>;
  if (access === 'out') return <Login />;
  if (access === 'failed') {
    return <div className="state"><h1>Couldn't check your access</h1><p>Check your connection and try again.</p>
      <button className="btn btn-red" onClick={() => setAttempt(attempt + 1)}>Try again</button></div>;
  }
  if (access === 'denied') {
    return <div className="state"><h1>This account isn't an admin</h1><p>Sign in with the store's admin account.</p>
      <button className="btn btn-red" onClick={signOut}>Use another account</button></div>;
  }

  return (
    <div className="admin">
      <aside className="admin-side">
        <Link to="/admin"><Brand /></Link>
        <nav aria-label="Admin">
          <NavLink to="/admin" end><Package size={19} /> Products</NavLink>
          <NavLink to="/admin/categories"><FolderTree size={19} /> Categories</NavLink>
          <NavLink to="/admin/account"><KeyRound size={19} /> Password</NavLink>
          <a href="/" target="_blank" rel="noreferrer"><ExternalLink size={19} /> View store</a>
          <button onClick={signOut}><LogOut size={19} /> Sign out</button>
        </nav>
      </aside>
      <main className="admin-main">
        <Routes>
          <Route index element={<Products />} />
          <Route path="products/new" element={<ProductForm key="new" />} />
          <Route path="products/:id" element={<ProductForm key="edit" />} />
          <Route path="categories" element={<Categories />} />
          <Route path="account" element={<Account />} />
          <Route path="*" element={<Products />} />
        </Routes>
      </main>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setError(error.code === 'invalid_credentials' ? 'Wrong email or password.' : `Couldn't sign in: ${error.message}`);
  }

  return (
    <div className="login">
      <form className="login-box" onSubmit={submit}>
        <Brand />
        <h1>Staff login</h1>
        <label>Email<input id="login-email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Password<input id="login-password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn-red btn-wide" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <Link to="/" className="muted">Back to the store</Link>
      </form>
    </div>
  );
}

function Account() {
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password !== again) { setMsg({ ok: false, text: "The two passwords don't match." }); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: 'Password changed.' });
    if (!error) { setPassword(''); setAgain(''); }
  }

  return (
    <>
      <div className="admin-head"><h1>Change password</h1></div>
      <form className="panel narrow" onSubmit={submit}>
        <label>New password<input id="new-password" type="password" minLength={8} required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <label>New password again<input id="new-password-2" type="password" minLength={8} required autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} /></label>
        {msg && <p className={msg.ok ? 'ok' : 'error'} role="status">{msg.text}</p>}
        <div><button className="btn btn-red" disabled={busy}>Change password</button></div>
      </form>
    </>
  );
}
