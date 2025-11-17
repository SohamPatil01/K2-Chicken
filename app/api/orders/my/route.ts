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
    let userId = getUserIdFromToken(request)
    
    // If userId is not found from token, try to find user by phone from query params as fallback
    if (!userId) {
      const { searchParams } = new URL(request.url)
      const phone = searchParams.get('phone')
      if (phone) {
        const clientForUserLookup = await pool.connect()
        try {
          const userResult = await clientForUserLookup.query(
            'SELECT id FROM users WHERE phone = $1',
            [phone]
          )
          if (userResult.rows.length > 0) {
            userId = userResult.rows[0].id
            console.log(`Found user by phone number for order history: ${userId}`)
          }
        } catch (error) {
          console.error('Error looking up user by phone:', error)
        } finally {
          clientForUserLookup.release()
        }
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await pool.connect()

    // Get user's phone number for fallback matching
    let userPhone: string | null = null
    if (userId) {
      const userResult = await client.query('SELECT phone FROM users WHERE id = $1', [userId])
      if (userResult.rows.length > 0) {
        userPhone = userResult.rows[0].phone
      }
    }
    
    try {
      // Query orders by user_id, or by phone number if user_id is null (for backward compatibility)
      let result
      if (userPhone) {
        // Query with both user_id and phone number fallback
        result = await client.query(`
          SELECT o.*, 
                 COALESCE(o.subtotal, o.total_amount) as subtotal,
                 COALESCE(o.delivery_charge, 0) as delivery_charge,
                 COALESCE(o.discount_amount, 0) as discount_amount,
                 COALESCE(o.delivery_type, 'delivery') as delivery_type,
                 o.preferred_delivery_date,
                 o.preferred_delivery_time,
                 array_agg(
                   json_build_object(
                     'id', oi.id,
                     'product_name', COALESCE(oi.product_name, p.name, 'Product (Unavailable)'),
                     'quantity', oi.quantity,
                     'price', oi.price
                   )
                 ) FILTER (WHERE oi.id IS NOT NULL) as items
          FROM orders o
          LEFT JOIN order_items oi ON o.id = oi.order_id
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE o.user_id = $1 OR (o.user_id IS NULL AND o.customer_phone = $2)
          GROUP BY o.id
          ORDER BY o.created_at DESC
        `, [userId, userPhone])
      } else {
        // Query only by user_id
        result = await client.query(`
          SELECT o.*, 
                 COALESCE(o.subtotal, o.total_amount) as subtotal,
                 COALESCE(o.delivery_charge, 0) as delivery_charge,
                 COALESCE(o.discount_amount, 0) as discount_amount,
                 COALESCE(o.delivery_type, 'delivery') as delivery_type,
                 o.preferred_delivery_date,
                 o.preferred_delivery_time,
                 array_agg(
                   json_build_object(
                     'id', oi.id,
                     'product_name', COALESCE(oi.product_name, p.name, 'Product (Unavailable)'),
                     'quantity', oi.quantity,
                     'price', oi.price
                   )
                 ) FILTER (WHERE oi.id IS NOT NULL) as items
          FROM orders o
          LEFT JOIN order_items oi ON o.id = oi.order_id
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE o.user_id = $1
          GROUP BY o.id
          ORDER BY o.created_at DESC
        `, [userId])
      }
      
      return NextResponse.json(result.rows)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

