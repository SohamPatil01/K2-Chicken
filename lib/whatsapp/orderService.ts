import pool from '@/lib/db'

export interface WhatsAppOrderItem {
  product_id: number
  product_name: string
  price: number
  quantity: number
  special_instructions?: string | null
}

export interface CreateWhatsAppOrderParams {
  user_id: string
  order_type: 'delivery' | 'pickup'
  delivery_address?: string | null
  contact_phone?: string | null
  payment_method: string
  items: WhatsAppOrderItem[]
}

export async function createWhatsAppOrder(params: CreateWhatsAppOrderParams) {
  const {
    user_id,
    order_type,
    delivery_address,
    contact_phone,
    payment_method,
    items
  } = params

  // Validate required fields
  if (!user_id || !order_type || !payment_method || !items || items.length === 0) {
    throw new Error('Missing required fields')
  }

  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    // Generate order ID
    const order_id = `WA${Date.now().toString().slice(-8)}`
    
    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    const delivery_fee = order_type === 'delivery' ? 5.00 : 0
    const total = subtotal + delivery_fee
    
    // Create WhatsApp order
    const orderResult = await client.query(
      `INSERT INTO whatsapp_orders (order_id, user_id, order_type, delivery_address, 
       contact_phone, payment_method, subtotal, delivery_fee, total, status, estimated_completion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        order_id,
        user_id,
        order_type,
        delivery_address,
        contact_phone,
        payment_method,
        subtotal,
        delivery_fee,
        total,
        'pending',
        new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
      ]
    )
    
    // Create order items for WhatsApp orders
    for (const item of items) {
      await client.query(
        `INSERT INTO whatsapp_order_items (order_id, product_id, product_name, quantity, price, special_instructions)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          order_id,
          item.product_id,
          item.product_name,
          item.quantity,
          item.price,
          item.special_instructions || null
        ]
      )
    }
    
    // Also create order in main orders table for unified order management
    const customerName = contact_phone || `WhatsApp User ${user_id.slice(-4)}`
    const deliveryAddress = order_type === 'pickup' ? 'Pickup at store' : (delivery_address || 'Pickup at store')
    const estimatedTime = new Date(Date.now() + (order_type === 'delivery' ? 45 : 20) * 60000)
    
    // Try inserting with enhanced columns first, fallback to basic if columns don't exist
    let mainOrderResult
    try {
      // Try with delivery_type, source, and whatsapp_user_id columns
      mainOrderResult = await client.query(`
        INSERT INTO orders (
          customer_name, 
          customer_phone, 
          delivery_address, 
          delivery_type,
          total_amount, 
          status, 
          estimated_delivery,
          source,
          whatsapp_user_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [
        customerName,
        contact_phone || user_id,
        deliveryAddress,
        order_type,
        total,
        'pending',
        estimatedTime,
        'whatsapp',
        user_id
      ])
    } catch (err: any) {
      // If columns don't exist, use basic insert
      if (err.code === '42703') { // undefined_column error
        mainOrderResult = await client.query(`
          INSERT INTO orders (
            customer_name, 
            customer_phone, 
            delivery_address, 
            total_amount, 
            status, 
            estimated_delivery
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `, [
          customerName,
          contact_phone || user_id,
          deliveryAddress,
          total,
          'pending',
          estimatedTime
        ])
      } else {
        throw err
      }
    }
    
    const mainOrderId = mainOrderResult.rows[0].id
    
    // Create order items in main orders table
    for (const item of items) {
      await client.query(`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES ($1, $2, $3, $4)
      `, [mainOrderId, item.product_id, item.quantity, item.price])
    }
    
    // Update WhatsApp order with external_order_id reference
    await client.query(
      `UPDATE whatsapp_orders SET external_order_id = $1 WHERE order_id = $2`,
      [mainOrderId.toString(), order_id]
    )
    
    await client.query('COMMIT')
    
    return {
      success: true,
      data: {
        ...orderResult.rows[0],
        external_order_id: mainOrderId.toString()
      }
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

