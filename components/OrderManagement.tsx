'use client'

import { useEffect, useState } from 'react'
import { Eye, Phone, MapPin, Clock, CheckCircle, Tag, Percent } from 'lucide-react'

interface Order {
  id: number
  customer_name: string
  customer_phone: string
  delivery_address: string
  delivery_type: string
  subtotal?: number
  delivery_charge?: number
  discount_amount?: number
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
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending')
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [discountInput, setDiscountInput] = useState('')
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed')

  useEffect(() => {
    // Clear any stale state on mount
    setOrders([])
    setSelectedOrder(null)
    
    // Fetch fresh orders
    fetchOrders()
    
    // Auto-refresh orders every 5 seconds
    const interval = setInterval(() => {
      fetchOrders()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      // Add timestamp and random number to prevent browser caching
      const timestamp = Date.now()
      const random = Math.random()
      const response = await fetch(`/api/orders?t=${timestamp}&r=${random}&_=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Requested-With': 'XMLHttpRequest',
        },
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      // Ensure data is an array
      const newOrders = Array.isArray(data) ? data : []
      console.log('📦 Fetched orders from API:', newOrders.length, 'orders')
      console.log('📦 Order IDs:', newOrders.map((o: Order) => o.id))
      
      // Always update orders, even if empty
      setOrders(newOrders)
      
      // Clear selected order if it no longer exists
      if (selectedOrder) {
        const updatedOrder = newOrders.find((o: Order) => o.id === selectedOrder.id)
        if (updatedOrder) {
          setSelectedOrder(updatedOrder)
        } else {
          console.log('🗑️ Clearing selected order (no longer exists)')
          setSelectedOrder(null)
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      // On error, set empty array to clear stale data
      console.log('🗑️ Clearing orders due to error')
      setOrders([])
      setSelectedOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const pendingOrders = Array.isArray(orders) ? orders.filter(order => 
    order.status !== 'delivered' && order.status !== 'cancelled'
  ) : []
  
  const completedOrders = Array.isArray(orders) ? orders.filter(order => 
    order.status === 'delivered' || order.status === 'cancelled'
  ) : []

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      
      if (response.ok) {
        const updatedOrder = await response.json()
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status, ...updatedOrder })
        }
        await fetchOrders()
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to update order status' }))
        alert(error.error || 'Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status. Please try again.')
    }
  }

  const applyDiscount = async () => {
    if (!selectedOrder) return

    const discountValue = parseFloat(discountInput)
    if (isNaN(discountValue) || discountValue < 0) {
      alert('Please enter a valid discount amount')
      return
    }

    let discountAmount = 0
    const subtotal = selectedOrder.subtotal || (selectedOrder.total_amount - (selectedOrder.delivery_charge || 0) + (selectedOrder.discount_amount || 0))

    if (discountType === 'percentage') {
      discountAmount = (subtotal * discountValue) / 100
      if (discountAmount > subtotal) {
        discountAmount = subtotal
      }
    } else {
      discountAmount = Math.min(discountValue, subtotal)
    }

    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discountAmount: Math.round(discountAmount * 100) / 100 }),
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setSelectedOrder(updatedOrder)
        await fetchOrders()
        setShowDiscountModal(false)
        setDiscountInput('')
        alert('Discount applied successfully!')
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to apply discount' }))
        alert(error.error || 'Failed to apply discount')
      }
    } catch (error) {
      console.error('Error applying discount:', error)
      alert('Failed to apply discount')
    }
  }

  const removeDiscount = async () => {
    if (!selectedOrder) return

    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discountAmount: 0 }),
      })

      if (response.ok) {
        await fetchOrders()
        const updatedOrder = await response.json()
        setSelectedOrder(updatedOrder)
        alert('Discount removed successfully!')
      } else {
        alert('Failed to remove discount')
      }
    } catch (error) {
      console.error('Error removing discount:', error)
      alert('Failed to remove discount')
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
        <div>
          <h2 className="text-xl font-semibold">Order Management</h2>
          <p className="text-xs text-gray-500 mt-1">Auto-refreshes every 5 seconds</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setLoading(true)
              fetchOrders()
            }}
            className="px-3 py-1.5 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-semibold"
            title="Refresh orders"
          >
            🔄 Refresh
          </button>
          <div className="text-sm text-gray-600">
            {pendingOrders.length} pending • {completedOrders.length} completed
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab('pending')
            setSelectedOrder(null)
          }}
          className={`pb-3 px-4 font-semibold transition-colors ${
            activeTab === 'pending'
              ? 'text-chicken-red border-b-2 border-chicken-red'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Pending Orders ({pendingOrders.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('completed')
            setSelectedOrder(null)
          }}
          className={`pb-3 px-4 font-semibold transition-colors ${
            activeTab === 'completed'
              ? 'text-chicken-red border-b-2 border-chicken-red'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Completed Orders ({completedOrders.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders List */}
        <div>
          <h3 className="text-lg font-medium mb-4">
            {activeTab === 'pending' ? 'Pending Orders' : 'Completed Orders'}
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {(activeTab === 'pending' ? pendingOrders : completedOrders).map((order) => (
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
                        ? 'Shop No. 4, 24K Avenue, New DP Rd, Kolte Patil, Vishal Nagar, Pimple Nilakh, Pimpri-Chinchwad, Pune, Maharashtra 411027' 
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
                  {selectedOrder.items && selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.product_name} x {item.quantity}</span>
                      <span>₹{(Number(item.price) * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>₹{Number(selectedOrder.subtotal || selectedOrder.total_amount - (selectedOrder.delivery_charge || 0) + (selectedOrder.discount_amount || 0)).toFixed(0)}</span>
                  </div>
                  {(selectedOrder.discount_amount || 0) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span className="font-semibold">-₹{Number(selectedOrder.discount_amount || 0).toFixed(0)}</span>
                    </div>
                  )}
                  {selectedOrder.delivery_type === 'delivery' && (selectedOrder.delivery_charge || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Charge:</span>
                      <span>₹{Number(selectedOrder.delivery_charge || 0).toFixed(0)}</span>
                    </div>
                  )}
                  {selectedOrder.delivery_type === 'delivery' && (selectedOrder.delivery_charge || 0) === 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Charge:</span>
                      <span className="text-green-600">FREE</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold pt-1">
                    <span>Total:</span>
                    <span>₹{Number(selectedOrder.total_amount).toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* Discount Management */}
              <div className="mb-6">
                <h4 className="font-semibold mb-2 flex items-center space-x-2">
                  <Tag className="h-4 w-4" />
                  <span>Discount Management</span>
                </h4>
                {(selectedOrder.discount_amount || 0) > 0 ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-green-800">Discount Applied</p>
                        <p className="text-lg font-bold text-green-600">-₹{Number(selectedOrder.discount_amount || 0).toFixed(0)}</p>
                      </div>
                      <button
                        onClick={removeDiscount}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDiscountModal(true)}
                    className="w-full px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold text-sm flex items-center justify-center space-x-2"
                  >
                    <Percent className="h-4 w-4" />
                    <span>Apply Discount</span>
                  </button>
                )}
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

      {/* Discount Modal */}
      {showDiscountModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Apply Discount</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="fixed"
                    checked={discountType === 'fixed'}
                    onChange={(e) => setDiscountType(e.target.value as 'fixed' | 'percentage')}
                    className="mr-2"
                  />
                  <span>Fixed Amount (₹)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="percentage"
                    checked={discountType === 'percentage'}
                    onChange={(e) => setDiscountType(e.target.value as 'fixed' | 'percentage')}
                    className="mr-2"
                  />
                  <span>Percentage (%)</span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount {discountType === 'percentage' ? 'Percentage' : 'Amount'}
              </label>
              <input
                type="number"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                placeholder={discountType === 'percentage' ? 'Enter percentage (e.g., 10)' : 'Enter amount (e.g., 50)'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                min="0"
                step={discountType === 'percentage' ? '0.1' : '1'}
              />
              {discountType === 'percentage' && discountInput && (
                <p className="text-xs text-gray-500 mt-1">
                  Discount: ₹{((Number(selectedOrder.subtotal || selectedOrder.total_amount - (selectedOrder.delivery_charge || 0) + (selectedOrder.discount_amount || 0)) * parseFloat(discountInput || '0')) / 100).toFixed(0)}
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDiscountModal(false)
                  setDiscountInput('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyDiscount}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold"
              >
                Apply Discount
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
