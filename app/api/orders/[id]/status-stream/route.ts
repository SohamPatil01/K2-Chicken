import { NextRequest } from 'next/server'
import pool from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = params.id

  // Set up Server-Sent Events headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  })

  const stream = new ReadableStream({
    start(controller) {
      // Send initial status
      sendStatusUpdate(controller, orderId)

      // Set up polling to check for status changes every 5 seconds
      const interval = setInterval(async () => {
        try {
          await sendStatusUpdate(controller, orderId)
        } catch (error) {
          console.error('Error in status stream:', error)
          clearInterval(interval)
          controller.close()
        }
      }, 5000)

      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    }
  })

  return new Response(stream, { headers })
}

async function sendStatusUpdate(controller: ReadableStreamDefaultController, orderId: string) {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(
        'SELECT status, created_at FROM orders WHERE id = $1',
        [orderId]
      )
      
      if (result.rows.length > 0) {
        const order = result.rows[0]
        const data = JSON.stringify({
          status: order.status,
          updated_at: order.created_at,
          timestamp: new Date().toISOString()
        })
        
        controller.enqueue(`data: ${data}\n\n`)
      }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching order status:', error)
    controller.enqueue(`data: ${JSON.stringify({ error: 'Failed to fetch status' })}\n\n`)
  }
}
