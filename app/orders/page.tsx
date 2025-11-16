'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { Clock, MapPin, Package, CheckCircle, XCircle, AlertCircle, Truck, Store, Calendar, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react'

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
      const response = await fetch('/api/orders/my', {
        credentials: 'include' // Include cookies for authentication
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Orders fetched:', data)
        setOrders(Array.isArray(data) ? data : [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Error fetching orders:', response.status, errorData)
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-6 w-6 text-red-500" />
      case 'preparing':
        return <Package className="h-6 w-6 text-orange-500" />
      case 'ready':
      case 'ready_for_pickup':
        return <AlertCircle className="h-6 w-6 text-blue-500" />
      default:
        return <Clock className="h-6 w-6 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-300 shadow-lg shadow-green-200'
      case 'cancelled':
        return 'bg-gradient-to-r from-red-500 to-rose-500 text-white border-red-300 shadow-lg shadow-red-200'
      case 'preparing':
        return 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-300 shadow-lg shadow-orange-200'
      case 'ready':
      case 'ready_for_pickup':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-300 shadow-lg shadow-blue-200'
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-gray-300 shadow-lg shadow-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Delivered'
      case 'cancelled':
        return 'Cancelled'
      case 'preparing':
        return 'Preparing'
      case 'ready':
        return 'Ready'
      case 'ready_for_pickup':
        return 'Ready for Pickup'
      case 'pending':
        return 'Pending'
      case 'received':
        return 'Received'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'delivered':
        return 100
      case 'ready':
      case 'ready_for_pickup':
        return 75
      case 'preparing':
        return 50
      case 'pending':
      case 'received':
        return 25
      case 'cancelled':
        return 0
      default:
        return 25
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto"></div>
            <p className="mt-6 text-lg text-gray-600 font-medium">Loading your orders...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 py-16 flex items-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-orange-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Please Login</h1>
            <p className="text-lg text-gray-600 mb-8">
              You need to be logged in to view your order history.
            </p>
            <Link 
              href="/login?redirect=/orders" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>Login Now</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12 animate-slide-down">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="relative inline-block mb-2">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full blur-3xl opacity-30"></div>
                <h1 className="relative text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  My Orders
                </h1>
              </div>
              <p className="text-gray-600 text-lg animate-slide-up stagger-1">Track your orders and view your history</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white border-2 border-orange-200 text-orange-600 px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all shadow-sm hover:shadow-md transform hover:scale-105 animate-scale-in stagger-2"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-xl border-2 border-gray-100 animate-bounce-in">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-orange-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">No Orders Yet</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Start your delicious journey! Place your first order and experience the best chicken in town.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>Start Shopping</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => {
              const progress = getStatusProgress(order.status)
              return (
                <div 
                  key={order.id} 
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:scale-[1.01] animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-orange-50 p-6 border-b border-gray-200 relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${getStatusColor(order.status)} transform transition-all duration-300 hover:scale-110`}>
                          {getStatusIcon(order.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-gray-900">Order #{order.id}</h3>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(order.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{new Date(order.created_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                            {order.delivery_type === 'pickup' ? (
                              <div className="flex items-center gap-2">
                                <Store className="h-4 w-4" />
                                <span>Pickup</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                <span>Delivery</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                          ₹{Number(order.total_amount).toFixed(0)}
                        </div>
                        <Link 
                          href={`/order-confirmation/${order.id}`}
                          className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-semibold group px-4 py-2 rounded-lg hover:bg-orange-50 transition-all duration-300"
                        >
                          <span>View Details</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {order.status !== 'cancelled' && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                          <span>Order Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              order.status === 'delivered' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                              order.status === 'ready' || order.status === 'ready_for_pickup' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                              order.status === 'preparing' ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                              'bg-gradient-to-r from-gray-400 to-gray-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Content */}
                  <div className="p-6">
                    {/* Items List */}
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Order Items ({order.items?.length || 0})
                      </h4>
                      <div className="space-y-2">
                        {order.items?.map((item, index) => (
                          <div 
                            key={index} 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-[1.02] animate-slide-up"
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-900">{item.product_name}</span>
                              <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">
                                x{item.quantity}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              ₹{(Number(item.price) * item.quantity).toFixed(0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {order.delivery_type === 'delivery' && order.delivery_address && (
                        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-blue-900 mb-1">Delivery Address</p>
                            <p className="text-sm text-blue-700">{order.delivery_address}</p>
                          </div>
                        </div>
                      )}
                      
                      {order.preferred_delivery_date && (
                        <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                          <Calendar className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-purple-900 mb-1">Preferred Time</p>
                            <p className="text-sm text-purple-700">
                              {new Date(order.preferred_delivery_date).toLocaleDateString()}
                              {order.preferred_delivery_time && ` • ${order.preferred_delivery_time}`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      {order.subtotal && order.subtotal !== order.total_amount && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Subtotal</span>
                          <span className="font-medium">₹{Number(order.subtotal).toFixed(0)}</span>
                        </div>
                      )}
                      {order.delivery_charge && order.delivery_charge > 0 && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Delivery Charge</span>
                          <span className="font-medium">₹{Number(order.delivery_charge).toFixed(0)}</span>
                        </div>
                      )}
                      {order.discount_amount && order.discount_amount > 0 && (
                        <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                          <span className="text-green-600 font-semibold flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Discount Applied
                          </span>
                          <span className="text-green-600 font-bold text-lg">-₹{Number(order.discount_amount).toFixed(0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
                        <span className="text-base font-bold text-gray-900">Total Amount</span>
                        <span className="text-2xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                          ₹{Number(order.total_amount).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

