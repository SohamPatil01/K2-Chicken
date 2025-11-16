import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

import jwt from 'jsonwebtoken'

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

export async function POST(request: NextRequest) {
  try {
    const { 
      customerName, 
      customerPhone, 
      deliveryAddress, 
      deliveryType, 
      items, 
      subtotal, 
      deliveryCharge, 
      total, 
      discountAmount, 
      promoCode,
      paymentMethod,
      deliveryTimeSlotId,
      preferredDeliveryDate,
      preferredDeliveryTime
    } = await request.json()
    
    const userId = getUserIdFromToken(request)
    
    const client = await pool.connect()
    
    try {
      // Start transaction
      await client.query('BEGIN')
      
      // Check if payment_method column exists, if not add it
      await client.query(`
        ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'cash'
      `).catch(() => {}) // Ignore error if column already exists

      // Ensure we use the exact total sent from client to avoid any calculation discrepancies
      const finalTotal = parseFloat(total) || 0
      const finalSubtotal = parseFloat(subtotal) || finalTotal
      const finalDeliveryCharge = parseFloat(deliveryCharge) || 0
      const finalDiscountAmount = parseFloat(discountAmount) || 0
      
      // Insert order
      const orderResult = await client.query(`
        INSERT INTO orders (
          customer_name, 
          customer_phone, 
          delivery_address, 
          delivery_type, 
          subtotal, 
          delivery_charge, 
          total_amount, 
          discount_amount,
          payment_method,
          status, 
          estimated_delivery,
          user_id,
          delivery_time_slot_id,
          preferred_delivery_date,
          preferred_delivery_time
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `, [
        customerName,
        customerPhone,
        deliveryType === 'delivery' ? deliveryAddress : 'Pickup at store',
        deliveryType || 'delivery',
        finalSubtotal,
        finalDeliveryCharge,
        finalTotal,
        finalDiscountAmount,
        paymentMethod || 'cash',
        'pending',
        new Date(Date.now() + (deliveryType === 'delivery' ? 45 : 20) * 60000),
        userId,
        deliveryTimeSlotId || null,
        preferredDeliveryDate || null,
        preferredDeliveryTime || null
      ])
      
      // Store promo code info if available (we'll add a promo_code column to orders table if needed)
      // For now, we can add it as a note or extend the schema
      
      const order = orderResult.rows[0]
      
      // Insert order items
      for (const item of items) {
        const itemPrice = item.selectedWeight?.price || item.product.price
        await client.query(`
          INSERT INTO order_items (order_id, product_id, quantity, price, weight_option_id, selected_weight, weight_unit)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          order.id, 
          item.product.id, 
          item.quantity, 
          itemPrice,
          item.selectedWeight?.id || null,
          item.selectedWeight?.weight || null,
          item.selectedWeight?.weight_unit || null
        ])
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
               COALESCE(o.discount_amount, 0) as discount_amount,
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
