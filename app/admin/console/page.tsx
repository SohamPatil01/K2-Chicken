'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminConsole() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to main admin page
    router.replace('/admin')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-brand-red mx-auto mb-4"></div>
        <p className="text-gray-700 font-semibold">Redirecting...</p>
      </div>
    </div>
  )
}

/* 
 * This page redirects to /admin to avoid duplicate routes.
 * All admin functionality is now consolidated in /app/admin/page.tsx
 */
