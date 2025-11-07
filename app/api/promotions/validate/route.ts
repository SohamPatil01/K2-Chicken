import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { promoCode, subtotal } = await request.json()

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Promo code is required' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    
    try {
      // Find active promotion with matching promo code
      const result = await client.query(`
        SELECT * FROM promotions
        WHERE UPPER(promo_code) = UPPER($1)
        AND is_active = true
        AND (start_date IS NULL OR start_date <= CURRENT_DATE)
        AND (end_date IS NULL OR end_date >= CURRENT_DATE)
      `, [promoCode])

      if (result.rows.length === 0) {
        return NextResponse.json(
          { 
            valid: false, 
            error: 'Invalid or expired promo code' 
          },
          { status: 200 }
        )
      }

      const promotion = result.rows[0]
      let discountAmount = 0
      let finalTotal = subtotal

      // Calculate discount based on type
      if (promotion.discount_type === 'percentage' && promotion.discount_value) {
        discountAmount = (subtotal * promotion.discount_value) / 100
        finalTotal = subtotal - discountAmount
      } else if (promotion.discount_type === 'fixed' && promotion.discount_value) {
        discountAmount = Math.min(promotion.discount_value, subtotal) // Don't allow negative total
        finalTotal = subtotal - discountAmount
      } else if (promotion.discount_type === 'free_delivery') {
        // Free delivery is handled separately in checkout
        discountAmount = 0
        finalTotal = subtotal
      }

      return NextResponse.json({
        valid: true,
        promotion: {
          id: promotion.id,
          title: promotion.title,
          discount_type: promotion.discount_type,
          discount_value: promotion.discount_value,
          promo_code: promotion.promo_code
        },
        discountAmount: Math.round(discountAmount * 100) / 100,
        finalTotal: Math.round(finalTotal * 100) / 100,
        isFreeDelivery: promotion.discount_type === 'free_delivery'
      })
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Error validating promo code:', error)
    return NextResponse.json(
      { error: 'Failed to validate promo code' },
      { status: 500 }
    )
  }
}

