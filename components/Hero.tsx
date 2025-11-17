"use client";

import Link from "next/link";
import {
  ArrowRight,
  Star,
  Clock,
  Shield,
  Sparkles,
  TrendingUp,
  Award,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[85vh] bg-gradient-to-b from-white via-orange-50/30 to-white overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #ea580c 1px, transparent 0)`,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* Enhanced Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-40 animate-float"></div>
        <div
          className="absolute bottom-10 left-10 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-30 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-50/40 rounded-full blur-3xl opacity-25 animate-pulse-slow"></div>

        {/* Floating accent circles */}
        <div
          className="absolute top-20 left-20 w-32 h-32 bg-orange-200/20 rounded-full blur-2xl animate-float"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-32 right-32 w-40 h-40 bg-red-200/20 rounded-full blur-2xl animate-float"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[85vh] flex flex-col justify-center py-16 sm:py-20">
        <div className="text-center space-y-8 sm:space-y-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-orange-200 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold text-orange-700 shadow-sm transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-orange-300 animate-slide-down group">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 group-hover:rotate-12 transition-transform duration-300" />
            <span>Fresh Daily • Premium Quality</span>
          </div>

          {/* Main Heading */}
          <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto px-4 sm:px-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] animate-slide-up stagger-1 overflow-visible">
              <span
                className="block bg-gradient-to-r from-orange-600 via-red-600 to-orange-500 bg-clip-text text-transparent relative"
                style={{
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  display: "inline-block",
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 blur-2xl opacity-30"></span>
                <span className="relative">Finger Lickin'</span>
              </span>
              <span className="block text-gray-900 mt-2 sm:mt-3 overflow-visible relative">
                <span className="relative z-10">Good Chicken</span>
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-normal px-4 animate-slide-up stagger-2">
              Experience the juiciest, crispiest, and most delicious chicken in
              town. Made fresh daily with our secret family recipes.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-3 sm:pt-5 px-4 animate-slide-up stagger-3">
            <Link href="/#products" className="group w-full sm:w-auto">
              <button className="group relative bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2.5 overflow-hidden w-full sm:w-auto transform hover:scale-105 active:scale-95">
                <span className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center gap-2.5">
                  <span>Order Now</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>
            </Link>
            <Link href="/recipes" className="group w-full sm:w-auto">
              <button className="bg-white border-2 border-gray-200 hover:border-orange-400 text-gray-700 hover:text-orange-600 px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-sm hover:shadow-md hover:bg-orange-50/50 transition-all duration-300 w-full sm:w-auto transform hover:scale-105 active:scale-95">
                View Recipes
              </button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-8 sm:pt-12 max-w-5xl mx-auto px-4">
            <div className="flex flex-col items-center gap-3 sm:gap-3.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 sm:p-7 hover:shadow-lg hover:border-orange-300 hover:bg-white transition-all duration-300 group animate-slide-up stagger-4 transform hover:scale-105 hover:-translate-y-1">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-200/30 rounded-2xl blur-xl group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center border-2 border-orange-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                  <Star className="h-6 w-6 sm:h-7 sm:w-7 text-orange-600 fill-orange-500" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  4.8/5
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                  Customer Rating
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 sm:gap-3.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 sm:p-7 hover:shadow-lg hover:border-green-300 hover:bg-white transition-all duration-300 group animate-slide-up stagger-5 transform hover:scale-105 hover:-translate-y-1">
              <div className="relative">
                <div className="absolute inset-0 bg-green-200/30 rounded-2xl blur-xl group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center border-2 border-green-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                  <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  30 Min
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                  Fast Delivery
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 sm:gap-3.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 sm:p-7 hover:shadow-lg hover:border-blue-300 hover:bg-white transition-all duration-300 group animate-slide-up stagger-6 transform hover:scale-105 hover:-translate-y-1">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-200/30 rounded-2xl blur-xl group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center border-2 border-blue-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                  <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  100%
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                  Fresh Quality
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
