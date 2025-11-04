'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { Product } from '@/context/CartContext'

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    is_available: true,
  })
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?all=true')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
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
        setFormData(prev => ({ ...prev, image_url: result.imageUrl }))
        setShowImagePreview(true)
        // Show success message
        console.log('Image uploaded successfully:', result.imageUrl)
      } else {
        alert('Failed to upload image: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingProduct) {
        // Update existing product
        const response = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        
        if (response.ok) {
          await fetchProducts()
          setEditingProduct(null)
          resetForm()
        }
      } else {
        // Create new product
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        
        if (response.ok) {
          await fetchProducts()
          setIsAdding(false)
          resetForm()
        }
      }
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image_url: product.image_url || '',
      category: product.category,
      is_available: product.is_available ?? true,
    })
  }

  const handleDelete = async (productId: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          await fetchProducts()
        }
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category: '',
      is_available: true,
    })
    setEditingProduct(null)
    setIsAdding(false)
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
        <h2 className="text-xl font-semibold">Product Management</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingProduct) && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                required
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
                        : formData.image_url
                        ? 'border-green-300 bg-green-50 hover:border-green-400'
                        : 'border-gray-300 hover:border-chicken-red'
                    }`}
                  >
                    <div className="text-center">
                      {uploadingImage ? (
                        <span className="text-gray-500">Uploading...</span>
                      ) : formData.image_url ? (
                        <span className="text-green-600">✓ Image Uploaded</span>
                      ) : (
                        <span className="text-chicken-red">Choose Image File</span>
                      )}
                    </div>
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent ${
                      formData.image_url ? 'border-green-300 bg-green-50' : 'border-gray-300'
                    }`}
                    placeholder="Image URL or uploaded file path"
                  />
                  {formData.image_url && (
                    <button
                      type="button"
                      onClick={() => setShowImagePreview(!showImagePreview)}
                      className="px-3 py-2 text-sm text-chicken-red hover:text-red-700 border border-chicken-red rounded-lg hover:bg-red-50"
                    >
                      {showImagePreview ? 'Hide' : 'Preview'}
                    </button>
                  )}
                </div>
                
                {formData.image_url && (
                  <div className="text-xs text-green-600 flex items-center space-x-1">
                    <span>✓</span>
                    <span>Image ready</span>
                  </div>
                )}
                
                {showImagePreview && formData.image_url && (
                  <div className="mt-2">
                    <div className="w-32 h-32 rounded-lg overflow-hidden border">
                      <img 
                        src={formData.image_url} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                        Error
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-4 h-4 text-chicken-red border-gray-300 rounded focus:ring-chicken-red"
                />
                <span className="text-sm font-medium text-gray-700">Product is available</span>
              </label>
            </div>

            <div className="md:col-span-2 flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
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

      {/* Products List */}
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden border">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-full ${product.image_url ? 'hidden' : 'flex'} bg-chicken-yellow items-center justify-center`}>
                  <span className="text-2xl">🍗</span>
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-chicken-red font-bold">₹</span>
                    <input
                      type="number"
                      step="1"
                      defaultValue={Number(product.price).toFixed(0)}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-chicken-red focus:border-transparent"
                      onBlur={async (e) => {
                        const newPrice = parseFloat(e.target.value);
                        if (newPrice !== Number(product.price) && newPrice > 0) {
                          try {
                            await fetch(`/api/products/${product.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ 
                                ...product, 
                                price: newPrice,
                                name: product.name,
                                description: product.description,
                                image_url: product.image_url,
                                category: product.category,
                                is_available: product.is_available ?? true
                              }),
                            });
                            await fetchProducts();
                          } catch (error) {
                            console.error('Error updating price:', error);
                          }
                        }
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 capitalize">{product.category}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${product.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEdit(product)}
                className="p-2 text-chicken-yellow hover:bg-yellow-100 rounded-lg transition-colors"
                title="Edit Product"
              >
                <Edit size={20} />
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                title="Delete Product"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
