'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/context/CartContext'
import { Product } from '@/context/CartContext'
import { Plus, Minus, Search, Filter, Star } from 'lucide-react'
// import { motion, AnimatePresence } from 'framer-motion'

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { state, dispatch } = useCart()

  // Bestseller products (you can make this dynamic based on order data)
  const bestsellerIds = [1, 2, 3] // Chicken Breast, Chicken Curry Cut, Chicken Wings

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, selectedCategory])

  const filterProducts = () => {
    let filtered = products

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    setFilteredProducts(filtered)
  }

  const getCategories = () => {
    const categories = ['all', ...new Set(products.map(p => p.category))]
    return categories
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity: 1 } })
    
    // Add haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  const updateQuantity = (productId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } })
  }

  const getCartQuantity = (productId: number) => {
    const item = state.items.find(item => item.product.id === productId)
    return item ? item.quantity : 0
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Delicious Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>Fresh Daily</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Our <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Delicious</span> Products
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Handcrafted with premium ingredients and our secret family recipes. 
            Every bite is a journey of flavor and satisfaction.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="text"
                placeholder="Search for your favorite chicken..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center gap-3">
              <Filter className="text-gray-400 h-5 w-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/50 backdrop-blur-sm font-medium"
              >
                {getCategories().map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => {
            const cartQuantity = getCartQuantity(product.id)
            const isBestseller = bestsellerIds.includes(product.id)
            
            return (
              <div 
                key={product.id}
                className="group bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden relative border border-white/20 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 hover:border-orange-200"
              >
                {/* Bestseller Badge */}
                {isBestseller && (
                  <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg animate-pulse">
                    <Star className="h-4 w-4 fill-current" />
                    🔥 Bestseller
                  </div>
                )}

                {/* Product Image */}
                <div className="relative h-64 overflow-hidden">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full ${product.image_url ? 'hidden' : 'flex'} bg-gradient-to-br from-orange-100 to-red-100 items-center justify-center`}>
                    <span className="text-8xl group-hover:scale-110 transition-transform duration-300">🍗</span>
                  </div>
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* Product Info */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 capitalize bg-gray-100 px-3 py-1 rounded-full font-medium">
                      {product.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                        ₹{Number(product.price).toFixed(0)}
                      </span>
                      <span className="text-sm text-gray-500">per piece</span>
                    </div>
                  </div>

                  {/* Cart Controls */}
                  <div className="pt-4 border-t border-gray-100">
                    {cartQuantity === 0 ? (
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
                      >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span>Add to Cart</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(product.id, cartQuantity - 1)}
                            className="w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
                          >
                            <Minus size={16} />
                          </button>
                          <div className="w-12 h-10 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                            <span className="font-bold text-lg text-gray-800">
                              {cartQuantity}
                            </span>
                          </div>
                          <button
                            onClick={() => updateQuantity(product.id, cartQuantity + 1)}
                            className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                            ₹{(Number(product.price) * cartQuantity).toFixed(0)}
                          </div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* No Results Message */}
        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto border border-white/20 shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No products found</h3>
              <p className="text-gray-600 mb-6">We couldn't find any products matching your search criteria.</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
