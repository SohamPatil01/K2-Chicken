import { NextRequest, NextResponse } from 'next/server';
import { createWhatsAppOrder } from '@/lib/whatsapp/orderService';
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
    
    const result = await createWhatsAppOrder(body);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error creating WhatsApp order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 400 }
    );
  }
}
