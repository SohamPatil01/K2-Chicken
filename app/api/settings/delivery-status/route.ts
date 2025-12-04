import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(
        'SELECT value FROM settings WHERE key = $1',
        ['delivery_enabled']
      )
      
      // Default to true if setting doesn't exist
      const enabled = result.rows.length > 0 
        ? result.rows[0].value === 'true' || result.rows[0].value === true
        : true
      
      return NextResponse.json({ enabled })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching delivery status:', error)
    // Default to enabled on error
    return NextResponse.json({ enabled: true })
  }
}


