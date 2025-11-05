'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Menu, ShoppingCart, MessageCircle, User } from 'lucide-react'
// import { motion } from 'framer-motion'
import { useCart } from '@/context/CartContext'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { state } = useCart()
  const [isVisible, setIsVisible] = useState(true)

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/#products', icon: Menu, label: 'Menu' },
    { href: '/cart', icon: ShoppingCart, label: 'Cart' },
  ]

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === '/#products' && pathname === '/')
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'text-orange-500 bg-orange-50' 
                      : 'text-gray-600 hover:text-orange-500'
                  }`}
                >
                  <div className="relative">
                    <Icon className="h-6 w-6" />
                    {item.label === 'Cart' && totalItems > 0 && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {totalItems}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium mt-1">{item.label}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
