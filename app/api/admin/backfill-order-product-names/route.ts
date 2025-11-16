import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const expectedToken = process.env.DB_INIT_TOKEN || 'change-this-token'

    if (token !== expectedToken) {
      return NextResponse.json(
        {
          error: 'Unauthorized. Add ?token=your-db-init-token to the URL.',
          hint: 'Set DB_INIT_TOKEN in your environment variables for security.'
        },
        { status: 401 }
      )
    }

    console.log('Starting backfill of product_name in order_items...')
    const client = await pool.connect()

    try {
      // First, add the column if it doesn't exist
      await client.query(`
        ALTER TABLE order_items 
        ADD COLUMN IF NOT EXISTS product_name VARCHAR(255)
      `).catch(() => {})

      // Update order_items where product_name is NULL but product_id exists
      const updateResult = await client.query(`
        UPDATE order_items oi
        SET product_name = p.name
        FROM products p
        WHERE oi.product_id = p.id
        AND (oi.product_name IS NULL OR oi.product_name = '')
      `)

      console.log(`Updated ${updateResult.rowCount} order items with product names`)

      // Count how many still have NULL product_name (products that were deleted)
      const nullCountResult = await client.query(`
        SELECT COUNT(*) as count
        FROM order_items
        WHERE product_name IS NULL OR product_name = ''
      `)

      const nullCount = nullCountResult.rows[0]?.count || 0

      return NextResponse.json({
        success: true,
        message: 'Product names backfilled successfully!',
        updated: updateResult.rowCount,
        stillMissing: nullCount,
        warning: nullCount > 0 
          ? `⚠️ ${nullCount} order items still have no product name (products may have been deleted). They will show as "Product (Unavailable)".`
          : null
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error backfilling product names:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: errorMessage,
      hint: 'Ensure your DATABASE_URL is correct and tables exist.'
    }, { status: 500 })
  }
}

