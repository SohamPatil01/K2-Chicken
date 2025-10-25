'use client'

import { useCart } from '@/context/CartContext'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const { state, dispatch } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery')
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          deliveryType: deliveryType,
          items: state.items,
          total: state.total,
        }),
      })

      if (response.ok) {
        const order = await response.json()
        dispatch({ type: 'CLEAR_CART' })
        router.push(`/order-confirmation/${order.id}`)
      } else {
        throw new Error('Failed to place order')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-lg text-gray-600 mb-8">
              You need to add some delicious chicken to your cart first!
            </p>
            <button
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              Start Shopping 🍗
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Order Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Delivery Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Order Type *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    deliveryType === 'delivery' 
                      ? 'border-chicken-red bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      value="delivery"
                      checked={deliveryType === 'delivery'}
                      onChange={(e) => setDeliveryType(e.target.value as 'delivery' | 'pickup')}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-2xl mb-2">🚚</div>
                      <div className="font-medium">Delivery</div>
                      <div className="text-sm text-gray-600">We'll bring it to you</div>
                    </div>
                  </label>
                  
                  <label className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    deliveryType === 'pickup' 
                      ? 'border-chicken-red bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      value="pickup"
                      checked={deliveryType === 'pickup'}
                      onChange={(e) => setDeliveryType(e.target.value as 'delivery' | 'pickup')}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-2xl mb-2">🏪</div>
                      <div className="font-medium">Pickup</div>
                      <div className="text-sm text-gray-600">Come get it yourself</div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              {deliveryType === 'delivery' && (
                <div>
                  <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address *
                  </label>
                  <textarea
                    id="deliveryAddress"
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                    placeholder="Enter your complete delivery address"
                    required
                  />
                </div>
              )}

              {deliveryType === 'pickup' && (
                <div className="p-4 bg-chicken-yellow bg-opacity-20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">🏪</span>
                    <h3 className="font-semibold text-gray-900">Pickup Information</h3>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>Store Address:</strong> 123 Chicken Street, Cluck City, CC 12345
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    We'll call you when your order is ready for pickup!
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order 🍗'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {state.items.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-chicken-red">
                    ₹{(Number(item.product.price) * item.quantity).toFixed(0)}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-chicken-red">₹{state.total.toFixed(0)}</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-chicken-yellow bg-opacity-20 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Order Type:</strong> {deliveryType === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>Estimated Time:</strong> {deliveryType === 'delivery' ? '30-45 minutes' : '15-20 minutes'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {deliveryType === 'delivery' 
                  ? "We'll call you when your order is ready for delivery!"
                  : "We'll call you when your order is ready for pickup!"
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}