'use client'

import { useCart } from '@/context/CartContext'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, MapPin } from 'lucide-react'
import AddressMapPicker from '@/components/AddressMapPicker'

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
  const [deliveryCharge, setDeliveryCharge] = useState(0)
  const [distance, setDistance] = useState<number | null>(null)
  const [freeDeliveryRadius, setFreeDeliveryRadius] = useState<number>(5)
  const [calculatingDelivery, setCalculatingDelivery] = useState(false)
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const WHATSAPP_NUMBER = '8484978622'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Calculate delivery charge when delivery address or coordinates change
  useEffect(() => {
    if (deliveryType === 'delivery' && (formData.deliveryAddress.trim().length > 10 || selectedCoordinates)) {
      const timer = setTimeout(async () => {
        setCalculatingDelivery(true)
        try {
          const response = await fetch('/api/delivery/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              deliveryAddress: formData.deliveryAddress,
              coordinates: selectedCoordinates
            })
          })
          const data = await response.json()
          if (data.success) {
            setDeliveryCharge(data.deliveryCharge)
            setDistance(data.distance)
            if (data.freeDeliveryRadius) {
              setFreeDeliveryRadius(data.freeDeliveryRadius)
            }
            // Update address if Google Maps provided a better formatted address
            if (data.formattedAddress && data.formattedAddress !== formData.deliveryAddress) {
              setFormData(prev => ({ ...prev, deliveryAddress: data.formattedAddress }))
            }
          } else {
            setDeliveryCharge(0)
            setDistance(null)
          }
        } catch (error) {
          console.error('Error calculating delivery:', error)
          setDeliveryCharge(0)
          setDistance(null)
        } finally {
          setCalculatingDelivery(false)
        }
      }, 1000) // Debounce for 1 second
      return () => clearTimeout(timer)
    } else {
      setDeliveryCharge(0)
      setDistance(null)
    }
  }, [formData.deliveryAddress, deliveryType, selectedCoordinates])

  const handleAddressSelect = (address: string, coordinates: { lat: number; lng: number }) => {
    setFormData(prev => ({ ...prev, deliveryAddress: address }))
    setSelectedCoordinates(coordinates)
    setShowMapPicker(false)
  }

  const handleWhatsAppOrder = () => {
    const orderItems = state.items.map(item => 
      `${item.product.name} x${item.quantity} - ₹${(Number(item.product.price) * item.quantity).toFixed(0)}`
    ).join('\n')
    
    const subtotal = state.total.toFixed(0)
    const total = (Number(state.total) + deliveryCharge).toFixed(0)
    const deliveryInfo = deliveryType === 'delivery' 
      ? `\n*Delivery Address:* ${formData.deliveryAddress || 'To be provided'}\n*Delivery Charge:* ₹${deliveryCharge}\n*Distance:* ${distance ? `${distance} km` : 'Calculating...'}`
      : '\n*Order Type:* Pickup'
    
    const message = encodeURIComponent(
      `🍗 *Order from K2 Chicken*\n\n` +
      `*Customer Details:*\n` +
      `Name: ${formData.customerName || 'To be provided'}\n` +
      `Phone: ${formData.customerPhone || 'To be provided'}\n\n` +
      `*Order Details:*\n${orderItems}\n\n` +
      `*Subtotal:* ₹${subtotal}${deliveryInfo}\n\n` +
      `*Total Amount:* ₹${total}\n\n` +
      `Please confirm this order.`
    )
    
    const whatsappUrl = `https://wa.me/91${WHATSAPP_NUMBER}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const totalWithDelivery = state.total + deliveryCharge

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
          subtotal: state.total,
          deliveryCharge: deliveryType === 'delivery' ? deliveryCharge : 0,
          total: totalWithDelivery,
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
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <textarea
                        id="deliveryAddress"
                        name="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={handleInputChange}
                        rows={4}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                        placeholder="Enter your complete delivery address (street, area, landmark)"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(true)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-chicken-red hover:bg-red-50 transition-colors text-sm font-medium"
                    >
                      <MapPin size={18} className="text-chicken-red" />
                      <span>Pick Address on Map</span>
                    </button>
                  </div>
                  {calculatingDelivery && (
                    <p className="text-sm text-gray-500 mt-2">Calculating delivery charge using Google Maps...</p>
                  )}
                  {distance !== null && !calculatingDelivery && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Distance:</strong> {distance} km from shop (road distance)
                        {distance <= freeDeliveryRadius ? (
                          <span className="text-green-600 ml-2">✓ Free delivery!</span>
                        ) : (
                          <span className="text-orange-600 ml-2">Delivery charge: ₹{deliveryCharge}</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {deliveryType === 'pickup' && (
                <div className="p-4 bg-chicken-yellow bg-opacity-20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">🏪</span>
                    <h3 className="font-semibold text-gray-900">Pickup Information</h3>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>Store Address:</strong> Shop No. 4, 24K Avenue, New DP Rd, Kolte Patil, Vishal Nagar, Pimple Nilakh, Pimpri-Chinchwad, Pune, Maharashtra 411027
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    We'll call you when your order is ready for pickup!
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Placing Order...' : 'Place Order 🍗'}
                </button>
                
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  disabled={!formData.customerName || !formData.customerPhone || (deliveryType === 'delivery' && !formData.deliveryAddress)}
                  className="w-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Order via WhatsApp
                </button>
              </div>
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
            
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{state.total.toFixed(0)}</span>
              </div>
              {deliveryType === 'delivery' && (
                <div className="flex justify-between text-sm">
                  <span>Delivery Charge</span>
                  <span>
                    {calculatingDelivery ? (
                      <span className="text-gray-400">Calculating...</span>
                    ) : distance !== null ? (
                      distance <= freeDeliveryRadius ? (
                        <span className="text-green-600">Free (within {freeDeliveryRadius}km)</span>
                      ) : (
                        <span>₹{deliveryCharge}</span>
                      )
                    ) : (
                      <span className="text-gray-400">Enter address</span>
                    )}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-chicken-red">
                  ₹{calculatingDelivery ? '...' : totalWithDelivery.toFixed(0)}
                </span>
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

      {/* Address Map Picker Modal */}
      {showMapPicker && (
        <AddressMapPicker
          onAddressSelect={handleAddressSelect}
          onClose={() => setShowMapPicker(false)}
          initialAddress={formData.deliveryAddress}
        />
      )}
    </div>
  )
}