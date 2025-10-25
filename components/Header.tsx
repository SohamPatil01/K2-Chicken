'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { state } = useCart()

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <img 
              src="/logo.svg" 
              alt="Chicken Vicken Logo" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-chicken-red transition-colors">
              Home
            </Link>
            <button 
              onClick={() => {
                const productsSection = document.getElementById('products');
                if (productsSection) {
                  productsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-gray-700 hover:text-chicken-red transition-colors"
            >
              Products
            </button>
            <Link href="/recipes" className="text-gray-700 hover:text-chicken-red transition-colors">
              Recipes
            </Link>
            <Link href="/admin" className="text-gray-700 hover:text-chicken-red transition-colors">
              Admin
            </Link>
          </nav>

          {/* Cart and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-chicken-red transition-colors">
              <ShoppingCart size={24} />
              {state.items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-chicken-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {state.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-700 hover:text-chicken-red transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-chicken-red transition-colors">
                Home
              </Link>
              <button 
                onClick={() => {
                  const productsSection = document.getElementById('products');
                  if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                  setIsMenuOpen(false);
                }}
                className="text-gray-700 hover:text-chicken-red transition-colors text-left"
              >
                Products
              </button>
              <Link href="/recipes" className="text-gray-700 hover:text-chicken-red transition-colors">
                Recipes
              </Link>
              <Link href="/admin" className="text-gray-700 hover:text-chicken-red transition-colors">
                Admin
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
