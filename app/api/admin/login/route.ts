import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import bcrypt from 'bcryptjs'

// Rate limiting - simple in-memory store (use Redis in production)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

function getClientId(request: NextRequest): string {
  // Use IP address for rate limiting
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  return ip
}

function isRateLimited(clientId: string): boolean {
  const attempts = loginAttempts.get(clientId)
  
  if (!attempts) {
    return false
  }
  
  // Reset if lockout period has passed
  if (Date.now() - attempts.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(clientId)
    return false
  }
  
  return attempts.count >= MAX_ATTEMPTS
}

function recordFailedAttempt(clientId: string) {
  const attempts = loginAttempts.get(clientId) || { count: 0, lastAttempt: 0 }
  attempts.count += 1
  attempts.lastAttempt = Date.now()
  loginAttempts.set(clientId, attempts)
}

function clearAttempts(clientId: string) {
  loginAttempts.delete(clientId)
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function POST(request: NextRequest) {
  try {
    const clientId = getClientId(request)
    
    // Check rate limiting
    if (isRateLimited(clientId)) {
      return NextResponse.json(
        { success: false, error: 'Too many failed login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const { username, password } = await request.json()

    // Get credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

    console.log('Login attempt:', { 
      providedUsername: username, 
      envUsername: adminUsername ? 'SET' : 'NOT SET',
      passwordHashSet: adminPasswordHash ? 'SET' : 'NOT SET'
    })

    // Check if credentials are configured
    if (!adminUsername || !adminPasswordHash) {
      console.error('Admin credentials not configured in environment variables')
      console.error('ADMIN_USERNAME:', adminUsername ? 'SET' : 'MISSING')
      console.error('ADMIN_PASSWORD_HASH:', adminPasswordHash ? 'SET' : 'MISSING')
      return NextResponse.json(
        { success: false, error: 'Server configuration error. Please contact administrator.' },
        { status: 500 }
      )
    }

    // Validate username
    if (username !== adminUsername) {
      console.log('Username mismatch:', { provided: username, expected: adminUsername })
      recordFailedAttempt(clientId)
      // Generic error message to prevent username enumeration
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Validate password using bcrypt
    console.log('Validating password...')
    const isPasswordValid = await bcrypt.compare(password, adminPasswordHash)
    console.log('Password validation result:', isPasswordValid)
    
    if (!isPasswordValid) {
      console.log('Password mismatch')
      recordFailedAttempt(clientId)
      // Generic error message
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    console.log('Credentials validated successfully!')

    // Clear failed attempts on successful login
    clearAttempts(clientId)

    // Create JWT token
    const token = await new SignJWT({ 
      username,
      role: 'admin',
      iat: Math.floor(Date.now() / 1000)
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET)

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        username,
        role: 'admin'
      }
    })

    // Set HTTP-only, secure cookie
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
