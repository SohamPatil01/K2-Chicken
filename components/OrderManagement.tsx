'use client'

import { useEffect, useState } from 'react'
import { Eye, Phone, MapPin, Clock, CheckCircle } from 'lucide-react'

interface Order {
  id: number
  customer_name: string
  customer_phone: string
  delivery_address: string
  delivery_type: string
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

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      
      if (response.ok) {
        await fetchOrders()
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status })
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'preparing': return 'text-blue-600 bg-blue-100'
      case 'ready': return 'text-green-600 bg-green-100'
      case 'delivered': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Order Management</h2>
        <div className="text-sm text-gray-600">
          {orders.length} total orders
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders List */}
        <div>
          <h3 className="text-lg font-medium mb-4">Recent Orders</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedOrder?.id === order.id
                    ? 'border-chicken-red bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">Order #{order.id}</h4>
                    <p className="text-sm text-gray-600">{order.customer_name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>₹{Number(order.total_amount).toFixed(0)}</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details */}
        <div>
          {selectedOrder ? (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Order Details</h3>
              
              {/* Customer Info */}
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Customer Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Name:</span>
                    <span>{selectedOrder.customer_name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone size={16} />
                    <span>{selectedOrder.customer_phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      {selectedOrder.delivery_type === 'pickup' ? '🏪' : '🚚'}
                    </div>
                    <span className="font-medium">
                      {selectedOrder.delivery_type === 'pickup' ? 'Pickup Order' : 'Delivery Order'}
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin size={16} className="mt-0.5" />
                    <span>
                      {selectedOrder.delivery_type === 'pickup' 
                        ? '123 Chicken Street, Cluck City, CC 12345' 
                        : selectedOrder.delivery_address
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.product_name} x {item.quantity}</span>
                      <span>₹{(Number(item.price) * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{Number(selectedOrder.total_amount).toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Order Status</h4>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-sm text-gray-600">Current Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                    disabled={selectedOrder.status === 'preparing' || selectedOrder.status === 'ready' || selectedOrder.status === 'delivered'}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Start Preparing
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'ready')}
                    disabled={selectedOrder.status === 'ready' || selectedOrder.status === 'delivered'}
                    className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Mark as Ready
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                    disabled={selectedOrder.status === 'delivered'}
                    className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Mark as Delivered
                  </button>
                </div>
              </div>

              {/* Order Timeline */}
              <div>
                <h4 className="font-semibold mb-2">Order Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>Order placed: {formatDate(selectedOrder.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock size={16} className="text-chicken-yellow" />
                    <span>Estimated delivery: {formatDate(selectedOrder.estimated_delivery)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-600">Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
