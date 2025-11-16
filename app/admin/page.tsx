'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Package, ChefHat, ShoppingCart, MessageCircle, LogOut, User, Warehouse, Settings, Tag, X } from 'lucide-react'
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
        
        const userData = await response.json()
        console.log('Admin auth check response:', { status: response.status, data: userData })
        
        if (response.ok && userData.success && userData.user) {
          setUser(userData.user)
          setIsLoading(false)
        } else {
          // Invalid response, redirect to login
          console.log('Auth check failed, redirecting to login')
          window.location.href = '/admin/login'
          return
        }
      } catch (error) {
        console.error('Auth check error:', error)
        window.location.href = '/admin/login'
        return
      }
    }

    checkAuth()
  }, [])

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50">
      {/* Order Notification Alert */}
      {showOrderNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-white rounded-xl shadow-lg border-l-4 border-orange-500 px-4 py-3 flex items-center space-x-3 min-w-[280px] animate-pulse">
            <div className="text-2xl">🔔</div>
            <div className="flex-grow">
              <div className="font-semibold text-gray-900 text-sm">New Order!</div>
              <div className="text-xs text-gray-600">
                {newOrderCount} new order{newOrderCount > 1 ? 's' : ''} arrived
              </div>
            </div>
            <button
              onClick={() => setShowOrderNotification(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Admin Header */}
      <div className="bg-white/70 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 sm:py-4 gap-3">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img 
                  src="/logo.svg" 
                  alt="K2 Chicken" 
                  className="h-8 sm:h-10 w-auto"
                />
                <div className="text-xs font-medium text-orange-600 mt-0.5" style={{ marginLeft: '28px' }}>
                  K2 Chicken
                </div>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">
                  Admin Console
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-orange-600" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-medium text-gray-700">{user.username}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 mb-5 overflow-hidden">
          <nav className="flex space-x-0.5 p-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isOrdersTab = tab.id === 'orders'
              const showBadge = isOrdersTab && newOrdersCount > 0 && activeTab !== 'orders'
              
              return (
                <button
                  key={tab.id}
                  onClick={() => isOrdersTab ? handleOrdersTabClick() : setActiveTab(tab.id as TabType)}
                  className={`relative flex items-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} className={activeTab === tab.id ? 'text-orange-600' : 'text-gray-400'} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {showBadge && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                      {newOrdersCount > 99 ? '99+' : newOrdersCount}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-5">
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
    </div>
  )
}
