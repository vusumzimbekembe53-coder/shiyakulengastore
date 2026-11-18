
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const { user } = useAuth()

  // Give each account its own storage key
  const storageKey = user
    ? `shiya-cart-${user._id || user.id || user.email}`
    : 'shiya-cart-guest'

  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem(storageKey)
      return savedCart ? JSON.parse(savedCart) : []
    } catch {
      return []
    }
  })

  const [loadedKey, setLoadedKey] = useState(storageKey)

  // Load the correct cart whenever the logged-in account changes
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(storageKey)
      setCart(savedCart ? JSON.parse(savedCart) : [])
    } catch {
      setCart([])
    }

    setLoadedKey(storageKey)
  }, [storageKey])

  // Save only after the correct customer's cart has loaded
  useEffect(() => {
    if (loadedKey === storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(cart))
    }
  }, [cart, storageKey, loadedKey])

 
  // Add product to cart
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find(
        (item) =>
          item.id === product.id &&
          (item.size || '') === (product.size || '') &&
          (item.color || '') === (product.color || '')
      )

      const quantityToAdd = Number(product.quantity) || 1

      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === product.id &&
          (item.size || '') === (product.size || '') &&
          (item.color || '') === (product.color || '')
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        )
      }

      return [
        ...prevCart,
        { ...product, quantity: quantityToAdd }
      ]
    })
  }

  // Remove a specific product variation
  const removeFromCart = (id, size, color) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(
            item.id === id &&
            (item.size || '') === (size || '') &&
            (item.color || '') === (color || '')
          )
      )
    )
  }

  // Increase quantity of a specific variation
  const increaseQuantity = (id, size, color) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id &&
        (item.size || '') === (size || '') &&
        (item.color || '') === (color || '')
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    )
  }

  // Decrease quantity of a specific variation
  const decreaseQuantity = (id, size, color) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id &&
        (item.size || '') === (size || '') &&
        (item.color || '') === (color || '')
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    )
  }

 

  // Calculate total items
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  )

  // Calculate subtotal
  const subtotal = cart.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  )

  // Clear current customer's cart
  const clearCart = () => setCart([])

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }

  return context
}

export default CartContext
