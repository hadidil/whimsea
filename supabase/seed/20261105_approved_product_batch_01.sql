-- Owner-run seed for the approved product batch.
-- Stock is unknown, so products remain inactive until the owner supplies stock.
insert into public.products (
  category_id, name, slug, sku, description, price_centimes,
  stock_quantity, active, featured
)
select
  c.id, batch.name, batch.slug, batch.sku, batch.description,
  batch.price_centimes, 0, false, batch.featured
from (
  values
    ('Ruby Necklace', 'ruby-necklace', 'WH-NECK-RUBY-01', 'Approved Whimsea product batch item.', 12900, true),
    ('Crystal Necklace', 'crystal-necklace', 'WH-NECK-CRYSTAL-01', 'Approved Whimsea product batch item.', 12900, true),
    ('Onyx Necklace', 'onyx-necklace', 'WH-NECK-ONYX-01', 'Approved Whimsea product batch item.', 12900, false),
    ('Pearl Necklace', 'pearl-necklace', 'WH-NECK-PEARL-01', 'Approved Whimsea product batch item.', 12900, false)
) as batch(name, slug, sku, description, price_centimes, featured)
cross join lateral (
  select id from public.categories
  order by sort_order asc, created_at asc
  limit 1
) c
on conflict (sku) do update set
  name = excluded.name,
  slug = excluded.slug,
  price_centimes = excluded.price_centimes,
  featured = excluded.featured;
