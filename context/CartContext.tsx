'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react'

export interface WeightOption {
  id: number | null
  weight: number
  weight_unit: string
  price: number
  is_default: boolean
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  category: string
  is_available?: boolean
  stock_quantity?: number
  low_stock_threshold?: number
  in_stock?: boolean
  weightOptions?: WeightOption[]
}

export interface CartItem {
  product: Product
  quantity: number
  selectedWeight?: WeightOption
}

interface CartState {
  items: CartItem[]
  total: number
}

const isSameWeightOption = (a?: WeightOption, b?: WeightOption) => {
  if (!a && !b) return true
  if (!a || !b) return false
  return (
    a.weight === b.weight &&
    a.weight_unit === b.weight_unit &&
    a.id === b.id
  )
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number; selectedWeight?: WeightOption } }
  | { type: 'REMOVE_ITEM'; payload: { productId: number; selectedWeight?: WeightOption } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: number; quantity: number; selectedWeight?: WeightOption } }
  | { type: 'CLEAR_CART' }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const productPrice = action.payload.selectedWeight?.price || action.payload.product.price
      const productToAdd = action.payload.selectedWeight 
        ? { ...action.payload.product, price: productPrice }
        : action.payload.product
      
      const existingItem = state.items.find(
        item => item.product.id === action.payload.product.id && 
                isSameWeightOption(item.selectedWeight, action.payload.selectedWeight)
      )
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.product.id === action.payload.product.id && 
          isSameWeightOption(item.selectedWeight, action.payload.selectedWeight)
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        )
        return {
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => {
            const itemPrice = item.selectedWeight?.price || item.product.price
            return sum + (Number(itemPrice) * item.quantity)
          }, 0)
        }
      } else {
        const newItems = [...state.items, { 
          product: productToAdd, 
          quantity: action.payload.quantity,
          selectedWeight: action.payload.selectedWeight
        }]
        return {
          items: newItems,
          total: newItems.reduce((sum, item) => {
            const itemPrice = item.selectedWeight?.price || item.product.price
            return sum + (Number(itemPrice) * item.quantity)
          }, 0)
        }
      }
    }
    
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => {
        if (item.product.id !== action.payload.productId) return true
        if (!action.payload.selectedWeight) return false
        return !isSameWeightOption(item.selectedWeight, action.payload.selectedWeight)
      })
      return {
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => {
          const itemPrice = item.selectedWeight?.price || item.product.price
          return sum + (Number(itemPrice) * item.quantity)
        }, 0)
      }
    }
    
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { productId: action.payload.productId, selectedWeight: action.payload.selectedWeight } })
      }
      
      const updatedItems = state.items.map(item =>
        item.product.id === action.payload.productId &&
        isSameWeightOption(item.selectedWeight, action.payload.selectedWeight)
          ? { ...item, quantity: action.payload.quantity }
          : item
      )
      return {
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => {
          const itemPrice = item.selectedWeight?.price || item.product.price
          return sum + (Number(itemPrice) * item.quantity)
        }, 0)
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
