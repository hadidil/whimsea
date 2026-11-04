-- Whimsea initial data model and security boundary.
-- Money is stored as integer centimes: 10.50 MAD = 1050.

create extension if not exists pgcrypto;

create type public.order_status as enum (
  'new',
  'confirmed',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
  'returned'
);

create type public.admin_role as enum ('owner', 'manager');

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 100),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 160),
  description text check (description is null or char_length(description) <= 5000),
  sku text not null unique check (char_length(sku) between 1 and 80),
  price_centimes integer not null check (price_centimes >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  active boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null check (char_length(storage_path) between 1 and 500),
  alt_text text not null check (char_length(alt_text) between 1 and 240),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, storage_path)
);

create table public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  city_name text not null check (char_length(city_name) between 1 and 120),
  normalized_city_key text not null unique check (normalized_city_key ~ '^[a-z0-9-]+$'),
  region text check (region is null or char_length(region) <= 120),
  fee_centimes integer check (fee_centimes is null or fee_centimes >= 0),
  enabled boolean not null default false,
  delivery_notes text check (delivery_notes is null or char_length(delivery_notes) <= 500),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.admin_role not null default 'manager',
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  public_reference text not null unique default upper('WS-' || substr(encode(gen_random_bytes(8), 'hex'), 1, 10)),
  confirmation_token_hash bytea not null unique,
  idempotency_key uuid not null unique,
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  phone text not null check (phone ~ '^\+212[5-7][0-9]{8}$'),
  city text not null check (char_length(city) between 1 and 120),
  street_address text not null check (char_length(street_address) between 5 and 500),
  landmark text check (landmark is null or char_length(landmark) <= 300),
  delivery_notes text check (delivery_notes is null or char_length(delivery_notes) <= 500),
  subtotal_centimes integer not null check (subtotal_centimes >= 0),
  delivery_fee_centimes integer not null check (delivery_fee_centimes >= 0),
  grand_total_centimes integer not null check (grand_total_centimes = subtotal_centimes + delivery_fee_centimes),
  status public.order_status not null default 'new',
  internal_notes text check (internal_notes is null or char_length(internal_notes) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name_snapshot text not null,
  sku_snapshot text not null,
  quantity integer not null check (quantity between 1 and 99),
  unit_price_centimes integer not null check (unit_price_centimes >= 0),
  line_total_centimes integer not null check (line_total_centimes = unit_price_centimes * quantity),
  created_at timestamptz not null default now()
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  changed_by uuid references auth.users(id) on delete set null,
  note text check (note is null or char_length(note) <= 1000),
  created_at timestamptz not null default now()
);

