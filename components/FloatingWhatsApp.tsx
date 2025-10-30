'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
// import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function FloatingWhatsApp() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative"
      >
        {/* Tooltip */}
        {isHovered && (
          <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
            Chat with us on WhatsApp!
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}

        {/* WhatsApp Button */}
        <Link href="/whatsapp-test">
          <button className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group">
            <MessageCircle className="h-7 w-7" />
          </button>
        </Link>
      </div>
    </div>
  )
}
