'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, MapPin, Tag, Check, X, Clock, Plus, Home, ArrowRight, User, Phone, Truck, Store, Sparkles, ShoppingBag, LogIn, CreditCard, Wallet, QrCode, Info, CheckCircle } from 'lucide-react'
import AddressMapPicker from '@/components/AddressMapPicker'
import { QRCodeSVG } from 'qrcode.react'

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
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderCount, setOrderCount] = useState(0)
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0)
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
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('cash')
  const [showUPIQR, setShowUPIQR] = useState(false)
  const [upiPaymentUrl, setUpiPaymentUrl] = useState('')
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null)
  const [orderTotalAmount, setOrderTotalAmount] = useState<number | null>(null)
  const WHATSAPP_NUMBER = '8484978622'

  // Load saved addresses and order history if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSavedAddresses()
      fetchOrderHistory()
      setFormData(prev => ({
        ...prev,
        customerName: user.name || '',
        customerPhone: user.phone
      }))
    }
  }, [isAuthenticated, user])

  // Fetch order history to calculate loyalty discount
  const fetchOrderHistory = async () => {
    try {
      const response = await fetch('/api/orders/my', {
        credentials: 'include'
      })
      if (response.ok) {
        const orders = await response.json()
        setOrderCount(orders.length)
        // Apply loyalty discount: 5% for 3+ orders, 10% for 10+ orders
        if (orders.length >= 10) {
          setLoyaltyDiscount(10) // 10% discount
        } else if (orders.length >= 3) {
          setLoyaltyDiscount(5) // 5% discount
        }
      }
    } catch (error) {
      console.error('Error fetching order history:', error)
    }
  }

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

  // Reset delivery charge when switching to pickup
  useEffect(() => {
    if (deliveryType === 'pickup') {
      setDeliveryCharge(0)
      setDistance(null)
      setCalculatingDelivery(false)
    }
  }, [deliveryType])

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
            // Round the delivery charge to ensure consistency
            const roundedCharge = Math.round(data.deliveryCharge || 0)
            setDeliveryCharge(roundedCharge)
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
    } else if (deliveryType === 'pickup') {
      // Ensure delivery charge is 0 for pickup
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
  // Calculate loyalty discount amount
  const loyaltyDiscountAmount = loyaltyDiscount > 0 ? (subtotal * loyaltyDiscount / 100) : 0
  // Total discount = promo discount + loyalty discount
  const totalDiscountAmount = discountAmount + loyaltyDiscountAmount
  const totalWithDiscount = subtotal - totalDiscountAmount
  // If free delivery promo is applied, delivery charge is 0
  // Also ensure delivery charge is 0 for pickup
  const finalDeliveryCharge = deliveryType === 'delivery' 
    ? (appliedPromo?.discount_type === 'free_delivery' ? 0 : Math.round(deliveryCharge || 0))
    : 0
  const totalWithDelivery = Math.max(0, Math.round(totalWithDiscount + finalDeliveryCharge))

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

  // Generate UPI payment URL with customer details
  const generateUPIUrl = (orderId: number, customerName: string, total: number) => {
    // Ensure total is a valid number and round it to match bill display (no decimals)
    const orderTotal = Math.round(parseFloat(String(total)) || 0)
    
    const timestamp = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    // Create order summary
    const orderItems = state.items.map(item => {
      const weightInfo = item.selectedWeight ? ` (${item.selectedWeight.weight}${item.selectedWeight.weight_unit})` : ''
      return `${item.product.name}${weightInfo} x${item.quantity}`
    }).join(', ')
    
    // UPI payment URL format: upi://pay?pa=UPI_ID&pn=PAYEE_NAME&am=AMOUNT&cu=INR&tn=TRANSACTION_NOTE
    // Get UPI ID from environment variable - set NEXT_PUBLIC_UPI_ID in .env.local
    const upiId = process.env.NEXT_PUBLIC_UPI_ID
    if (!upiId) {
      console.warn('NEXT_PUBLIC_UPI_ID is not set in environment variables. UPI payments will not work.')
      // Return a placeholder URL that won't work but won't crash the app
      return `upi://pay?pa=SET_UPI_ID@paytm&pn=${encodeURIComponent('K2 Chicken')}&am=${orderTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order #${orderId} - ${customerName}`)}`
    }
    const payeeName = 'K2 Chicken'
    // UPI amount must be formatted with exactly 2 decimal places (even if rounded to whole number)
    const amount = orderTotal.toFixed(2)
    
    // Transaction note with customer name, order details, and timestamp
    const transactionNote = `Order #${orderId} - ${customerName} - ${orderItems} - ${timestamp}`
    
    // Encode the transaction note
    const encodedNote = encodeURIComponent(transactionNote)
    
    // Generate UPI URL
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodedNote}`
    
    return upiUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Require login before placing order
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout')
      return
    }
    
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
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          ...formData,
          deliveryType: deliveryType,
          items: state.items,
          subtotal: subtotal,
          discountAmount: totalDiscountAmount,
          loyaltyDiscount: loyaltyDiscountAmount,
          promoCode: appliedPromo?.promo_code || null,
          deliveryCharge: finalDeliveryCharge,
          total: totalWithDelivery,
          paymentMethod: paymentMethod,
          deliveryTimeSlotId: selectedSlotId,
          preferredDeliveryDate: selectedDate || null,
          preferredDeliveryTime: selectedSlot ? `${selectedSlot.start_time} - ${selectedSlot.end_time}` : null,
        }),
      })

      if (response.ok) {
        const order = await response.json()
        
        // If UPI payment, show QR code with actual order ID (only once during checkout)
        if (paymentMethod === 'upi') {
          // Use the order's total_amount from the server response and round it to match bill display
          const orderTotal = Math.round(parseFloat(order.total_amount || order.total || totalWithDelivery))
          setOrderTotalAmount(orderTotal) // Store the rounded order total
          const upiUrl = generateUPIUrl(order.id, formData.customerName || user?.name || 'Customer', orderTotal)
          setCurrentOrderId(order.id) // Store the actual order ID
          setUpiPaymentUrl(upiUrl)
          setShowUPIQR(true)
          setIsSubmitting(false)
          return
        }
        
        // For other payment methods, proceed to confirmation
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

  // Handle UPI payment confirmation (after user has paid)
  const handleUPIPaymentConfirm = async () => {
    setShowUPIQR(false)
    setUpiPaymentUrl('')
    dispatch({ type: 'CLEAR_CART' })
    // Redirect to order confirmation page with the actual order ID
    if (currentOrderId) {
      router.push(`/order-confirmation/${currentOrderId}`)
    } else {
      router.push('/orders')
    }
    router.refresh()
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
        <div className="mb-6 sm:mb-8 animate-slide-down">
          <div className="relative inline-block mb-3">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full blur-3xl opacity-30"></div>
            <h1 className="relative text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
              Checkout <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Details</span>
            </h1>
          </div>
          <p className="text-gray-600 text-base sm:text-lg animate-slide-up stagger-1">Complete your order in just a few steps</p>
        </div>
        
        {/* Login Prompt */}
        {!authLoading && !isAuthenticated && (
          <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6 animate-scale-in stagger-1 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 animate-bounce-in">
                <div className="p-3 bg-white rounded-full shadow-md">
                  <User className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Login Required to Place Order</h3>
                <p className="text-gray-700 mb-4">
                  Please login or create an account to place your order. As a registered customer, you'll get:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Automatic discounts on repeat orders (5% after 3 orders, 10% after 10 orders)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Access to your order history</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Save delivery addresses for faster checkout</span>
                  </li>
                </ul>
                <Link
                  href="/login?redirect=/checkout"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <LogIn className="h-5 w-5" />
                  Login or Register
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2 animate-slide-up stagger-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4 sm:p-6 text-white relative overflow-hidden">
                <div className="relative">
                  <h2 className="text-xl sm:text-2xl font-bold mb-1">Order Information</h2>
                  <p className="text-orange-100 text-xs sm:text-sm">Fill in your details to complete the order</p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Delivery Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Order Type *
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <label className={`relative flex flex-col items-center justify-center p-4 sm:p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 transform ${
                      deliveryType === 'delivery' 
                        ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 hover:scale-102'
                    }`}>
                      <input
                        type="radio"
                        value="delivery"
                        checked={deliveryType === 'delivery'}
                        onChange={(e) => setDeliveryType(e.target.value as 'delivery' | 'pickup')}
                        className="sr-only"
                      />
                      <Truck className={`h-6 w-6 sm:h-8 sm:w-8 mb-2 sm:mb-3 transition-all duration-300 ${deliveryType === 'delivery' ? 'text-orange-600 animate-bounce-in' : 'text-gray-400'}`} />
                      <div className={`font-bold text-sm sm:text-base transition-colors ${deliveryType === 'delivery' ? 'text-orange-600' : 'text-gray-700'}`}>Delivery</div>
                      <div className="text-xs text-gray-600 mt-1 text-center">We'll bring it to you</div>
                    </label>
                    
                    <label className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 transform ${
                      deliveryType === 'pickup' 
                        ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 hover:scale-102'
                    }`}>
                      <input
                        type="radio"
                        value="pickup"
                        checked={deliveryType === 'pickup'}
                        onChange={(e) => setDeliveryType(e.target.value as 'delivery' | 'pickup')}
                        className="sr-only"
                      />
                      <Store className={`h-6 w-6 sm:h-8 sm:w-8 mb-2 sm:mb-3 transition-all duration-300 ${deliveryType === 'pickup' ? 'text-orange-600 animate-bounce-in' : 'text-gray-400'}`} />
                      <div className={`font-bold text-sm sm:text-base transition-colors ${deliveryType === 'pickup' ? 'text-orange-600' : 'text-gray-700'}`}>Pickup</div>
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

                {/* Payment Method Selection */}
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Payment Method *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <label className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                      paymentMethod === 'cash' 
                        ? 'border-orange-500 bg-orange-50 shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'upi' | 'card')}
                        className="sr-only"
                      />
                      <Wallet className={`h-6 w-6 mb-2 ${paymentMethod === 'cash' ? 'text-orange-600' : 'text-gray-400'}`} />
                      <div className={`font-bold text-sm ${paymentMethod === 'cash' ? 'text-orange-600' : 'text-gray-700'}`}>Cash</div>
                      <div className="text-xs text-gray-600 mt-1 text-center">Pay on delivery</div>
                    </label>
                    
                    <label className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                      paymentMethod === 'upi' 
                        ? 'border-orange-500 bg-orange-50 shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'upi' | 'card')}
                        className="sr-only"
                      />
                      <QrCode className={`h-6 w-6 mb-2 ${paymentMethod === 'upi' ? 'text-orange-600' : 'text-gray-400'}`} />
                      <div className={`font-bold text-sm ${paymentMethod === 'upi' ? 'text-orange-600' : 'text-gray-700'}`}>UPI</div>
                      <div className="text-xs text-gray-600 mt-1 text-center">QR Code</div>
                    </label>
                    
                    <label className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                      paymentMethod === 'card' 
                        ? 'border-orange-500 bg-orange-50 shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'upi' | 'card')}
                        className="sr-only"
                      />
                      <CreditCard className={`h-6 w-6 mb-2 ${paymentMethod === 'card' ? 'text-orange-600' : 'text-gray-400'}`} />
                      <div className={`font-bold text-sm ${paymentMethod === 'card' ? 'text-orange-600' : 'text-gray-700'}`}>Card</div>
                      <div className="text-xs text-gray-600 mt-1 text-center">Debit/Credit</div>
                    </label>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="space-y-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white relative z-10"></div>
                        <span className="relative z-10">Placing Order...</span>
                      </>
                    ) : (
                      <>
                        <span className="relative z-10">{paymentMethod === 'upi' ? 'Show QR Code' : 'Place Order'} 🍗</span>
                        {paymentMethod === 'upi' ? <QrCode className="h-5 w-5 relative z-10" /> : <ArrowRight className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />}
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
          <div className="lg:col-span-1 animate-slide-up stagger-3">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-8 hover:shadow-2xl transition-all duration-300">
              {/* Summary Header */}
              <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white relative overflow-hidden">
                <div className="relative">
                  <h2 className="text-2xl font-bold mb-1">Order Summary</h2>
                  <p className="text-orange-100 text-sm">{state.items.length} {state.items.length === 1 ? 'item' : 'items'}</p>
                </div>
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
                  {loyaltyDiscountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Loyalty Discount ({orderCount} orders - {loyaltyDiscount}%)</span>
                      <span className="font-bold">-₹{loyaltyDiscountAmount.toFixed(0)}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Promo Discount ({appliedPromo?.promo_code})</span>
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

      {/* UPI QR Code Modal */}
      {showUPIQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-bounce-in">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Pay via UPI</h3>
                    <p className="text-sm text-white/90">Scan QR code to complete payment</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (currentOrderId) {
                      try {
                        const response = await fetch(`/api/orders/${currentOrderId}`, {
                          method: 'DELETE',
                        })
                        if (response.ok) {
                          setShowUPIQR(false)
                          setUpiPaymentUrl('')
                          setCurrentOrderId(null)
                          setOrderTotalAmount(null)
                        } else {
                          const errorData = await response.json().catch(() => ({}))
                          alert(errorData.error || 'Failed to cancel order.')
                        }
                      } catch (error) {
                        console.error('Error cancelling order:', error)
                        alert('Failed to cancel order.')
                      }
                    } else {
                      setShowUPIQR(false)
                      setUpiPaymentUrl('')
                      setOrderTotalAmount(null)
                    }
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 text-center">
                <p className="text-3xl font-bold">₹{(orderTotalAmount || totalWithDelivery).toFixed(0)}</p>
                <p className="text-sm text-white/80 mt-1">Total Amount to Pay</p>
              </div>
            </div>

            <div className="p-6">
              {/* Order Summary */}
              {currentOrderId && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Order ID</span>
                    <span className="text-sm font-bold text-gray-900">#{currentOrderId}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Customer:</span>
                      <span className="font-medium text-gray-900">{formData.customerName || user?.name || 'Customer'}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Date & Time:</span>
                      <span className="font-medium text-gray-900">
                        {new Date().toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items Breakdown */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Order Details</h4>
                <div className="space-y-2 mb-4">
                  {state.items.map((item, index) => {
                    const weightInfo = item.selectedWeight ? ` (${item.selectedWeight.weight}${item.selectedWeight.weight_unit})` : ''
                    const itemTotal = Number(item.product.price) * item.quantity
                    return (
                      <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.product.name}{weightInfo}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{Number(item.product.price).toFixed(0)}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">₹{itemTotal.toFixed(0)}</p>
                      </div>
                    )
                  })}
                </div>
                
                {/* Price Breakdown */}
                <div className="border-t border-gray-200 pt-3 space-y-2">
                  {subtotal !== totalWithDelivery && (
                    <>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium">₹{subtotal.toFixed(0)}</span>
                      </div>
                      {deliveryType === 'delivery' && (deliveryCharge || 0) > 0 && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Delivery Charge</span>
                          <span className="font-medium">₹{deliveryCharge.toFixed(0)}</span>
                        </div>
                      )}
                      {deliveryType === 'delivery' && (deliveryCharge || 0) === 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Delivery Charge</span>
                          <span className="font-semibold text-green-600">FREE</span>
                        </div>
                      )}
                      {(totalDiscountAmount || 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Discount</span>
                          <span className="font-semibold text-green-600">-₹{totalDiscountAmount.toFixed(0)}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t-2 border-gray-300">
                    <span className="text-base font-bold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-orange-600">₹{(orderTotalAmount || totalWithDelivery).toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="mb-6">
                <div className="flex justify-center p-6 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                  {upiPaymentUrl && (
                    <QRCodeSVG
                      value={upiPaymentUrl}
                      size={280}
                      level="H"
                      includeMargin={true}
                    />
                  )}
                </div>
                <p className="text-center text-xs text-gray-500 mt-3">
                  Scan with PhonePe, Google Pay, Paytm, or any UPI app
                </p>
              </div>

              {/* Payment Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-semibold text-blue-900">Payment Steps</p>
                </div>
                <ol className="text-xs text-blue-800 space-y-2 list-decimal list-inside">
                  <li>Open your UPI app (PhonePe, Google Pay, Paytm, etc.)</li>
                  <li>Tap on "Scan QR Code" in your app</li>
                  <li>Point your camera at the QR code above</li>
                  <li>Verify the amount <strong>₹{(orderTotalAmount || totalWithDelivery).toFixed(0)}</strong> and merchant name <strong>K2 Chicken</strong></li>
                  <li>Enter your UPI PIN to complete payment</li>
                  <li>Click "I've Paid" below after successful payment</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleUPIPaymentConfirm}
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] duration-200"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      I've Paid Successfully
                    </span>
                  )}
                </button>
                
                <button
                  onClick={async () => {
                    if (currentOrderId) {
                      try {
                        const response = await fetch(`/api/orders/${currentOrderId}`, {
                          method: 'DELETE',
                        })
                        if (response.ok) {
                          setShowUPIQR(false)
                          setUpiPaymentUrl('')
                          setCurrentOrderId(null)
                        } else {
                          const errorData = await response.json().catch(() => ({}))
                          alert(errorData.error || 'Failed to cancel order.')
                        }
                      } catch (error) {
                        console.error('Error cancelling order:', error)
                        alert('Failed to cancel order.')
                      }
                    } else {
                      setShowUPIQR(false)
                      setUpiPaymentUrl('')
                    }
                  }}
                  className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel Order
                </button>

                {/* Alternative: Open UPI App Link */}
                <a
                  href={upiPaymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center text-sm text-orange-600 hover:text-orange-700 font-medium py-2"
                >
                  Or open in UPI app directly →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
