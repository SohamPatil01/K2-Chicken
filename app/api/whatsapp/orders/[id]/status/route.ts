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
      // Update order status
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
      
      const order = result.rows[0];
      
      // Send status update to customer via WhatsApp
      await sendStatusUpdate(order);
      
      return NextResponse.json({
        success: true,
        data: order
      });
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
