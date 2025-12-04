import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import jwt from 'jsonwebtoken'
import { sendOrderNotificationToWhatsApp } from '@/lib/whatsapp/orderNotification'

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
    const requestBody = await request.json()
    console.log('Order API received request:', {
      customerName: requestBody.customerName,
      customerPhone: requestBody.customerPhone,
      deliveryType: requestBody.deliveryType,
      itemsCount: requestBody.items?.length || 0,
      total: requestBody.total,
      paymentMethod: requestBody.paymentMethod
    })
    
    const { 
      customerName, 
      customerPhone, 
      deliveryAddress, 
      deliveryInstructions,
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
    } = requestBody
    
    // Validate required fields
    if (!customerName || !customerName.trim()) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 })
    }
    
    if (!customerPhone || !customerPhone.trim()) {
      return NextResponse.json({ error: 'Customer phone is required' }, { status: 400 })
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 })
    }
    
    if (deliveryType === 'delivery' && (!deliveryAddress || !deliveryAddress.trim())) {
      return NextResponse.json({ error: 'Delivery address is required for delivery orders' }, { status: 400 })
    }
    
    // Check if delivery is enabled when delivery type is selected
    if (deliveryType === 'delivery') {
      const clientForDeliveryCheck = await pool.connect()
      try {
        const deliveryStatusResult = await clientForDeliveryCheck.query(
          'SELECT value FROM settings WHERE key = $1',
          ['delivery_enabled']
        )
        const isDeliveryEnabled = deliveryStatusResult.rows.length > 0 
          ? (deliveryStatusResult.rows[0].value === 'true' || deliveryStatusResult.rows[0].value === true)
          : true // Default to enabled if setting doesn't exist
        
        if (!isDeliveryEnabled) {
          return NextResponse.json({ 
            error: 'Delivery service is currently unavailable. Please select pickup instead.',
            code: 'DELIVERY_DISABLED'
          }, { status: 400 })
        }
      } catch (error) {
        console.error('Error checking delivery status:', error)
        // If we can't check, allow the order (fail open for availability)
      } finally {
        clientForDeliveryCheck.release()
      }
    }
    
    if (!total || parseFloat(total) <= 0) {
      return NextResponse.json({ error: 'Invalid order total' }, { status: 400 })
    }
    
    let userId = getUserIdFromToken(request)
    
    // If userId is not found from token, try to find user by phone number as fallback
    if (!userId && customerPhone) {
      const clientForUserLookup = await pool.connect()
      try {
        const userResult = await clientForUserLookup.query(
          'SELECT id FROM users WHERE phone = $1',
          [customerPhone]
        )
        if (userResult.rows.length > 0) {
          userId = userResult.rows[0].id
          console.log(`Found user by phone number: ${userId}`)
        }
      } catch (error) {
        console.error('Error looking up user by phone:', error)
      } finally {
        clientForUserLookup.release()
      }
    }
    
    const client = await pool.connect()
    
    try {
      // Start transaction
      await client.query('BEGIN')
      
      // Validate userId exists in users table if provided, otherwise set to NULL
      let finalUserId: number | null = null
      if (userId) {
        const userCheckResult = await client.query(
          'SELECT id FROM users WHERE id = $1',
          [userId]
        )
        if (userCheckResult.rows.length > 0) {
          finalUserId = userCheckResult.rows[0].id
          console.log(`Validated userId: ${finalUserId}`)
        } else {
          console.warn(`UserId ${userId} not found in users table. Setting to NULL for guest order.`)
          finalUserId = null
        }
      }
      
      console.log(`Creating order for userId: ${finalUserId}, phone: ${customerPhone}`)
      
      // Check if payment_method column exists, if not add it
      await client.query(`
        ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'cash'
      `).catch(() => {}) // Ignore error if column already exists

      // Ensure delivery_time_slot_id foreign key allows NULL (fix constraint if needed)
      // Note: Foreign keys in PostgreSQL allow NULL by default, so this should work
      // But we'll ensure the constraint exists properly
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'orders_delivery_time_slot_id_fkey'
          ) THEN
            ALTER TABLE orders 
            ADD CONSTRAINT orders_delivery_time_slot_id_fkey 
            FOREIGN KEY (delivery_time_slot_id) REFERENCES delivery_time_slots(id);
          END IF;
        EXCEPTION
          WHEN OTHERS THEN NULL;
        END $$;
      `).catch(() => {})

      // Ensure we use the exact total sent from client to avoid any calculation discrepancies
      const finalTotal = parseFloat(total) || 0
      const finalSubtotal = parseFloat(subtotal) || finalTotal
      const finalDeliveryCharge = parseFloat(deliveryCharge) || 0
      const finalDiscountAmount = parseFloat(discountAmount) || 0
      
      console.log('Inserting order with values:', {
        customerName,
        customerPhone,
        deliveryType,
        finalTotal,
        finalSubtotal,
        finalDeliveryCharge,
        finalDiscountAmount,
        paymentMethod,
        finalUserId,
        deliveryTimeSlotId: deliveryTimeSlotId || null,
        preferredDeliveryDate: preferredDeliveryDate || null,
        preferredDeliveryTime: preferredDeliveryTime || null
      })
      
      // Calculate estimated delivery time using PostgreSQL's NOW() for timezone-aware calculation
      const estimatedMinutes = deliveryType === 'delivery' ? 45 : 20
      
      // Ensure delivery_instructions column exists
      await client.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='orders' AND column_name='delivery_instructions') THEN
            ALTER TABLE orders ADD COLUMN delivery_instructions TEXT;
          END IF;
        END $$;
      `)

      // Insert order - use PostgreSQL's NOW() + INTERVAL for timezone-aware time calculation
      const orderResult = await client.query(`
        INSERT INTO orders (
          customer_name, 
          customer_phone, 
          delivery_address, 
          delivery_instructions,
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
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW() + INTERVAL '${estimatedMinutes} minutes', $12, $13, $14, $15)
        RETURNING *
      `, [
        customerName,
        customerPhone,
        deliveryType === 'delivery' ? deliveryAddress : 'Pickup at store',
        deliveryInstructions || null,
        deliveryType || 'delivery',
        finalSubtotal,
        finalDeliveryCharge,
        finalTotal,
        finalDiscountAmount,
        paymentMethod || 'cash',
        'pending',
        finalUserId, // Use validated userId (can be NULL for guest orders)
        deliveryTimeSlotId || null,
        preferredDeliveryDate || null,
        preferredDeliveryTime || null
      ])
      
      console.log('Order created successfully:', orderResult.rows[0].id)
      
      // Store promo code info if available (we'll add a promo_code column to orders table if needed)
      // For now, we can add it as a note or extend the schema
      
      const order = orderResult.rows[0]
      
      // Check if product_name column exists in order_items, if not add it
      await client.query(`
        ALTER TABLE order_items 
        ADD COLUMN IF NOT EXISTS product_name VARCHAR(255)
      `).catch(() => {}) // Ignore error if column already exists

      // Insert order items
      for (const item of items) {
        // Validate item structure
        if (!item.product || !item.product.id) {
          throw new Error('Invalid item structure: missing product information')
        }
        
        if (!item.quantity || item.quantity <= 0) {
          throw new Error(`Invalid quantity for product ${item.product.name || item.product.id}`)
        }
        
        const itemPrice = item.selectedWeight?.price || item.product.price
        if (!itemPrice || parseFloat(String(itemPrice)) <= 0) {
          throw new Error(`Invalid price for product ${item.product.name || item.product.id}`)
        }
        
        await client.query(`
          INSERT INTO order_items (order_id, product_id, quantity, price, weight_option_id, selected_weight, weight_unit, product_name)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          order.id, 
          item.product.id, 
          item.quantity, 
          parseFloat(String(itemPrice)),
          item.selectedWeight?.id || null,
          item.selectedWeight?.weight || null,
          item.selectedWeight?.weight_unit || null,
          item.product.name || 'Unknown Product' // Store product name for historical records
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
      
      // Send WhatsApp notification to admin (non-blocking)
      try {
        const orderNumber = order.id.toString().padStart(6, '0')
        await sendOrderNotificationToWhatsApp({
          orderId: order.id,
          orderNumber: orderNumber,
          customerName: customerName,
          customerPhone: customerPhone,
          deliveryType: deliveryType || 'delivery',
          deliveryAddress: deliveryAddress || undefined,
          deliveryInstructions: deliveryInstructions || undefined,
          items: items.map((item: any) => ({
            product_name: item.product.name,
            quantity: item.quantity,
            price: parseFloat(String(item.selectedWeight?.price || item.product.price)),
            selected_weight: item.selectedWeight?.weight?.toString(),
            weight_unit: item.selectedWeight?.weight_unit
          })),
          subtotal: finalSubtotal,
          deliveryCharge: finalDeliveryCharge,
          discountAmount: finalDiscountAmount,
          total: finalTotal,
          paymentMethod: paymentMethod || 'cash',
          promoCode: promoCode || undefined,
          createdAt: order.created_at || new Date().toISOString()
        })
        console.log('✅ WhatsApp notification sent for order:', order.id)
      } catch (whatsappError) {
        // Log error but don't fail the order creation
        console.error('⚠️ Failed to send WhatsApp notification (order still created):', whatsappError)
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

export async function GET(request: NextRequest) {
  let client;
  let retries = 3;
  
  while (retries > 0) {
    try {
      client = await pool.connect()
      
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
        
        // Disable caching for real-time order data
        const response = NextResponse.json(result.rows)
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
        response.headers.set('Pragma', 'no-cache')
        response.headers.set('Expires', '0')
        response.headers.set('Surrogate-Control', 'no-store')
        
        return response
      } catch (queryError: any) {
        // If query fails, check if it's a connection error
        if (queryError.code === 'ECONNRESET' || queryError.code === '57P01' || queryError.message?.includes('ECONNRESET')) {
          console.warn(`Database connection error (attempt ${4 - retries}/3):`, queryError.message)
          retries--
          if (retries > 0) {
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000))
            continue
          }
        }
        throw queryError
      } finally {
        if (client) {
          client.release()
        }
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error)
      
      // If it's a connection error and we have retries left, try again
      if ((error.code === 'ECONNRESET' || error.code === '57P01' || error.message?.includes('ECONNRESET')) && retries > 0) {
        retries--
        if (retries > 0) {
          console.log(`Retrying connection... (${retries} attempts left)`)
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }
      }
      
      return NextResponse.json({ 
        error: 'Failed to fetch orders',
        message: error.message || 'Database connection error',
        code: error.code
      }, { status: 500 })
    }
  }
  
  return NextResponse.json({ 
    error: 'Failed to fetch orders after multiple retries'
  }, { status: 500 })
}
