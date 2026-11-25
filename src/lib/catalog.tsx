import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from './config';
import type { Category, Product } from './types';

const PAGE = 1000; // Supabase returns at most 1000 rows per request

export async function fetchProducts(): Promise<Product[]> {
  const all: Product[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('products').select('*')
      .order('created_at', { ascending: false }).order('id')
      .range(from, from + PAGE - 1);
    if (error) throw error;
    all.push(...data.map((p) => ({
      ...p,
      price: Number(p.price),
      compare_at_price: p.compare_at_price == null ? null : Number(p.compare_at_price),
    })));
    if (data.length < PAGE) return all;
  }
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order').order('name');
  if (error) throw error;
  return data;
}

type Catalog = {
  status: 'loading' | 'ready' | 'error';
  /** Every product this visitor may read (admins also see hidden ones). */
  allProducts: Product[];
  /** Products visible in the store. */
  products: Product[];
  categories: Category[];
  reload: () => Promise<void>;
};
const Ctx = createContext<Catalog | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Catalog['status']>('loading');
  const [allProducts, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const reload = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(p); setCategories(c); setStatus('ready');
    } catch (e) {
      console.error(e);
      setStatus((s) => (s === 'ready' ? s : 'error'));
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const products = useMemo(() => allProducts.filter((p) => p.is_active), [allProducts]);
  const value = useMemo(
    () => ({ status, allProducts, products, categories, reload }),
    [status, allProducts, products, categories, reload],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCatalog = () => useContext(Ctx)!;
