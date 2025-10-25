'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, ShoppingCart, Menu, Package, Phone, MapPin, Clock } from 'lucide-react'

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  buttons?: Array<{
    type: string
    reply: {
      id: string
      title: string
    }
  }>
  list_sections?: Array<{
    title: string
    rows: Array<{
      id: string
      title: string
    }>
  }>
}

export default function WhatsAppChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (message: string) => {
    if (!message.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'web_user',
          message: message
        })
      })

      const data = await response.json()
      
      if (data.success) {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: data.response.response,
          isUser: false,
          timestamp: new Date(),
          buttons: data.response.buttons,
          list_sections: data.response.list_sections
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: 'Sorry, there was an error processing your message. Please try again.',
          isUser: false,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, there was an error connecting to the chatbot. Please try again.',
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleButtonClick = (buttonId: string) => {
    sendMessage(buttonId)
  }

  const getIcon = (title: string) => {
    if (title.includes('Order')) return <ShoppingCart className="h-4 w-4 mr-2" />
    if (title.includes('Menu')) return <Menu className="h-4 w-4 mr-2" />
    if (title.includes('Track')) return <Package className="h-4 w-4 mr-2" />
    if (title.includes('Human')) return <Phone className="h-4 w-4 mr-2" />
    if (title.includes('Info')) return <MapPin className="h-4 w-4 mr-2" />
    if (title.includes('appetizer')) return <Package className="h-4 w-4 mr-2" />
    if (title.includes('main')) return <Menu className="h-4 w-4 mr-2" />
    if (title.includes('All Items')) return <Menu className="h-4 w-4 mr-2" />
    if (title.includes('Back')) return <Clock className="h-4 w-4 mr-2" />
    return null
  }

  const startChat = () => {
    setIsOpen(true)
    if (messages.length === 0) {
      sendMessage('hi')
    }
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={startChat}
            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="Open WhatsApp Chat"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-green-500 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              <span className="font-semibold">K2 Chicken Chat</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Start a conversation with our chatbot!</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.isUser
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  
                  {/* Interactive Buttons */}
                  {message.buttons && message.buttons.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.buttons.map((button, index) => (
                        <button
                          key={index}
                          onClick={() => handleButtonClick(button.reply.id)}
                          className="flex items-center w-full text-left px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 transition-colors"
                        >
                          {getIcon(button.reply.title)}
                          {button.reply.title}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* List Sections */}
                  {message.list_sections && message.list_sections.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-500 mb-2">Select an option:</p>
                      {message.list_sections[0].rows.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleButtonClick(item.id)}
                          className="flex items-center w-full text-left px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 transition-colors"
                        >
                          {getIcon(item.title)}
                          {item.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage(inputMessage)}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg px-3 py-2 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
