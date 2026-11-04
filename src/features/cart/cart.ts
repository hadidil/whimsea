import type { CatalogProduct } from '../catalog/catalog'

export const CART_STORAGE_KEY = 'whimsea.cart'
export const CART_SCHEMA_VERSION = 1
const MAX_QUANTITY = 99

export type CartItem = {
  product: CatalogProduct
  quantity: number
}

export type StoredCart = {
  version: number
  items: CartItem[]
}

function isCatalogProduct(value: unknown): value is CatalogProduct {
  if (!value || typeof value !== 'object') return false
  const product = value as Partial<CatalogProduct>
  return (
    typeof product.id === 'string' &&
    typeof product.slug === 'string' &&
    typeof product.name === 'string' &&
    typeof product.priceCentimes === 'number' &&
    typeof product.stockQuantity === 'number' &&
    typeof product.active === 'boolean'
  )
}

function clampQuantity(quantity: number, stockQuantity: number): number {
  if (!Number.isFinite(quantity) || stockQuantity <= 0) return 0
  return Math.min(
    MAX_QUANTITY,
    Math.min(Math.max(0, Math.floor(quantity)), stockQuantity),
  )
}

export function createEmptyCart(): StoredCart {
  return { version: CART_SCHEMA_VERSION, items: [] }
}

export function parseStoredCart(value: string | null): StoredCart {
  if (!value) return createEmptyCart()

  try {
    const parsed: unknown = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object') return createEmptyCart()
    const candidate = parsed as Partial<StoredCart>
    if (
      candidate.version !== CART_SCHEMA_VERSION ||
      !Array.isArray(candidate.items)
    ) {
      return createEmptyCart()
    }

    const items = candidate.items.flatMap((item) => {
      if (!item || typeof item !== 'object') return []
      const candidateItem = item as Partial<CartItem>
      if (!isCatalogProduct(candidateItem.product)) return []
      const quantity = clampQuantity(
        Number(candidateItem.quantity),
        candidateItem.product.stockQuantity,
      )
      return quantity > 0 ? [{ product: candidateItem.product, quantity }] : []
    })

    return { version: CART_SCHEMA_VERSION, items }
  } catch {
    return createEmptyCart()
  }
}

export function reconcileCart(
  cart: StoredCart,
  products: CatalogProduct[],
): StoredCart {
  const productsById = new Map(products.map((product) => [product.id, product]))
  const productsBySlug = new Map(
    products.map((product) => [product.slug, product]),
  )

  const items = cart.items.flatMap((item) => {
    const current =
      productsById.get(item.product.id) ?? productsBySlug.get(item.product.slug)
    if (!current || !current.active) return []

    const quantity = clampQuantity(item.quantity, current.stockQuantity)
    return quantity > 0 ? [{ product: current, quantity }] : []
  })

  return { version: CART_SCHEMA_VERSION, items }
}

export function addCartItem(
  cart: StoredCart,
  product: CatalogProduct,
  requestedQuantity = 1,
): StoredCart {
  if (!product.active || product.stockQuantity <= 0) return cart

  const existing = cart.items.find((item) => item.product.id === product.id)
  const quantity = clampQuantity(
    (existing?.quantity ?? 0) + requestedQuantity,
    product.stockQuantity,
  )
  if (quantity <= 0) return cart

  const items = existing
    ? cart.items.map((item) =>
        item.product.id === product.id ? { product, quantity } : item,
      )
    : [...cart.items, { product, quantity }]

  return { version: CART_SCHEMA_VERSION, items }
}

export function updateCartItem(
  cart: StoredCart,
  productId: string,
  requestedQuantity: number,
): StoredCart {
  const item = cart.items.find(
    (candidate) => candidate.product.id === productId,
  )
  if (!item) return cart

  const quantity = clampQuantity(requestedQuantity, item.product.stockQuantity)
  const items =
    quantity <= 0
      ? cart.items.filter((candidate) => candidate.product.id !== productId)
      : cart.items.map((candidate) =>
          candidate.product.id === productId
            ? { ...candidate, quantity }
            : candidate,
        )

  return { version: CART_SCHEMA_VERSION, items }
}

export function removeCartItem(
  cart: StoredCart,
  productId: string,
): StoredCart {
  return {
    ...cart,
    items: cart.items.filter((item) => item.product.id !== productId),
  }
}

export function getCartQuantity(cart: StoredCart): number {
  return cart.items.reduce((total, item) => total + item.quantity, 0)
}

export function getCartSubtotalCentimes(cart: StoredCart): number {
  return cart.items.reduce(
    (total, item) => total + item.product.priceCentimes * item.quantity,
    0,
  )
}
