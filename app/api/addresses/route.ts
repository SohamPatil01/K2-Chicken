import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import jwt from 'jsonwebtoken'

function getUserIdFromToken(request: NextRequest): number | null {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return null

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    return decoded.userId
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await pool.connect()

    try {
      const result = await client.query(
        `SELECT id, address, latitude, longitude, label, is_default, created_at
         FROM user_addresses
         WHERE user_id = $1
         ORDER BY is_default DESC, created_at DESC`,
        [userId]
      )

      return NextResponse.json(result.rows)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { address, latitude, longitude, label, is_default } = await request.json()

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // If this is set as default, unset other defaults
      if (is_default) {
        await client.query(
          'UPDATE user_addresses SET is_default = false WHERE user_id = $1',
          [userId]
        )
      }

      const result = await client.query(
        `INSERT INTO user_addresses (user_id, address, latitude, longitude, label, is_default)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, address, latitude || null, longitude || null, label || 'Home', is_default || false]
      )

      await client.query('COMMIT')

      return NextResponse.json(result.rows[0], { status: 201 })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error creating address:', error)
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 })
  }
}

