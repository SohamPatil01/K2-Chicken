"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Tag,
  Calendar,
  Percent,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Zap,
  Gift,
} from "lucide-react";

interface Promotion {
  id: number;
  title: string;
  description?: string;
  discount_type?: "percentage" | "fixed" | "buy_x_get_y" | "free_delivery";
  discount_value?: number;
  promo_code?: string;
  image_url?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  display_order: number;
}

interface PromotionsFlyerProps {
  initialPromotions?: Promotion[];
}

export default function PromotionsFlyer({
  initialPromotions,
}: PromotionsFlyerProps = {}) {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>(
    initialPromotions || []
  );
  const [loading, setLoading] = useState(!initialPromotions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (initialPromotions && initialPromotions.length > 0) {
      setPromotions(initialPromotions);
      setLoading(false);
    } else if (!initialPromotions) {
      fetchPromotions();
    }
  }, [initialPromotions]);

  useEffect(() => {
    if (promotions.length > 1 && !isPaused) {
      const interval = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % promotions.length);
          setIsTransitioning(false);
        }, 300);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [promotions.length, isPaused]);

  const fetchPromotions = async () => {
    try {
      const response = await fetch("/api/promotions?active=true", {
        next: { revalidate: 60 }, // Cache for 60 seconds
      });
      const data = await response.json();
      const activePromotions = Array.isArray(data)
        ? data.filter((p: Promotion) => {
          if (!p.is_active) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (p.end_date) {
            const endDate = new Date(p.end_date);
            if (endDate < today) return false;
          }
          if (p.start_date) {
            const startDate = new Date(p.start_date);
            if (startDate > today) return false;
          }
          return true;
        })
        : [];
      setPromotions(activePromotions);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDiscount = (promo: Promotion) => {
    if (promo.discount_type === "percentage" && promo.discount_value) {
      // Remove .00 from percentage values
      const value = Number(promo.discount_value);
      return `${value % 1 === 0 ? value.toFixed(0) : value}%`;
    } else if (promo.discount_type === "fixed" && promo.discount_value) {
      // Remove .00 from fixed discount values
      const value = Number(promo.discount_value);
      return `₹${value % 1 === 0 ? value.toFixed(0) : value}`;
    } else if (promo.discount_type === "free_delivery") {
      return "FREE";
    } else if (promo.discount_type === "buy_x_get_y") {
      return "BUY X GET Y";
    }
    return "SPECIAL";
  };

  const goToSlide = (index: number) => {
    if (index !== currentIndex) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setIsTransitioning(false);
      }, 300);
    }
  };

  if (loading) {
    return null;
  }

  if (promotions.length === 0) {
    return null;
  }

  const currentPromo = promotions[currentIndex];

  const goToPrevious = () => {
    if (promotions.length > 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(
          (prev) => (prev - 1 + promotions.length) % promotions.length
        );
        setIsTransitioning(false);
      }, 300);
    }
  };

  const goToNext = () => {
    if (promotions.length > 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % promotions.length);
        setIsTransitioning(false);
      }, 300);
    }
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-red-50 border-y border-red-100"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="relative">
          {/* Navigation Arrows */}
          {promotions.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 z-20 p-2 md:p-3 bg-white/80 backdrop-blur-sm rounded-full border border-red-200 hover:bg-white hover:border-red-200 transition-all duration-300 hover:scale-105 shadow-sm group"
                aria-label="Previous promotion"
              >
                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-brand-red group-hover:translate-x-[-2px] transition-transform" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8 z-20 p-2 md:p-3 bg-white/80 backdrop-blur-sm rounded-full border border-red-200 hover:bg-white hover:border-red-200 transition-all duration-300 hover:scale-105 shadow-sm group"
                aria-label="Next promotion"
              >
                <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-brand-red group-hover:translate-x-[2px] transition-transform" />
              </button>
            </>
          )}

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
            {/* Left side - Animated Discount Badge */}
            <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0 animate-slide-in-from-left">
              <div className="relative group">
                <div className="relative bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-red-200 shadow-md transform group-hover:scale-105 transition-all duration-300">
                  <div className="relative">
                    <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-brand-red" />
                  </div>
                </div>
              </div>
              <div className="transform transition-all duration-500">
                <div className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-brand-red/80 mb-1 animate-fade-in">
                  Special Offer
                </div>
                <div
                  className={`text-2xl sm:text-3xl md:text-4xl font-bold transform transition-all duration-500 ${isTransitioning
                      ? "opacity-0 scale-95"
                      : "opacity-100 scale-100"
                    }`}
                >
                  <span className="text-brand-red">
                    {formatDiscount(currentPromo)}
                  </span>
                  {(currentPromo.discount_type === "percentage" ||
                    currentPromo.discount_type === "fixed") && (
                      <span className="text-lg sm:text-xl md:text-2xl ml-1.5 text-brand-red/70 font-medium">
                        OFF
                      </span>
                    )}
                  {currentPromo.discount_type === "free_delivery" && (
                    <span className="text-lg sm:text-xl md:text-2xl ml-1.5 text-gray-700">
                      DELIVERY
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Center - Promotion Details with enhanced slide animation */}
            <div
              className={`flex-1 text-center transform transition-all duration-500 px-4 ${isTransitioning
                  ? "opacity-0 translate-y-4"
                  : "opacity-100 translate-y-0"
                }`}
            >
              <div className="inline-flex items-center space-x-2 mb-2 animate-scale-in">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-brand-red" />
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-brand-red/80 bg-white/70 backdrop-blur-sm px-2.5 py-1 rounded-full border border-red-200">
                  Limited Time
                </span>
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-brand-red" />
              </div>

              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 leading-tight text-gray-900">
                {currentPromo.title}
              </h3>

              {currentPromo.description && (
                <p className="text-sm sm:text-base text-gray-700 mb-3 font-normal max-w-2xl mx-auto leading-relaxed">
                  {currentPromo.description}
                </p>
              )}

              {currentPromo.promo_code && (
                <button
                  onClick={() => {
                    if (currentPromo.promo_code) {
                      router.push(
                        `/checkout?promo=${encodeURIComponent(
                          currentPromo.promo_code
                        )}`
                      );
                    } else {
                      router.push("/checkout");
                    }
                  }}
                  className="mt-3 inline-flex items-center space-x-2 bg-brand-red hover:bg-brand-red-hover px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl shadow-soft transition-colors duration-300 group cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-semibold text-white/90">
                    Use Code:
                  </span>
                  <span className="text-base sm:text-lg md:text-xl font-bold tracking-wide text-white">
                    {currentPromo.promo_code}
                  </span>
                  <ArrowRight className="h-4 w-4 text-white group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              )}

              {(currentPromo.start_date || currentPromo.end_date) && (
                <div className="mt-3 flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-600">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="font-medium">
                    {currentPromo.start_date &&
                      new Date(currentPromo.start_date).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" }
                      )}
                    {currentPromo.start_date && currentPromo.end_date && " - "}
                    {currentPromo.end_date &&
                      new Date(currentPromo.end_date).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                  </span>
                </div>
              )}
            </div>

            {/* Right side - Enhanced Navigation Dots */}
            {promotions.length > 1 && (
              <div className="flex flex-row lg:flex-col items-center justify-center space-x-2 lg:space-x-0 lg:space-y-2 flex-shrink-0 animate-slide-in-from-right">
                {promotions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`relative transition-all duration-300 group ${index === currentIndex ? "w-2.5 h-8 lg:h-10" : "w-2 h-2"
                      } rounded-full ${index === currentIndex
                        ? "bg-brand-red shadow-md"
                        : "bg-red-50/50 hover:bg-red-50"
                      }`}
                    aria-label={`Go to promotion ${index + 1}`}
                  >
                    {index === currentIndex && (
                      <div className="absolute inset-0 bg-brand-red/40 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
