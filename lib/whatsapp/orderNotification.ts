import whatsappAPI from './api'

interface OrderNotificationData {
  orderId: number
  orderNumber: string
  customerName: string
  customerPhone: string
  deliveryType: 'delivery' | 'pickup'
  deliveryAddress?: string
  deliveryInstructions?: string
  items: Array<{
    product_name: string
    quantity: number
    price: number
    selected_weight?: string
    weight_unit?: string
  }>
  subtotal: number
  deliveryCharge: number
  discountAmount: number
  loyaltyDiscountAmount?: number
  total: number
  paymentMethod: string
  promoCode?: string
  createdAt: string
}

export async function sendOrderNotificationToWhatsApp(orderData: OrderNotificationData) {
  try {
    // Get admin WhatsApp number from environment or use default
    const adminWhatsAppNumber = process.env.ADMIN_WHATSAPP_NUMBER || process.env.WHATSAPP_NUMBER || '8484978622'
    
    // Format order items
    const itemsText = orderData.items.map((item, index) => {
      const weightInfo = item.selected_weight ? ` (${item.selected_weight}${item.weight_unit || 'g'})` : ''
      const itemTotal = (item.price * item.quantity).toFixed(0)
      return `${index + 1}. ${item.product_name}${weightInfo}\n   Qty: ${item.quantity} × ₹${item.price.toFixed(0)} = ₹${itemTotal}`
    }).join('\n\n')

    // Format delivery information
    const deliveryInfo = orderData.deliveryType === 'delivery'
      ? `📍 *Delivery Address:*\n${orderData.deliveryAddress || 'Not provided'}\n\n` +
        (orderData.deliveryInstructions ? `📝 *Delivery Instructions:*\n${orderData.deliveryInstructions}\n\n` : '') +
        `🚚 *Delivery Charge:* ₹${orderData.deliveryCharge.toFixed(0)}\n`
      : `🏪 *Pickup at Store*\n`

    // Format discounts
    const promoDiscountText = orderData.discountAmount > 0
      ? `\n💰 *Promo Discount:* -₹${orderData.discountAmount.toFixed(0)}${orderData.promoCode ? ` (${orderData.promoCode})` : ''}`
      : ''
    
    const loyaltyDiscountText = orderData.loyaltyDiscountAmount && orderData.loyaltyDiscountAmount > 0
      ? `\n🎉 *Loyalty Discount:* -₹${orderData.loyaltyDiscountAmount.toFixed(0)}`
      : ''
    
    const discountInfo = promoDiscountText || loyaltyDiscountText
      ? `${promoDiscountText}${loyaltyDiscountText}\n`
      : ''

    // Format payment method
    const paymentMethodText = orderData.paymentMethod === 'cash'
      ? '💵 Cash on Delivery'
      : orderData.paymentMethod === 'upi'
      ? '📱 UPI Payment'
      : '💳 Card Payment'

    // Create formatted message
    const message = `🔔 *NEW ORDER RECEIVED!*\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `📋 *Order #${orderData.orderNumber}*\n` +
      `🆔 Order ID: ${orderData.orderId}\n` +
      `📅 ${new Date(orderData.createdAt).toLocaleString('en-IN', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      })}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `👤 *Customer Details:*\n` +
      `Name: ${orderData.customerName}\n` +
      `Phone: ${orderData.customerPhone}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `🛒 *Order Items:*\n\n${itemsText}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `💰 *Pricing:*\n` +
      `Subtotal: ₹${orderData.subtotal.toFixed(0)}${discountInfo}` +
      `${deliveryInfo}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `💵 *Total Amount: ₹${orderData.total.toFixed(0)}*\n\n` +
      `💳 *Payment Method:* ${paymentMethodText}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `⏰ *Order Type:* ${orderData.deliveryType === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}\n\n` +
      `✅ Please process this order.`

    // Send message via WhatsApp API
    const recipientId = adminWhatsAppNumber.replace(/^\+?91/, '').replace(/^whatsapp:/, '')
    
    // Use mock in development if no access token
    const useMock = process.env.NODE_ENV === 'development' || !process.env.WHATSAPP_ACCESS_TOKEN
    
    if (useMock) {
      console.log('📱 [MOCK] Sending order notification to WhatsApp:', {
        to: recipientId,
        message: message
      })
      await whatsappAPI.sendMessageMock(`whatsapp:${recipientId}`, message)
    } else {
      console.log('📱 Sending order notification to WhatsApp:', {
        to: recipientId,
        orderId: orderData.orderId
      })
      await whatsappAPI.sendMessage(`whatsapp:${recipientId}`, message)
    }
    
    return { success: true }
  } catch (error) {
    console.error('❌ Error sending order notification to WhatsApp:', error)
    // Don't throw error - we don't want to fail order creation if WhatsApp fails
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

