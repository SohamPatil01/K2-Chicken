import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import ConditionalLayout from '@/components/ConditionalLayout'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chicken Vicken - Finger Lickin\' Good!',
  description: 'The best chicken in town - crispy, juicy, and absolutely delicious!',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </div>
          </CartProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
