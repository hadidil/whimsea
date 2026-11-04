# Supabase foundation

The initial migration in `migrations/20261104180000_initial_schema.sql` defines
the catalog, delivery zones, private COD orders, order items, admin roles, and
status history.

## Money convention

All monetary values are integer centimes. For example, `1050` represents
`10.50 MAD`. The public client never supplies prices, totals, stock, or fees
to the checkout function.

## Security boundary

- Published catalog and configured delivery zones are publicly readable.
- Product image files are publicly readable, while image metadata changes and
  storage writes require an authenticated admin profile.
- Orders, order items, status history, and admin profiles are not publicly
  readable.
- Admin writes require an authenticated user present in `admin_profiles`.
- `create_cod_order` is the only public order-creation entry point. It
  validates delivery fields, reads authoritative prices and delivery fees,
  locks product rows, decrements stock, snapshots items, and supports
  idempotency keys.
- Admin access uses Supabase Auth plus an `admin_profiles` row. The `/admin`
  UI is only a convenience layer; RLS and the `update_order_status` RPC enforce
  access and valid status transitions server-side.
- `update_order_status` restores reserved item quantities when an order is
  cancelled and refuses invalid transitions. Repeating cancellation is
  idempotent and does not restore stock twice.
- No admin user is seeded by this repository. The owner must create an
  authenticated Supabase user through Auth, then add its UUID to
  `admin_profiles` with role `owner` using a protected SQL editor. Never place
  a service-role key in the browser or commit it to the project.

## Product images

The product image migration creates the `product-images` public bucket and
admin-only write policies. `/admin/catalog` stores ordered image metadata,
including alt text, in `product_images`. Use owner-approved product media; the
application keeps a placeholder when no image exists.

The approved first product batch has a retry-safe, owner-run seed at
`seed/20261105_approved_product_batch_01.sql`. It uses SKU conflict handling,
sets stock to `0`, and leaves products inactive. Run it only after the
categories and base migration exist. Upload the matching WebP files through
the authenticated `/admin/catalog` flow; local files in `public/images` are
editorial fallbacks, not proof that Supabase Storage has been populated.

## Applying it

The Supabase CLI is not installed or authenticated in this workspace, and no
Supabase project credentials are configured. After the owner creates a project,
apply the migration with the Supabase CLI or SQL editor, then set the values
listed in `.env.example` in a local `.env.local` file. Never commit that file
or a service-role key.
