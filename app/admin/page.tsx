'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Package, ChefHat, ShoppingCart, MessageCircle, LogOut, User, Warehouse, Settings, Tag } from 'lucide-react'
import ProductManagement from '@/components/ProductManagement'
import RecipeManagement from '@/components/RecipeManagement'
import OrderManagement from '@/components/OrderManagement'
import AdminDashboard from '@/components/AdminDashboard'
import InventoryManagement from '@/components/InventoryManagement'
import SettingsManagement from '@/components/SettingsManagement'
import PromotionManagement from '@/components/PromotionManagement'

type TabType = 'dashboard' | 'products' | 'recipes' | 'orders' | 'whatsapp' | 'inventory' | 'settings' | 'promotions'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newOrdersCount, setNewOrdersCount] = useState(0)
  const [previousOrdersCount, setPreviousOrdersCount] = useState(0)
  const [showOrderNotification, setShowOrderNotification] = useState(false)
  const [newOrderCount, setNewOrderCount] = useState(0)
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
        const count = data.count || 0
        
        // Check if new orders arrived
        if (count > previousOrdersCount && previousOrdersCount > 0) {
          const newOrders = count - previousOrdersCount
          setNewOrderCount(newOrders)
          triggerOrderAlarm(newOrders)
        }
        
        setNewOrdersCount(count)
        setPreviousOrdersCount(count)
      } catch (error) {
        console.error('Error fetching new orders count:', error)
      }
    }

    // Fetch immediately
    fetchNewOrdersCount()

    // Poll every 10 seconds for new orders
    const interval = setInterval(fetchNewOrdersCount, 10000)

    return () => clearInterval(interval)
  }, [previousOrdersCount])

  // Function to trigger alarm/buzzer when new orders arrive
  const triggerOrderAlarm = (orderCount: number) => {
    // Play alarm sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Create a buzzer-like sound (beep pattern)
    const beepPattern = [200, 150, 200, 150, 200] // Frequency pattern in Hz
    let currentBeep = 0
    
    const playBeep = () => {
      if (currentBeep >= beepPattern.length) {
        audioContext.close()
        return
      }
      
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = beepPattern[currentBeep]
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
      
      currentBeep++
      setTimeout(playBeep, 250)
    }
    
    playBeep()
    
    // Show visual notification
    setShowOrderNotification(true)
    setTimeout(() => {
      setShowOrderNotification(false)
    }, 5000)
    
    // Also try to request browser notification permission and show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`New Order Alert! 🍗`, {
        body: `${orderCount} new order${orderCount > 1 ? 's' : ''} has arrived!`,
        icon: '/logo.svg',
        badge: '/logo.svg',
        tag: 'new-order',
        requireInteraction: false,
      })
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(`New Order Alert! 🍗`, {
            body: `${orderCount} new order${orderCount > 1 ? 's' : ''} has arrived!`,
            icon: '/logo.svg',
            badge: '/logo.svg',
          })
        }
      })
    }
  }

  // Reset count when Orders tab is clicked
  const handleOrdersTabClick = () => {
    setActiveTab('orders')
    setNewOrdersCount(0)
    setPreviousOrdersCount(0)
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/20 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="flex flex-col items-center mb-4 sm:mb-6">
            <div className="relative inline-block">
              <img 
                src="/logo.svg" 
                alt="K2 Chicken" 
                className="h-16 sm:h-20 w-auto mb-2"
              />
              <div className="text-sm sm:text-base font-semibold text-[#FF6B35]" style={{ marginLeft: '50px' }}>
                K2 Chicken
              </div>
            </div>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-200 border-t-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold text-sm sm:text-base">Loading Admin Dashboard...</p>
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
    { id: 'inventory', label: 'Inventory', icon: Warehouse },
    { id: 'promotions', label: 'Promotions', icon: Tag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/20">
      {/* Order Notification Alert */}
      {showOrderNotification && (
        <div className="fixed top-16 sm:top-20 right-2 sm:right-4 left-2 sm:left-auto z-50 animate-bounce">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl border-2 border-white flex items-center space-x-2 sm:space-x-3 max-w-[300px] sm:min-w-[300px] mx-auto sm:mx-0">
            <div className="text-2xl sm:text-3xl animate-pulse flex-shrink-0">🔔</div>
            <div className="flex-grow min-w-0">
              <div className="font-bold text-base sm:text-lg">New Order Alert!</div>
              <div className="text-xs sm:text-sm opacity-90">
                {newOrderCount} new order{newOrderCount > 1 ? 's' : ''} has arrived!
              </div>
            </div>
            <button
              onClick={() => setShowOrderNotification(false)}
              className="ml-auto text-white hover:text-gray-200 flex-shrink-0 text-lg sm:text-xl min-h-[44px] min-w-[44px] items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Admin Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-2xl border-b border-orange-200/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative inline-block">
                <img 
                  src="/logo.svg" 
                  alt="K2 Chicken" 
                  className="h-10 sm:h-14 w-auto"
                />
                <div className="text-xs sm:text-sm font-semibold text-[#FF6B35] mt-0.5 sm:mt-1" style={{ marginLeft: '32px' }}>
                  K2 Chicken
                </div>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 font-medium hidden sm:block">K2 Chicken Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              <div className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl sm:rounded-2xl border border-orange-200">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs sm:text-sm font-semibold text-gray-800">Welcome back!</p>
                  <p className="text-xs text-gray-600">{user.username}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl sm:rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold text-xs sm:text-sm min-h-[44px]"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 mb-4 sm:mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 p-1 sm:p-2">
            <nav className="flex space-x-1 sm:space-x-2 px-2 sm:px-4 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isOrdersTab = tab.id === 'orders'
                const showBadge = isOrdersTab && newOrdersCount > 0 && activeTab !== 'orders'
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => isOrdersTab ? handleOrdersTabClick() : setActiveTab(tab.id as TabType)}
                    className={`relative flex items-center space-x-1 sm:space-x-2 md:space-x-3 py-2 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap min-h-[44px] ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                        : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50 hover:scale-105'
                    }`}
                  >
                    <Icon size={16} className="sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {showBadge && (
                      <span className="order-badge-flash absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full min-w-[20px] sm:min-w-[24px] h-5 sm:h-6 px-1 sm:px-1.5 flex items-center justify-center border-2 border-white z-10">
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
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden p-4 sm:p-6">
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'recipes' && <RecipeManagement />}
          {activeTab === 'orders' && <OrderManagement />}
          {activeTab === 'inventory' && <InventoryManagement />}
          {activeTab === 'promotions' && <PromotionManagement />}
          {activeTab === 'settings' && <SettingsManagement />}
        </div>
      </div>
    </div>
  )
}
