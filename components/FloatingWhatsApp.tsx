'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export default function FloatingWhatsApp() {
  const [isHovered, setIsHovered] = useState(false)
  const { state } = useCart()
  const WHATSAPP_NUMBER = '8484978622' // K2 Chicken WhatsApp number

  const handleWhatsAppOrder = () => {
    // Build order message
    const orderItems = state.items.map(item => 
      `${item.product.name} x${item.quantity} - ₹${(Number(item.product.price) * item.quantity).toFixed(0)}`
    ).join('\n')
    
    const total = state.total.toFixed(0)
    const message = encodeURIComponent(
      `🍗 *Order from K2 Chicken*\n\n` +
      `*Order Details:*\n${orderItems}\n\n` +
      `*Total: ₹${total}*\n\n` +
      `Please confirm your order and provide delivery address.`
    )
    
    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/91${WHATSAPP_NUMBER}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

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
            Order via WhatsApp!
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}

        {/* WhatsApp Button */}
        <button 
          onClick={handleWhatsAppOrder}
          disabled={state.items.length === 0}
          className={`w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${
            state.items.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Order via WhatsApp"
        >
          <MessageCircle className="h-7 w-7" />
        </button>
      </div>
    </div>
  )
}
