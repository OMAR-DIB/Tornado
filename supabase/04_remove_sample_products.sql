-- Removes the sample products from 03_seed.sql that still use their sample
-- illustration. Anything the owner added, or gave a real photo, is kept.
delete from public.products
where cardinality(images) > 0
  and not exists (select 1 from unnest(images) i where i not like '/products/%');
