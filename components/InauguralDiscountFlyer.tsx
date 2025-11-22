'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { X, Gift, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function InauguralDiscountFlyer() {
  const [isVisible, setIsVisible] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Only show if user is not authenticated
    if (isAuthenticated) {
      setIsVisible(false)
      return
    }

    // Show flyer immediately after a short delay
    const initialTimer = setTimeout(() => {
      setIsVisible(true)
    }, 1500)

    // Set up interval to show flyer every 15 seconds
    intervalRef.current = setInterval(() => {
      setIsVisible(true)
    }, 15000) // 15 seconds

    return () => {
      clearTimeout(initialTimer)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAuthenticated])

  const handleClose = () => {
    setIsVisible(false)
    // Don't set localStorage - allow flyer to show again after 15 seconds
  }

  const handleSignUpClick = () => {
    setIsVisible(false)
    // Don't set localStorage - allow flyer to show again after 15 seconds
  }

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={handleClose}
      />
      
      {/* Flyer Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="relative bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 rounded-3xl shadow-2xl max-w-md w-full pointer-events-auto animate-scale-in overflow-hidden border-2 border-orange-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-orange-300/20 to-red-300/20 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative p-8 sm:p-10">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-full shadow-lg">
                  <Gift className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-6 w-6 text-yellow-400 animate-bounce" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-3 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Welcome Bonus! 🎉
            </h2>

            {/* Discount Badge */}
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-bold text-2xl shadow-lg transform hover:scale-105 transition-transform duration-200">
                10% OFF
              </div>
            </div>

            {/* Description */}
            <p className="text-center text-gray-700 mb-2 text-lg font-semibold">
              Get <span className="text-orange-600 font-bold">10% discount</span> on your first order!
            </p>
            <p className="text-center text-gray-600 mb-6 text-sm">
              Sign up now and enjoy fresh, premium chicken at amazing prices. Limited time offer for new customers!
            </p>

            {/* Benefits */}
            <div className="bg-white/60 rounded-xl p-4 mb-6 backdrop-blur-sm">
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>10% discount on first order</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>View your order history</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Exclusive discounts on repeat orders</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Save delivery addresses</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <Link
              href="/login?redirect=/checkout"
              onClick={handleSignUpClick}
              className="block w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-center group"
            >
              <span className="flex items-center justify-center gap-2">
                Sign Up Now
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            {/* Small print */}
            <p className="text-center text-xs text-gray-500 mt-4">
              * Discount applies automatically on your first order after sign up
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

