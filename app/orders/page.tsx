'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { Clock, MapPin, Package, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface Order {
  id: number
  customer_name: string
  customer_phone: string
  delivery_address: string
  delivery_type: string
  total_amount: number
  subtotal?: number
  delivery_charge?: number
  discount_amount?: number
  status: string
  estimated_delivery: string
  preferred_delivery_date?: string
  preferred_delivery_time?: string
  created_at: string
  items: Array<{
    product_name: string
    quantity: number
    price: number
  }>
}

export default function OrdersPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchOrders()
      } else {
        setLoading(false)
      }
    }
  }, [isAuthenticated, authLoading])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/my')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'preparing':
      case 'ready':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'preparing':
      case 'ready':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Please Login</h1>
            <p className="text-lg text-gray-600 mb-8">
              You need to be logged in to view your order history.
            </p>
            <Link href="/" className="btn-primary">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">View your order history and track your deliveries</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-8">You haven't placed any orders yet.</p>
            <Link href="/" className="btn-primary">
              Start Shopping 🍗
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">Order #{order.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">₹{Number(order.total_amount).toFixed(0)}</div>
                    <Link 
                      href={`/order-confirmation/${order.id}`}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span>
                      {order.delivery_type === 'pickup' ? 'Pickup' : order.delivery_address}
                    </span>
                  </div>
                  
                  {order.preferred_delivery_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} />
                      <span>
                        Preferred: {new Date(order.preferred_delivery_date).toLocaleDateString()}
                        {order.preferred_delivery_time && ` at ${order.preferred_delivery_time}`}
                      </span>
                    </div>
                  )}

                  <div className="mt-3">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Items:</p>
                    <div className="space-y-1">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm text-gray-600">
                          <span>{item.product_name} x {item.quantity}</span>
                          <span>₹{(Number(item.price) * item.quantity).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.discount_amount && order.discount_amount > 0 && (
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                      <span className="text-green-600 font-medium">Discount Applied:</span>
                      <span className="text-green-600 font-bold">-₹{Number(order.discount_amount).toFixed(0)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

