import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { otpStore, generateOTP } from '@/lib/otpStore'

// OTP expiration time: 10 minutes
const OTP_EXPIRY = 10 * 60 * 1000
// Max attempts: 5
const MAX_ATTEMPTS = 5

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const trimmedPhone = phone.trim()

    // Check if phone number is valid (basic validation)
    if (trimmedPhone.length < 10) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      // Check if user exists, if not create one
      let userResult = await client.query(
        'SELECT id, phone FROM users WHERE phone = $1',
        [trimmedPhone]
      )

      let userId: number

      if (userResult.rows.length === 0) {
        // Create new user without password
        const newUser = await client.query(
          'INSERT INTO users (phone) VALUES ($1) RETURNING id',
          [trimmedPhone]
        )
        userId = newUser.rows[0].id
      } else {
        userId = userResult.rows[0].id
      }

      // Check if there's an existing OTP and if it's still valid
      const existingOTP = otpStore.get(trimmedPhone)
      if (existingOTP && existingOTP.expiresAt > Date.now()) {
        // Don't send new OTP if one is still valid (prevent spam)
        const timeLeft = Math.ceil((existingOTP.expiresAt - Date.now()) / 1000 / 60)
        return NextResponse.json({
          error: `OTP already sent. Please wait ${timeLeft} minute(s) before requesting a new one.`,
          retryAfter: timeLeft
        }, { status: 429 })
      }

      // Generate new OTP
      const otp = generateOTP()
      const expiresAt = Date.now() + OTP_EXPIRY

      // Store OTP
      otpStore.set(trimmedPhone, {
        otp,
        expiresAt,
        attempts: 0
      })

      // In production, send OTP via SMS service (Twilio, AWS SNS, etc.)
      // For development, we'll log it and return it in the response
      console.log(`OTP for ${trimmedPhone}: ${otp} (expires in 10 minutes)`)

      // TODO: Integrate with SMS service
      // await sendSMS(trimmedPhone, `Your K2 Chicken OTP is ${otp}. Valid for 10 minutes.`)

      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
        // In development, return OTP. Remove this in production!
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
        expiresIn: 10 // minutes
      })

    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error sending OTP:', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}

