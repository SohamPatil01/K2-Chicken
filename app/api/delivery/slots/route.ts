import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') // YYYY-MM-DD format

    const client = await pool.connect()

    try {
      let query
      let params

      if (date) {
        // Get slots for specific date
        query = `
          SELECT id, date, start_time, end_time, available_slots, is_active
          FROM delivery_time_slots
          WHERE date = $1 AND is_active = true
          ORDER BY start_time ASC
        `
        params = [date]
      } else {
        // Get slots for next 7 days
        query = `
          SELECT id, date, start_time, end_time, available_slots, is_active
          FROM delivery_time_slots
          WHERE date >= CURRENT_DATE 
            AND date <= CURRENT_DATE + INTERVAL '7 days'
            AND is_active = true
          ORDER BY date ASC, start_time ASC
        `
        params = []
      }

      const result = await client.query(query, params)

      // Group by date
      const slotsByDate: Record<string, any[]> = {}
      result.rows.forEach(slot => {
        const dateKey = slot.date.toISOString().split('T')[0]
        if (!slotsByDate[dateKey]) {
          slotsByDate[dateKey] = []
        }
        slotsByDate[dateKey].push({
          id: slot.id,
          start_time: slot.start_time,
          end_time: slot.end_time,
          available_slots: slot.available_slots
        })
      })

      return NextResponse.json(slotsByDate)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching delivery slots:', error)
    return NextResponse.json({ error: 'Failed to fetch delivery slots' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { date, start_time, end_time, available_slots, is_active } = await request.json()

    if (!date || !start_time || !end_time) {
      return NextResponse.json({ error: 'Date, start_time, and end_time are required' }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      const result = await client.query(
        `INSERT INTO delivery_time_slots (date, start_time, end_time, available_slots, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [date, start_time, end_time, available_slots || 10, is_active !== false]
      )

      return NextResponse.json(result.rows[0], { status: 201 })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error creating delivery slot:', error)
    return NextResponse.json({ error: 'Failed to create delivery slot' }, { status: 500 })
  }
}

