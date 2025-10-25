import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { 
      customerName, 
      customerPhone, 
      deliveryAddress, 
      deliveryType, 
      items, 
      total,
      source = 'website', // 'website' or 'whatsapp'
      whatsapp_user_id = null
    } = await request.json()
    
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')
      
      // Calculate estimated time based on delivery type
      const estimatedMinutes = deliveryType === 'pickup' ? 20 : 45
      
      // Create order with source tracking
      const orderResult = await client.query(`
        INSERT INTO orders (customer_name, customer_phone, delivery_address, delivery_type, total_amount, estimated_delivery, source, whatsapp_user_id)
        VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '${estimatedMinutes} minutes', $6, $7)
        RETURNING *
      `, [customerName, customerPhone, deliveryAddress || 'Pickup at store', deliveryType, total, source, whatsapp_user_id])
      
      const order = orderResult.rows[0]
      
      // Create order items
      for (const item of items) {
        await client.query(`
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES ($1, $2, $3, $4)
        `, [order.id, item.product.id, item.quantity, item.product.price])
      }
      
      await client.query('COMMIT')
      
      return NextResponse.json({
        success: true,
        order: {
          id: order.id,
          order_number: order.id.toString().padStart(6, '0'),
          total: order.total_amount,
          estimated_delivery: order.estimated_delivery,
          status: order.status,
          source: order.source
        }
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error creating shared order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const phone = searchParams.get('phone')
    
    const client = await pool.connect()
    
    try {
      let query = `
        SELECT o.*, 
               array_agg(
                 json_build_object(
                   'id', oi.id,
                   'product_name', p.name,
                   'quantity', oi.quantity,
                   'price', oi.price
                 )
               ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
      `
      
      const params = []
      let paramCount = 1
      
      if (orderId) {
        query += ` WHERE o.id = $${paramCount}`
        params.push(orderId)
        paramCount++
      } else if (phone) {
        query += ` WHERE o.customer_phone = $${paramCount}`
        params.push(phone)
        paramCount++
      }
      
      query += ` GROUP BY o.id ORDER BY o.created_at DESC`
      
      const result = await client.query(query, params)
      
      return NextResponse.json({
        success: true,
        orders: result.rows
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
