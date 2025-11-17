'use client'

import Link from 'next/link'
import { ArrowRight, Star, Clock, Shield, Sparkles, TrendingUp, Award } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative w-full min-h-[85vh] bg-white overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #ea580c 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      {/* Subtle Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-30 animate-float"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-red-50 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-50/30 rounded-full blur-3xl opacity-20 animate-pulse-slow"></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[85vh] flex flex-col justify-center py-16 sm:py-20">
        <div className="text-center space-y-8 sm:space-y-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium text-orange-700 shadow-sm transform transition-all duration-300 hover:scale-105 hover:shadow-md animate-slide-down">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
            <span>Fresh Daily • Premium Quality</span>
          </div>
          
          {/* Main Heading */}
          <div className="space-y-4 sm:space-y-5 max-w-4xl mx-auto px-4 sm:px-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] animate-slide-up stagger-1 overflow-visible">
              <span 
                className="block bg-gradient-to-r from-orange-600 via-red-600 to-orange-500 bg-clip-text text-transparent"
                style={{ 
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline-block'
                }}
              >
                Finger Lickin'
              </span>
              <span className="block text-gray-900 mt-1 sm:mt-2 overflow-visible">
                Good Chicken
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-normal px-4 animate-slide-up stagger-2">
              Experience the juiciest, crispiest, and most delicious chicken in town. 
              Made fresh daily with our secret family recipes.
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-2 sm:pt-4 px-4 animate-slide-up stagger-3">
            <Link href="/#products" className="group w-full sm:w-auto">
              <button className="group relative bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-7 sm:px-9 py-3 sm:py-3.5 rounded-xl font-semibold text-base sm:text-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2.5 overflow-hidden w-full sm:w-auto transform hover:scale-105 active:scale-95">
                <span className="relative z-10 flex items-center gap-2.5">
                  <span>Order Now</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>
            <Link href="/recipes" className="group w-full sm:w-auto">
              <button className="bg-white border border-gray-200 hover:border-orange-300 text-gray-700 hover:text-orange-600 px-7 sm:px-9 py-3 sm:py-3.5 rounded-xl font-semibold text-base sm:text-lg shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-auto transform hover:scale-105 active:scale-95">
                View Recipes
              </button>
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 pt-6 sm:pt-10 max-w-4xl mx-auto px-4">
            <div className="flex flex-col items-center gap-2.5 sm:gap-3 bg-white border border-gray-100 rounded-xl p-5 sm:p-6 hover:shadow-md hover:border-orange-200 transition-all duration-300 group animate-slide-up stagger-4 transform hover:scale-105">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center border border-orange-200 group-hover:scale-110 transition-transform duration-300">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 fill-orange-500" />
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-0.5">4.8/5</div>
                <div className="text-xs text-gray-500 font-medium">Customer Rating</div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2.5 sm:gap-3 bg-white border border-gray-100 rounded-xl p-5 sm:p-6 hover:shadow-md hover:border-green-200 transition-all duration-300 group animate-slide-up stagger-5 transform hover:scale-105">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center border border-green-200 group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-0.5">30 Min</div>
                <div className="text-xs text-gray-500 font-medium">Fast Delivery</div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2.5 sm:gap-3 bg-white border border-gray-100 rounded-xl p-5 sm:p-6 hover:shadow-md hover:border-blue-200 transition-all duration-300 group animate-slide-up stagger-6 transform hover:scale-105">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center border border-blue-200 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-0.5">100%</div>
                <div className="text-xs text-gray-500 font-medium">Fresh Quality</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
