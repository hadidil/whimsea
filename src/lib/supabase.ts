import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database, Json } from '../types/database'

export type WhimseaSupabaseClient = SupabaseClient<Database>

export type CodOrderInput = {
  p_idempotency_key: string
  p_customer_name: string
  p_phone: string
  p_city_key: string
  p_street_address: string
  p_items: Json[]
  p_landmark: string | null
  p_delivery_notes: string | null
}

export type CodOrderResult = {
  reference: string
  status: string
  grand_total_centimes: number
  subtotal_centimes?: number
  delivery_fee_centimes?: number
  duplicate?: boolean
}

export function getSupabaseClient(): WhimseaSupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return null
  }

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

export async function createCodOrder(
  client: WhimseaSupabaseClient,
  input: CodOrderInput,
): Promise<{ data: CodOrderResult | null; error: { message: string } | null }> {
  const rpc = client.rpc as unknown as (
    functionName: 'create_cod_order',
    args: CodOrderInput,
  ) => Promise<{
    data: CodOrderResult | null
    error: { message: string } | null
  }>

  return rpc('create_cod_order', input)
}
