import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const client = await pool.connect()
    
    try {
      // Count pending orders from main orders table
      const ordersCount = await client.query(`
        SELECT COUNT(*) as count 
        FROM orders 
        WHERE status = 'pending'
      `)
      
      // Count pending/received orders from WhatsApp orders table
      const whatsappOrdersCount = await client.query(`
        SELECT COUNT(*) as count 
        FROM whatsapp_orders 
        WHERE status IN ('pending', 'received')
      `)
      
      const newOrdersCount = parseInt(ordersCount.rows[0].count) + parseInt(whatsappOrdersCount.rows[0].count)
      
      return NextResponse.json({ count: newOrdersCount })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error counting new orders:', error)
    return NextResponse.json({ count: 0 })
  }
}

