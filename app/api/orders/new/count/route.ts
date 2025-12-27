import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  let client;
  let retries = 3;
  
  while (retries > 0) {
  try {
      client = await pool.connect()
    
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
      } catch (queryError: any) {
        // If query fails, check if it's a connection error
        if (
          queryError.code === 'ECONNRESET' || 
          queryError.code === 'ETIMEDOUT' ||
          queryError.code === '57P01' || 
          queryError.message?.includes('timeout') ||
          queryError.message?.includes('Connection terminated')
        ) {
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
      // If it's a connection error and we have retries left, try again
      if (
        (error.code === 'ECONNRESET' || 
         error.code === 'ETIMEDOUT' ||
         error.code === '57P01' || 
         error.message?.includes('timeout') ||
         error.message?.includes('Connection terminated')) && 
        retries > 0
      ) {
        retries--
        if (retries > 0) {
          console.log(`Retrying connection... (${retries} attempts left)`)
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }
      }
      
      // If all retries failed or it's a different error, return 0 count
      // This prevents the admin console from breaking
      console.error('Error counting new orders:', error.message || error)
    return NextResponse.json({ count: 0 })
  }
  }
  
  // If we exhausted all retries, return 0 count
  return NextResponse.json({ count: 0 })
}

