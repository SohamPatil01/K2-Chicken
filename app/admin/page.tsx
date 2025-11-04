'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Package, ChefHat, ShoppingCart, MessageCircle, LogOut, User, Warehouse } from 'lucide-react'
import ProductManagement from '@/components/ProductManagement'
import RecipeManagement from '@/components/RecipeManagement'
import OrderManagement from '@/components/OrderManagement'
import WhatsAppOrderManagement from '@/components/WhatsAppOrderManagement'
import AdminDashboard from '@/components/AdminDashboard'
import InventoryManagement from '@/components/InventoryManagement'

type TabType = 'dashboard' | 'products' | 'recipes' | 'orders' | 'whatsapp' | 'inventory'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newOrdersCount, setNewOrdersCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        // Try to get user info from the server
        const response = await fetch('/api/admin/me', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        } else {
          // If not authenticated, redirect to login
          router.push('/admin/login')
          return
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/admin/login')
        return
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  // Fetch new orders count periodically
  useEffect(() => {
    const fetchNewOrdersCount = async () => {
      try {
        const response = await fetch('/api/orders/new/count')
        const data = await response.json()
        setNewOrdersCount(data.count || 0)
      } catch (error) {
        console.error('Error fetching new orders count:', error)
      }
    }

    // Fetch immediately
    fetchNewOrdersCount()

    // Poll every 10 seconds for new orders
    const interval = setInterval(fetchNewOrdersCount, 10000)

    return () => clearInterval(interval)
  }, [])

  // Reset count when Orders tab is clicked
  const handleOrdersTabClick = () => {
    setActiveTab('orders')
    setNewOrdersCount(0)
  }

  const handleLogout = async () => {
    try {
      // Call logout API to clear cookie
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    router.push('/admin/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="flex flex-col items-center mb-6">
            <div className="relative inline-block">
              <img 
                src="/logo.svg" 
                alt="Chicken Vicken" 
                className="h-20 w-auto mb-2"
              />
              <div className="text-base font-semibold text-[#FF6B35]" style={{ marginLeft: '63px' }}>
                K2 Chicken
              </div>
            </div>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-200 border-t-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading Admin Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Package },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'recipes', label: 'Recipes', icon: ChefHat },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'whatsapp', label: 'WhatsApp Orders', icon: MessageCircle },
    { id: 'inventory', label: 'Inventory', icon: Warehouse },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/20">
      {/* Admin Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-2xl border-b border-orange-200/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="relative inline-block">
                <img 
                  src="/logo.svg" 
                  alt="Chicken Vicken" 
                  className="h-14 w-auto"
                />
                <div className="text-sm font-semibold text-[#FF6B35] mt-1" style={{ marginLeft: '44px' }}>
                  K2 Chicken
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600 font-medium">K2 Chicken Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl border border-orange-200">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Welcome back!</p>
                  <p className="text-xs text-gray-600">{user.username}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 p-2">
            <nav className="flex space-x-2 px-4">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isOrdersTab = tab.id === 'orders'
                const showBadge = isOrdersTab && newOrdersCount > 0 && activeTab !== 'orders'
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => isOrdersTab ? handleOrdersTabClick() : setActiveTab(tab.id as TabType)}
                    className={`relative flex items-center space-x-3 py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                        : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50 hover:scale-105'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{tab.label}</span>
                    {showBadge && (
                      <span className="order-badge-flash absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full min-w-[24px] h-6 px-1.5 flex items-center justify-center border-2 border-white z-10">
                        {newOrdersCount > 99 ? '99+' : newOrdersCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'recipes' && <RecipeManagement />}
          {activeTab === 'orders' && <OrderManagement />}
          {activeTab === 'whatsapp' && <WhatsAppOrderManagement />}
          {activeTab === 'inventory' && <InventoryManagement />}
        </div>
      </div>
    </div>
  )
}
