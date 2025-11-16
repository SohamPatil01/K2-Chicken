// Shared OTP store (use Redis in production)
// This is a simple in-memory solution for development

interface OTPData {
  otp: string
  expiresAt: number
  attempts: number
}

declare global {
  var otpStore: Map<string, OTPData> | undefined
}

// Use global store to persist across hot reloads in development
const getOTPStore = (): Map<string, OTPData> => {
  if (!global.otpStore) {
    global.otpStore = new Map()
  }
  return global.otpStore
}

export const otpStore = getOTPStore()

// Cleanup expired OTPs periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [phone, data] of otpStore.entries()) {
      if (data.expiresAt < now) {
        otpStore.delete(phone)
      }
    }
  }, 5 * 60 * 1000) // Clean every 5 minutes
}

export function generateOTP(): string {
  // Generate 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString()
}

