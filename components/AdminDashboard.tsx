'use client'

import { useEffect, useState } from 'react'
import { Package, ChefHat, ShoppingCart, DollarSign } from 'lucide-react'

interface DashboardStats {
  totalProducts: number
  totalRecipes: number
  totalOrders: number
  totalRevenue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalRecipes: 0,
    totalOrders: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [productsRes, recipesRes, ordersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/recipes'),
        fetch('/api/orders')
      ])
      
      const products = await productsRes.json()
      const recipes = await recipesRes.json()
      const orders = await ordersRes.json()
      
      const totalRevenue = orders.reduce((sum: number, order: any) => 
        sum + Number(order.total_amount), 0
      )
      
      setStats({
        totalProducts: products.length,
        totalRecipes: recipes.length,
        totalOrders: orders.length,
        totalRevenue
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-chicken-red bg-opacity-20 rounded-lg">
              <Package className="h-6 w-6 text-chicken-red" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-chicken-yellow bg-opacity-20 rounded-lg">
              <ChefHat className="h-6 w-6 text-chicken-yellow" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Recipes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRecipes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-chicken-orange bg-opacity-20 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-chicken-orange" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toFixed(0)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <h4 className="font-medium text-gray-900">Add New Product</h4>
            <p className="text-sm text-gray-600">Create a new chicken product</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <h4 className="font-medium text-gray-900">Add New Recipe</h4>
            <p className="text-sm text-gray-600">Add a cooking recipe</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <h4 className="font-medium text-gray-900">View Orders</h4>
            <p className="text-sm text-gray-600">Manage customer orders</p>
          </button>
        </div>
      </div>
    </div>
  )
}
