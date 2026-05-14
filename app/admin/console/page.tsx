'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/LoadingState'

export default function AdminConsole() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to main admin page
    router.replace('/admin')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-50 flex items-center justify-center px-4">
      <LoadingSpinner label="Redirecting to admin" size="md" />
    </div>
  )
}

/* 
 * This page redirects to /admin to avoid duplicate routes.
 * All admin functionality is now consolidated in /app/admin/page.tsx
 */
