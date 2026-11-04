import { describe, expect, it } from 'vitest'
import {
  addCartItem,
  createEmptyCart,
  getCartSubtotalCentimes,
  parseStoredCart,
  reconcileCart,
  updateCartItem,
} from './cart'
import type { CatalogProduct } from '../catalog/catalog'

const product: CatalogProduct = {
  id: 'product-1',
  slug: 'pearl-halo',
  name: 'Pearl Halo',
  description: 'Demo',
  category: 'Perles & lumière',
  priceCentimes: 18900,
  stockQuantity: 2,
  active: true,
  featured: true,
  isDemo: true,
  tone: 'rose',
}

describe('cart state', () => {
  it('adds items, caps quantity at stock, and calculates the subtotal', () => {
    let cart = addCartItem(createEmptyCart(), product, 4)
    cart = addCartItem(cart, product)

    expect(cart.items[0].quantity).toBe(2)
    expect(getCartSubtotalCentimes(cart)).toBe(37800)
  })

  it('removes an item when its quantity is reduced to zero', () => {
    const cart = updateCartItem(
      addCartItem(createEmptyCart(), product),
      product.id,
      0,
    )

    expect(cart.items).toHaveLength(0)
  })

  it('drops invalid storage data and reconciles stale products', () => {
    expect(parseStoredCart('{not-json}').items).toHaveLength(0)
    const stale = addCartItem(createEmptyCart(), {
      ...product,
      priceCentimes: 19900,
      stockQuantity: 4,
    })
    const current = reconcileCart(stale, [{ ...product, stockQuantity: 1 }])

    expect(current.items[0].product.priceCentimes).toBe(18900)
    expect(current.items[0].quantity).toBe(1)
  })
})
