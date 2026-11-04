import { getSupabaseClient } from '../../lib/supabase'

export type CatalogProduct = {
  id: string
  slug: string
  name: string
  description: string
  category: string
  priceCentimes: number
  stockQuantity: number
  active: boolean
  featured: boolean
  isDemo: boolean
  tone: 'rose' | 'champagne' | 'lilac'
  imageUrl?: string
  imageAlt?: string
}

const demoProducts: CatalogProduct[] = [
  {
    id: 'demo-pearl-halo',
    slug: 'pearl-halo',
    name: 'Pearl Halo',
    description:
      'Exemple de fiche produit à remplacer par les informations réelles de Whimsea.',
    category: 'Perles & lumière',
    priceCentimes: 18900,
    stockQuantity: 4,
    active: true,
    featured: true,
    isDemo: true,
    tone: 'rose',
  },
  {
    id: 'demo-moonlit-chain',
    slug: 'moonlit-chain',
    name: 'Moonlit Chain',
    description:
      'Contenu de démonstration uniquement. Aucun matériau ou détail réel n’est affirmé.',
    category: 'Essentiels du quotidien',
    priceCentimes: 22500,
    stockQuantity: 2,
    active: true,
    featured: true,
    isDemo: true,
    tone: 'champagne',
  },
  {
    id: 'demo-soft-star',
    slug: 'soft-star',
    name: 'Soft Star',
    description:
      'Placeholder éditorial pour valider la navigation et la mise en page.',
    category: 'Petits trésors',
    priceCentimes: 15900,
    stockQuantity: 0,
    active: true,
    featured: false,
    isDemo: true,
    tone: 'lilac',
  },
]

function mapLiveProduct(product: {
  id: string
  slug: string
  name: string
  description: string | null
  price_centimes: number
  stock_quantity: number
  active: boolean
  featured: boolean
  imageUrl?: string
  imageAlt?: string
}): CatalogProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description ?? '',
    category: 'Bijoux',
    priceCentimes: product.price_centimes,
    stockQuantity: product.stock_quantity,
    active: product.active,
    featured: product.featured,
    isDemo: false,
    tone: 'rose',
    imageUrl: product.imageUrl,
    imageAlt: product.imageAlt,
  }
}

export async function loadCatalog(): Promise<{
  products: CatalogProduct[]
  isDemo: boolean
}> {
  const client = getSupabaseClient()

  if (!client) {
    return { products: demoProducts, isDemo: true }
  }

  const { data, error } = await client
    .from('products')
    .select(
      'id, slug, name, description, price_centimes, stock_quantity, active, featured, product_images(storage_path, alt_text, sort_order)',
    )
    .eq('active', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Impossible de charger la boutique.')
  }

  const liveProducts = (data ?? []) as Array<{
    id: string
    slug: string
    name: string
    description: string | null
    price_centimes: number
    stock_quantity: number
    active: boolean
    featured: boolean
    product_images?: Array<{
      storage_path: string
      alt_text: string
      sort_order: number
    }>
  }>
  const products = liveProducts.map((product) => {
    const images = product.product_images ?? []
    const image = images.sort((a, b) => a.sort_order - b.sort_order)[0]
    const imageUrl = image
      ? client.storage.from('product-images').getPublicUrl(image.storage_path)
          .data.publicUrl
      : undefined
    return mapLiveProduct({
      ...product,
      imageUrl,
      imageAlt: image?.alt_text,
    })
  })

  return {
    products,
    isDemo: false,
  }
}

export function formatMad(centimes: number): string {
  return `${(centimes / 100).toLocaleString('fr-MA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} MAD`
}

export function getDemoProducts(): CatalogProduct[] {
  return demoProducts
}
