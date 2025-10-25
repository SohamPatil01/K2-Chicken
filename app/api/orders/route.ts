import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { customerName, customerPhone, deliveryAddress, deliveryType, items, total } = await request.json()
    
    // Use the shared order API for consistency
    const orderData = {
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryType,
      items,
      total,
      source: 'website'
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/orders/shared`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    })
    
    const result = await response.json()
    
    if (result.success) {
      return NextResponse.json(result.order)
    } else {
      throw new Error('Failed to create order')
    }
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
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
