'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, Bot, User, ShoppingCart, Menu, Package, Phone, MapPin, Clock, AlertCircle, CheckCircle, ArrowLeft, Home, X } from 'lucide-react'
import Link from 'next/link'

interface ChatMessage {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
  buttons?: any[]
  list_sections?: any[]
  isError?: boolean
}

export default function WhatsAppTestPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const [showWelcome, setShowWelcome] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Auto-start conversation after 2 seconds
    const timer = setTimeout(() => {
      if (messages.length === 0) {
        sendMessage('hi')
        setShowWelcome(false)
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        const target = event.target as Element
        if (!target.closest('.mobile-menu-container')) {
          setIsMobileMenuOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileMenuOpen])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isBot: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)
    setIsConnected(true)

    try {
      const response = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'web_user',
          message: text.trim()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Chatbot response:', data)
      
      if (data.success && data.response) {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: data.response.response || 'I received your message.',
          isBot: true,
          timestamp: new Date(),
          buttons: data.response.buttons,
          list_sections: data.response.list_sections
        }
        
        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error(data.error || 'Invalid response from chatbot')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setIsConnected(false)
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, there was an error connecting to the chatbot. Please try again.',
        isBot: true,
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputText)
  }

  const handleButtonClick = (buttonId: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    sendMessage(buttonId)
  }

  const startConversation = () => {
    sendMessage('hi')
  }

  const clearChat = () => {
    setMessages([])
    setIsConnected(true)
  }

  const closeChatbot = () => {
    window.location.href = '/'
  }

  const getButtonIcon = (title: string) => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes('order') || lowerTitle.includes('place')) return <ShoppingCart className="h-4 w-4 mr-2" />
    if (lowerTitle.includes('menu') || lowerTitle.includes('view')) return <Menu className="h-4 w-4 mr-2" />
    if (lowerTitle.includes('track') || lowerTitle.includes('status')) return <Package className="h-4 w-4 mr-2" />
    if (lowerTitle.includes('human') || lowerTitle.includes('support')) return <Phone className="h-4 w-4 mr-2" />
    if (lowerTitle.includes('info') || lowerTitle.includes('restaurant')) return <MapPin className="h-4 w-4 mr-2" />
    if (lowerTitle.includes('time') || lowerTitle.includes('hours')) return <Clock className="h-4 w-4 mr-2" />
    return null
  }

  const getListIcon = (title: string) => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes('appetizer') || lowerTitle.includes('starter')) return <Package className="h-4 w-4 mr-2" />
    if (lowerTitle.includes('main') || lowerTitle.includes('entree')) return <Menu className="h-4 w-4 mr-2" />
    if (lowerTitle.includes('all items') || lowerTitle.includes('everything')) return <Menu className="h-4 w-4 mr-2" />
    if (lowerTitle.includes('back') || lowerTitle.includes('return')) return <Clock className="h-4 w-4 mr-2" />
    return null
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 overflow-hidden" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Navigation Bar */}
      <div className="relative z-20 bg-white/10 backdrop-blur-xl border-b border-white/20 mobile-menu-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Back Button */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center space-x-3 group hover:scale-105 transition-transform duration-300"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-lg font-black text-white">K2</span>
                </div>
                <div className="hidden sm:block">
                  <div className="text-lg font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    Chicken Vicken
                  </div>
                  <div className="text-xs text-gray-300 font-medium">Finger Lickin' Good</div>
                </div>
              </Link>
              <Link 
                href="/" 
                className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-semibold">Back to Home</span>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/#products" 
                className="px-4 py-2 text-white/80 hover:text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                Products
              </Link>
              <Link 
                href="/recipes" 
                className="px-4 py-2 text-white/80 hover:text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                Recipes
              </Link>
              <Link 
                href="/cart" 
                className="px-4 py-2 text-white/80 hover:text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                Cart
              </Link>
            </div>

            {/* Close and Mobile Menu Buttons */}
            <div className="flex items-center space-x-2">
              {/* Close Button */}
              <button 
                onClick={closeChatbot}
                className="p-2 text-white/80 hover:text-white hover:bg-red-500/20 rounded-xl transition-all duration-300 hover:scale-110"
                title="Close Chatbot"
              >
                <X className="h-6 w-6" />
              </button>
              
              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 text-white/80 hover:text-white transition-colors"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/10 backdrop-blur-xl border-b border-white/20">
          <div className="px-4 py-4 space-y-3">
            <Link 
              href="/#products" 
              className="block px-4 py-3 text-white/80 hover:text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link 
              href="/recipes" 
              className="block px-4 py-3 text-white/80 hover:text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Recipes
            </Link>
            <Link 
              href="/cart" 
              className="block px-4 py-3 text-white/80 hover:text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cart
            </Link>
          </div>
        </div>
      )}

      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-500/10 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-emerald-500/10 rounded-full blur-lg animate-pulse"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-green-400/10 rounded-full blur-md animate-ping"></div>
      </div>

      <div className="relative z-10 h-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col pt-4">
        {/* Header */}
        <div className="mb-6 text-center flex-shrink-0 pt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-4 shadow-2xl">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            K2 Chicken <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">WhatsApp Bot</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Experience the future of ordering with our intelligent chatbot assistant
          </p>
        </div>

        {/* Status Indicator */}
        <div className="mb-6 flex justify-center flex-shrink-0">
          <div className={`inline-flex items-center px-6 py-3 rounded-2xl text-sm font-bold shadow-lg ${
            isConnected 
              ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
              : 'bg-red-500/20 text-red-300 border border-red-400/30'
          }`}>
            {isConnected ? (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                <CheckCircle className="h-5 w-5 mr-2" />
                Assistant Online
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                <AlertCircle className="h-5 w-5 mr-2" />
                Connection Error
              </>
            )}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex-1 flex flex-col border border-white/20">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                  <Bot className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">K2 Chicken Assistant</h3>
                  <p className="text-green-100 text-sm">Your personal ordering companion</p>
                </div>
              </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={(e) => { e.preventDefault(); startConversation(); }}
                              className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 hover:scale-105 font-semibold"
                            >
                              Start Chat
                            </button>
                            <button
                              onClick={(e) => { e.preventDefault(); clearChat(); }}
                              className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 hover:scale-105 font-semibold"
                            >
                              Clear
                            </button>
                            <button
                              onClick={(e) => { e.preventDefault(); closeChatbot(); }}
                              className="px-4 py-2 bg-red-500/20 text-white rounded-xl hover:bg-red-500/30 transition-all duration-300 hover:scale-105 font-semibold flex items-center gap-2"
                              title="Close Chatbot"
                            >
                              <X className="h-4 w-4" />
                              Close
                            </button>
                          </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50 to-gray-100 scroll-smooth">
            {messages.length === 0 ? (
              <div className="text-center text-gray-600 py-16">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <MessageCircle className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Welcome to K2 Chicken!</h3>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">I'm your intelligent assistant, ready to help you order the most delicious chicken in town!</p>
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-700">Try saying:</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <span className="px-4 py-2 bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => sendMessage('hi')}>"Hi"</span>
                    <span className="px-4 py-2 bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => sendMessage('menu')}>"Menu"</span>
                    <span className="px-4 py-2 bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => sendMessage('order')}>"Order"</span>
                    <span className="px-4 py-2 bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => sendMessage('track')}>"Track"</span>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} group`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-6 py-4 rounded-3xl shadow-lg ${
                      message.isBot
                        ? message.isError
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-white text-gray-900 border border-gray-200 group-hover:shadow-xl transition-all duration-300'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white group-hover:shadow-xl transition-all duration-300'
                    }`}
                  >
                    <div className="flex items-start">
                      {message.isBot && (
                        <Bot className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                      )}
                      {!message.isBot && (
                        <User className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        
                        {/* Quick Reply Buttons */}
                        {message.buttons && message.buttons.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.buttons.map((button, index) => (
                              <button
                                key={index}
                                onClick={(e) => handleButtonClick(button.reply.id, e)}
                                className="flex items-center w-full text-left px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm hover:bg-green-100 transition-colors"
                              >
                                {getButtonIcon(button.reply.title)}
                                {button.reply.title}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {/* List Sections */}
                        {message.list_sections && message.list_sections.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs text-gray-500 mb-2 font-medium">Choose an option:</p>
                            {message.list_sections[0].rows.map((item: any, index: number) => (
                              <button
                                key={index}
                                onClick={(e) => handleButtonClick(item.id, e)}
                                className="flex items-center w-full text-left px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                              >
                                {getListIcon(item.title)}
                                {item.title}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        <p className="text-xs mt-2 opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex items-center">
                    <Bot className="h-4 w-4 mr-2 text-gray-400" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200/50 p-6 bg-white/80 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="flex space-x-4">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center font-bold shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>


      </div>
    </div>
  )
}