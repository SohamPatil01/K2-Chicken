'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/context/CartContext'
import { Product } from '@/context/CartContext'
import { Plus, Minus } from 'lucide-react'

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { state, dispatch } = useCart()

  useEffect(() => {
    fetchProducts()
  }, [])

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
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Delicious Products</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fresh, crispy, and absolutely delicious chicken made with love and our secret recipes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const cartQuantity = getCartQuantity(product.id)
            
            return (
              <div key={product.id} className="card hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <div className="w-full h-48 rounded-lg overflow-hidden">
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
                      <span className="text-6xl">🍗</span>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-chicken-red">
                    ₹{Number(product.price).toFixed(0)}
                  </span>
                  <span className="text-sm text-gray-500 capitalize">
                    {product.category}
                  </span>
                </div>

                {cartQuantity === 0 ? (
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    <Plus size={20} />
                    <span>Add to Cart</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(product.id, cartQuantity - 1)}
                        className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-semibold">{cartQuantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, cartQuantity + 1)}
                        className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <span className="text-chicken-red font-bold">
                      ₹{(Number(product.price) * cartQuantity).toFixed(0)}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
