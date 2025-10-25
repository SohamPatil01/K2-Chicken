import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, description, price, image_url, category, is_available } = await request.json()
    
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        UPDATE products 
        SET name = $1, description = $2, price = $3, image_url = $4, category = $5, is_available = $6, updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *
      `, [name, description, price, image_url, category, is_available, params.id])
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      
      return NextResponse.json(result.rows[0])
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        DELETE FROM products 
        WHERE id = $1
        RETURNING *
      `, [params.id])
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      
      return NextResponse.json({ message: 'Product deleted successfully' })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
