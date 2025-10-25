'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react'

export interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  category: string
}

export interface CartItem {
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
  total: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: number; quantity: number } }
  | { type: 'CLEAR_CART' }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(
        item => item.product.id === action.payload.product.id
      )
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.product.id === action.payload.product.id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        )
        return {
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0)
        }
      } else {
        const newItems = [...state.items, action.payload]
        return {
          items: newItems,
          total: newItems.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0)
        }
      }
    }
    
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(
        item => item.product.id !== action.payload.productId
      )
      return {
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0)
      }
    }
    
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { productId: action.payload.productId } })
      }
      
      const updatedItems = state.items.map(item =>
        item.product.id === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      )
      return {
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0)
      }
    }
    
    case 'CLEAR_CART':
      return { items: [], total: 0 }
    
    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 })

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
