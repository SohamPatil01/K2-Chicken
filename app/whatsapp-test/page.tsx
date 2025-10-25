'use client'

import { useState } from 'react'
import { MessageCircle, Send, Bot, User, ShoppingCart, Menu, Package, Phone, MapPin, Clock } from 'lucide-react'

interface ChatMessage {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
  buttons?: any[]
  list_sections?: any[]
}

export default function WhatsAppTestPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isBot: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'test_user',
          message: text.trim()
        })
      })

      const data = await response.json()
      console.log('Chatbot response:', data)
      
      if (data.success) {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: data.response.response,
          isBot: true,
          timestamp: new Date(),
          buttons: data.response.buttons,
          list_sections: data.response.list_sections
        }
        
        setMessages(prev => [...prev, botMessage])
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: 'Sorry, there was an error processing your message.',
          isBot: true,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, there was an error processing your message. Please try again.',
        isBot: true,
        timestamp: new Date()
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

  const handleButtonClick = (buttonId: string) => {
    sendMessage(buttonId)
  }

  const startConversation = () => {
    sendMessage('hi')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
            <MessageCircle className="h-8 w-8 mr-3 text-green-600" />
            WhatsApp Chatbot Test
          </h1>
          <p className="text-lg text-gray-600">
            Test the K2 Chicken WhatsApp chatbot functionality
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          {/* Chat Header */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Bot className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">K2 Chicken Bot</h3>
                  <p className="text-sm text-gray-500">Online</p>
                </div>
              </div>
              <button
                onClick={startConversation}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Start Conversation
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Start a conversation with the K2 Chicken chatbot!</p>
                <p className="text-sm mt-2">Try saying "hi", "menu", or "order"</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isBot
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-green-600 text-white'
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
                        {message.buttons && message.buttons.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.buttons.map((button, index) => {
                              const getIcon = (title: string) => {
                                if (title.includes('Order')) return <ShoppingCart className="h-4 w-4 mr-2" />;
                                if (title.includes('Menu')) return <Menu className="h-4 w-4 mr-2" />;
                                if (title.includes('Track')) return <Package className="h-4 w-4 mr-2" />;
                                if (title.includes('Human')) return <Phone className="h-4 w-4 mr-2" />;
                                if (title.includes('Info')) return <MapPin className="h-4 w-4 mr-2" />;
                                return null;
                              };
                              
                              return (
                                <button
                                  key={index}
                                  onClick={() => handleButtonClick(button.reply.id)}
                                  className="flex items-center w-full text-left px-3 py-2 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                                >
                                  {getIcon(button.reply.title)}
                                  {button.reply.title}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {message.list_sections && message.list_sections.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-500 mb-2">Select an option:</p>
                            {message.list_sections[0].rows.map((item, index) => {
                              const getIcon = (title: string) => {
                                if (title.includes('appetizer')) return <Package className="h-4 w-4 mr-2" />;
                                if (title.includes('main')) return <Menu className="h-4 w-4 mr-2" />;
                                if (title.includes('All Items')) return <Menu className="h-4 w-4 mr-2" />;
                                if (title.includes('Back')) return <Clock className="h-4 w-4 mr-2" />;
                                return null;
                              };
                              
                              return (
                                <button
                                  key={index}
                                  onClick={() => handleButtonClick(item.id)}
                                  className="flex items-center w-full text-left px-3 py-2 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                                >
                                  {getIcon(item.title)}
                                  {item.title}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex items-center">
                    <Bot className="h-4 w-4 mr-2" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Test Instructions</h3>
          <div className="text-blue-800 space-y-2">
            <p>Try these commands to test the chatbot:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>"hi"</strong> or <strong>"hello"</strong> - Start the conversation</li>
              <li><strong>"menu"</strong> - View the menu</li>
              <li><strong>"order"</strong> - Start placing an order</li>
              <li><strong>"track"</strong> - Track an order</li>
              <li><strong>"info"</strong> - Get restaurant information</li>
            </ul>
            <p className="text-sm mt-4">
              <strong>Note:</strong> This is a test interface. In production, customers would interact with the chatbot through WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
