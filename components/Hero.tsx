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
    <section className="relative w-full min-h-[calc(100vh-120px)] sm:min-h-[90vh] bg-gradient-to-br from-orange-50 via-white to-orange-50 overflow-hidden">
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-100/20 via-transparent to-red-100/20"></div>
      
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #fb923c 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        ></div>
      </div>

      {/* Main Content - Mobile First */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-120px)] sm:min-h-[90vh] flex flex-col justify-center py-8 sm:py-16 md:py-20">
        <div className="text-center space-y-6 sm:space-y-8 md:space-y-10 bg-white/80 backdrop-blur-sm rounded-3xl px-5 sm:px-8 md:px-10 py-8 sm:py-10 md:py-12 shadow-2xl border border-white/50">
          <div
            className={`inline-flex items-center gap-1.5 sm:gap-2 bg-white/90 backdrop-blur-md border border-orange-200 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs md:text-sm font-semibold text-orange-700 shadow-sm transition-all duration-300 hover:shadow-md ${
              mounted ? "animate-fade-up" : "opacity-0"
            }`}
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
            <span className="whitespace-nowrap">Fresh Daily • Premium Quality</span>
          </div>

          {/* Main Heading with Typewriter Effect */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6 max-w-4xl mx-auto px-2 sm:px-4 md:px-6">
            <h1
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight text-gray-900 ${
                mounted ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: "0.2s" }}
            >
              <span className="block text-orange-600">
                {displayedText}
                {isTyping && <span className="animate-pulse">|</span>}
              </span>
              <span className="block text-gray-800 mt-1 sm:mt-2 md:mt-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold">
                Good Chicken
              </span>
            </h1>

            {/* Value Proposition */}
            <p
              className={`text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-900 max-w-3xl mx-auto leading-relaxed font-semibold px-2 sm:px-4 ${
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
              className={`text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed px-2 sm:px-4 ${
                mounted ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: "0.6s" }}
            >
              Experience the juiciest, crispiest, and most delicious chicken in
              town. Made fresh daily with our secret family recipes and premium
              ingredients.
            </p>
          </div>

          {/* CTA Buttons - Modern Mobile Design */}
          <div
            className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4 sm:pt-6 px-2 sm:px-4 ${
              mounted ? "animate-fade-up" : "opacity-0"
            }`}
            style={{ animationDelay: "0.8s" }}
          >
            <Link href="/#products" className="group w-full sm:w-auto">
              <button className="group relative bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-2xl font-bold text-base sm:text-lg shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 w-full sm:w-auto min-h-[56px]">
                <span>Order Now</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-active:translate-x-1" />
              </button>
            </Link>
            <Link href="tel:+918484978622" className="group w-full sm:w-auto">
              <button className="bg-white px-8 py-4 rounded-2xl font-bold text-base sm:text-lg text-gray-900 border-2 border-gray-200 shadow-lg active:scale-95 transition-all duration-200 w-full sm:w-auto flex items-center justify-center gap-3 min-h-[56px]">
                <Phone className="h-5 w-5" />
                <span>Call Now</span>
              </button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 pt-6 sm:pt-8 md:pt-12 max-w-4xl mx-auto px-2 sm:px-4 ${
              mounted ? "animate-fade-up" : "opacity-0"
            }`}
            style={{ animationDelay: "1s" }}
          >
            <div className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 bg-white/95 backdrop-blur border border-orange-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-7 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white fill-white" />
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">
                  4.8/5
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm text-gray-700 font-semibold">
                  Customer Rating
                </div>
                <div className="text-[10px] sm:text-xs text-gray-700 mt-0.5 sm:mt-1 font-semibold">
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
