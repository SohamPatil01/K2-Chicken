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
      await client.query('BEGIN');
      
      // Get current order status
      const currentOrder = await client.query(
        'SELECT status FROM whatsapp_orders WHERE order_id = $1',
        [order_id]
      );
      
      if (currentOrder.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }
      
      const oldStatus = currentOrder.rows[0].status;
      
      // Update order status
      const result = await client.query(
        `UPDATE whatsapp_orders 
         SET status = $1, estimated_completion = $2, updated_at = CURRENT_TIMESTAMP 
         WHERE order_id = $3 
         RETURNING *`,
        [status, estimated_completion, order_id]
      );
      
      const order = result.rows[0];
      
      // Update corresponding order in main orders table if external_order_id exists
      if (order.external_order_id) {
        // Map WhatsApp status to orders table status
        let mainOrderStatus = 'pending';
        if (status === 'received' || status === 'preparing') {
          mainOrderStatus = 'preparing';
        } else if (status === 'ready_for_pickup') {
          mainOrderStatus = 'ready';
        } else if (status === 'out_for_delivery' || status === 'delivered') {
          mainOrderStatus = status === 'delivered' ? 'delivered' : 'preparing';
        } else if (status === 'cancelled') {
          mainOrderStatus = 'cancelled';
        }
        
        await client.query(
          `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [mainOrderStatus, order.external_order_id]
        );
      }
      
      // If order is being marked as delivered, deduct inventory
      if (status === 'delivered' && oldStatus !== 'delivered') {
        // Get order items
        const orderItems = await client.query(
          `SELECT product_id, quantity FROM whatsapp_order_items WHERE order_id = $1`,
          [order_id]
        );
        
        // Deduct inventory for each item
        for (const item of orderItems.rows) {
          if (item.product_id) {
            // Check if inventory exists for this product
            const inventoryCheck = await client.query(
              'SELECT quantity FROM inventory WHERE product_id = $1',
              [item.product_id]
            );
            
            if (inventoryCheck.rows.length > 0) {
              const currentQuantity = inventoryCheck.rows[0].quantity;
              const newQuantity = Math.max(0, currentQuantity - item.quantity);
              
              // Update inventory
              await client.query(
                `UPDATE inventory 
                 SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
                 WHERE product_id = $2`,
                [newQuantity, item.product_id]
              );
              
              // Log to history
              await client.query(
                `INSERT INTO inventory_history 
                 (product_id, change_type, quantity_change, previous_quantity, new_quantity, notes)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                  item.product_id,
                  'delivery_deduction',
                  -item.quantity,
                  currentQuantity,
                  newQuantity,
                  `Deducted from WhatsApp order #${order_id}`
                ]
              );
            } else {
              // Create inventory record if it doesn't exist
              await client.query(
                'INSERT INTO inventory (product_id, quantity) VALUES ($1, $2)',
                [item.product_id, 0]
              );
            }
          }
        }
      }
      
      await client.query('COMMIT');
      
      return NextResponse.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
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
