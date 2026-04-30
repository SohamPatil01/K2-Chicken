"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Star,
  Clock,
  Shield,
  Sparkles,
  Phone,
  CheckCircle2,
} from "lucide-react";

import CinematicBackground from "./CinematicBackground";
import DeliveryChecker from "./DeliveryChecker";

interface HeroProps {
  deliveryEnabled?: boolean;
  freeDeliveryAbove?: number;
}

export default function Hero({
  deliveryEnabled = true,
  freeDeliveryAbove = 500,
}: HeroProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative w-full h-[85vh] min-h-[400px] sm:min-h-[500px] md:min-h-[600px] overflow-hidden flex items-center justify-center pt-16 sm:pt-20 safe-top">
      {/* Cinematic Background */}
      <CinematicBackground />

      {/* Main Content - Centered */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
        <div className="text-center space-y-5 sm:space-y-7 md:space-y-8 bg-white/85 backdrop-blur-md rounded-2xl sm:rounded-[2.5rem] px-4 sm:px-10 md:px-14 pt-6 sm:pt-12 pb-8 sm:pb-12 border border-white/60 max-w-5xl w-full mx-2 sm:mx-auto shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          <div
            className={`inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-orange-500 to-orange-600 backdrop-blur-md border border-orange-100/20 rounded-full px-4 py-1.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all duration-300 hover:scale-[1.02] ${
              mounted ? "animate-fade-up" : "opacity-0"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300" />
            <span className="uppercase tracking-wider">
              Fresh Daily • Premium Quality
            </span>
          </div>

          {/* Main Heading */}
          <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto text-center">
            <h1
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.15] sm:leading-tight tracking-tight ${
                mounted ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: "0.2s" }}
            >
              <span className="block text-transparent bg-clip-text bg-gradient-to-br from-orange-700 via-orange-600 to-orange-500">
                Fresh Halal Chicken
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-br from-orange-700 via-orange-600 to-orange-500 mt-1 sm:mt-2">
                Delivered Today
              </span>
            </h1>

            {/* Value Proposition */}
            <p
              className={`text-lg sm:text-xl md:text-2xl text-gray-700 font-medium max-w-3xl mx-auto leading-relaxed text-center space-y-2 ${
                mounted ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: "0.4s" }}
            >
              <span className="block">The crispiest, juiciest chicken in town.</span>
              <span className="block text-base sm:text-lg opacity-80 font-normal">
                {deliveryEnabled
                  ? "Fast delivery to your doorstep."
                  : "Ready for quick pickup."}
              </span>
              {deliveryEnabled && freeDeliveryAbove > 0 && (
                <span className="block pt-1 text-sm sm:text-base text-orange-600 font-semibold">
                  Free delivery above ₹{freeDeliveryAbove}
                </span>
              )}
            </p>
          </div>

          {/* Delivery area checker */}
          {deliveryEnabled && (
            <div
              className={`pt-4 ${
                mounted ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: "0.5s" }}
            >
              <DeliveryChecker />
            </div>
          )}

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 ${
              mounted ? "animate-fade-up" : "opacity-0"
            }`}
            style={{ animationDelay: "0.6s" }}
          >
            <Link href="/#products" className="group w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-orange-700 text-white px-10 py-5 rounded-button font-bold text-lg hover:brightness-[1.03] active:scale-[0.98] transition-all duration-smooth flex items-center justify-center gap-3 border border-orange-500/30">
                <span>Order Now</span>
                <ArrowRight className="h-6 w-6 transition-transform duration-smooth group-hover:translate-x-1" />
              </button>
            </Link>
            <Link href="tel:+918484978622" className="group w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-white/90 backdrop-blur-sm text-gray-800 px-10 py-5 rounded-button font-bold text-lg border border-gray-200 hover:bg-white hover:border-orange-200 active:scale-95 transition-all duration-smooth flex items-center justify-center gap-3">
                <Phone className="h-5 w-5 fill-current text-gray-700" />
                <span>Call Now</span>
              </button>
            </Link>
          </div>

          {/* Trust strip: Halal, No antibiotics, Fresh daily */}
          <div
            className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-6 border-t border-gray-200/70 ${
              mounted ? "animate-fade-up" : "opacity-0"
            }`}
            style={{ animationDelay: "0.7s" }}
          >
            <div className="flex items-center gap-2.5 text-gray-700">
              <Shield className="w-6 h-6 text-green-600 flex-shrink-0" aria-hidden />
              <span className="text-sm sm:text-base font-medium">100% Halal</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-700">
              <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" aria-hidden />
              <span className="text-sm sm:text-base font-medium">No antibiotics</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-700">
              <Sparkles className="w-6 h-6 text-orange-500 flex-shrink-0" aria-hidden />
              <span className="text-sm sm:text-base font-medium">Fresh daily</span>
            </div>
          </div>

          {/* Trust stats — solid tiles inside the panel (no split / heavy shadow) */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-8 border-t border-gray-200/70 ${
              mounted ? "animate-fade-up" : "opacity-0"
            }`}
            style={{ animationDelay: "0.8s" }}
          >
            <div className="flex flex-col items-center gap-2 p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 hover:border-orange-200/80 transition-colors">
              <div className="text-yellow-500 font-bold text-2xl flex items-center gap-1.5">
                4.8 <Star className="fill-yellow-400 w-6 h-6 text-yellow-400" aria-hidden />
              </div>
              <div className="text-gray-600 text-sm font-medium">
                500+ Reviews
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 hover:border-orange-200/80 transition-colors">
              <div className="text-orange-600 font-bold text-2xl flex items-center gap-1.5">
                {deliveryEnabled ? "30m" : "15m"} <Clock className="w-6 h-6" aria-hidden />
              </div>
              <div className="text-gray-600 text-sm font-medium">
                {deliveryEnabled ? "Fast Delivery" : "Quick Pickup"}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 hover:border-orange-200/80 transition-colors">
              <div className="text-blue-600 font-bold text-2xl flex items-center gap-1.5">
                100% <Shield className="w-6 h-6" aria-hidden />
              </div>
              <div className="text-gray-600 text-sm font-medium">
                Halal Certified
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
