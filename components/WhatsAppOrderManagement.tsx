'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, Clock, CheckCircle, XCircle, Truck, Package } from 'lucide-react'

interface WhatsAppOrder {
  id: number
  order_id: string
  user_id: string
  order_type: 'delivery' | 'pickup'
  delivery_address?: string
  contact_phone?: string
  payment_method: string
  subtotal: number
  delivery_fee: number
  total: number
  status: string
  estimated_completion?: string
  created_at: string
  items: any[]
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  received: 'bg-blue-100 text-blue-800',
  preparing: 'bg-red-50 text-brand-red',
  ready_for_pickup: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

const statusIcons = {
  pending: Clock,
  received: CheckCircle,
  preparing: Package,
  ready_for_pickup: Package,
  out_for_delivery: Truck,
  delivered: CheckCircle,
  cancelled: XCircle
}

export default function WhatsAppOrderManagement() {
  const [orders, setOrders] = useState<WhatsAppOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<WhatsAppOrder | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [selectedStatus])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const url = selectedStatus === 'all' 
        ? '/api/whatsapp/orders' 
        : `/api/whatsapp/orders?status=${selectedStatus}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.data)
      }
    } catch (error) {
      console.error('Error fetching WhatsApp orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/whatsapp/orders/${orderId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          estimated_completion: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        })
      })

      if (response.ok) {
        await fetchOrders() // Refresh the list
        setSelectedOrder(null) // Close modal
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const getStatusOptions = (currentStatus: string) => {
    const statusFlow = {
      pending: ['received', 'cancelled'],
      received: ['preparing', 'cancelled'],
      preparing: ['ready_for_pickup', 'out_for_delivery', 'cancelled'],
      ready_for_pickup: ['delivered'],
      out_for_delivery: ['delivered'],
      delivered: [],
      cancelled: []
    }
    
    return statusFlow[currentStatus as keyof typeof statusFlow] || []
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <MessageCircle className="h-6 w-6 mr-2 text-green-600" />
          WhatsApp Orders
        </h2>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="received">Received</option>
          <option value="preparing">Preparing</option>
          <option value="ready_for_pickup">Ready for Pickup</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No WhatsApp orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                  const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Clock
                  const statusOptions = getStatusOptions(order.status)
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.order_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div className="font-medium">{order.user_id}</div>
                          {order.contact_phone && (
                            <div className="text-xs">{order.contact_phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.order_type === 'delivery' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {order.order_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status as keyof typeof statusColors]}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-chicken-red hover:text-chicken-red-dark"
                          >
                            View
                          </button>
                          {statusOptions.length > 0 && (
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  updateOrderStatus(order.order_id, e.target.value)
                                }
                              }}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                              defaultValue=""
                            >
                              <option value="">Update Status</option>
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {status.replace('_', ' ')}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Order Details - {selectedOrder.order_id}</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer</label>
                    <p className="text-sm text-gray-900">{selectedOrder.user_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900">{selectedOrder.contact_phone || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order Type</label>
                    <p className="text-sm text-gray-900 capitalize">{selectedOrder.order_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <p className="text-sm text-gray-900">{selectedOrder.payment_method}</p>
                  </div>
                </div>

                {selectedOrder.delivery_address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Delivery Address</label>
                    <p className="text-sm text-gray-900">{selectedOrder.delivery_address}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Items</label>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium">{item.product_name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          {item.special_instructions && (
                            <p className="text-xs text-gray-500">Note: {item.special_instructions}</p>
                          )}
                        </div>
                        <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedOrder.delivery_fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee:</span>
                      <span>${selectedOrder.delivery_fee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total:</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
