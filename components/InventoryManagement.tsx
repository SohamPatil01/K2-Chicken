'use client'

import { useEffect, useState } from 'react'
import { Package, AlertTriangle, CheckCircle, TrendingDown, Edit2, Save, X, History, Plus, Trash2 } from 'lucide-react'

interface InventoryItem {
  id: number
  product_id: number
  product_name: string
  product_category: string
  product_image_url: string
  quantity: number
  reserved_quantity: number
  available_quantity: number
  minimum_stock_level: number
  stock_status: 'low' | 'medium' | 'good'
}

interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  category: string
  is_available: boolean
}

interface InventoryHistory {
  id: number
  product_id: number
  product_name: string
  change_type: string
  quantity_change: number
  previous_quantity: number
  new_quantity: number
  notes: string
  created_at: string
}

export default function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingInventoryItem, setEditingInventoryItem] = useState<number | null>(null)
  const [editInventoryValues, setEditInventoryValues] = useState<{ quantity: number; minimum_stock_level: number } | null>(null)
  const [editingProduct, setEditingProduct] = useState<InventoryItem | null>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    is_available: true,
    quantity: 0,
    minimum_stock_level: 10,
  })
  const [history, setHistory] = useState<InventoryHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory')
      const data = await response.json()
      setInventory(data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async (productId: number) => {
    try {
      const response = await fetch(`/api/inventory/history?product_id=${productId}&limit=20`)
      const data = await response.json()
      setHistory(data)
      setSelectedProductId(productId)
      setShowHistory(true)
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  // Inventory quantity editing
  const handleEditInventory = (item: InventoryItem) => {
    setEditingInventoryItem(item.id)
    setEditInventoryValues({
      quantity: item.quantity,
      minimum_stock_level: item.minimum_stock_level
    })
  }

  const handleSaveInventory = async (item: InventoryItem) => {
    if (!editInventoryValues) return

    try {
      const response = await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: item.product_id,
          quantity: editInventoryValues.quantity,
          minimum_stock_level: editInventoryValues.minimum_stock_level,
          notes: `Manual adjustment by admin`
        })
      })

      if (response.ok) {
        await fetchInventory()
        setEditingInventoryItem(null)
        setEditInventoryValues(null)
      } else {
        const error = await response.json()
        alert('Failed to update inventory: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating inventory:', error)
      alert('Failed to update inventory')
    }
  }

  const handleCancelInventory = () => {
    setEditingInventoryItem(null)
    setEditInventoryValues(null)
  }

  // Product CRUD operations
  const handleAddProduct = () => {
    setIsAddingProduct(true)
    setProductFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category: '',
      is_available: true,
      quantity: 0,
      minimum_stock_level: 10,
    })
  }

  const handleEditProduct = async (item: InventoryItem) => {
    setEditingProduct(item)
    try {
      // Fetch full product details
      const response = await fetch(`/api/products/${item.product_id}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.statusText}`)
      }
      
      const product = await response.json()
      
      if (product.error) {
        throw new Error(product.error)
      }
      
      setProductFormData({
        name: product.name || item.product_name,
        description: product.description || '',
        price: product.price !== null && product.price !== undefined ? product.price.toString() : '',
        image_url: product.image_url || item.product_image_url || '',
        category: product.category || item.product_category,
        is_available: product.is_available ?? true,
        quantity: item.quantity,
        minimum_stock_level: item.minimum_stock_level,
      })
    } catch (error: any) {
      console.error('Error fetching product details:', error)
      // Fallback to inventory item data
      setProductFormData({
        name: item.product_name,
        description: '',
        price: '',
        image_url: item.product_image_url || '',
        category: item.product_category,
        is_available: true,
        quantity: item.quantity,
        minimum_stock_level: item.minimum_stock_level,
      })
      alert('Warning: Could not fetch full product details. Using available information.')
    }
  }

  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (confirm(`Are you sure you want to delete "${productName}"? This will also delete its inventory record.\n\nNote: Order history will be preserved but product references will be removed.`)) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        })

        const result = await response.json()

        if (response.ok) {
          await fetchInventory()
        } else {
          alert('Failed to delete product: ' + (result.error || 'Unknown error'))
        }
      } catch (error: any) {
        console.error('Error deleting product:', error)
        alert('Failed to delete product: ' + (error.message || 'Network error'))
      }
    }
  }

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setProductFormData(prev => ({ ...prev, image_url: result.imageUrl }))
        setShowImagePreview(true)
      } else {
        alert('Failed to upload image: ' + (result.error || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      alert('Failed to upload image: ' + error.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingProduct) {
        // Update existing product
        const productResponse = await fetch(`/api/products/${editingProduct.product_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: productFormData.name,
            description: productFormData.description,
            price: productFormData.price ? parseFloat(productFormData.price) : 0,
            image_url: productFormData.image_url,
            category: productFormData.category,
            is_available: productFormData.is_available,
          }),
        })

        if (!productResponse.ok) {
          const error = await productResponse.json()
          throw new Error(error.error || 'Failed to update product')
        }

        // Update inventory
        const inventoryResponse = await fetch('/api/inventory', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: editingProduct.product_id,
            quantity: productFormData.quantity,
            minimum_stock_level: productFormData.minimum_stock_level,
            notes: 'Updated via product edit'
          }),
        })

        if (!inventoryResponse.ok) {
          const error = await inventoryResponse.json()
          throw new Error(error.error || 'Failed to update inventory')
        }

        await fetchInventory()
        setEditingProduct(null)
        resetProductForm()
      } else {
        // Create new product
        const productResponse = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: productFormData.name,
            description: productFormData.description,
            price: productFormData.price ? parseFloat(productFormData.price) : 0,
            image_url: productFormData.image_url,
            category: productFormData.category,
            is_available: productFormData.is_available,
          }),
        })

        if (!productResponse.ok) {
          const error = await productResponse.json()
          throw new Error(error.error || 'Failed to create product')
        }

        const newProduct = await productResponse.json()

        // Create inventory record for the new product
        const inventoryResponse = await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: newProduct.id,
            quantity: productFormData.quantity,
            minimum_stock_level: productFormData.minimum_stock_level,
          }),
        })

        if (!inventoryResponse.ok) {
          const error = await inventoryResponse.json()
          throw new Error(error.error || 'Failed to create inventory')
        }

        await fetchInventory()
        setIsAddingProduct(false)
        resetProductForm()
      }
    } catch (error: any) {
      console.error('Error saving product:', error)
      alert('Failed to save product: ' + error.message)
    }
  }

  const resetProductForm = () => {
    setProductFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category: '',
      is_available: true,
      quantity: 0,
      minimum_stock_level: 10,
    })
    setEditingProduct(null)
    setIsAddingProduct(false)
    setShowImagePreview(false)
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'low':
        return 'text-red-600 bg-red-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'good':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStockStatusIcon = (status: string) => {
    switch (status) {
      case 'low':
        return <AlertTriangle size={16} className="text-red-600" />
      case 'medium':
        return <TrendingDown size={16} className="text-yellow-600" />
      case 'good':
        return <CheckCircle size={16} className="text-green-600" />
      default:
        return <Package size={16} />
    }
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

  const lowStockItems = inventory.filter(item => item.stock_status === 'low')
  const mediumStockItems = inventory.filter(item => item.stock_status === 'medium')

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Inventory Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleAddProduct}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Product</span>
          </button>
          <button
            onClick={fetchInventory}
            className="px-4 py-2 bg-chicken-red text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Add/Edit Product Form */}
      {(isAddingProduct || editingProduct) && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h3>

          <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={productFormData.name}
                onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={productFormData.category}
                onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                <option value="main">Main Course</option>
                <option value="appetizer">Appetizer</option>
                <option value="side">Side Dish</option>
                <option value="beverage">Beverage</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                value={productFormData.price}
                onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Stock Quantity
              </label>
              <input
                type="number"
                value={productFormData.quantity}
                onChange={(e) => setProductFormData({ ...productFormData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Stock Level
              </label>
              <input
                type="number"
                value={productFormData.minimum_stock_level}
                onChange={(e) => setProductFormData({ ...productFormData, minimum_stock_level: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                    disabled={uploadingImage}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex-1 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      uploadingImage
                        ? 'opacity-50 cursor-not-allowed border-gray-300'
                        : productFormData.image_url
                        ? 'border-green-300 bg-green-50 hover:border-green-400'
                        : 'border-gray-300 hover:border-chicken-red'
                    }`}
                  >
                    <div className="text-center">
                      {uploadingImage ? (
                        <span className="text-gray-500">Uploading...</span>
                      ) : productFormData.image_url ? (
                        <span className="text-green-600">✓ Image Uploaded</span>
                      ) : (
                        <span className="text-chicken-red">Choose Image File</span>
                      )}
                    </div>
                  </label>
                </div>
                <input
                  type="text"
                  value={productFormData.image_url}
                  onChange={(e) => setProductFormData({ ...productFormData, image_url: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent ${
                    productFormData.image_url ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  }`}
                  placeholder="Image URL or uploaded file path"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={productFormData.description}
                onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={productFormData.is_available}
                  onChange={(e) => setProductFormData({ ...productFormData, is_available: e.target.checked })}
                  className="w-4 h-4 text-chicken-red border-gray-300 rounded focus:ring-chicken-red"
                />
                <span className="text-sm font-medium text-gray-700">Product is available</span>
              </label>
            </div>

            <div className="md:col-span-2 flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetProductForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
              >
                <Save size={20} />
                <span>{editingProduct ? 'Update' : 'Create'} Product</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stock Alerts */}
      {(lowStockItems.length > 0 || mediumStockItems.length > 0) && (
        <div className="mb-6 space-y-2">
          {lowStockItems.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="text-red-600" size={20} />
                <span className="font-semibold text-red-800">
                  {lowStockItems.length} product(s) are low on stock
                </span>
              </div>
            </div>
          )}
          {mediumStockItems.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <TrendingDown className="text-yellow-600" size={20} />
                <span className="font-semibold text-yellow-800">
                  {mediumStockItems.length} product(s) are running low
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inventory List */}
      <div className="space-y-4">
        {inventory.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-16 h-16 rounded-lg overflow-hidden border">
                {item.product_image_url ? (
                  <img
                    src={item.product_image_url}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div className={`w-full h-full ${item.product_image_url ? 'hidden' : 'flex'} bg-chicken-yellow items-center justify-center`}>
                  <span className="text-2xl">🍗</span>
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                <p className="text-sm text-gray-600 capitalize">{item.product_category}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    {getStockStatusIcon(item.stock_status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(item.stock_status)}`}>
                      {item.stock_status.toUpperCase()} STOCK
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Inventory Details */}
              <div className="text-right">
                {editingInventoryItem === item.id ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-600">Quantity</label>
                      <input
                        type="number"
                        value={editInventoryValues?.quantity || 0}
                        onChange={(e) => setEditInventoryValues({ ...editInventoryValues!, quantity: parseInt(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-chicken-red focus:border-transparent"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Min Level</label>
                      <input
                        type="number"
                        value={editInventoryValues?.minimum_stock_level || 0}
                        onChange={(e) => setEditInventoryValues({ ...editInventoryValues!, minimum_stock_level: parseInt(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-chicken-red focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div>
                      <span className="text-xs text-gray-600">Total: </span>
                      <span className="font-semibold">{item.quantity}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">Available: </span>
                      <span className={`font-semibold ${
                        item.available_quantity <= item.minimum_stock_level ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {item.available_quantity}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">Min Level: </span>
                      <span className="font-semibold">{item.minimum_stock_level}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {editingInventoryItem === item.id ? (
                  <>
                    <button
                      onClick={() => handleSaveInventory(item)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      title="Save Inventory"
                    >
                      <Save size={20} />
                    </button>
                    <button
                      onClick={handleCancelInventory}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <X size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditInventory(item)}
                      className="p-2 text-chicken-yellow hover:bg-yellow-100 rounded-lg transition-colors"
                      title="Edit Inventory Quantity"
                    >
                      <TrendingDown size={20} />
                    </button>
                    <button
                      onClick={() => handleEditProduct(item)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit Product Details"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => fetchHistory(item.product_id)}
                      className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                      title="View History"
                    >
                      <History size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(item.product_id, item.product_name)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Inventory History
                {selectedProductId && (
                  <span className="text-sm text-gray-600 ml-2">
                    (Product ID: {selectedProductId})
                  </span>
                )}
              </h3>
              <button
                onClick={() => {
                  setShowHistory(false)
                  setHistory([])
                  setSelectedProductId(null)
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-2">
              {history.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No history available</p>
              ) : (
                history.map((entry) => (
                  <div
                    key={entry.id}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{entry.product_name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {entry.change_type === 'delivery_deduction' ? '📦 Delivery' :
                           entry.change_type === 'adjustment' ? '✏️ Adjustment' :
                           entry.change_type}
                        </div>
                        {entry.notes && (
                          <div className="text-xs text-gray-500 mt-1">{entry.notes}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${entry.quantity_change < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {entry.quantity_change > 0 ? '+' : ''}{entry.quantity_change}
                        </div>
                        <div className="text-xs text-gray-600">
                          {entry.previous_quantity} → {entry.new_quantity}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(entry.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
