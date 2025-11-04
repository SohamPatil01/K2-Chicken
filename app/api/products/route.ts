import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === 'true'
    
    const client = await pool.connect()
    
    try {
      const query = all 
        ? `SELECT id, name, description, price, image_url, category, is_available
           FROM products 
           ORDER BY category, name`
        : `SELECT id, name, description, price, image_url, category, is_available
           FROM products 
           WHERE is_available = true 
           ORDER BY category, name`
      
      const result = await client.query(query)
      
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
      await client.query('BEGIN')
      
      // Create product
      const result = await client.query(`
        INSERT INTO products (name, description, price, image_url, category)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [name, description, price, image_url, category])
      
      const newProduct = result.rows[0]
      
      // Automatically create inventory record for the new product
      await client.query(`
        INSERT INTO inventory (product_id, quantity, minimum_stock_level)
        VALUES ($1, $2, $3)
        ON CONFLICT (product_id) DO NOTHING
      `, [newProduct.id, 0, 10])
      
      await client.query('COMMIT')
      
      return NextResponse.json(newProduct)
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
