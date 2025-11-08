'use client'

import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, MapPin, Tag, Check, X, Clock, Plus, Home, ArrowRight, User, Phone, Truck, Store, Sparkles, ShoppingBag } from 'lucide-react'
import AddressMapPicker from '@/components/AddressMapPicker'

interface SavedAddress {
  id: number
  address: string
  latitude?: number
  longitude?: number
  label: string
  is_default: boolean
}

interface DeliverySlot {
  id: number
  start_time: string
  end_time: string
  available_slots: number
}

export default function CheckoutPage() {
  const { state, dispatch } = useCart()
  const { user, isAuthenticated } = useAuth()
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
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<any>(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [validatingPromo, setValidatingPromo] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [deliverySlots, setDeliverySlots] = useState<Record<string, DeliverySlot[]>>({})
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null)
  const WHATSAPP_NUMBER = '8484978622'

  // Load saved addresses if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSavedAddresses()
      setFormData(prev => ({
        ...prev,
        customerName: user.name || '',
        customerPhone: user.phone
      }))
    }
  }, [isAuthenticated, user])

  // Load delivery slots
  useEffect(() => {
    if (deliveryType === 'delivery') {
      fetchDeliverySlots()
    }
  }, [deliveryType])

  const fetchSavedAddresses = async () => {
    try {
      const response = await fetch('/api/addresses')
      if (response.ok) {
        const addresses = await response.json()
        setSavedAddresses(addresses)
        const defaultAddress = addresses.find((a: SavedAddress) => a.is_default)
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id)
          setFormData(prev => ({ ...prev, deliveryAddress: defaultAddress.address }))
          if (defaultAddress.latitude && defaultAddress.longitude) {
            setSelectedCoordinates({ lat: defaultAddress.latitude, lng: defaultAddress.longitude })
          }
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }

  const fetchDeliverySlots = async () => {
    try {
      const response = await fetch('/api/delivery/slots')
      if (response.ok) {
        const slots = await response.json()
        setDeliverySlots(slots)
        // Set default date to tomorrow
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const dateKey = tomorrow.toISOString().split('T')[0]
        setSelectedDate(dateKey)
      }
    } catch (error) {
      console.error('Error fetching delivery slots:', error)
    }
  }

  const handleAddressSelect = (addressId: number) => {
    const address = savedAddresses.find(a => a.id === addressId)
    if (address) {
      setSelectedAddressId(addressId)
      setFormData(prev => ({ ...prev, deliveryAddress: address.address }))
      if (address.latitude && address.longitude) {
        setSelectedCoordinates({ lat: address.latitude, lng: address.longitude })
      }
    }
  }

  const saveNewAddress = async () => {
    if (!formData.deliveryAddress || !selectedCoordinates) return

    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: formData.deliveryAddress,
          latitude: selectedCoordinates.lat,
          longitude: selectedCoordinates.lng,
          label: 'Home',
          is_default: savedAddresses.length === 0
        })
      })

      if (response.ok) {
        await fetchSavedAddresses()
        setShowAddAddress(false)
      }
    } catch (error) {
      console.error('Error saving address:', error)
    }
  }

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

  const handleMapAddressSelect = (address: string, coordinates: { lat: number; lng: number }) => {
    setFormData(prev => ({ ...prev, deliveryAddress: address }))
    setSelectedCoordinates(coordinates)
    setShowMapPicker(false)
  }

  const handleWhatsAppOrder = () => {
    const orderItems = state.items.map(item => {
      const weightInfo = item.selectedWeight 
        ? ` (${item.selectedWeight.weight}${item.selectedWeight.weight_unit})`
        : ''
      const itemPrice = item.selectedWeight?.price || item.product.price
      return `${item.product.name}${weightInfo} x${item.quantity} - ₹${(Number(itemPrice) * item.quantity).toFixed(0)}`
    }).join('\n')
    
    const subtotal = state.total.toFixed(0)
    const finalDeliveryCharge = deliveryType === 'delivery' 
      ? (appliedPromo?.discount_type === 'free_delivery' ? 0 : deliveryCharge)
      : 0
    const total = (totalWithDelivery).toFixed(0)
    const discountInfo = discountAmount > 0 
      ? `\n*Discount (${appliedPromo?.promo_code}):* -₹${discountAmount.toFixed(0)}`
      : ''
    const deliveryInfo = deliveryType === 'delivery' 
      ? `\n*Delivery Address:* ${formData.deliveryAddress || 'To be provided'}\n*Delivery Charge:* ₹${finalDeliveryCharge}${appliedPromo?.discount_type === 'free_delivery' ? ' (FREE - Promo Applied)' : ''}`
      : '\n*Order Type:* Pickup'
    
    const message = encodeURIComponent(
      `🍗 *Order from K2 Chicken*\n\n` +
      `*Customer Details:*\n` +
      `Name: ${formData.customerName || 'To be provided'}\n` +
      `Phone: ${formData.customerPhone || 'To be provided'}\n\n` +
      `*Order Details:*\n${orderItems}\n\n` +
      `*Subtotal:* ₹${subtotal}${discountInfo}${deliveryInfo}\n\n` +
      `*Total Amount:* ₹${total}\n\n` +
      `Please confirm this order.`
    )
    
    const whatsappUrl = `https://wa.me/91${WHATSAPP_NUMBER}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const subtotal = state.total
  const totalWithDiscount = subtotal - discountAmount
  // If free delivery promo is applied, delivery charge is 0
  const finalDeliveryCharge = deliveryType === 'delivery' 
    ? (appliedPromo?.discount_type === 'free_delivery' ? 0 : deliveryCharge)
    : 0
  const totalWithDelivery = Math.max(0, totalWithDiscount + finalDeliveryCharge)

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code')
      return
    }

    setValidatingPromo(true)
    setPromoError('')

    try {
      const response = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          promoCode: promoCode.trim(),
          subtotal: subtotal,
          deliveryCharge: finalDeliveryCharge
        })
      })

      const data = await response.json()

      if (data.valid) {
        setAppliedPromo(data.promotion)
        setDiscountAmount(data.discountAmount)
        setPromoError('')
      } else {
        setAppliedPromo(null)
        setDiscountAmount(0)
        setPromoError(data.error || 'Invalid promo code')
      }
    } catch (error) {
      console.error('Error validating promo code:', error)
      setPromoError('Failed to validate promo code. Please try again.')
      setAppliedPromo(null)
      setDiscountAmount(0)
    } finally {
      setValidatingPromo(false)
    }
  }

  const handleRemovePromoCode = () => {
    setPromoCode('')
    setAppliedPromo(null)
    setDiscountAmount(0)
    setPromoError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Get selected slot info
    const selectedSlot = selectedDate && deliverySlots[selectedDate] 
      ? deliverySlots[selectedDate].find(s => s.id === selectedSlotId)
      : null
    
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
          subtotal: subtotal,
          discountAmount: discountAmount,
          promoCode: appliedPromo?.promo_code || null,
          deliveryCharge: deliveryType === 'delivery' 
            ? (appliedPromo?.discount_type === 'free_delivery' ? 0 : deliveryCharge)
            : 0,
          total: totalWithDelivery,
          deliveryTimeSlotId: selectedSlotId,
          preferredDeliveryDate: selectedDate || null,
          preferredDeliveryTime: selectedSlot ? `${selectedSlot.start_time} - ${selectedSlot.end_time}` : null,
        }),
      })

      if (response.ok) {
        const order = await response.json()
        dispatch({ type: 'CLEAR_CART' })
        router.push(`/order-confirmation/${order.id}`)
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.details || errorData.error || 'Failed to place order')
      }
    } catch (error: any) {
      console.error('Error placing order:', error)
      alert(error.message || 'Failed to place order. Please try again.')
    } finally {
      setIsSubmitting(false)
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
              You need to add some delicious chicken to your cart first!
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
            Checkout <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Details</span>
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">Complete your order in just a few steps</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4 sm:p-6 text-white">
                <h2 className="text-xl sm:text-2xl font-bold mb-1">Order Information</h2>
                <p className="text-orange-100 text-xs sm:text-sm">Fill in your details to complete the order</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Delivery Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Order Type *
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <label className={`relative flex flex-col items-center justify-center p-4 sm:p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                      deliveryType === 'delivery' 
                        ? 'border-orange-500 bg-orange-50 shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                    }`}>
                      <input
                        type="radio"
                        value="delivery"
                        checked={deliveryType === 'delivery'}
                        onChange={(e) => setDeliveryType(e.target.value as 'delivery' | 'pickup')}
                        className="sr-only"
                      />
                      <Truck className={`h-6 w-6 sm:h-8 sm:w-8 mb-2 sm:mb-3 ${deliveryType === 'delivery' ? 'text-orange-600' : 'text-gray-400'}`} />
                      <div className={`font-bold text-sm sm:text-base ${deliveryType === 'delivery' ? 'text-orange-600' : 'text-gray-700'}`}>Delivery</div>
                      <div className="text-xs text-gray-600 mt-1 text-center">We'll bring it to you</div>
                    </label>
                    
                    <label className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                      deliveryType === 'pickup' 
                        ? 'border-orange-500 bg-orange-50 shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                    }`}>
                      <input
                        type="radio"
                        value="pickup"
                        checked={deliveryType === 'pickup'}
                        onChange={(e) => setDeliveryType(e.target.value as 'delivery' | 'pickup')}
                        className="sr-only"
                      />
                      <Store className={`h-6 w-6 sm:h-8 sm:w-8 mb-2 sm:mb-3 ${deliveryType === 'pickup' ? 'text-orange-600' : 'text-gray-400'}`} />
                      <div className={`font-bold text-sm sm:text-base ${deliveryType === 'pickup' ? 'text-orange-600' : 'text-gray-700'}`}>Pickup</div>
                      <div className="text-xs text-gray-600 mt-1 text-center">Come get it yourself</div>
                    </label>
                  </div>
                </div>

                {/* Customer Name */}
                <div>
                  <label htmlFor="customerName" className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-base"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="customerPhone" className="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="customerPhone"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                {deliveryType === 'delivery' && (
                  <>
                    {/* Saved Addresses */}
                    {isAuthenticated && savedAddresses.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Home className="inline h-4 w-4 mr-1" />
                          Saved Addresses
                        </label>
                        <select
                          value={selectedAddressId || ''}
                          onChange={(e) => {
                            const addressId = parseInt(e.target.value)
                            if (addressId) {
                              handleAddressSelect(addressId)
                            } else {
                              setSelectedAddressId(null)
                              setFormData(prev => ({ ...prev, deliveryAddress: '' }))
                              setSelectedCoordinates(null)
                            }
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                        >
                          <option value="">Select a saved address</option>
                          {savedAddresses.map((address) => (
                            <option key={address.id} value={address.id}>
                              {address.label} - {address.address.substring(0, 50)}...
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowAddAddress(true)}
                          className="mt-2 text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                        >
                          <Plus size={14} />
                          Add New Address
                        </button>
                      </div>
                    )}

                    {/* Address Input */}
                    <div>
                      <label htmlFor="deliveryAddress" className="block text-sm font-semibold text-gray-700 mb-2">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        {isAuthenticated && savedAddresses.length > 0 ? 'Or Enter New Address' : 'Delivery Address *'}
                      </label>
                      <div className="space-y-3">
                        <textarea
                          id="deliveryAddress"
                          name="deliveryAddress"
                          value={formData.deliveryAddress}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 resize-none"
                          placeholder="Enter your complete delivery address (street, area, landmark)"
                          required={!selectedAddressId}
                        />
                        <button
                          type="button"
                          onClick={() => setShowMapPicker(true)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 text-sm font-semibold"
                        >
                          <MapPin size={18} className="text-orange-600" />
                          <span>Pick Address on Map</span>
                        </button>
                        {isAuthenticated && formData.deliveryAddress && selectedCoordinates && (
                          <button
                            type="button"
                            onClick={saveNewAddress}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-all duration-200"
                          >
                            <Home size={16} />
                            <span>Save This Address</span>
                          </button>
                        )}
                      </div>
                      {calculatingDelivery && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                          <span>Calculating delivery charge...</span>
                        </div>
                      )}
                      {!calculatingDelivery && deliveryCharge > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                          <p className="text-sm text-gray-700">
                            <span className="text-orange-600 font-semibold">Delivery charge: ₹{deliveryCharge}</span>
                          </p>
                        </div>
                      )}
                      {!calculatingDelivery && deliveryCharge === 0 && distance !== null && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                          <p className="text-sm text-green-700 font-semibold flex items-center gap-2">
                            <Check size={16} />
                            Free delivery within service area!
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Delivery Time Slots */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <Clock className="inline h-4 w-4 mr-1" />
                        Preferred Delivery Date & Time
                      </label>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">Select Date</label>
                          <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => {
                              setSelectedDate(e.target.value)
                              setSelectedSlotId(null)
                              fetchDeliverySlots()
                            }}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                          />
                        </div>
                        {selectedDate && deliverySlots[selectedDate] && deliverySlots[selectedDate].length > 0 && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-2">Select Time Slot</label>
                            <div className="grid grid-cols-2 gap-3">
                              {deliverySlots[selectedDate].map((slot) => (
                                <button
                                  key={slot.id}
                                  type="button"
                                  onClick={() => setSelectedSlotId(slot.id)}
                                  disabled={slot.available_slots === 0}
                                  className={`p-4 border-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                    selectedSlotId === slot.id
                                      ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md scale-105'
                                      : slot.available_slots === 0
                                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                      : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                                  }`}
                                >
                                  <div className="font-bold">{slot.start_time} - {slot.end_time}</div>
                                  {slot.available_slots > 0 && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {slot.available_slots} slots left
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedDate && (!deliverySlots[selectedDate] || deliverySlots[selectedDate].length === 0) && (
                          <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-xl">No delivery slots available for this date</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {deliveryType === 'pickup' && (
                  <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Store className="h-6 w-6 text-orange-600" />
                      <h3 className="font-bold text-gray-900 text-lg">Pickup Information</h3>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Store Address:</strong> Shop No. 4, 24K Avenue, New DP Rd, Kolte Patil, Vishal Nagar, Pimple Nilakh, Pimpri-Chinchwad, Pune, Maharashtra 411027
                    </p>
                    <p className="text-sm text-gray-600">
                      We'll call you when your order is ready for pickup!
                    </p>
                  </div>
                )}

                {/* Promo Code Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Tag className="inline h-4 w-4 mr-1" />
                    Promo Code
                  </label>
                  {!appliedPromo ? (
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value.toUpperCase())
                            setPromoError('')
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleApplyPromoCode()
                            }
                          }}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                          placeholder="Enter promo code"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyPromoCode}
                        disabled={validatingPromo || !promoCode.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                      >
                        {validatingPromo ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 rounded-full">
                          <Check className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-green-800">
                            {appliedPromo.title} Applied!
                          </p>
                          <p className="text-xs text-green-600">
                            Code: {appliedPromo.promo_code} • Save ₹{discountAmount.toFixed(0)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromoCode}
                        className="p-2 hover:bg-green-100 rounded-full transition-colors"
                        title="Remove promo code"
                      >
                        <X className="h-5 w-5 text-green-600" />
                      </button>
                    </div>
                  )}
                  {promoError && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <X size={14} />
                      {promoError}
                    </p>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="space-y-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Placing Order...</span>
                      </>
                    ) : (
                      <>
                        <span>Place Order 🍗</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleWhatsAppOrder}
                    disabled={!formData.customerName || !formData.customerPhone || (deliveryType === 'delivery' && !formData.deliveryAddress)}
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Order via WhatsApp</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-8">
              {/* Summary Header */}
              <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white">
                <h2 className="text-2xl font-bold mb-1">Order Summary</h2>
                <p className="text-orange-100 text-sm">{state.items.length} {state.items.length === 1 ? 'item' : 'items'}</p>
              </div>
              
              <div className="p-6">
                {/* Items List */}
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 max-h-64 overflow-y-auto">
                  {state.items.map((item) => {
                    const itemPrice = item.selectedWeight?.price || item.product.price
                    const totalPrice = Number(itemPrice) * item.quantity
                    return (
                      <div key={item.product.id} className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                          {item.product.image_url ? (
                            <img 
                              src={item.product.image_url} 
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full ${item.product.image_url ? 'hidden' : 'flex'} bg-gradient-to-br from-orange-100 to-red-100 items-center justify-center`}>
                            <span className="text-2xl">🍗</span>
                          </div>
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{item.product.name}</p>
                          {item.selectedWeight && (
                            <p className="text-xs text-gray-500">{item.selectedWeight.weight}{item.selectedWeight.weight_unit}</p>
                          )}
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          <p className="text-sm font-bold text-gray-900 mt-1">₹{totalPrice.toFixed(0)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">₹{subtotal.toFixed(0)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({appliedPromo?.promo_code})</span>
                      <span className="font-bold">-₹{discountAmount.toFixed(0)}</span>
                    </div>
                  )}
                  {deliveryType === 'delivery' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Charge</span>
                      <span>
                        {calculatingDelivery ? (
                          <span className="text-gray-400">Calculating...</span>
                        ) : distance !== null ? (
                          distance <= freeDeliveryRadius || (appliedPromo?.discount_type === 'free_delivery') ? (
                            <span className="text-green-600 font-semibold">
                              Free {appliedPromo?.discount_type === 'free_delivery' ? '(Promo)' : `(within ${freeDeliveryRadius}km)`}
                            </span>
                          ) : (
                            <span className="font-semibold">₹{deliveryCharge}</span>
                          )
                        ) : (
                          <span className="text-gray-400">Enter address</span>
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200">
                    <span className="text-xl font-bold text-gray-900">Total</span>
                    <span className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      ₹{calculatingDelivery ? '...' : totalWithDelivery.toFixed(0)}
                    </span>
                  </div>
                </div>
                
                {/* Order Info */}
                <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    {deliveryType === 'delivery' ? <Truck className="h-5 w-5 text-orange-600" /> : <Store className="h-5 w-5 text-orange-600" />}
                    <p className="text-sm font-bold text-gray-900">
                      {deliveryType === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    <strong>Estimated Time:</strong> {deliveryType === 'delivery' ? '30-45 minutes' : '15-20 minutes'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {deliveryType === 'delivery' 
                      ? "We'll call you when your order is ready for delivery!"
                      : "We'll call you when your order is ready for pickup!"
                    }
                  </p>
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
                      <span>Fast</span>
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

      {/* Address Map Picker Modal */}
      {showMapPicker && (
        <AddressMapPicker
          onAddressSelect={handleMapAddressSelect}
          onClose={() => setShowMapPicker(false)}
          initialAddress={formData.deliveryAddress}
        />
      )}
    </div>
  )
}
