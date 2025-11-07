import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { phone, email, name, password } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE phone = $1',
        [phone]
      )

      if (existingUser.rows.length > 0) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 })
      }

      // Hash password if provided
      let passwordHash = null
      if (password) {
        passwordHash = await bcrypt.hash(password, 10)
      }

      // Create user
      const result = await client.query(
        `INSERT INTO users (phone, email, name, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING id, phone, email, name, created_at`,
        [phone, email || null, name || null, passwordHash]
      )

      const user = result.rows[0]

      return NextResponse.json({ 
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          name: user.name
        }
      }, { status: 201 })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error registering user:', error)
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 })
  }
}

