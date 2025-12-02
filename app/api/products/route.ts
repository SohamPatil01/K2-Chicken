import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// Cache for 60 seconds (revalidate)
export const revalidate = 60;
export const runtime = 'nodejs';

// Cache column existence checks (only check once per process)
let cachedColumnCheck: {
  hasStockColumns: boolean
  hasOriginalPriceColumn: boolean
  checked: boolean
} = {
  hasStockColumns: false,
  hasOriginalPriceColumn: false,
  checked: false
}

async function checkColumns(client: any) {
  if (cachedColumnCheck.checked) {
    return cachedColumnCheck
  }
  
  try {
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name IN ('stock_quantity', 'low_stock_threshold', 'in_stock', 'original_price')
    `)
    const columnNames = columnCheck.rows.map((row: any) => row.column_name)
    cachedColumnCheck.hasStockColumns = ['stock_quantity', 'low_stock_threshold', 'in_stock'].every(col => columnNames.includes(col))
    cachedColumnCheck.hasOriginalPriceColumn = columnNames.includes('original_price')
    cachedColumnCheck.checked = true
  } catch (error) {
    // If check fails, assume columns don't exist
    cachedColumnCheck.checked = true
  }
  
  return cachedColumnCheck
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === 'true'
    const idsParam = searchParams.get('ids')
    const productIds = idsParam ? idsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : null
    
    const client = await pool.connect()
    
    try {
      // Check columns (cached after first check)
      const { hasStockColumns, hasOriginalPriceColumn } = await checkColumns(client)
      
      let query: string
      let queryParams: any[] = []
      
      if (productIds && productIds.length > 0) {
        // Fetch specific products by IDs
        query = `SELECT id, name, description, price, ${hasOriginalPriceColumn ? 'COALESCE(original_price, price) as original_price' : 'price as original_price'}, image_url, category, is_available,
                  ${hasStockColumns ? 'COALESCE(stock_quantity, 100) as stock_quantity,' : '100 as stock_quantity,'}
                  ${hasStockColumns ? 'COALESCE(low_stock_threshold, 10) as low_stock_threshold,' : '10 as low_stock_threshold,'}
                  ${hasStockColumns ? 'COALESCE(in_stock, true) as in_stock' : 'true as in_stock'}
           FROM products 
           WHERE id = ANY($1::int[])
           ORDER BY category, name`
        queryParams = [productIds]
      } else {
        query = all 
          ? `SELECT id, name, description, price, ${hasOriginalPriceColumn ? 'COALESCE(original_price, price) as original_price' : 'price as original_price'}, image_url, category, is_available,
                    ${hasStockColumns ? 'COALESCE(stock_quantity, 100) as stock_quantity,' : '100 as stock_quantity,'}
                    ${hasStockColumns ? 'COALESCE(low_stock_threshold, 10) as low_stock_threshold,' : '10 as low_stock_threshold,'}
                    ${hasStockColumns ? 'COALESCE(in_stock, true) as in_stock' : 'true as in_stock'}
             FROM products 
             ORDER BY category, name`
          : `SELECT id, name, description, price, ${hasOriginalPriceColumn ? 'COALESCE(original_price, price) as original_price' : 'price as original_price'}, image_url, category, is_available,
                    ${hasStockColumns ? 'COALESCE(stock_quantity, 100) as stock_quantity,' : '100 as stock_quantity,'}
                    ${hasStockColumns ? 'COALESCE(low_stock_threshold, 10) as low_stock_threshold,' : '10 as low_stock_threshold,'}
                    ${hasStockColumns ? 'COALESCE(in_stock, true) as in_stock' : 'true as in_stock'}
             FROM products 
             WHERE is_available = true 
             ORDER BY category, name`
      }
      
      const result = queryParams.length > 0 
        ? await client.query(query, queryParams)
        : await client.query(query)
      
      // Check if product_weight_options table exists (cached check)
      let hasWeightOptionsTable = false
      try {
        const tableCheck = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'product_weight_options'
          )
        `)
        hasWeightOptionsTable = tableCheck.rows[0].exists
      } catch {
        hasWeightOptionsTable = false
      }
      
      // Batch fetch all weight options at once (much faster than per-product queries)
      let weightOptionsMap: { [key: number]: any[] } = {}
      if (hasWeightOptionsTable && result.rows.length > 0) {
        try {
          const productIds = result.rows.map((p: any) => p.id)
          const weightResult = await client.query(
            `SELECT id, product_id, weight, weight_unit, price, is_default 
             FROM product_weight_options 
             WHERE product_id = ANY($1::int[])
             ORDER BY product_id, weight ASC`,
            [productIds]
          )
          
          // Group weight options by product_id
          weightResult.rows.forEach((wo: any) => {
            if (!weightOptionsMap[wo.product_id]) {
              weightOptionsMap[wo.product_id] = []
            }
            weightOptionsMap[wo.product_id].push(wo)
          })
        } catch (error) {
          // Table might not exist yet, use defaults
        }
      }
      
      // Attach weight options to products
      const productsWithWeights = result.rows.map((product: any) => {
        const weightOptions = weightOptionsMap[product.id] || []
        return {
          ...product,
          weightOptions: weightOptions.length > 0 
            ? weightOptions 
            : [
                { id: null, weight: 500, weight_unit: 'g', price: product.price, is_default: true }
              ]
        }
      })
      
      return NextResponse.json(productsWithWeights)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? error.stack : String(error)
    console.error('Error details:', errorDetails)
    return NextResponse.json({ 
      error: 'Failed to fetch products',
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, price, original_price, image_url, category, is_available } = await request.json()
    
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')
      
      // Ensure original_price column exists
      await client.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='products' AND column_name='original_price') THEN
            ALTER TABLE products ADD COLUMN original_price DECIMAL(10,2);
          END IF;
        END $$;
      `)
      
      // Create product
      const result = await client.query(`
        INSERT INTO products (name, description, price, original_price, image_url, category, is_available)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [name, description, price, original_price || null, image_url, category, is_available ?? true])
      
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
