'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global application error:', error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-k2-cream-dark px-4">
          <div className="max-w-md w-full bg-white rounded-card shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">⚠️</span>
              </div>
              <h1 className="text-2xl font-bold text-k2-green-deep mb-2">Something went wrong!</h1>
              <p className="text-[#5a6a61] mb-6">
                We encountered an unexpected error. Please try again.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full bg-brand-red hover:bg-brand-red-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-k2-cream-dark hover:bg-gray-200 text-k2-ink font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Go Home
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-[#7b877f] hover:text-k2-ink">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs bg-k2-cream p-4 rounded overflow-auto">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}

