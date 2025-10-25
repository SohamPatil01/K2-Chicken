'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Package, ChefHat, ShoppingCart, MessageCircle } from 'lucide-react'
import ProductManagement from '@/components/ProductManagement'
import RecipeManagement from '@/components/RecipeManagement'
import OrderManagement from '@/components/OrderManagement'
import WhatsAppOrderManagement from '@/components/WhatsAppOrderManagement'
import AdminDashboard from '@/components/AdminDashboard'

type TabType = 'dashboard' | 'products' | 'recipes' | 'orders' | 'whatsapp'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Package },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'recipes', label: 'Recipes', icon: ChefHat },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'whatsapp', label: 'WhatsApp Orders', icon: MessageCircle },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-lg text-gray-600">
            Manage your Chicken Vicken store - products, recipes, and orders
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-chicken-red text-chicken-red'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-lg">
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'recipes' && <RecipeManagement />}
          {activeTab === 'orders' && <OrderManagement />}
          {activeTab === 'whatsapp' && <WhatsAppOrderManagement />}
        </div>
      </div>
    </div>
  )
}
