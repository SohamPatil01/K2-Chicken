'use client'

import { MessageCircle, Smartphone, Clock, Users } from 'lucide-react'

export default function ChatbotCTA() {
  const WHATSAPP_NUMBER = '8484978622'

  const handleWhatsAppOrder = () => {
    const message = encodeURIComponent(
      `🍗 *Hello! I'd like to order from K2 Chicken*\n\n` +
      `Please help me with my order.`
    )
    const whatsappUrl = `https://wa.me/91${WHATSAPP_NUMBER}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <section className="bg-gradient-to-r from-green-50 to-green-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-6">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Order via WhatsApp
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Place your order directly through WhatsApp! Add items to cart and click the WhatsApp button to send your order.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-lg mb-4">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Ordering</h3>
            <p className="text-gray-600">
              Add items to cart and order directly through WhatsApp with all your order details.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-lg mb-4">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Response</h3>
            <p className="text-gray-600">
              Get instant confirmation and updates about your order directly on WhatsApp.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-lg mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Direct Contact</h3>
            <p className="text-gray-600">
              Chat directly with our team for any special requests or modifications to your order.
            </p>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Order via WhatsApp Now!
            </h3>
            <p className="text-gray-600 mb-6">
              Click the button below to open WhatsApp and place your order. Our team will confirm your order shortly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleWhatsAppOrder}
                className="flex items-center justify-center bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                <span className="font-semibold">Order via WhatsApp</span>
              </button>
              <div className="text-sm text-gray-500 flex items-center justify-center">
                <Clock className="h-4 w-4 mr-1" />
                Quick Response
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
