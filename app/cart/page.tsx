'use client'

import { useCart, WeightOption } from '@/context/CartContext'
import { Minus, Plus, Trash2, ShoppingBag, MessageCircle, ArrowRight, Sparkles, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function CartPage() {
  const { state, dispatch } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const WHATSAPP_NUMBER = '8484978622'

  const handleWhatsAppOrder = () => {
    const orderItems = state.items.map(item => {
      const weightInfo = item.selectedWeight 
        ? ` (${item.selectedWeight.weight}${item.selectedWeight.weight_unit})`
        : ''
      const itemPrice = item.selectedWeight?.price || item.product.price
      return `${item.product.name}${weightInfo} x${item.quantity} - ₹${(Number(itemPrice) * item.quantity).toFixed(0)}`
    }).join('\n')
    
    const total = state.total.toFixed(0)
    const message = encodeURIComponent(
      `🍗 *Order from K2 Chicken*\n\n` +
      `*Order Details:*\n${orderItems}\n\n` +
      `*Total: ₹${total}*\n\n` +
      `Please confirm your order and provide delivery address.`
    )
    
    const whatsappUrl = `https://wa.me/91${WHATSAPP_NUMBER}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const updateQuantity = (productId: number, quantity: number, selectedWeight?: WeightOption) => {
    if (quantity <= 0) {
      dispatch({ type: 'REMOVE_ITEM', payload: { productId, selectedWeight } })
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity, selectedWeight } })
    }
  }

  const removeItem = (productId: number, selectedWeight?: WeightOption) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, selectedWeight } })
  }

  const clearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      dispatch({ type: 'CLEAR_CART' })
    }
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <ShoppingBag size={120} className="relative text-gray-300 mx-auto" />
            </div>
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Your Cart is Empty
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-md mx-auto">
              Looks like you haven't added any delicious chicken to your cart yet! Let's fix that.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <Sparkles className="h-5 w-5" />
              <span>Start Shopping 🍗</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 py-6 sm:py-8 md:py-12 pb-24 sm:pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
                Shopping <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Cart</span>
              </h1>
              <p className="text-gray-600 text-base sm:text-lg">
                {state.items.length} {state.items.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            <button
              onClick={clearCart}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium text-sm"
            >
              <Trash2 size={18} />
              <span>Clear All</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item, index) => {
              const itemPrice = item.selectedWeight?.price || item.product.price
              const totalPrice = Number(itemPrice) * item.quantity
              const itemKey = `${item.product.id}-${item.selectedWeight?.weight ?? 'default'}-${item.selectedWeight?.id ?? 'base'}`
              
              return (
                <div 
                  key={itemKey}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl overflow-hidden border-2 border-gray-100 group-hover:border-orange-300 transition-colors shadow-sm">
                          {item.product.image_url ? (
                            <img 
                              src={item.product.image_url} 
                              alt={item.product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full ${item.product.image_url ? 'hidden' : 'flex'} bg-gradient-to-br from-orange-100 to-red-100 items-center justify-center`}>
                            <span className="text-4xl">🍗</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-grow min-w-0">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-1">
                              {item.product.name}
                            </h3>
                            {item.selectedWeight && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-md text-xs font-semibold mb-2">
                                <span>{item.selectedWeight.weight}{item.selectedWeight.weight_unit}</span>
                              </div>
                            )}
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {item.product.description}
                            </p>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-sm text-gray-500">Price:</span>
                              <span className="text-lg font-bold text-orange-600">
                                ₹{Number(itemPrice).toFixed(0)}
                                {item.selectedWeight && (
                                  <span className="text-xs text-gray-500 font-normal ml-1">
                                    / {item.selectedWeight.weight}{item.selectedWeight.weight_unit}
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                          onClick={() => removeItem(item.product.id, item.selectedWeight)}
                            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Remove item"
                          >
                            <X size={20} />
                          </button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1">
                            <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedWeight)}
                              className="w-9 h-9 flex items-center justify-center bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <Minus size={18} />
                            </button>
                            <div className="w-12 text-center">
                              <span className="text-lg font-bold text-gray-900">{item.quantity}</span>
                            </div>
                            <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedWeight)}
                              className="w-9 h-9 flex items-center justify-center bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                          
                          {/* Item Total */}
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Total</p>
                            <p className="text-2xl font-bold text-gray-900">
                              ₹{totalPrice.toFixed(0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Order Summary - Sticky */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-8">
              {/* Summary Header */}
              <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white">
                <h2 className="text-2xl font-bold mb-1">Order Summary</h2>
                <p className="text-orange-100 text-sm">{state.items.length} {state.items.length === 1 ? 'item' : 'items'}</p>
              </div>
              
              <div className="p-6">
                {/* Items Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  {state.items.map((item) => {
                    const itemPrice = item.selectedWeight?.price || item.product.price
                    const totalPrice = Number(itemPrice) * item.quantity
                    return (
                      <div key={item.product.id} className="flex justify-between items-start text-sm">
                        <div className="flex-grow min-w-0 pr-2">
                          <p className="font-medium text-gray-900 truncate">{item.product.name}</p>
                          {item.selectedWeight && (
                            <p className="text-xs text-gray-500">{item.selectedWeight.weight}{item.selectedWeight.weight_unit}</p>
                          )}
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-semibold text-gray-900 whitespace-nowrap">₹{totalPrice.toFixed(0)}</span>
                      </div>
                    )
                  })}
                </div>
                
                {/* Total */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-gray-700">Subtotal</span>
                    <span className="text-lg font-semibold text-gray-900">₹{state.total.toFixed(0)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Delivery charges will be calculated at checkout
                  </p>
                  <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200">
                    <span className="text-2xl font-bold text-gray-900">Total</span>
                    <span className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      ₹{state.total.toFixed(0)}
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  
                  <button
                    onClick={handleWhatsAppOrder}
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Order via WhatsApp</span>
                  </button>
                  
                  <Link
                    href="/"
                    className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:bg-gray-50"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    <span>Continue Shopping</span>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <span>🔒</span>
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🚚</span>
                      <span>Fast Delivery</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>✓</span>
                      <span>Fresh</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
