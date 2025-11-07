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
               COALESCE(o.subtotal, o.total_amount) as subtotal,
               COALESCE(o.delivery_charge, 0) as delivery_charge,
               COALESCE(o.delivery_type, CASE WHEN o.delivery_address = 'Pickup at store' THEN 'pickup' ELSE 'delivery' END) as delivery_type,
               array_agg(
                 json_build_object(
                   'product_name', p.name,
                   'quantity', oi.quantity,
                   'price', oi.price
                 )
               ) FILTER (WHERE oi.id IS NOT NULL) as items
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
        delivery_type: order.delivery_type || (order.delivery_address === 'Pickup at store' ? 'pickup' : 'delivery'),
        subtotal: order.subtotal,
        delivery_charge: order.delivery_charge,
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
      await client.query('BEGIN')
      
      // Get current order status and items
      const orderResult = await client.query(`
        SELECT status, id FROM orders WHERE id = $1
      `, [params.id])
      
      if (orderResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      
      const oldStatus = orderResult.rows[0].status
      const orderId = orderResult.rows[0].id
      
      // Update order status
      const result = await client.query(`
        UPDATE orders 
        SET status = $1
        WHERE id = $2
        RETURNING *
      `, [status, params.id])
      
      // If order is being marked as delivered, deduct inventory
      if (status === 'delivered' && oldStatus !== 'delivered') {
        // Get order items
        const orderItems = await client.query(`
          SELECT product_id, quantity FROM order_items WHERE order_id = $1
        `, [orderId])
        
        // Deduct inventory for each item
        for (const item of orderItems.rows) {
          // Check if inventory exists for this product
          const inventoryCheck = await client.query(
            'SELECT quantity FROM inventory WHERE product_id = $1',
            [item.product_id]
          )
          
          if (inventoryCheck.rows.length > 0) {
            const currentQuantity = inventoryCheck.rows[0].quantity
            const newQuantity = Math.max(0, currentQuantity - item.quantity)
            
            // Update inventory
            await client.query(
              `UPDATE inventory 
               SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
               WHERE product_id = $2`,
              [newQuantity, item.product_id]
            )
            
            // Log to history
            await client.query(
              `INSERT INTO inventory_history 
               (product_id, change_type, quantity_change, previous_quantity, new_quantity, order_id, notes)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [
                item.product_id,
                'delivery_deduction',
                -item.quantity,
                currentQuantity,
                newQuantity,
                orderId,
                `Deducted from order #${orderId}`
              ]
            )
          } else {
            // Create inventory record if it doesn't exist
            await client.query(
              'INSERT INTO inventory (product_id, quantity) VALUES ($1, $2)',
              [item.product_id, 0]
            )
          }
        }
      }
      
      await client.query('COMMIT')
      return NextResponse.json(result.rows[0])
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}