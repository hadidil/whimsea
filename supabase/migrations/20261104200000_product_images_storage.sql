insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

create policy "product images are public"
on storage.objects for select to anon, authenticated
using (bucket_id = 'product-images');

create policy "admins upload product images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'product-images'
  and public.is_admin()
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
);

create policy "admins update product images"
on storage.objects for update to authenticated
using (
  bucket_id = 'product-images'
  and public.is_admin()
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
)
with check (
  bucket_id = 'product-images'
  and public.is_admin()
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
);

create policy "admins delete product images"
on storage.objects for delete to authenticated
using (bucket_id = 'product-images' and public.is_admin());
