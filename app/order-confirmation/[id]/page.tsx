'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Clock, MapPin, Phone, Printer } from 'lucide-react'

interface Order {
  id: number
  customer_name: string
  customer_phone: string
  delivery_address: string
  delivery_type: string
  subtotal?: number
  delivery_charge?: number
  total_amount: number
  status: string
  estimated_delivery: string
  created_at: string
  items: Array<{
    product_name: string
    quantity: number
    price: number
  }>
}

export default function OrderConfirmationPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStatus, setCurrentStatus] = useState<string>('')

  useEffect(() => {
    console.log('useEffect triggered, params:', params)
    if (params.id) {
      console.log('Fetching order for ID:', params.id)
      fetchOrder(params.id as string)
      const cleanup = setupStatusStream(params.id as string)
      return cleanup
    } else {
      console.log('No order ID found in params')
      setLoading(false)
    }
  }, [params.id])

  const setupStatusStream = (orderId: string) => {
    const eventSource = new EventSource(`/api/orders/${orderId}/status-stream`)
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('Status update received:', data)
        if (data.status) {
          setCurrentStatus(data.status)
          // Update the order status in the state
          setOrder(prev => prev ? { ...prev, status: data.status } : null)
        }
      } catch (error) {
        console.error('Error parsing status update:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('Status stream error:', error)
      eventSource.close()
    }

    // Clean up on component unmount
    return () => {
      eventSource.close()
    }
  }

  const fetchOrder = async (orderId: string) => {
    console.log('Fetching order with ID:', orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      console.log('Response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Order data:', data)
        setOrder(data)
      } else {
        console.error('Failed to fetch order:', response.status, response.statusText)
        setOrder(null)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-chicken-red mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <p className="text-lg text-gray-600 mb-8">
              The order you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/" className="btn-primary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for choosing Chicken Vicken! Your order has been placed successfully.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Order Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle size={20} className="text-green-500" />
                <div>
                  <p className="font-medium">Order #{order.id}</p>
                  <p className="text-sm text-gray-600">Placed on {formatDate(order.created_at)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock size={20} className="text-chicken-yellow" />
                <div>
                  <p className="font-medium">Estimated {order.delivery_type === 'pickup' ? 'Pickup' : 'Delivery'}</p>
                  <p className="text-sm text-gray-600">{formatDate(order.estimated_delivery)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone size={20} className="text-chicken-red" />
                <div>
                  <p className="font-medium">Contact</p>
                  <p className="text-sm text-gray-600">{order.customer_phone}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin size={20} className="text-chicken-orange" />
                <div>
                  <p className="font-medium">{order.delivery_type === 'pickup' ? 'Pickup Location' : 'Delivery Address'}</p>
                  <p className="text-sm text-gray-600">
                    {order.delivery_type === 'pickup' 
                      ? 'Shop No. 4, 24K Avenue, New DP Rd, Kolte Patil, Vishal Nagar, Pimple Nilakh, Pimpri-Chinchwad, Pune, Maharashtra 411027' 
                      : order.delivery_address
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  {order.delivery_type === 'pickup' ? '🏪' : '🚚'}
                </div>
                <div>
                  <p className="font-medium">Order Type</p>
                  <p className="text-sm text-gray-600">
                    {order.delivery_type === 'pickup' ? 'Pickup Order' : 'Delivery Order'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Bill */}
          <div className="bg-white rounded-lg shadow-lg p-6 print:shadow-none">
            <div className="flex justify-between items-start mb-4 print:hidden">
              <h2 className="text-xl font-semibold">Order Bill</h2>
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Printer size={18} />
                <span>Print Bill</span>
              </button>
            </div>
            <div className="text-center mb-6 pb-4 border-b-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">K2 CHICKEN</h2>
              <p className="text-sm text-gray-600 mt-1">Shop No. 4, 24K Avenue, New DP Rd</p>
              <p className="text-sm text-gray-600">Vishal Nagar, Pimple Nilakh, Pune - 411027</p>
              <p className="text-sm text-gray-600 mt-2">Phone: 8484978622</p>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Order #:</span>
                <span className="font-semibold">{order.id}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Date:</span>
                <span>{formatDate(order.created_at)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Customer:</span>
                <span className="font-medium">{order.customer_name}</span>
              </div>
            </div>

            <div className="border-t border-b border-gray-200 py-4 my-4">
              <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
              <div className="space-y-3">
                {order.items && order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity} × ₹{Number(item.price).toFixed(0)}</p>
                    </div>
                    <p className="font-semibold text-gray-900 ml-4">
                      ₹{(Number(item.price) * item.quantity).toFixed(0)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{Number(order.subtotal || order.total_amount - (order.delivery_charge || 0)).toFixed(0)}</span>
              </div>
              {order.delivery_type === 'delivery' && (order.delivery_charge || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Charge:</span>
                  <span className="font-medium">₹{Number(order.delivery_charge || 0).toFixed(0)}</span>
                </div>
              )}
              {order.delivery_type === 'delivery' && (order.delivery_charge || 0) === 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Charge:</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
              )}
            </div>
            
            <div className="border-t-2 border-gray-300 pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total Amount:</span>
                <span className="text-chicken-red">₹{Number(order.total_amount).toFixed(0)}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">Thank you for your order!</p>
              <p className="text-xs text-gray-500 mt-2">We'll contact you shortly to confirm your order.</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-12 bg-chicken-yellow bg-opacity-20 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">What's Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className={`w-8 h-8 text-white rounded-full flex items-center justify-center mx-auto mb-2 ${
                (currentStatus || order.status) === 'pending' || (currentStatus || order.status) === 'received' 
                  ? 'bg-chicken-red' 
                  : 'bg-gray-400'
              }`}>1</div>
              <p className="font-medium">Order Confirmed</p>
              <p className="text-gray-600">We've received your order</p>
            </div>
            <div className="text-center">
              <div className={`w-8 h-8 text-white rounded-full flex items-center justify-center mx-auto mb-2 ${
                (currentStatus || order.status) === 'preparing' 
                  ? 'bg-chicken-red' 
                  : (currentStatus || order.status) === 'ready_for_pickup' || (currentStatus || order.status) === 'delivered'
                  ? 'bg-green-500'
                  : 'bg-gray-400'
              }`}>2</div>
              <p className="font-medium">Preparing</p>
              <p className="text-gray-600">Our chefs are cooking your chicken</p>
            </div>
            <div className="text-center">
              <div className={`w-8 h-8 text-white rounded-full flex items-center justify-center mx-auto mb-2 ${
                (currentStatus || order.status) === 'ready' || (currentStatus || order.status) === 'ready_for_pickup' || (currentStatus || order.status) === 'delivered'
                  ? 'bg-chicken-red' 
                  : 'bg-gray-400'
              }`}>3</div>
              <p className="font-medium">
                {order.delivery_type === 'pickup' ? 'Ready for Pickup' : 'Ready for Delivery'}
              </p>
              <p className="text-gray-600">
                {order.delivery_type === 'pickup' 
                  ? "We'll call you when it's ready!" 
                  : "We'll call you when it's ready for delivery!"
                }
              </p>
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white shadow-sm">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                (currentStatus || order.status) === 'pending' || (currentStatus || order.status) === 'received'
                  ? 'bg-chicken-red'
                  : (currentStatus || order.status) === 'preparing'
                  ? 'bg-chicken-yellow'
                  : (currentStatus || order.status) === 'ready' || (currentStatus || order.status) === 'ready_for_pickup' || (currentStatus || order.status) === 'delivered'
                  ? 'bg-green-500'
                  : 'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium">
                Current Status: {
                  (currentStatus || order.status) === 'pending' || (currentStatus || order.status) === 'received'
                    ? 'Order Confirmed'
                    : (currentStatus || order.status) === 'preparing'
                    ? 'Preparing'
                    : (currentStatus || order.status) === 'ready'
                    ? (order.delivery_type === 'pickup' ? 'Ready for Pickup' : 'Ready for Delivery')
                    : (currentStatus || order.status) === 'ready_for_pickup'
                    ? 'Ready for Pickup'
                    : (currentStatus || order.status) === 'delivered'
                    ? 'Delivered'
                    : 'Unknown'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">
            Order More Chicken 🍗
          </Link>
          <Link href="/recipes" className="btn-secondary">
            View Recipes 👨‍🍳
          </Link>
        </div>
      </div>
    </div>
  )
}
