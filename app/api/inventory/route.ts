import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Get all inventory items
export async function GET() {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        SELECT 
          i.*,
          p.name as product_name,
          p.category as product_category,
          p.image_url as product_image_url,
          (i.quantity - i.reserved_quantity) as available_quantity,
          CASE 
            WHEN (i.quantity - i.reserved_quantity) <= i.minimum_stock_level THEN 'low'
            WHEN (i.quantity - i.reserved_quantity) <= (i.minimum_stock_level * 2) THEN 'medium'
            ELSE 'good'
          END as stock_status
        FROM inventory i
        INNER JOIN products p ON i.product_id = p.id
        ORDER BY p.name
      `)
      
      return NextResponse.json(result.rows)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}

// Update inventory quantity (for adjustments)
export async function PUT(request: NextRequest) {
  try {
    const { product_id, quantity, minimum_stock_level, notes } = await request.json()
    
    if (!product_id || quantity === undefined) {
      return NextResponse.json({ error: 'product_id and quantity are required' }, { status: 400 })
    }
    
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')
      
      // Get current inventory
      const currentInventory = await client.query(
        'SELECT quantity FROM inventory WHERE product_id = $1',
        [product_id]
      )
      
      if (currentInventory.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'Inventory record not found' }, { status: 404 })
      }
      
      const previousQuantity = currentInventory.rows[0].quantity
      const quantityChange = quantity - previousQuantity
      
      // Update inventory
      const updateQuery = minimum_stock_level !== undefined
        ? `UPDATE inventory 
           SET quantity = $1, minimum_stock_level = $2, updated_at = CURRENT_TIMESTAMP 
           WHERE product_id = $3 
           RETURNING *`
        : `UPDATE inventory 
           SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE product_id = $2 
           RETURNING *`
      
      const updateParams = minimum_stock_level !== undefined
        ? [quantity, minimum_stock_level, product_id]
        : [quantity, product_id]
      
      const result = await client.query(updateQuery, updateParams)
      
      // Determine change type based on notes - check for "Stock delivery" or "delivery to store" in notes
      const notesLower = notes ? notes.toLowerCase() : ''
      const changeType = (notesLower.includes('stock delivery') || notesLower.includes('delivery to store')) ? 'stock_delivery' : 'adjustment'
      
      // Log to history
      await client.query(
        `INSERT INTO inventory_history 
         (product_id, change_type, quantity_change, previous_quantity, new_quantity, notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [product_id, changeType, quantityChange, previousQuantity, quantity, notes || null]
      )
      
      await client.query('COMMIT')
      
      return NextResponse.json(result.rows[0])
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error updating inventory:', error)
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 })
  }
}

// Create inventory record for a new product
export async function POST(request: NextRequest) {
  try {
    const { product_id, quantity, minimum_stock_level } = await request.json()
    
    if (!product_id || quantity === undefined) {
      return NextResponse.json({ error: 'product_id and quantity are required' }, { status: 400 })
    }
    
    const client = await pool.connect()
    
    try {
      const result = await client.query(
        `INSERT INTO inventory (product_id, quantity, minimum_stock_level)
         VALUES ($1, $2, $3)
         ON CONFLICT (product_id) DO UPDATE SET
           quantity = EXCLUDED.quantity,
           minimum_stock_level = EXCLUDED.minimum_stock_level,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [product_id, quantity, minimum_stock_level || 10]
      )
      
      return NextResponse.json(result.rows[0], { status: 201 })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error creating inventory:', error)
    return NextResponse.json({ error: 'Failed to create inventory' }, { status: 500 })
  }
}

