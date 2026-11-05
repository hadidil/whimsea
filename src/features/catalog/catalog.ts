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
  imageUrls?: string[]
  imageAltTexts?: string[]
}

const approvedLocalImages: Record<string, string[]> = {
  'ruby-necklace': [
    '/images/products/ruby-water.webp',
    '/images/products/ruby-satin.webp',
    '/images/products/ruby-model.webp',
    '/images/products/ruby-editorial-pendant.webp',
    '/images/products/ruby-detail-pendant.webp',
    '/images/products/ruby-sand-shell.webp',
    '/images/products/ruby-shell-box.webp',
    '/images/products/ruby-lipstick.webp',
  ],
  'crystal-necklace': [
    '/images/products/crystal-pink.webp',
    '/images/products/crystal-model.webp',
    '/images/products/crystal-necklace-solitaire.webp',
    '/images/products/crystal-necklace-lace.webp',
    '/images/products/crystal-editorial-reflection.webp',
  ],
  'onyx-necklace': ['/images/products/onyx-model.webp'],
  'pearl-necklace': [
    '/images/products/pearl-model.webp',
    '/images/products/pearl-necklace-ceramic.webp',
    '/images/products/pearl-shell-dish.webp',
    '/images/products/pearl-iridescent-shell-box.webp',
  ],
  'blush-necklace': [
    '/images/products/blush-necklace-pendant.webp',
    '/images/products/blush-necklace-model.webp',
    '/images/products/blush-editorial-necklace.webp',
    '/images/products/blush-turquoise-gel.webp',
    '/images/products/blush-beige-stone.webp',
    '/images/products/blush-shimmering-nacre.webp',
  ],
  'teardrop-necklace': [
    '/images/products/teardrop-necklace-crystal.webp',
    '/images/products/teardrop-necklace-sparkle.webp',
    '/images/products/teardrop-necklace-model.webp',
  ],
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
    imageUrls: [],
    imageAltTexts: [],
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
    imageUrls: [],
    imageAltTexts: [],
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
    imageUrls: [],
    imageAltTexts: [],
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
  imageUrls?: string[]
  imageAltTexts?: string[]
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
    imageUrls: product.imageUrls,
    imageAltTexts: product.imageAltTexts,
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
    const images = [...(product.product_images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order,
    )
    const image = images.sort((a, b) => a.sort_order - b.sort_order)[0]
    const storageImages = images.map(
      (item) =>
        client.storage.from('product-images').getPublicUrl(item.storage_path)
          .data.publicUrl,
    )
    const localImages = approvedLocalImages[product.slug] ?? []
    const imageUrls = storageImages.length ? storageImages : localImages
    const imageUrl = imageUrls[0]
    return mapLiveProduct({
      ...product,
      imageUrl,
      imageAlt: image?.alt_text,
      imageUrls,
      imageAltTexts: images.length
        ? images.map((item) => item.alt_text)
        : localImages.map((_, index) => `${product.name} image ${index + 1}`),
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
