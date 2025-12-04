"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Star, Clock, Shield, Sparkles, Phone } from "lucide-react";

interface HeroProps {
  deliveryEnabled?: boolean;
}

export default function Hero({ deliveryEnabled = true }: HeroProps) {
  const [mounted, setMounted] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  const typewriterText = "Finger Lickin'";
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setMounted(true);

    // Typewriter effect
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < typewriterText.length) {
        setDisplayedText(typewriterText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <section className="relative w-full min-h-[90vh] bg-gradient-to-br from-white via-orange-50 to-white overflow-hidden">
      {/* Subtle backdrop */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #fb923c 1px, transparent 0)`,
            backgroundSize: "45px 45px",
          }}
        ></div>
      </div>
      {/* Parallax Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-16 right-10 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-40"></div>
        <div
          className="absolute bottom-16 left-10 w-80 h-80 bg-red-100 rounded-full blur-3xl opacity-30"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[90vh] flex flex-col justify-center py-20">
        <div className="text-center space-y-10 bg-white rounded-3xl px-6 sm:px-10 py-12 shadow-xl border border-gray-100">
          <div
            className={`inline-flex items-center gap-2 bg-white/90 backdrop-blur-md border border-orange-200 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold text-orange-700 shadow-sm transition-all duration-300 hover:shadow-md ${
              mounted ? "animate-fade-up" : "opacity-0"
            }`}
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Fresh Daily • Premium Quality</span>
          </div>

          {/* Main Heading with Typewriter Effect */}
          <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto px-4 sm:px-6">
            <h1
              className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-gray-900 ${
                mounted ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: "0.2s" }}
            >
              <span className="block text-orange-600">
                {displayedText}
                {isTyping && <span className="animate-pulse">|</span>}
              </span>
              <span className="block text-gray-800 mt-2 sm:mt-3 font-semibold">
                Good Chicken
              </span>
            </h1>

            {/* Value Proposition */}
            <p
              className={`text-lg sm:text-xl md:text-2xl text-gray-900 max-w-3xl mx-auto leading-relaxed font-semibold px-4 ${
                mounted ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: "0.4s" }}
            >
              Premium Quality • Fresh Daily{" "}
              {deliveryEnabled
                ? "• Delivered to Your Door"
                : "• Available for Pickup"}
            </p>

            {/* Subheading */}
            <p
              className={`text-base sm:text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed px-4 ${
                mounted ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: "0.6s" }}
            >
              Experience the juiciest, crispiest, and most delicious chicken in
              town. Made fresh daily with our secret family recipes and premium
              ingredients.
            </p>
          </div>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4 sm:pt-6 px-4 ${
              mounted ? "animate-fade-up" : "opacity-0"
            }`}
            style={{ animationDelay: "0.8s" }}
          >
            <Link href="/#products" className="group w-full sm:w-auto">
              <button className="group relative bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden w-full sm:w-auto">
                <span className="relative z-10 flex items-center gap-3">
                  <span>Order Now</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-700 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </Link>
            <Link href="tel:+918484978622" className="group w-full sm:w-auto">
              <button className="bg-white/90 backdrop-blur px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-semibold text-base sm:text-lg text-gray-900 hover:text-orange-700 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-3">
                <Phone className="h-5 w-5 sm:h-5 sm:w-5" />
                <span>Call Now</span>
              </button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-8 sm:pt-12 max-w-4xl mx-auto px-4 ${
              mounted ? "animate-fade-up" : "opacity-0"
            }`}
            style={{ animationDelay: "1s" }}
          >
            <div className="flex flex-col items-center gap-3 sm:gap-4 bg-white/95 backdrop-blur border border-orange-200 rounded-2xl p-6 sm:p-7 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-md">
                <Star className="h-6 w-6 sm:h-8 sm:w-8 text-white fill-white" />
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  4.8/5
                </div>
                <div className="text-xs sm:text-sm text-gray-700 font-semibold">
                  Customer Rating
                </div>
                <div className="text-xs text-gray-700 mt-1 font-semibold">
                  500+ Reviews
                </div>
              </div>
            </div>

            {deliveryEnabled && (
              <div className="flex flex-col items-center gap-3 sm:gap-4 bg-white/95 backdrop-blur border border-green-200 rounded-2xl p-6 sm:p-7 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-md">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    30 Min
                  </div>
                  <div className="text-xs sm:text-sm text-gray-700 font-semibold">
                    Fast Delivery
                  </div>
                  <div className="text-xs text-gray-600 mt-1 font-medium">
                    Free over ₹500
                  </div>
                </div>
              </div>
            )}
            {!deliveryEnabled && (
              <div className="flex flex-col items-center gap-3 sm:gap-4 bg-white/95 backdrop-blur border border-orange-200 rounded-2xl p-6 sm:p-7 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-md">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    15 Min
                  </div>
                  <div className="text-xs sm:text-sm text-gray-700 font-semibold">
                    Quick Pickup
                  </div>
                  <div className="text-xs text-gray-600 mt-1 font-medium">
                    Store Ready
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center gap-3 sm:gap-4 bg-white/95 backdrop-blur border border-blue-200 rounded-2xl p-6 sm:p-7 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-md">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  100%
                </div>
                <div className="text-xs sm:text-sm text-gray-700 font-semibold">
                  Fresh Quality
                </div>
                <div className="text-xs text-gray-600 mt-1 font-medium">
                  Premium Ingredients
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
