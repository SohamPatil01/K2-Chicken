import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// Get inventory history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')
    const changeType = searchParams.get('change_type')
    const date = searchParams.get('date') // Filter by date (YYYY-MM-DD)
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const client = await pool.connect()
    
    try {
      let query = `
        SELECT 
          ih.*,
          p.name as product_name
        FROM inventory_history ih
        INNER JOIN products p ON ih.product_id = p.id
      `
      const params: any[] = []
      const conditions: string[] = []
      
      if (productId) {
        conditions.push(`ih.product_id = $${params.length + 1}`)
        params.push(productId)
      }
      
      if (changeType) {
        conditions.push(`ih.change_type = $${params.length + 1}`)
        params.push(changeType)
      }
      
      if (date) {
        conditions.push(`DATE(ih.created_at) = $${params.length + 1}`)
        params.push(date)
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ')
      }
      
      query += ' ORDER BY ih.created_at DESC LIMIT $' + (params.length + 1)
      params.push(limit)
      
      const result = await client.query(query, params)
      
      return NextResponse.json(result.rows)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching inventory history:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory history' }, { status: 500 })
  }
}

