'use client'

import Link from 'next/link'
import { Home, Package, ChefHat, ShoppingBag, Phone, Mail, MapPin, Sparkles } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #ea580c 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6 animate-slide-down">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-400 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-300">
                  <span className="text-white font-bold text-lg">K2</span>
                </div>
              </div>
              <div>
                <div className="text-xl font-semibold text-white">K2 Chicken</div>
                <div className="text-xs text-gray-400 font-medium">Fresh & Delicious</div>
              </div>
            </div>
            <p className="text-gray-400 mb-5 leading-relaxed max-w-md text-sm sm:text-base animate-slide-up stagger-1">
              The best chicken in town! We serve crispy, juicy, and absolutely delicious chicken 
              that will make your taste buds dance with joy.
            </p>
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 text-orange-400 font-medium text-sm sm:text-base animate-slide-up stagger-2">
              <Sparkles className="w-4 h-4" />
              <span>"Finger Lickin' Good!"</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="animate-slide-up stagger-3">
            <h4 className="text-base sm:text-lg font-semibold mb-5 sm:mb-6 text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></span>
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/" 
                  className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-all duration-300 group"
                >
                  <Home className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/#products" 
                  className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-all duration-300 group"
                >
                  <Package className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  <span>Products</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/recipes" 
                  className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-all duration-300 group"
                >
                  <ChefHat className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  <span>Recipes</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/orders" 
                  className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-all duration-300 group"
                >
                  <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  <span>My Orders</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="animate-slide-up stagger-4">
            <h4 className="text-base sm:text-lg font-semibold mb-5 sm:mb-6 text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></span>
              Contact Us
            </h4>
            <div className="space-y-3.5 text-gray-400">
              <a 
                href="tel:8484978622"
                className="flex items-center gap-3 hover:text-orange-400 transition-all duration-300 group"
              >
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-orange-500/20 transition-colors duration-300">
                  <Phone className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-sm sm:text-base">8484978622</span>
              </a>
              <a 
                href="mailto:hello@k2chicken.com"
                className="flex items-center gap-3 hover:text-orange-400 transition-all duration-300 group"
              >
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-orange-500/20 transition-colors duration-300">
                  <Mail className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-sm sm:text-base">hello@k2chicken.com</span>
              </a>
              <div className="flex items-start gap-3 pt-1">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">
                  Shop No. 4, 24K Avenue, New DP Rd, Kolte Patil, Vishal Nagar, Pimple Nilakh, Pimpri-Chinchwad, Pune, Maharashtra 411027
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 animate-slide-up stagger-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm text-center sm:text-left">
              &copy; 2024 K2 Chicken. All rights reserved. Made with <span className="text-red-400">❤️</span> and lots of <span className="text-orange-400">🐔</span>
            </p>
            <Link 
              href="/admin" 
              className="group flex items-center gap-2 text-gray-500 hover:text-orange-400 transition-all duration-300 text-sm"
              title="Click to access Admin Console"
            >
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Admin Console</span>
              <span className="text-xs bg-gray-800 px-2 py-1 rounded border border-gray-700 group-hover:border-orange-500/50 transition-colors duration-300">
                🔐
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
