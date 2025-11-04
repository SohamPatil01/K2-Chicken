import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { WhatsAppAPI } from '@/lib/whatsapp/api';

// Update order status and notify customer
export async function POST(
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
      
      // Send status update to customer via WhatsApp
      await sendStatusUpdate(order);
      
      return NextResponse.json({
        success: true,
        data: order
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating WhatsApp order status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}

async function sendStatusUpdate(order: any) {
  try {
    const whatsappAPI = new WhatsAppAPI();
    const user_id = `whatsapp:${order.user_id}`;
    
    let statusMessage = '';
    let buttons = [
      { type: "reply", reply: { id: "track_order", title: "📦 Track Order" } },
      { type: "reply", reply: { id: "place_order", title: "🛒 Place New Order" } }
    ];
    
    switch (order.status) {
      case 'received':
        statusMessage = `✅ Order #${order.order_id} received and confirmed!\n\nWe're preparing your delicious meal. Estimated completion: ${new Date(order.estimated_completion).toLocaleTimeString()}`;
        break;
      case 'preparing':
        statusMessage = `👨‍🍳 Order #${order.order_id} is being prepared!\n\nOur chefs are working on your order. Estimated completion: ${new Date(order.estimated_completion).toLocaleTimeString()}`;
        break;
      case 'ready_for_pickup':
        statusMessage = `🍗 Order #${order.order_id} is ready for pickup!\n\nPlease come to our restaurant to collect your order.`;
        break;
      case 'out_for_delivery':
        statusMessage = `🚚 Order #${order.order_id} is out for delivery!\n\nYour order is on its way to you.`;
        break;
      case 'delivered':
        statusMessage = `🎉 Order #${order.order_id} has been delivered!\n\nThank you for choosing K2 Chicken! Enjoy your meal!`;
        buttons = [
          { type: "reply", reply: { id: "place_order", title: "🛒 Order Again" } },
          { type: "reply", reply: { id: "view_menu", title: "📜 View Menu" } }
        ];
        break;
      case 'cancelled':
        statusMessage = `❌ Order #${order.order_id} has been cancelled.\n\nIf you have any questions, please contact us.`;
        buttons = [
          { type: "reply", reply: { id: "place_order", title: "🛒 Place New Order" } },
          { type: "reply", reply: { id: "talk_human", title: "💬 Contact Support" } }
        ];
        break;
      default:
        statusMessage = `📋 Order #${order.order_id} status: ${order.status}`;
    }
    
    // Use mock API for development, real API for production
    const useMock = process.env.NODE_ENV === 'development' || !process.env.WHATSAPP_ACCESS_TOKEN;
    
    if (useMock) {
      await whatsappAPI.sendMessageMock(user_id, statusMessage, buttons);
    } else {
      await whatsappAPI.sendMessage(user_id, statusMessage, buttons);
    }
    
    console.log(`Status update sent to ${user_id}: ${statusMessage}`);
  } catch (error) {
    console.error('Error sending status update:', error);
  }
}
