import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

export const isConfigured = /^https?:\/\//.test(url) && key.length > 0;

// Only created when .env is filled in; App shows a setup screen otherwise.
export const supabase = (isConfigured ? createClient(url, key) : null) as SupabaseClient;

// Accepts "+961 70 123 456", "00961...", "+961 03 ..." and returns plain digits.
function normalizePhone(raw: string) {
  return raw.replace(/\D/g, '').replace(/^00/, '').replace(/^9610/, '961');
}
const phone = normalizePhone(import.meta.env.VITE_WHATSAPP_NUMBER ?? '');
export const whatsappReady = /^961\d{7,8}$/.test(phone);
export const phoneDisplay = whatsappReady
  ? `+961 ${phone.slice(3, -6)} ${phone.slice(-6, -3)} ${phone.slice(-3)}`
  : '';

export function whatsappLink(message: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export const store = {
  name: 'AL HAJ',
  brand: 'TORNADO',
  sloganAr: 'جودة تلبي احتياجاتك',
  slogan: 'Quality that meets your needs',
};
