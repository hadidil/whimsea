import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { isAllowedProductImage, MAX_PRODUCT_IMAGE_BYTES } from './security'

const initialMigration = readFileSync(
  resolve(
    process.cwd(),
    'supabase/migrations/20261104180000_initial_schema.sql',
  ),
  'utf8',
)
const adminMigration = readFileSync(
  resolve(
    process.cwd(),
    'supabase/migrations/20261104190000_admin_order_workflows.sql',
  ),
  'utf8',
)
const storageMigration = readFileSync(
  resolve(
    process.cwd(),
    'supabase/migrations/20261104200000_product_images_storage.sql',
  ),
  'utf8',
)

describe('Supabase security contracts', () => {
  it('rejects unsafe or oversized product uploads', () => {
    expect(isAllowedProductImage({ type: 'image/png', size: 1024 })).toBe(true)
    expect(
      isAllowedProductImage({
        type: 'application/javascript',
        size: 1024,
      }),
    ).toBe(false)
    expect(
      isAllowedProductImage({
        type: 'image/png',
        size: MAX_PRODUCT_IMAGE_BYTES + 1,
      }),
    ).toBe(false)
  })

  it('keeps customer data private and exposes only the intended checkout RPC', () => {
    expect(initialMigration).toContain(
      'alter table public.orders enable row level security;',
    )
    expect(initialMigration).toContain(
      'on public.orders for select, update to authenticated',
    )
    expect(initialMigration).toContain(
      'revoke all on function public.create_cod_order',
    )
    expect(initialMigration).toContain(
      'grant execute on function public.create_cod_order',
    )
    expect(initialMigration).toContain(
      "raise exception using errcode = '22023', message = 'Duplicate products are not allowed'",
    )
  })

  it('recalculates prices and fees from locked database rows', () => {
    expect(initialMigration).toContain('v_subtotal := v_subtotal +')
    expect(initialMigration).toContain('v_delivery_fee := v_zone.fee_centimes')
    expect(initialMigration).toContain('for update;')
    expect(initialMigration).toContain(
      'grand_total_centimes = subtotal_centimes + delivery_fee_centimes',
    )
  })

  it('requires admin authorization for status changes and protects image writes', () => {
    expect(adminMigration).toContain("message = 'Admin access required'")
    expect(adminMigration).toContain(
      "message = 'Invalid order status transition'",
    )
    expect(storageMigration).toContain('and public.is_admin()')
    expect(storageMigration).toContain(
      "using (bucket_id = 'product-images' and public.is_admin());",
    )
    expect(storageMigration).toContain(
      "lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')",
    )
  })

  it('contains no service-role secret or broad public order policy', () => {
    expect(initialMigration.toLowerCase()).not.toContain('service_role')
    expect(initialMigration).not.toMatch(
      /on public\.orders for all to anon|on public\.orders for select to anon/,
    )
  })
})
