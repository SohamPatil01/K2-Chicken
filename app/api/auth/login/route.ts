import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      // Find user by phone
      const result = await client.query(
        'SELECT id, phone, email, name, password_hash FROM users WHERE phone = $1',
        [phone]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      const user = result.rows[0]

      // If password is provided, verify it
      if (password && user.password_hash) {
        const isValid = await bcrypt.compare(password, user.password_hash)
        if (!isValid) {
          return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }
      } else if (password && !user.password_hash) {
        // User exists but no password set - allow OTP login
        // In production, verify OTP here
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, phone: user.phone },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' }
      )

      const response = NextResponse.json({
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
    console.error('Error logging in:', error)
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 })
  }
}

