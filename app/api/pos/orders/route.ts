import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

function validatePosAuth(request: NextRequest): boolean {
  const apiKey = process.env.POS_API_KEY
  if (!apiKey) return true // No key configured = allow (you should set POS_API_KEY in production)
  const headerKey = request.headers.get('x-pos-api-key')
  return headerKey === apiKey
}

/**
 * GET /api/pos/orders
 * Returns orders for POS integration. Optional query: ?status=pending (default), confirmed, preparing, etc.
 * Secure with x-pos-api-key header matching POS_API_KEY in .env
 */
export async function GET(request: NextRequest) {
  if (!validatePosAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') ?? 'pending'

    const client = await pool.connect()
    try {
      const result = await client.query(
        `
        SELECT o.id, o.customer_name, o.customer_phone, o.delivery_address,
               o.delivery_instructions, o.delivery_type, o.subtotal, o.delivery_charge,
               o.discount_amount, o.total_amount, o.payment_method, o.status,
               o.estimated_delivery, o.created_at,
               o.preferred_delivery_date, o.preferred_delivery_time,
               (SELECT COALESCE(json_agg(
                 json_build_object(
                   'id', oi.id, 'product_id', oi.product_id,
                   'product_name', COALESCE(oi.product_name, p.name),
                   'quantity', oi.quantity, 'price', oi.price,
                   'selected_weight', oi.selected_weight, 'weight_unit', oi.weight_unit
                 )
               ), '[]')
                FROM order_items oi
                LEFT JOIN products p ON p.id = oi.product_id
                WHERE oi.order_id = o.id) AS items
        FROM orders o
        WHERE o.status = $1
        ORDER BY o.created_at ASC
        `,
        [status]
      )

      return NextResponse.json({
        orders: result.rows.map((row) => ({
          id: row.id,
          customer_name: row.customer_name,
          customer_phone: row.customer_phone,
          delivery_address: row.delivery_address,
          delivery_instructions: row.delivery_instructions || null,
          delivery_type: row.delivery_type,
          subtotal: parseFloat(row.subtotal),
          delivery_charge: parseFloat(row.delivery_charge || 0),
          discount_amount: parseFloat(row.discount_amount || 0),
          total_amount: parseFloat(row.total_amount),
          payment_method: row.payment_method,
          status: row.status,
          estimated_delivery: row.estimated_delivery,
          created_at: row.created_at,
          preferred_delivery_date: row.preferred_delivery_date,
          preferred_delivery_time: row.preferred_delivery_time,
          items: row.items || [],
        })),
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('POS orders API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
