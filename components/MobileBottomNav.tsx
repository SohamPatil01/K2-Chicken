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
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden safe-bottom">
      <div className="bg-white/98 backdrop-blur-2xl border-t border-gray-200/50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around py-2 px-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === '/#products' && pathname === '/')
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href} className="flex-1 touch-target">
                <div
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl transition-all duration-200 active:scale-90 ${
                    isActive 
                      ? 'text-orange-600' 
                      : 'text-gray-500 active:text-gray-700'
                  }`}
                >
                  <div className="relative mb-1">
                    <div className={`absolute inset-0 rounded-full transition-all duration-200 ${
                      isActive ? 'bg-orange-100 scale-150' : 'bg-transparent scale-0'
                    }`}></div>
                    <Icon className={`relative h-6 w-6 transition-all duration-200 ${
                      isActive ? 'scale-110' : 'scale-100'
                    }`} strokeWidth={isActive ? 2.5 : 2} />
                    {item.label === 'Cart' && totalItems > 0 && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-600 to-red-600 text-white text-[10px] font-extrabold rounded-full h-5 w-5 min-w-[20px] flex items-center justify-center shadow-lg ring-2 ring-white">
                        {totalItems > 99 ? '99+' : totalItems}
                      </div>
                    )}
                  </div>
                  <span className={`text-[11px] font-bold transition-colors duration-200 ${
                    isActive ? 'text-orange-600' : 'text-gray-500'
                  }`}>
                    {item.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
