'use client'

import Link from 'next/link'
import { ArrowRight, Star, Clock, Shield, Sparkles } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative w-full min-h-[90vh] bg-gradient-to-br from-orange-50 via-white to-red-50 overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #ea580c 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-30"></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[90vh] flex flex-col justify-center py-20">
        <div className="text-center space-y-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 rounded-full px-5 py-2 text-sm font-semibold text-orange-700 shadow-sm">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Fresh Daily • Premium Quality</span>
          </div>
          
          {/* Main Heading */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1.1]">
              <span className="block bg-gradient-to-r from-orange-600 via-red-600 to-orange-500 bg-clip-text text-transparent">
                Finger Lickin'
              </span>
              <span className="block text-gray-900 mt-2">
                Good Chicken
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
              Experience the juiciest, crispiest, and most delicious chicken in town. 
              Made fresh daily with our secret family recipes.
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Link href="/#products" className="group">
              <button className="group relative bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-10 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 overflow-hidden">
                <span className="relative z-10 flex items-center gap-3">
                  <span>Order Now</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-700 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </Link>
            <Link href="/recipes" className="group">
              <button className="bg-white border-2 border-gray-200 hover:border-orange-300 text-gray-700 hover:text-orange-600 px-10 py-4 rounded-xl font-semibold text-lg shadow-sm hover:shadow-md transition-all duration-300">
                View Recipes
              </button>
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto">
            <div className="flex flex-col items-center gap-4 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-8 hover:shadow-lg hover:border-orange-200 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Star className="h-8 w-8 text-white fill-white" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">4.8/5</div>
                <div className="text-sm text-gray-500 font-medium">Customer Rating</div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-4 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-8 hover:shadow-lg hover:border-green-200 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">30 Min</div>
                <div className="text-sm text-gray-500 font-medium">Fast Delivery</div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-4 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-8 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">100%</div>
                <div className="text-sm text-gray-500 font-medium">Fresh Quality</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
