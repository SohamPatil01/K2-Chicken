import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === 'true'
    
    const client = await pool.connect()
    
    try {
      // Check if additional columns exist
      const columnCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name IN ('stock_quantity', 'low_stock_threshold', 'in_stock')
      `)
      const hasStockColumns = columnCheck.rows.length > 0
      
      const query = all 
        ? `SELECT id, name, description, price, image_url, category, is_available,
                  ${hasStockColumns ? 'COALESCE(stock_quantity, 100) as stock_quantity,' : '100 as stock_quantity,'}
                  ${hasStockColumns ? 'COALESCE(low_stock_threshold, 10) as low_stock_threshold,' : '10 as low_stock_threshold,'}
                  ${hasStockColumns ? 'COALESCE(in_stock, true) as in_stock' : 'true as in_stock'}
           FROM products 
           ORDER BY category, name`
        : `SELECT id, name, description, price, image_url, category, is_available,
                  ${hasStockColumns ? 'COALESCE(stock_quantity, 100) as stock_quantity,' : '100 as stock_quantity,'}
                  ${hasStockColumns ? 'COALESCE(low_stock_threshold, 10) as low_stock_threshold,' : '10 as low_stock_threshold,'}
                  ${hasStockColumns ? 'COALESCE(in_stock, true) as in_stock' : 'true as in_stock'}
           FROM products 
           WHERE is_available = true 
           ORDER BY category, name`
      
      const result = await client.query(query)
      
      // Check if product_weight_options table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'product_weight_options'
        )
      `)
      const hasWeightOptionsTable = tableCheck.rows[0].exists
      
      // Fetch weight options for each product (if table exists)
      const productsWithWeights = await Promise.all(
        result.rows.map(async (product) => {
          let weightOptions = []
          
          if (hasWeightOptionsTable) {
            try {
              const weightResult = await client.query(
                `SELECT id, weight, weight_unit, price, is_default 
                 FROM product_weight_options 
                 WHERE product_id = $1 
                 ORDER BY weight ASC`,
                [product.id]
              )
              weightOptions = weightResult.rows
            } catch (error) {
              // Table might not exist yet, use default
              console.log('Weight options table not accessible, using default')
            }
          }
          
          return {
            ...product,
            weightOptions: weightOptions.length > 0 
              ? weightOptions 
              : [
                  { id: null, weight: 500, weight_unit: 'g', price: product.price, is_default: true }
                ]
          }
        })
      )
      
      return NextResponse.json(productsWithWeights)
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
