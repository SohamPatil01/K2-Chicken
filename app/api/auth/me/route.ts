import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import jwt from 'jsonwebtoken'

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
      // Return 200 with null user instead of 401 to allow graceful handling
      return NextResponse.json({ user: null })
    }

    const client = await pool.connect()

    try {
      const result = await client.query(
        'SELECT id, phone, email, name FROM users WHERE id = $1',
        [userId]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ user: null })
      }

      return NextResponse.json({ user: result.rows[0] })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    // Return null user instead of error to prevent breaking the UI
    return NextResponse.json({ user: null })
  }
}

