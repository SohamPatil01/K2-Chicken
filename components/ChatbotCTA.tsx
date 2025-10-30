import { MessageCircle, Smartphone, Clock, Users } from 'lucide-react'
import Link from 'next/link'

export default function ChatbotCTA() {
  return (
    <section className="bg-gradient-to-r from-green-50 to-green-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-6">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Order with WhatsApp Chat
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get instant help with your order, browse our menu, and place orders directly through our smart WhatsApp chatbot. 
            Available 24/7 for your convenience!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-lg mb-4">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Ordering</h3>
            <p className="text-gray-600">
              Browse our menu, select items, and place orders directly through WhatsApp chat.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-lg mb-4">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Available</h3>
            <p className="text-gray-600">
              Our chatbot is always ready to help you, even outside business hours.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-lg mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Support</h3>
            <p className="text-gray-600">
              Get immediate answers to your questions and track your orders in real-time.
            </p>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Try Our WhatsApp Chatbot Now!
            </h3>
            <p className="text-gray-600 mb-6">
              Click the button below to start ordering or ask any questions about our menu through our WhatsApp chatbot.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/whatsapp-test" className="flex items-center justify-center bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors">
                <MessageCircle className="h-5 w-5 mr-2" />
                <span className="font-semibold">Start Chatting</span>
              </Link>
              <div className="text-sm text-gray-500 flex items-center justify-center">
                <Clock className="h-4 w-4 mr-1" />
                Available 24/7
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
