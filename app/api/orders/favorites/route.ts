import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// Get favorite orders for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const phone = searchParams.get('phone')

    if (!userId && !phone) {
      return NextResponse.json({ error: 'User ID or phone required' }, { status: 400 })
    }

    const client = await pool.connect()
    
    try {
      // Check if favorite_orders table exists, create if not
      await client.query(`
        CREATE TABLE IF NOT EXISTS favorite_orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          user_phone VARCHAR(20),
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          order_name VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, order_id),
          UNIQUE(user_phone, order_id)
        )
      `)

      let result
      if (userId) {
        result = await client.query(`
          SELECT fo.*, o.*,
                 array_agg(
                   json_build_object(
                     'id', oi.id,
                     'product_id', oi.product_id,
                     'product_name', COALESCE(oi.product_name, p.name),
                     'quantity', oi.quantity,
                     'price', oi.price
                   )
                 ) FILTER (WHERE oi.id IS NOT NULL) as items
          FROM favorite_orders fo
          JOIN orders o ON fo.order_id = o.id
          LEFT JOIN order_items oi ON o.id = oi.order_id
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE fo.user_id = $1
          GROUP BY fo.id, o.id
          ORDER BY fo.created_at DESC
        `, [userId])
      } else {
        result = await client.query(`
          SELECT fo.*, o.*,
                 array_agg(
                   json_build_object(
                     'id', oi.id,
                     'product_id', oi.product_id,
                     'product_name', COALESCE(oi.product_name, p.name),
                     'quantity', oi.quantity,
                     'price', oi.price
                   )
                 ) FILTER (WHERE oi.id IS NOT NULL) as items
          FROM favorite_orders fo
          JOIN orders o ON fo.order_id = o.id
          LEFT JOIN order_items oi ON o.id = oi.order_id
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE fo.user_phone = $1
          GROUP BY fo.id, o.id
          ORDER BY fo.created_at DESC
        `, [phone])
      }

      return NextResponse.json(result.rows)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching favorite orders:', error)
    return NextResponse.json({ error: 'Failed to fetch favorite orders' }, { status: 500 })
  }
}

// Add order to favorites
export async function POST(request: NextRequest) {
  try {
    const { user_id, user_phone, order_id, order_name } = await request.json()

    if (!order_id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const client = await pool.connect()
    
    try {
      // Ensure table exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS favorite_orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          user_phone VARCHAR(20),
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          order_name VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, order_id),
          UNIQUE(user_phone, order_id)
        )
      `)

      const result = await client.query(`
        INSERT INTO favorite_orders (user_id, user_phone, order_id, order_name)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, order_id) DO NOTHING
        ON CONFLICT (user_phone, order_id) DO NOTHING
        RETURNING *
      `, [user_id || null, user_phone || null, order_id, order_name || `Order #${order_id}`])

      return NextResponse.json({ success: true, favorite: result.rows[0] })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error adding favorite order:', error)
    return NextResponse.json({ error: 'Failed to add favorite order' }, { status: 500 })
  }
}

// Remove order from favorites
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const user_phone = searchParams.get('user_phone')
    const order_id = searchParams.get('order_id')

    if (!order_id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const client = await pool.connect()
    
    try {
      let result
      if (user_id) {
        result = await client.query(`
          DELETE FROM favorite_orders
          WHERE user_id = $1 AND order_id = $2
          RETURNING *
        `, [user_id, order_id])
      } else if (user_phone) {
        result = await client.query(`
          DELETE FROM favorite_orders
          WHERE user_phone = $1 AND order_id = $2
          RETURNING *
        `, [user_phone, order_id])
      } else {
        return NextResponse.json({ error: 'User ID or phone required' }, { status: 400 })
      }

      return NextResponse.json({ success: true, deleted: result.rows.length > 0 })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error removing favorite order:', error)
    return NextResponse.json({ error: 'Failed to remove favorite order' }, { status: 500 })
  }
}

