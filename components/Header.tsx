'use client'

import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { state } = useCart()
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-xl">K2</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                K2 Chicken
              </div>
              <div className="text-xs text-gray-500 -mt-1">Fresh & Delicious</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link 
              href="/" 
              className="px-5 py-2.5 text-gray-700 hover:text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-all duration-200"
            >
              Home
            </Link>
            <Link 
              href="/#products"
              className="px-5 py-2.5 text-gray-700 hover:text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-all duration-200"
            >
              Products
            </Link>
            <Link 
              href="/recipes" 
              className="px-5 py-2.5 text-gray-700 hover:text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-all duration-200"
            >
              Recipes
            </Link>
          </nav>

          {/* Cart and Mobile Menu */}
          <div className="flex items-center space-x-2">
            <Link 
              href="/cart" 
              className="relative p-2.5 text-gray-700 hover:text-orange-600 transition-all duration-200 rounded-lg hover:bg-orange-50 group"
            >
              <ShoppingCart size={22} className="group-hover:scale-110 transition-transform duration-200" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-md">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2.5 text-gray-700 hover:text-orange-600 transition-all duration-200 rounded-lg hover:bg-orange-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 bg-white">
            <nav className="flex flex-col space-y-1">
              <Link 
                href="/" 
                className="px-4 py-3 text-gray-700 hover:text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/#products"
                className="px-4 py-3 text-gray-700 hover:text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                href="/recipes" 
                className="px-4 py-3 text-gray-700 hover:text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Recipes
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
