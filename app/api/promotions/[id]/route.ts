import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// GET - Fetch a single promotion
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await pool.query(
      'SELECT * FROM promotions WHERE id = $1',
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    console.error('Error fetching promotion:', error)
    return NextResponse.json(
      { error: 'Failed to fetch promotion' },
      { status: 500 }
    )
  }
}

// PUT - Update a promotion
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      is_active,
      display_order
    } = body

    const result = await pool.query(`
      UPDATE promotions
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        discount_type = COALESCE($3, discount_type),
        discount_value = COALESCE($4, discount_value),
        promo_code = COALESCE($5, promo_code),
        image_url = COALESCE($6, image_url),
        start_date = COALESCE($7, start_date),
        end_date = COALESCE($8, end_date),
        is_active = COALESCE($9, is_active),
        display_order = COALESCE($10, display_order),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `, [
      title,
      description,
      discount_type,
      discount_value,
      promo_code,
      image_url,
      start_date,
      end_date,
      is_active,
      display_order,
      params.id
    ])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    console.error('Error updating promotion:', error)
    return NextResponse.json(
      { error: 'Failed to update promotion' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a promotion
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await pool.query(
      'DELETE FROM promotions WHERE id = $1 RETURNING *',
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Promotion deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting promotion:', error)
    return NextResponse.json(
      { error: 'Failed to delete promotion' },
      { status: 500 }
    )
  }
}

