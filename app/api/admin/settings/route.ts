import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import pool from '@/lib/db'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

// Middleware to verify admin authentication
async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  if (!token) {
    return { authorized: false, error: 'Unauthorized' }
  }

  try {
    await jwtVerify(token, JWT_SECRET)
    return { authorized: true }
  } catch (error) {
    return { authorized: false, error: 'Invalid token' }
  }
}

// GET - Fetch all settings
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: 401 }
    )
  }

  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query('SELECT key, value, description, updated_at FROM settings ORDER BY key')
      
      // Convert to object format for easier access
      const settings: Record<string, any> = {}
      result.rows.forEach(row => {
        settings[row.key] = {
          value: row.value,
          description: row.description,
          updated_at: row.updated_at
        }
      })

      return NextResponse.json({ success: true, settings })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: 401 }
    )
  }

  try {
    const { settings } = await request.json()
    
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Invalid settings data' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')
      
      // Update each setting
      for (const [key, value] of Object.entries(settings)) {
        // Validate numeric values
        if (key === 'delivery_radius_km' || key === 'charge_per_km' || key === 'base_delivery_fee') {
          const numValue = parseFloat(value as string)
          if (isNaN(numValue) || numValue < 0) {
            await client.query('ROLLBACK')
            return NextResponse.json(
              { error: `Invalid value for ${key}. Must be a positive number.` },
              { status: 400 }
            )
          }
        }

        await client.query(
          `INSERT INTO settings (key, value, updated_at) 
           VALUES ($1, $2, CURRENT_TIMESTAMP)
           ON CONFLICT (key) 
           DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
          [key, String(value)]
        )
      }
      
      await client.query('COMMIT')
      
      return NextResponse.json({ success: true, message: 'Settings updated successfully' })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

