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

let cachedClient: WhimseaSupabaseClient | null | undefined

export function getSupabaseClient(): WhimseaSupabaseClient | null {
  if (cachedClient !== undefined) {
    return cachedClient
  }

  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    cachedClient = null
    return cachedClient
  }

  cachedClient = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return cachedClient
}

type RpcResponse = {
  data: CodOrderResult | null
  error: { message: string } | null
}

export async function createCodOrder(
  client: WhimseaSupabaseClient,
  input: CodOrderInput,
): Promise<RpcResponse> {
  // IMPORTANT : on appelle rpc() directement sur le client.
  // Détacher la méthode (const rpc = client.rpc) fait perdre `this`
  // et provoque « Cannot read properties of undefined (reading 'rest') ».
  const typedClient = client as unknown as {
    rpc: (
      functionName: 'create_cod_order',
      args: CodOrderInput,
    ) => PromiseLike<RpcResponse>
  }

  return typedClient.rpc('create_cod_order', input)
}