import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// Cache for 60 seconds
export const revalidate = 60;

// GET - Fetch all promotions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    let query = `
      SELECT * FROM promotions
      ${activeOnly ? 'WHERE is_active = true AND (end_date IS NULL OR end_date >= CURRENT_DATE)' : ''}
      ORDER BY display_order ASC, created_at DESC
    `

    const result = await pool.query(query)
    
    return NextResponse.json(result.rows)
  } catch (error: any) {
    console.error('Error fetching promotions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch promotions' },
      { status: 500 }
    )
  }
}

// POST - Create a new promotion
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      discount_type,
      discount_value,
      promo_code,
      image_url,
      start_date,
      end_date,
      is_active = true,
      display_order = 0
    } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const result = await pool.query(`
      INSERT INTO promotions (
        title, description, discount_type, discount_value, promo_code,
        image_url, start_date, end_date, is_active, display_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      title,
      description || null,
      discount_type || null,
      discount_value || null,
      promo_code || null,
      image_url || null,
      start_date || null,
      end_date || null,
      is_active,
      display_order
    ])

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error: any) {
    console.error('Error creating promotion:', error)
    return NextResponse.json(
      { error: 'Failed to create promotion' },
      { status: 500 }
    )
  }
}

