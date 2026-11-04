import { createContext } from 'react'
import type { CatalogProduct } from '../catalog/catalog'
import type { StoredCart } from './cart'

export type CartContextValue = {
  cart: StoredCart
  itemCount: number
  subtotalCentimes: number
  addItem: (product: CatalogProduct, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  replaceCart: (cart: StoredCart) => void
}

export const CartContext = createContext<CartContextValue | null>(null)
