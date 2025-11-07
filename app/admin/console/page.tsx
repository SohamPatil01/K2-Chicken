'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Package, 
  ChefHat, 
  ShoppingCart, 
  MessageCircle, 
  LogOut, 
  User, 
  Warehouse, 
  Settings,
  BarChart3,
  TrendingUp,
  Clock,
  DollarSign,
  Tag
} from 'lucide-react'
import ProductManagement from '@/components/ProductManagement'
import RecipeManagement from '@/components/RecipeManagement'
import OrderManagement from '@/components/OrderManagement'
import WhatsAppOrderManagement from '@/components/WhatsAppOrderManagement'
import AdminDashboard from '@/components/AdminDashboard'
import InventoryManagement from '@/components/InventoryManagement'
import SettingsManagement from '@/components/SettingsManagement'
import PromotionManagement from '@/components/PromotionManagement'

type TabType = 'dashboard' | 'products' | 'recipes' | 'orders' | 'whatsapp' | 'inventory' | 'settings' | 'promotions'

export default function AdminConsole() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newOrdersCount, setNewOrdersCount] = useState(0)
  const [previousOrdersCount, setPreviousOrdersCount] = useState(0)
  const [showOrderNotification, setShowOrderNotification] = useState(false)
  const [newOrderCount, setNewOrderCount] = useState(0)
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  })
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/me', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        } else {
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

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes] = await Promise.all([
          fetch('/api/orders')
        ])
        
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json()
          const orders = Array.isArray(ordersData) ? ordersData : []
          
          const pending = orders.filter((o: any) => o.status !== 'delivered' && o.status !== 'cancelled').length
          const completed = orders.filter((o: any) => o.status === 'delivered').length
          const revenue = orders
            .filter((o: any) => o.status === 'delivered')
            .reduce((sum: number, o: any) => sum + (parseFloat(o.total_amount) || 0), 0)
          
          setStats({
            totalOrders: orders.length,
            pendingOrders: pending,
            completedOrders: completed,
            totalRevenue: revenue
          })
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    if (user) {
      fetchStats()
      const interval = setInterval(fetchStats, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [user])

  // Fetch new orders count periodically
  useEffect(() => {
    const fetchNewOrdersCount = async () => {
      try {
        const response = await fetch('/api/orders/new/count')
        const data = await response.json()
        const count = data.count || 0
        
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

    if (user) {
      fetchNewOrdersCount()
      const interval = setInterval(fetchNewOrdersCount, 10000)
      return () => clearInterval(interval)
    }
  }, [previousOrdersCount, user])

  const triggerOrderAlarm = (orderCount: number) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const beepPattern = [200, 150, 200, 150, 200]
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
    
    setShowOrderNotification(true)
    setTimeout(() => {
      setShowOrderNotification(false)
    }, 5000)
    
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

  const handleOrdersTabClick = () => {
    setActiveTab('orders')
    setNewOrdersCount(0)
    setPreviousOrdersCount(0)
  }

  const handleLogout = async () => {
    try {
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-300 font-semibold">Loading Admin Console...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'recipes', label: 'Recipes', icon: ChefHat },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'inventory', label: 'Inventory', icon: Warehouse },
    { id: 'promotions', label: 'Promotions', icon: Tag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100">
      {/* Order Notification Alert */}
      {showOrderNotification && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4 rounded-lg shadow-2xl border-2 border-orange-400 flex items-center space-x-3 min-w-[300px]">
            <div className="text-3xl animate-pulse">🔔</div>
            <div>
              <div className="font-bold text-lg">New Order Alert!</div>
              <div className="text-sm opacity-90">
                {newOrderCount} new order{newOrderCount > 1 ? 's' : ''} has arrived!
              </div>
            </div>
            <button
              onClick={() => setShowOrderNotification(false)}
              className="ml-auto text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Console Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h1 className="text-xl font-bold text-green-400 font-mono">ADMIN CONSOLE</h1>
              </div>
              <div className="hidden md:block text-sm text-gray-400 font-mono">
                K2 Chicken Management System
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/admin"
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white rounded-lg transition-all duration-300 text-sm font-semibold border border-slate-600"
                title="Go to Main Admin Dashboard"
              >
                Dashboard
              </a>
              <div className="flex items-center space-x-3 px-4 py-2 bg-slate-700 rounded-lg border border-slate-600">
                <User className="h-4 w-4 text-orange-400" />
                <div>
                  <p className="text-xs text-gray-400 font-mono">USER</p>
                  <p className="text-sm font-semibold text-gray-200">{user.username}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 font-semibold text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span>LOGOUT</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-mono mb-1">TOTAL ORDERS</p>
                  <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-mono mb-1">PENDING</p>
                  <p className="text-2xl font-bold text-orange-400">{stats.pendingOrders}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-400" />
              </div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-mono mb-1">COMPLETED</p>
                  <p className="text-2xl font-bold text-green-400">{stats.completedOrders}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-mono mb-1">REVENUE</p>
                  <p className="text-2xl font-bold text-yellow-400">₹{stats.totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 mb-6 overflow-hidden">
          <div className="p-2">
            <nav className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isOrdersTab = tab.id === 'orders'
                const showBadge = isOrdersTab && newOrdersCount > 0 && activeTab !== 'orders'
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => isOrdersTab ? handleOrdersTabClick() : setActiveTab(tab.id as TabType)}
                    className={`relative flex items-center space-x-2 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white border border-slate-600'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                    {showBadge && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center border-2 border-slate-800">
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
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="p-6">
            {activeTab === 'dashboard' && <AdminDashboard />}
            {activeTab === 'products' && <ProductManagement />}
            {activeTab === 'recipes' && <RecipeManagement />}
            {activeTab === 'orders' && <OrderManagement />}
            {activeTab === 'whatsapp' && <WhatsAppOrderManagement />}
            {activeTab === 'inventory' && <InventoryManagement />}
            {activeTab === 'promotions' && <PromotionManagement />}
            {activeTab === 'settings' && <SettingsManagement />}
          </div>
        </div>
      </div>
    </div>
  )
}

