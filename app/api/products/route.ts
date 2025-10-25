import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        SELECT id, name, description, price, image_url, category, is_available
        FROM products 
        WHERE is_available = true 
        ORDER BY category, name
      `)
      
      return NextResponse.json(result.rows)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, price, image_url, category } = await request.json()
    
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        INSERT INTO products (name, description, price, image_url, category)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [name, description, price, image_url, category])
      
      return NextResponse.json(result.rows[0])
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
