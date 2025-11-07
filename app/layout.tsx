import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import ConditionalLayout from '@/components/ConditionalLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chicken Vicken - Finger Lickin\' Good!',
  description: 'The best chicken in town - crispy, juicy, and absolutely delicious!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </div>
        </CartProvider>
      </body>
    </html>
  )
}
