import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        SELECT o.*, 
               array_agg(
                 json_build_object(
                   'product_name', p.name,
                   'quantity', oi.quantity,
                   'price', oi.price
                 )
               ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.id = $1
        GROUP BY o.id
      `, [params.id])
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      
      const order = result.rows[0]
      
      // Transform the order to match the expected format
      const transformedOrder = {
        id: order.id,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        delivery_address: order.delivery_address,
        delivery_type: order.delivery_address === 'Pickup at store' ? 'pickup' : 'delivery',
        total_amount: order.total_amount,
        status: order.status,
        estimated_delivery: order.estimated_delivery,
        created_at: order.created_at,
        items: order.items || []
      }
      
      return NextResponse.json(transformedOrder)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()
    
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        UPDATE orders 
        SET status = $1
        WHERE id = $2
        RETURNING *
      `, [status, params.id])
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      
      return NextResponse.json(result.rows[0])
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}