'use client'

import { useCart } from '@/context/CartContext'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function CartPage() {
  const { state, dispatch } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      dispatch({ type: 'REMOVE_ITEM', payload: { productId } })
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } })
    }
  }

  const removeItem = (productId: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-lg text-gray-600 mb-8">
              Looks like you haven't added any delicious chicken to your cart yet!
            </p>
            <Link href="/" className="btn-primary">
              Start Shopping 🍗
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Cart Items</h2>
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Clear Cart
                </button>
              </div>
              
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.product.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border">
                      {item.product.image_url ? (
                        <img 
                          src={item.product.image_url} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full ${item.product.image_url ? 'hidden' : 'flex'} bg-chicken-yellow items-center justify-center`}>
                        <span className="text-2xl">🍗</span>
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">{item.product.description}</p>
                      <p className="text-chicken-red font-bold">₹{Number(item.product.price).toFixed(0)} each</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-semibold w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div className="text-right">
                    <p className="font-bold text-chicken-red">
                      ₹{(Number(item.product.price) * item.quantity).toFixed(0)}
                    </p>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                {state.items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span>₹{(Number(item.product.price) * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-chicken-red">₹{state.total.toFixed(0)}</span>
                </div>
              </div>
              
              <Link
                href="/checkout"
                className="w-full btn-primary mt-6 flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
