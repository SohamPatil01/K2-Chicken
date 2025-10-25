import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Get a specific WhatsApp order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order_id = params.id;
    const client = await pool.connect();
    
    try {
      // Get order details
      const orderResult = await client.query(
        'SELECT * FROM whatsapp_orders WHERE order_id = $1',
        [order_id]
      );
      
      if (orderResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }
      
      // Get order items
      const itemsResult = await client.query(
        `SELECT woi.*, p.name, p.description, p.image_url, p.category 
         FROM whatsapp_order_items woi 
         LEFT JOIN products p ON woi.product_id = p.id 
         WHERE woi.order_id = $1`,
        [order_id]
      );
      
      const order = orderResult.rows[0];
      order.items = itemsResult.rows;
      
      return NextResponse.json({
        success: true,
        data: order
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching WhatsApp order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// Update WhatsApp order status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order_id = params.id;
    const body = await request.json();
    const { status, estimated_completion } = body;
    
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `UPDATE whatsapp_orders 
         SET status = $1, estimated_completion = $2, updated_at = CURRENT_TIMESTAMP 
         WHERE order_id = $3 
         RETURNING *`,
        [status, estimated_completion, order_id]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: result.rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating WhatsApp order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// Delete WhatsApp order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order_id = params.id;
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'DELETE FROM whatsapp_orders WHERE order_id = $1 RETURNING *',
        [order_id]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Order deleted successfully'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting WhatsApp order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