create index products_catalog_idx on public.products (active, featured, created_at desc);
create index product_images_product_idx on public.product_images (product_id, sort_order);
create index delivery_zones_enabled_idx on public.delivery_zones (enabled, sort_order);
create index orders_status_created_idx on public.orders (status, created_at desc);
create index order_items_order_idx on public.order_items (order_id);
create index status_history_order_idx on public.order_status_history (order_id, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger delivery_zones_set_updated_at
before update on public.delivery_zones
for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

create policy "published categories are public"
on public.categories for select to anon, authenticated
using (exists (
  select 1 from public.products
  where products.category_id = categories.id and products.active
));

create policy "active products are public"
on public.products for select to anon, authenticated
using (active);

create policy "images for active products are public"
on public.product_images for select to anon, authenticated
using (exists (
  select 1 from public.products
  where products.id = product_images.product_id and products.active
));

create policy "enabled delivery zones are public"
on public.delivery_zones for select to anon, authenticated
using (enabled and fee_centimes is not null);

create policy "admins manage categories"
on public.categories for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins manage products"
on public.products for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins manage product images"
on public.product_images for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins manage delivery zones"
on public.delivery_zones for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins read profiles"
on public.admin_profiles for select to authenticated
using (public.is_admin());

create policy "admins manage orders"
on public.orders for select, update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins read order items"
on public.order_items for select to authenticated
using (public.is_admin());

create policy "admins read status history"
on public.order_status_history for select to authenticated
using (public.is_admin());

create or replace function public.create_cod_order(
  p_idempotency_key uuid,
  p_customer_name text,
  p_phone text,
  p_city_key text,
  p_street_address text,
  p_items jsonb,
  p_landmark text default null,
  p_delivery_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing public.orders;
  v_zone public.delivery_zones;
  v_order public.orders;
  v_item jsonb;
  v_product public.products;
  v_quantity integer;
  v_subtotal integer := 0;
  v_delivery_fee integer;
  v_token text;
begin
  if p_idempotency_key is null or p_items is null
    or jsonb_typeof(p_items) <> 'array'
    or jsonb_array_length(p_items) = 0
    or jsonb_array_length(p_items) > 30 then
    raise exception using errcode = '22023', message = 'Invalid order payload';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_items) as item
    group by item ->> 'product_id'
    having count(*) > 1
  ) then
    raise exception using errcode = '22023', message = 'Duplicate products are not allowed';
  end if;

  select * into v_existing
  from public.orders
  where idempotency_key = p_idempotency_key;

  if found then
    return jsonb_build_object(
      'reference', v_existing.public_reference,
      'status', v_existing.status,
      'grand_total_centimes', v_existing.grand_total_centimes,
      'duplicate', true
    );
  end if;

  if p_customer_name is null or char_length(trim(p_customer_name)) not between 2 and 120
    or p_phone !~ '^\+212[5-7][0-9]{8}$'
    or p_street_address is null or char_length(trim(p_street_address)) not between 5 and 500 then
    raise exception using errcode = '22023', message = 'Invalid delivery details';
  end if;

  select * into v_zone
  from public.delivery_zones
  where normalized_city_key = lower(trim(p_city_key))
    and enabled
    and fee_centimes is not null
  for share;

  if not found then
    raise exception using errcode = '22023', message = 'Delivery destination is unavailable';
  end if;
  v_delivery_fee := v_zone.fee_centimes;

  for v_item in select * from jsonb_array_elements(p_items) loop
    if v_item ->> 'product_id' is null
      or v_item ->> 'quantity' is null then
      raise exception using errcode = '22023', message = 'Invalid item payload';
    end if;
    v_quantity := (v_item ->> 'quantity')::integer;
    if v_quantity is null or v_quantity < 1 or v_quantity > 99 then
      raise exception using errcode = '22023', message = 'Invalid item quantity';
    end if;

    select * into v_product
    from public.products
    where id = (v_item ->> 'product_id')::uuid
      and active
    for update;

    if not found or v_product.stock_quantity < v_quantity then
      raise exception using errcode = 'P0001', message = 'Product is unavailable';
    end if;

    v_subtotal := v_subtotal + (v_product.price_centimes * v_quantity);
  end loop;

  v_token := encode(gen_random_bytes(24), 'hex');

  insert into public.orders (
    confirmation_token_hash,
    idempotency_key,
    customer_name,
    phone,
    city,
    street_address,
    landmark,
    delivery_notes,
    subtotal_centimes,
    delivery_fee_centimes,
    grand_total_centimes
  )
  values (
    digest(v_token, 'sha256'),
    p_idempotency_key,
    trim(p_customer_name),
    p_phone,
    v_zone.city_name,
    trim(p_street_address),
    nullif(trim(p_landmark), ''),
    nullif(trim(p_delivery_notes), ''),
    v_subtotal,
    v_delivery_fee,
    v_subtotal + v_delivery_fee
  )
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_product
    from public.products
    where id = (v_item ->> 'product_id')::uuid
    for update;
    v_quantity := (v_item ->> 'quantity')::integer;

    insert into public.order_items (
      order_id, product_id, product_name_snapshot, sku_snapshot,
      quantity, unit_price_centimes, line_total_centimes
    )
    values (
      v_order.id, v_product.id, v_product.name, v_product.sku,
      v_quantity, v_product.price_centimes, v_product.price_centimes * v_quantity
    );

    update public.products
    set stock_quantity = stock_quantity - v_quantity
    where id = v_product.id;
  end loop;

  insert into public.order_status_history (order_id, to_status)
  values (v_order.id, 'new');

  return jsonb_build_object(
    'reference', v_order.public_reference,
    'confirmation_token', v_token,
    'status', v_order.status,
    'subtotal_centimes', v_order.subtotal_centimes,
    'delivery_fee_centimes', v_order.delivery_fee_centimes,
    'grand_total_centimes', v_order.grand_total_centimes,
    'duplicate', false
  );
exception
  when unique_violation then
    select * into v_existing
    from public.orders
    where idempotency_key = p_idempotency_key;
    if found then
      return jsonb_build_object(
        'reference', v_existing.public_reference,
        'status', v_existing.status,
        'grand_total_centimes', v_existing.grand_total_centimes,
        'duplicate', true
      );
    end if;
    raise;
end;
$$;

revoke all on function public.create_cod_order(uuid, text, text, text, text, jsonb, text, text) from public;
grant execute on function public.create_cod_order(uuid, text, text, text, text, jsonb, text, text) to anon, authenticated;

comment on table public.orders is 'Private customer data. Read access is admin-only; public checkout uses create_cod_order.';
comment on column public.orders.subtotal_centimes is 'Integer centimes; 1050 = 10.50 MAD.';
comment on function public.create_cod_order is 'Authoritative COD checkout: validates input, recalculates totals, locks stock, creates order atomically, and supports idempotent retries.';
