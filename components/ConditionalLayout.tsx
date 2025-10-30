'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'
import ChatbotBanner from './ChatbotBanner'
import FloatingWhatsApp from './FloatingWhatsApp'
import MobileBottomNav from './MobileBottomNav'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Pages that should have their own full-screen layout
  const fullScreenPages = ['/whatsapp-test']
  
  const isFullScreenPage = fullScreenPages.includes(pathname)
  
  if (isFullScreenPage) {
    // For full-screen pages like WhatsApp bot, don't render the main layout components
    return <>{children}</>
  }
  
  // For regular pages, render the normal layout
  return (
    <>
      <ChatbotBanner />
      <Header />
      <main className="flex-grow pb-20 md:pb-0">
        {children}
      </main>
      <Footer />
      <FloatingWhatsApp />
      <MobileBottomNav />
    </>
  )
}
