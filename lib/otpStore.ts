// In-memory OTP store
// In production, consider using Redis or a database for OTP storage

interface OTPData {
  otp: string
  expiresAt: number
  attempts: number
}

class OTPStore {
  private store: Map<string, OTPData> = new Map()

  set(phone: string, data: OTPData): void {
    this.store.set(phone, data)
    
    // Auto-cleanup expired OTPs
    setTimeout(() => {
      const stored = this.store.get(phone)
      if (stored && stored.expiresAt < Date.now()) {
        this.store.delete(phone)
      }
    }, data.expiresAt - Date.now())
  }

  get(phone: string): OTPData | undefined {
    const data = this.store.get(phone)
    if (data && data.expiresAt < Date.now()) {
      // Auto-delete expired OTP
      this.store.delete(phone)
      return undefined
    }
    return data
  }

  delete(phone: string): void {
    this.store.delete(phone)
  }

  clear(): void {
    this.store.clear()
  }
}

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Export singleton instance
export const otpStore = new OTPStore()

// Cleanup expired OTPs every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    const store = (otpStore as any).store as Map<string, OTPData>
    const phonesToDelete: string[] = []
    
    store.forEach((data, phone) => {
      if (data.expiresAt < now) {
        phonesToDelete.push(phone)
      }
    })
    
    phonesToDelete.forEach(phone => {
      otpStore.delete(phone)
    })
  }, 5 * 60 * 1000) // Every 5 minutes
}

