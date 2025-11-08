'use client'

import { useState, useEffect } from 'react'
import { Tag, Calendar, Percent, Sparkles, ArrowRight } from 'lucide-react'

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

export default function PromotionsFlyer() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    fetchPromotions()
  }, [])

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

  return (
    <section 
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 via-pink-500 to-orange-600 animate-gradient-x"></div>
      
      {/* Animated overlay pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 animate-pulse" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
          animation: 'float 20s ease-in-out infinite'
        }}></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 30}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + (i % 3)}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          {/* Left side - Animated Discount Badge */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0 w-full md:w-auto justify-center md:justify-start">
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-white/25 backdrop-blur-md rounded-full p-3 sm:p-4 border-2 border-white/40 shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <Tag className="h-5 w-5 sm:h-7 sm:w-7 animate-bounce" style={{ animationDuration: '2s' }} />
              </div>
            </div>
            <div className="transform transition-all duration-500">
              <div className="text-xs sm:text-sm font-bold uppercase tracking-wider opacity-90 mb-1 animate-fade-in">
                Special Offer
              </div>
              <div className={`text-2xl sm:text-3xl md:text-5xl font-black transform transition-all duration-500 ${
                isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}>
                <span className="bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent animate-shimmer">
                  {formatDiscount(currentPromo)}
                </span>
                {currentPromo.discount_type === 'percentage' && (
                  <span className="text-lg sm:text-xl md:text-4xl ml-1">OFF</span>
                )}
                {currentPromo.discount_type === 'fixed' && (
                  <span className="text-lg sm:text-xl md:text-4xl ml-1">OFF</span>
                )}
                {currentPromo.discount_type === 'free_delivery' && (
                  <span className="text-lg sm:text-xl md:text-4xl ml-1">DELIVERY</span>
                )}
              </div>
            </div>
          </div>

          {/* Center - Promotion Details with slide animation */}
          <div className={`flex-1 text-center transform transition-all duration-500 px-2 ${
            isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}>
            <div className="inline-flex items-center space-x-2 mb-2">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-xs font-semibold uppercase tracking-widest opacity-80">Limited Time</span>
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent drop-shadow-2xl px-2">
              {currentPromo.title}
            </h3>
            {currentPromo.description && (
              <p className="text-xs sm:text-sm md:text-lg opacity-95 mb-3 font-medium max-w-2xl mx-auto px-2">
                {currentPromo.description}
              </p>
            )}
            {currentPromo.promo_code && (
              <div className="mt-3 inline-flex items-center space-x-2 sm:space-x-3 bg-white/25 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-3 rounded-full border-2 border-white/40 shadow-xl transform hover:scale-105 transition-all duration-300 group">
                <span className="text-xs sm:text-sm font-semibold opacity-90">Use Code:</span>
                <span className="text-base sm:text-xl md:text-2xl font-black tracking-widest bg-gradient-to-r from-yellow-200 to-yellow-100 bg-clip-text text-transparent">
                  {currentPromo.promo_code}
                </span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
              </div>
            )}
            {(currentPromo.start_date || currentPromo.end_date) && (
              <div className="mt-3 flex items-center justify-center space-x-2 text-sm opacity-90">
                <Calendar className="h-4 w-4 animate-pulse" />
                <span className="font-medium">
                  {currentPromo.start_date && new Date(currentPromo.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {currentPromo.start_date && currentPromo.end_date && ' - '}
                  {currentPromo.end_date && new Date(currentPromo.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>

          {/* Right side - Navigation Dots with animation */}
          {promotions.length > 1 && (
            <div className="flex flex-col items-center space-y-2 flex-shrink-0">
              {promotions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`relative transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-3 h-8' 
                      : 'w-2 h-2'
                  } rounded-full ${
                    index === currentIndex
                      ? 'bg-white shadow-lg shadow-white/50'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to promotion ${index + 1}`}
                >
                  {index === currentIndex && (
                    <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

    </section>
  )
}
