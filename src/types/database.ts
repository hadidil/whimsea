export type Json =
  | boolean
  | number
  | string
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          slug: string
          name: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          sort_order?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      products: {
        Row: {
          id: string
          category_id: string | null
          slug: string
          name: string
          description: string | null
          sku: string
          price_centimes: number
          stock_quantity: number
          active: boolean
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          slug: string
          name: string
          description?: string | null
          sku: string
          price_centimes: number
          stock_quantity?: number
          active?: boolean
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          storage_path: string
          alt_text: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          storage_path: string
          alt_text: string
          sort_order?: number
          created_at?: string
        }
        Update: Partial<
          Database['public']['Tables']['product_images']['Insert']
        >
      }
      delivery_zones: {
        Row: {
          id: string
          city_name: string
          normalized_city_key: string
          region: string | null
          fee_centimes: number | null
          enabled: boolean
          delivery_notes: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          city_name: string
          normalized_city_key: string
          region?: string | null
          fee_centimes?: number | null
          enabled?: boolean
          delivery_notes?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<
          Database['public']['Tables']['delivery_zones']['Insert']
        >
      }
      admin_profiles: {
        Row: {
          user_id: string
          role: 'owner' | 'manager'
          created_at: string
        }
        Insert: {
          user_id: string
          role?: 'owner' | 'manager'
          created_at?: string
        }
        Update: Partial<
          Database['public']['Tables']['admin_profiles']['Insert']
        >
      }
      orders: {
        Row: {
          id: string
          public_reference: string
          customer_name: string
          phone: string
          city: string
          street_address: string
          landmark: string | null
          delivery_notes: string | null
          subtotal_centimes: number
          delivery_fee_centimes: number
          grand_total_centimes: number
          status:
            | 'new'
            | 'confirmed'
            | 'preparing'
            | 'shipped'
            | 'delivered'
            | 'cancelled'
            | 'returned'
          internal_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Record<string, never>
        Update: Partial<Database['public']['Tables']['orders']['Row']>
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_name_snapshot: string
          sku_snapshot: string
          quantity: number
          unit_price_centimes: number
          line_total_centimes: number
          created_at: string
        }
        Insert: Record<string, never>
        Update: Record<string, never>
      }
      order_status_history: {
        Row: {
          id: string
          order_id: string
          from_status:
            Database['public']['Tables']['orders']['Row']['status'] | null
          to_status: Database['public']['Tables']['orders']['Row']['status']
          changed_by: string | null
          note: string | null
          created_at: string
        }
        Insert: Record<string, never>
        Update: Record<string, never>
      }
    }
    Functions: {
      create_cod_order: {
        Args: {
          p_idempotency_key: string
          p_customer_name: string
          p_phone: string
          p_city_key: string
          p_street_address: string
          p_items: Json
          p_landmark?: string | null
          p_delivery_notes?: string | null
        }
        Returns: Json
      }
      update_order_status: {
        Args: {
          p_order_id: string
          p_to_status: Database['public']['Tables']['orders']['Row']['status']
          p_internal_notes?: string | null
        }
        Returns: Json
      }
    }
  }
}
