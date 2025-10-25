'use client'

import { MessageCircle, X } from 'lucide-react'
import { useState } from 'react'

export default function ChatbotBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-green-500 text-white py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">
            🎉 New! Order directly through WhatsApp chat - Click the chat button to get started!
          </span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
