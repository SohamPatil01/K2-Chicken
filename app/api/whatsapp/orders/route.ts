import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Get all WhatsApp orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const client = await pool.connect();
    
    try {
      let query = `
        SELECT wo.*, 
               COUNT(woi.id) as item_count,
               ARRAY_AGG(
                 JSON_BUILD_OBJECT(
                   'product_name', woi.product_name,
                   'quantity', woi.quantity,
                   'price', woi.price,
                   'special_instructions', woi.special_instructions
                 )
               ) as items
        FROM whatsapp_orders wo
        LEFT JOIN whatsapp_order_items woi ON wo.order_id = woi.order_id
      `;
      
      const conditions = [];
      const params: any[] = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        conditions.push(`wo.status = $${paramCount}`);
        params.push(status);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += `
        GROUP BY wo.id, wo.order_id, wo.user_id, wo.external_order_id, wo.order_type, 
                 wo.delivery_address, wo.contact_phone, wo.payment_method, wo.subtotal, 
                 wo.delivery_fee, wo.total, wo.status, wo.estimated_completion, 
                 wo.created_at, wo.updated_at
        ORDER BY wo.created_at DESC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;
      
      params.push(limit, offset);

      const result = await client.query(query, params);
      
      return NextResponse.json({
        success: true,
        data: result.rows,
        pagination: {
          limit,
          offset,
          total: result.rows.length
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching WhatsApp orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// Create a new WhatsApp order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      order_type,
      delivery_address,
      contact_phone,
      payment_method,
      items
    } = body;

    // Validate required fields
    if (!user_id || !order_type || !payment_method || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Generate order ID
      const order_id = `WA${Date.now().toString().slice(-8)}`;
      
      // Calculate totals
      const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      const delivery_fee = order_type === 'delivery' ? 5.00 : 0;
      const total = subtotal + delivery_fee;
      
      // Create order
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
      );
      
      // Create order items
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
        );
      }
      
      await client.query('COMMIT');
      
      return NextResponse.json({
        success: true,
        data: orderResult.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating WhatsApp order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
