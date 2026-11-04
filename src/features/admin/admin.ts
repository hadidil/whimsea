import {
  getSupabaseClient,
  type WhimseaSupabaseClient,
} from '../../lib/supabase'
import type { Database } from '../../types/database'

export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type OrderStatus = Order['status']
export type AdminProduct = Database['public']['Tables']['products']['Row']
export type AdminDeliveryZone =
  Database['public']['Tables']['delivery_zones']['Row']
export type AdminProductImage =
  Database['public']['Tables']['product_images']['Row']

export const orderStatuses: OrderStatus[] = [
  'new',
  'confirmed',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
]

export async function loadAdminProducts(client: WhimseaSupabaseClient) {
  const { data, error } = await client
    .from('products')
    .select(
      'id, category_id, slug, name, description, sku, price_centimes, stock_quantity, active, featured, created_at, updated_at',
    )
    .order('updated_at', { ascending: false })
  if (error) throw new Error('Impossible de charger les produits.')
  return data ?? []
}

export async function saveAdminProduct(
  client: WhimseaSupabaseClient,
  product: Omit<Database['public']['Tables']['products']['Insert'], 'id'>,
  productId?: string,
) {
  if (productId) {
    const { error } = await client
      .from('products')
      .update(product as never)
      .eq('id', productId)
    if (error) throw new Error('Impossible de modifier le produit.')
    return
  }
  const { error } = await client.from('products').insert(product as never)
  if (error) throw new Error('Impossible de créer le produit.')
}

export async function loadAdminDeliveryZones(client: WhimseaSupabaseClient) {
  const { data, error } = await client
    .from('delivery_zones')
    .select(
      'id, city_name, normalized_city_key, region, fee_centimes, enabled, delivery_notes, sort_order, created_at, updated_at',
    )
    .order('sort_order', { ascending: true })
    .order('city_name', { ascending: true })
  if (error) throw new Error('Impossible de charger les zones.')
  return data ?? []
}

export async function saveAdminDeliveryZone(
  client: WhimseaSupabaseClient,
  zone: Database['public']['Tables']['delivery_zones']['Insert'],
  zoneId?: string,
) {
  if (zoneId) {
    const { error } = await client
      .from('delivery_zones')
      .update(zone as never)
      .eq('id', zoneId)
    if (error) throw new Error('Impossible de modifier la zone.')
    return
  }
  const { error } = await client.from('delivery_zones').insert(zone as never)
  if (error) throw new Error('Impossible de créer la zone.')
}

export async function unpublishAdminProduct(
  client: WhimseaSupabaseClient,
  productId: string,
) {
  const { error } = await client
    .from('products')
    .update({ active: false } as never)
    .eq('id', productId)
  if (error) throw new Error('Impossible de dépublier le produit.')
}

export async function loadAdminProductImages(
  client: WhimseaSupabaseClient,
  productId: string,
) {
  const { data, error } = await client
    .from('product_images')
    .select('id, product_id, storage_path, alt_text, sort_order, created_at')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true })
  if (error) throw new Error('Impossible de charger les images.')
  return data ?? []
}

export async function addAdminProductImage(
  client: WhimseaSupabaseClient,
  image: Database['public']['Tables']['product_images']['Insert'],
) {
  const { error } = await client.from('product_images').insert(image as never)
  if (error) throw new Error('Impossible d’enregistrer l’image.')
}

export async function updateAdminProductImage(
  client: WhimseaSupabaseClient,
  imageId: string,
  update: Database['public']['Tables']['product_images']['Update'],
) {
  const { error } = await client
    .from('product_images')
    .update(update as never)
    .eq('id', imageId)
  if (error) throw new Error('Impossible de modifier l’image.')
}

export async function removeAdminProductImage(
  client: WhimseaSupabaseClient,
  imageId: string,
) {
  const { error } = await client
    .from('product_images')
    .delete()
    .eq('id', imageId)
  if (error) throw new Error('Impossible de supprimer l’image.')
}

export async function getAdminClient(): Promise<WhimseaSupabaseClient | null> {
  const client = getSupabaseClient()
  if (!client) return null
  const { data } = await client.auth.getSession()
  if (!data.session) return null
  const { data: profile } = await client
    .from('admin_profiles')
    .select('user_id, role')
    .eq('user_id', data.session.user.id)
    .maybeSingle()
  return profile ? client : null
}

export async function loadAdminOrders(client: WhimseaSupabaseClient) {
  const { data, error } = await client
    .from('orders')
    .select(
      'id, public_reference, customer_name, phone, city, street_address, landmark, delivery_notes, subtotal_centimes, delivery_fee_centimes, grand_total_centimes, status, internal_notes, created_at, updated_at',
    )
    .order('created_at', { ascending: false })
  if (error) throw new Error('Impossible de charger les commandes.')
  return data ?? []
}

export async function loadOrderItems(
  client: WhimseaSupabaseClient,
  orderId: string,
) {
  const { data, error } = await client
    .from('order_items')
    .select(
      'id, order_id, product_id, product_name_snapshot, sku_snapshot, quantity, unit_price_centimes, line_total_centimes, created_at',
    )
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })
  if (error) throw new Error('Impossible de charger les articles.')
  return data ?? []
}

export async function updateOrderStatus(
  client: WhimseaSupabaseClient,
  orderId: string,
  status: OrderStatus,
  internalNotes: string,
) {
  const rpc = client.rpc as unknown as (
    name: 'update_order_status',
    args: {
      p_order_id: string
      p_to_status: OrderStatus
      p_internal_notes: string | null
    },
  ) => Promise<{ error: { message: string } | null }>
  const result = await rpc('update_order_status', {
    p_order_id: orderId,
    p_to_status: status,
    p_internal_notes: internalNotes.trim() || null,
  })
  if (result.error) throw new Error(result.error.message)
}

export function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat('fr-MA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
