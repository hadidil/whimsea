import { useEffect, useMemo, useState } from 'react'
import { CartContext, type CartContextValue } from './CartContext'
import {
  addCartItem,
  CART_STORAGE_KEY,
  createEmptyCart,
  getCartQuantity,
  getCartSubtotalCentimes,
  parseStoredCart,
  removeCartItem,
  type StoredCart,
  updateCartItem,
} from './cart'

function readCart(): StoredCart {
  if (typeof window === 'undefined') return createEmptyCart()
  return parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY))
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState(readCart)

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      itemCount: getCartQuantity(cart),
      subtotalCentimes: getCartSubtotalCentimes(cart),
      addItem: (product, quantity = 1) =>
        setCart((current) => addCartItem(current, product, quantity)),
      updateQuantity: (productId, quantity) =>
        setCart((current) => updateCartItem(current, productId, quantity)),
      removeItem: (productId) =>
        setCart((current) => removeCartItem(current, productId)),
      clearCart: () => setCart(createEmptyCart()),
      replaceCart: (nextCart) => setCart(nextCart),
    }),
    [cart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
