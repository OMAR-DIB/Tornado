import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useCatalog } from './catalog';
import type { Product } from './types';

type Stored = Record<string, number>; // product id -> quantity
export type Line = { product: Product; qty: number };
type Cart = {
  lines: Line[]; count: number; total: number; hasUnavailable: boolean;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  open: boolean; setOpen: (v: boolean) => void;
};

const KEY = 'alhaj-cart';
const MAX = 99;
const Ctx = createContext<Cart | null>(null);

function load(): Stored {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return Object.fromEntries(Object.entries(raw).filter(([, q]) => Number.isInteger(q) && (q as number) > 0)) as Stored;
  } catch { return {}; }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { products } = useCatalog();
  const [items, setItems] = useState<Stored>(load);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* private mode */ }
  }, [items]);

  const value = useMemo<Cart>(() => {
    // Only ids are stored, so names and prices always come from the live catalogue.
    const lines = Object.entries(items).flatMap(([id, qty]) => {
      const product = products.find((p) => p.id === id);
      return product ? [{ product, qty }] : [];
    });
    const available = lines.filter((l) => l.product.in_stock);
    return {
      lines,
      count: available.reduce((n, l) => n + l.qty, 0),
      total: available.reduce((n, l) => n + Math.round(l.product.price * 100) * l.qty, 0) / 100,
      hasUnavailable: available.length < lines.length,
      add: (id, qty = 1) => {
        setItems((s) => ({ ...s, [id]: Math.min(MAX, (s[id] ?? 0) + qty) }));
        setOpen(true);
      },
      setQty: (id, qty) => setItems((s) => {
        const next = { ...s };
        if (qty <= 0) delete next[id]; else next[id] = Math.min(MAX, qty);
        return next;
      }),
      clear: () => setItems({}),
      open, setOpen,
    };
  }, [items, open, products]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => useContext(Ctx)!;
