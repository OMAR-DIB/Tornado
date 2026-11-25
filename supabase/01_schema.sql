-- ============================================================
-- AL HAJ / TORNADO store: tables, security rules, image storage
-- Run FIRST in Supabase > SQL Editor. Safe to run again.
-- ============================================================

-- ---------- Tables ----------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(trim(name)) > 0),
  slug        text not null unique,
  image_url   text,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  name              text not null check (length(trim(name)) > 0),
  slug              text not null unique,
  brand             text not null default 'TORNADO',
  description       text not null default '',
  price             numeric(10,2) not null check (price >= 0),
  compare_at_price  numeric(10,2) check (compare_at_price is null or compare_at_price > price),
  category_id       uuid references public.categories(id) on delete set null,
  images            text[] not null default '{}',
  specs             jsonb  not null default '[]'::jsonb,   -- [{"label":"Capacity","value":"8 kg"}]
  in_stock          boolean not null default true,
  is_featured       boolean not null default false,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_created_idx  on public.products (created_at desc);

-- Users listed here are store admins. Nobody can add themselves:
-- the table has no insert/update policy, only SQL Editor can change it.
create table if not exists public.admins (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- ---------- Keep updated_at fresh ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------- "Is the current user an admin?" ----------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- API access ----------
grant usage on schema public to anon, authenticated;
revoke all on public.admins from anon, authenticated;
grant select on public.categories, public.products to anon, authenticated;
grant insert, update, delete on public.categories, public.products to authenticated;

-- ---------- Row level security ----------
alter table public.categories enable row level security;
alter table public.products   enable row level security;
alter table public.admins     enable row level security;

drop policy if exists "categories: everyone reads" on public.categories;
create policy "categories: everyone reads" on public.categories
  for select using (true);

drop policy if exists "categories: admin writes" on public.categories;
create policy "categories: admin writes" on public.categories
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "products: everyone reads visible" on public.products;
create policy "products: everyone reads visible" on public.products
  for select using (is_active or (select public.is_admin()));

drop policy if exists "products: admin writes" on public.products;
create policy "products: admin writes" on public.products
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------- Product photos (Supabase Storage) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
        array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product-images: admin reads" on storage.objects;
create policy "product-images: admin reads" on storage.objects
  for select to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));

drop policy if exists "product-images: admin uploads" on storage.objects;
create policy "product-images: admin uploads" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));

drop policy if exists "product-images: admin deletes" on storage.objects;
create policy "product-images: admin deletes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));

notify pgrst, 'reload schema';
