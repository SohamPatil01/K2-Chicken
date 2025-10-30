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
    <header className="bg-white/90 backdrop-blur-xl shadow-2xl sticky top-0 z-50 border-b border-orange-200/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl font-black text-white">K2</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <div className="text-xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Chicken Vicken
              </div>
              <div className="text-xs text-gray-500 font-medium">Finger Lickin' Good</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              href="/" 
              className="px-4 py-2 text-gray-700 hover:text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-all duration-300"
            >
              Home
            </Link>
            <button 
              onClick={() => {
                const productsSection = document.getElementById('products');
                if (productsSection) {
                  productsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-4 py-2 text-gray-700 hover:text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-all duration-300"
            >
              Products
            </button>
            <Link 
              href="/recipes" 
              className="px-4 py-2 text-gray-700 hover:text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-all duration-300"
            >
              Recipes
            </Link>
            <Link 
              href="/whatsapp-test" 
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
              </svg>
              WhatsApp Bot
            </Link>
          </nav>

          {/* Cart and Mobile Menu */}
          <div className="flex items-center space-x-3">
            <Link 
              href="/cart" 
              className="relative p-3 text-gray-700 hover:text-orange-600 transition-all duration-300 rounded-xl hover:bg-orange-50 group"
            >
              <ShoppingCart size={24} className="group-hover:scale-110 transition-transform duration-300" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-3 text-gray-700 hover:text-orange-600 transition-all duration-300 rounded-xl hover:bg-orange-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-orange-200/30 bg-white/50 backdrop-blur-sm">
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/" 
                className="px-4 py-3 text-gray-700 hover:text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
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
                className="px-4 py-3 text-gray-700 hover:text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-all duration-300 text-left"
              >
                Products
              </button>
              <Link 
                href="/recipes" 
                className="px-4 py-3 text-gray-700 hover:text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Recipes
              </Link>
              <Link 
                href="/whatsapp-test" 
                className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
                </svg>
                WhatsApp Bot
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
