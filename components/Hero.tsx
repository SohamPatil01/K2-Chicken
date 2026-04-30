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
        <div className="text-center space-y-4 sm:space-y-8 md:space-y-10 bg-white/60 backdrop-blur-md rounded-2xl sm:rounded-[2.5rem] px-4 sm:px-10 md:px-14 py-6 sm:py-14 shadow-2xl shadow-orange-100/50 border border-white/40 max-w-5xl w-full mx-2 sm:mx-auto">
          <div
            className={`inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-orange-500 to-orange-600 backdrop-blur-md border border-orange-100/20 rounded-full px-4 py-1.5 text-xs sm:text-sm font-bold text-white shadow-lg transition-all duration-300 hover:shadow-orange-500/30 hover:scale-105 ${
              mounted ? "animate-fade-up" : "opacity-0"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300" />
            <span className="uppercase tracking-wider">
              Fresh Daily • Premium Quality
            </span>
          </div>

          {/* Main Heading */}
          <div className="space-y-2 sm:space-y-4 max-w-4xl mx-auto text-center">
            <h1
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-balance ${
                mounted ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: "0.2s" }}
            >
              <span className="block text-transparent bg-clip-text bg-gradient-to-br from-orange-700 via-orange-600 to-orange-500">
                Fresh Halal Chicken Delivered Today
              </span>
            </h1>

            {/* Value Proposition */}
            <p
              className={`text-lg sm:text-xl md:text-2xl text-gray-700 font-medium max-w-3xl mx-auto leading-relaxed text-center ${
                mounted ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: "0.4s" }}
            >
              The crispiest, juiciest chicken in town.
              <span className="block mt-2 text-base sm:text-lg opacity-80 font-normal">
                {deliveryEnabled
                  ? "Fast delivery to your doorstep."
                  : "Ready for quick pickup."}
              </span>
              {deliveryEnabled && freeDeliveryAbove > 0 && (
                <span className="block mt-1 text-sm sm:text-base text-orange-600 font-semibold">
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
              <button className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-orange-700 text-white px-10 py-5 rounded-button font-bold text-lg shadow-card hover:shadow-card-hover hover:scale-105 active:scale-95 transition-all duration-smooth flex items-center justify-center gap-3 border border-transparent">
                <span>Order Now</span>
                <ArrowRight className="h-6 w-6 transition-transform duration-smooth group-hover:translate-x-1" />
              </button>
            </Link>
            <Link href="tel:+918484978622" className="group w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-white/50 backdrop-blur-md text-gray-800 px-10 py-5 rounded-button font-bold text-lg border border-gray-200 hover:bg-white/80 hover:border-orange-200 shadow-soft active:scale-95 transition-all duration-smooth flex items-center justify-center gap-3">
                <Phone className="h-5 w-5 fill-current text-gray-700" />
                <span>Call Now</span>
              </button>
            </Link>
          </div>

          {/* Trust strip: Halal, No antibiotics, Fresh daily */}
          <div
            className={`flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-6 border-t border-gray-200/60 mt-6 ${
              mounted ? "animate-fade-up" : "opacity-0"
            }`}
            style={{ animationDelay: "0.7s" }}
          >
            <div className="flex items-center gap-2 text-gray-700">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-sm font-medium">100% Halal</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span className="text-sm font-medium">No antibiotics</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <span className="text-sm font-medium">Fresh daily</span>
            </div>
          </div>

          {/* Trust Indicators - Glassmorphism */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 border-t border-gray-200/60 mt-8 ${
              mounted ? "animate-fade-up" : "opacity-0"
            }`}
            style={{ animationDelay: "0.8s" }}
          >
            <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/80 transition-colors shadow-sm">
              <div className="text-yellow-500 font-bold text-2xl flex items-center gap-1">
                4.8 <Star className="fill-yellow-400 w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-gray-600 text-sm font-medium">
                500+ Reviews
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/80 transition-colors shadow-sm">
              <div className="text-orange-600 font-bold text-2xl flex items-center gap-1">
                {deliveryEnabled ? "30m" : "15m"} <Clock className="w-5 h-5" />
              </div>
              <div className="text-gray-600 text-sm font-medium">
                {deliveryEnabled ? "Fast Delivery" : "Quick Pickup"}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/80 transition-colors shadow-sm">
              <div className="text-blue-600 font-bold text-2xl flex items-center gap-1">
                100% <Shield className="w-5 h-5" />
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
