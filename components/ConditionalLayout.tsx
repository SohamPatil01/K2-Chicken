'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'
import ChatbotBanner from './ChatbotBanner'
import FloatingWhatsApp from './FloatingWhatsApp'
import MobileBottomNav from './MobileBottomNav'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Pages that should have their own full-screen layout (no Header/Footer)
  const fullScreenPages: string[] = []
  
  // Pages that should not have Header/Footer (admin pages have their own navigation)
  const isAdminPage = pathname?.startsWith('/admin')
  
  const isFullScreenPage = fullScreenPages.includes(pathname || '')
  
  if (isFullScreenPage || isAdminPage) {
    // For full-screen pages like WhatsApp bot or admin pages, don't render the main layout components
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
