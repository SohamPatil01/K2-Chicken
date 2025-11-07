import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { customerName, customerPhone, deliveryAddress, deliveryType, items, subtotal, deliveryCharge, total } = await request.json()
    
    const client = await pool.connect()
    
    try {
      // Start transaction
      await client.query('BEGIN')
      
      // Insert order
      const orderResult = await client.query(`
        INSERT INTO orders (customer_name, customer_phone, delivery_address, delivery_type, subtotal, delivery_charge, total_amount, status, estimated_delivery)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        customerName,
        customerPhone,
        deliveryType === 'delivery' ? deliveryAddress : 'Pickup at store',
        deliveryType || 'delivery',
        subtotal || total,
        deliveryCharge || 0,
        total,
        'pending',
        new Date(Date.now() + (deliveryType === 'delivery' ? 45 : 20) * 60000)
      ])
      
      const order = orderResult.rows[0]
      
      // Insert order items
      for (const item of items) {
        await client.query(`
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES ($1, $2, $3, $4)
        `, [order.id, item.product.id, item.quantity, item.product.price])
      }
      
      // Commit transaction
      await client.query('COMMIT')
      
      // Return order with items
      const orderWithItems = {
        ...order,
        items: items.map((item: any) => ({ 
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        }))
      }
      
      return NextResponse.json(orderWithItems)
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json({ 
      error: 'Failed to create order',
      details: error.message || 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        SELECT o.*, 
               COALESCE(o.subtotal, o.total_amount) as subtotal,
               COALESCE(o.delivery_charge, 0) as delivery_charge,
               COALESCE(o.delivery_type, 'delivery') as delivery_type,
               array_agg(
                 json_build_object(
                   'id', oi.id,
                   'product_name', p.name,
                   'quantity', oi.quantity,
                   'price', oi.price
                 )
               ) FILTER (WHERE oi.id IS NOT NULL) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `)
      
      return NextResponse.json(result.rows)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
