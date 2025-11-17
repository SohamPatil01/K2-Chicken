'use client'

import { useState, useEffect } from 'react'
import { Tag, Calendar, Percent, Sparkles, ArrowRight, ChevronLeft, ChevronRight, Zap, Gift } from 'lucide-react'

interface Promotion {
  id: number
  title: string
  description?: string
  discount_type?: 'percentage' | 'fixed' | 'buy_x_get_y' | 'free_delivery'
  discount_value?: number
  promo_code?: string
  image_url?: string
  start_date?: string
  end_date?: string
  is_active: boolean
  display_order: number
}

interface PromotionsFlyerProps {
  initialPromotions?: Promotion[]
}

export default function PromotionsFlyer({ initialPromotions }: PromotionsFlyerProps = {}) {
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions || [])
  const [loading, setLoading] = useState(!initialPromotions)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (!initialPromotions) {
      fetchPromotions()
    } else {
      setLoading(false)
    }
  }, [initialPromotions])

  useEffect(() => {
    if (promotions.length > 1 && !isPaused) {
      const interval = setInterval(() => {
        setIsTransitioning(true)
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % promotions.length)
          setIsTransitioning(false)
        }, 300)
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [promotions.length, isPaused])

  const fetchPromotions = async () => {
    try {
      const response = await fetch('/api/promotions?active=true')
      const data = await response.json()
      const activePromotions = Array.isArray(data)
        ? data.filter((p: Promotion) => {
            if (!p.is_active) return false
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            if (p.end_date) {
              const endDate = new Date(p.end_date)
              if (endDate < today) return false
            }
            if (p.start_date) {
              const startDate = new Date(p.start_date)
              if (startDate > today) return false
            }
            return true
          })
        : []
      setPromotions(activePromotions)
    } catch (error) {
      console.error('Error fetching promotions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDiscount = (promo: Promotion) => {
    if (promo.discount_type === 'percentage' && promo.discount_value) {
      return `${promo.discount_value}%`
    } else if (promo.discount_type === 'fixed' && promo.discount_value) {
      return `₹${promo.discount_value}`
    } else if (promo.discount_type === 'free_delivery') {
      return 'FREE'
    } else if (promo.discount_type === 'buy_x_get_y') {
      return 'BUY X GET Y'
    }
    return 'SPECIAL'
  }

  const goToSlide = (index: number) => {
    if (index !== currentIndex) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex(index)
        setIsTransitioning(false)
      }, 300)
    }
  }

  if (loading) {
    return null
  }

  if (promotions.length === 0) {
    return null
  }

  const currentPromo = promotions[currentIndex]

  const goToPrevious = () => {
    if (promotions.length > 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length)
        setIsTransitioning(false)
      }, 300)
    }
  }

  const goToNext = () => {
    if (promotions.length > 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % promotions.length)
        setIsTransitioning(false)
      }, 300)
    }
  }

  return (
    <section 
      className="relative w-full overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-500"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Animated gradient background with movement */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-400 via-pink-400 to-orange-500 animate-gradient-x"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-pulse"></div>
      </div>
      
      {/* Animated mesh gradient overlay */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 50%),
                             radial-gradient(circle at 40% 20%, rgba(255,255,255,0.25) 0%, transparent 50%)`,
            animation: 'float 15s ease-in-out infinite'
          }}
        ></div>
      </div>

      {/* Floating animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-white/40 rounded-full blur-sm"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 4) * 25}%`,
              animation: `float ${4 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`
            }}
          />
        ))}
      </div>

      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-slide pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="relative">
          {/* Navigation Arrows */}
          {promotions.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 z-20 p-2 md:p-3 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/40 hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-lg group"
                aria-label="Previous promotion"
              >
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-white group-hover:translate-x-[-2px] transition-transform" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8 z-20 p-2 md:p-3 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/40 hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-lg group"
                aria-label="Next promotion"
              >
                <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-white group-hover:translate-x-[2px] transition-transform" />
              </button>
            </>
          )}

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
            {/* Left side - Animated Discount Badge */}
            <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0 animate-slide-in-from-left">
              <div className="relative group">
                <div className="absolute inset-0 bg-white/40 rounded-2xl blur-2xl animate-pulse-slow"></div>
                <div className="relative bg-white/30 backdrop-blur-lg rounded-2xl p-4 sm:p-5 border-2 border-white/50 shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <div className="relative">
                    <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-white animate-bounce-slow" />
                    <Zap className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="transform transition-all duration-700">
                <div className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white/90 mb-1.5 animate-fade-in">
                  Special Offer
                </div>
                <div className={`text-3xl sm:text-4xl md:text-6xl font-black transform transition-all duration-700 ${
                  isTransitioning ? 'opacity-0 scale-90 rotate-3' : 'opacity-100 scale-100 rotate-0'
                }`}>
                  <span className="relative inline-block">
                    <span className="absolute inset-0 bg-white/50 blur-xl"></span>
                    <span className="relative bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent animate-shimmer-bg">
                      {formatDiscount(currentPromo)}
                    </span>
                  </span>
                  {(currentPromo.discount_type === 'percentage' || currentPromo.discount_type === 'fixed') && (
                    <span className="text-xl sm:text-2xl md:text-4xl ml-2 text-white/90">OFF</span>
                  )}
                  {currentPromo.discount_type === 'free_delivery' && (
                    <span className="text-xl sm:text-2xl md:text-4xl ml-2 text-white/90">DELIVERY</span>
                  )}
                </div>
              </div>
            </div>

            {/* Center - Promotion Details with enhanced slide animation */}
            <div className={`flex-1 text-center transform transition-all duration-700 px-4 ${
              isTransitioning ? 'opacity-0 translate-y-8 scale-95' : 'opacity-100 translate-y-0 scale-100'
            }`}>
              <div className="inline-flex items-center space-x-2 mb-3 animate-scale-in">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300 animate-spin-slow" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white/95 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                  Limited Time
                </span>
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300 animate-spin-slow" style={{ animationDirection: 'reverse' }} />
              </div>
              
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 leading-tight">
                <span className="relative inline-block">
                  <span className="absolute inset-0 bg-white/30 blur-2xl"></span>
                  <span className="relative bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                    {currentPromo.title}
                  </span>
                </span>
              </h3>
              
              {currentPromo.description && (
                <p className="text-sm sm:text-base md:text-lg text-white/95 mb-4 font-medium max-w-2xl mx-auto leading-relaxed">
                  {currentPromo.description}
                </p>
              )}
              
              {currentPromo.promo_code && (
                <div className="mt-4 inline-flex items-center space-x-3 bg-white/25 backdrop-blur-lg px-5 sm:px-7 py-3 sm:py-4 rounded-2xl border-2 border-white/50 shadow-2xl transform hover:scale-105 hover:shadow-white/20 transition-all duration-500 group cursor-pointer">
                  <span className="text-xs sm:text-sm font-bold text-white/90 uppercase tracking-wide">Use Code:</span>
                  <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-widest">
                    <span className="bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-200 bg-clip-text text-transparent animate-shimmer-bg">
                      {currentPromo.promo_code}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-white/80 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              )}
              
              {(currentPromo.start_date || currentPromo.end_date) && (
                <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-white/90">
                  <Calendar className="h-4 w-4 animate-pulse-slow" />
                  <span className="font-semibold">
                    {currentPromo.start_date && new Date(currentPromo.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {currentPromo.start_date && currentPromo.end_date && ' - '}
                    {currentPromo.end_date && new Date(currentPromo.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>

            {/* Right side - Enhanced Navigation Dots */}
            {promotions.length > 1 && (
              <div className="flex flex-row lg:flex-col items-center justify-center space-x-2 lg:space-x-0 lg:space-y-3 flex-shrink-0 animate-slide-in-from-right">
                {promotions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`relative transition-all duration-500 group ${
                      index === currentIndex
                        ? 'w-3 h-10 lg:h-12' 
                        : 'w-2 h-2 lg:w-2.5 lg:h-2.5'
                    } rounded-full ${
                      index === currentIndex
                        ? 'bg-white shadow-xl shadow-white/60'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Go to promotion ${index + 1}`}
                  >
                    {index === currentIndex && (
                      <>
                        <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-50"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-white to-white/80 rounded-full"></div>
                      </>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
