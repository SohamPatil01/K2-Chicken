import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import jwt from 'jsonwebtoken'
import { otpStore } from '@/lib/otpStore'

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json()

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone number and OTP are required' }, { status: 400 })
    }

    const trimmedPhone = phone.trim()
    const trimmedOTP = otp.trim()

    // Get stored OTP data
    const storedData = otpStore.get(trimmedPhone)

    if (!storedData) {
      return NextResponse.json({ error: 'OTP not found or expired. Please request a new OTP.' }, { status: 400 })
    }

    // Check if OTP is expired
    if (storedData.expiresAt < Date.now()) {
      otpStore.delete(trimmedPhone)
      return NextResponse.json({ error: 'OTP has expired. Please request a new OTP.' }, { status: 400 })
    }

    // Check max attempts
    if (storedData.attempts >= 5) {
      otpStore.delete(trimmedPhone)
      return NextResponse.json({ error: 'Too many failed attempts. Please request a new OTP.' }, { status: 429 })
    }

    // Verify OTP
    if (storedData.otp !== trimmedOTP) {
      storedData.attempts += 1
      otpStore.set(trimmedPhone, storedData)
      return NextResponse.json({ 
        error: 'Invalid OTP',
        attemptsLeft: 5 - storedData.attempts
      }, { status: 401 })
    }

    // OTP is valid - get or create user
    const client = await pool.connect()

    try {
      let userResult = await client.query(
        'SELECT id, phone, email, name FROM users WHERE phone = $1',
        [trimmedPhone]
      )

      let user

      if (userResult.rows.length === 0) {
        // Create new user
        const newUser = await client.query(
          'INSERT INTO users (phone) VALUES ($1) RETURNING id, phone, email, name',
          [trimmedPhone]
        )
        user = newUser.rows[0]
      } else {
        user = userResult.rows[0]
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, phone: user.phone },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' }
      )

      // Remove OTP from store after successful verification
      otpStore.delete(trimmedPhone)

      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          name: user.name
        },
        token
      })

      // Set HTTP-only cookie
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      })

      return response

    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 })
  }
}

