import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import pool from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await pool.connect()

    try {
      const result = await client.query(
        `SELECT id, name, description, price, COALESCE(original_price, price) as original_price, image_url, category, is_available
         FROM products
         WHERE id = $1`,
        [params.id]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      const product = result.rows[0]

      let weightOptions: { id: number | null; weight: number; weight_unit: string; price: number; is_default: boolean }[] = []
      try {
        const weightResult = await client.query(
          `SELECT id, weight, weight_unit, price, COALESCE(is_default, false) as is_default
           FROM product_weight_options
           WHERE product_id = $1
           ORDER BY weight`,
          [params.id]
        )
        weightOptions = weightResult.rows.map((row: any) => ({
          id: row.id,
          weight: parseFloat(row.weight) || row.weight,
          weight_unit: row.weight_unit || 'g',
          price: parseFloat(row.price) || row.price,
          is_default: !!row.is_default,
        }))
      } catch {
        // table may not exist
      }

      if (weightOptions.length === 0) {
        weightOptions = [{
          id: null,
          weight: 500,
          weight_unit: 'g',
          price: parseFloat(product.price) || product.price,
          is_default: true,
        }]
      }

      return NextResponse.json({ ...product, weightOptions })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, description, price, original_price, image_url, category, is_available } = await request.json()
    
    console.log("📥 Received product update request:", {
      productId: params.id,
      name,
      price,
      original_price,
    });
    
    const client = await pool.connect()
    
    try {
      // Get current product data before update
      const currentProduct = await client.query(
        'SELECT id, name, price, original_price FROM products WHERE id = $1',
        [params.id]
      );
      
      if (currentProduct.rows.length > 0) {
        console.log("📊 Current product data:", {
          id: currentProduct.rows[0].id,
          name: currentProduct.rows[0].name,
          currentPrice: currentProduct.rows[0].price,
          currentOriginalPrice: currentProduct.rows[0].original_price,
        });
      }
      
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

      const result = await client.query(`
        UPDATE products 
        SET name = $1, description = $2, price = $3, original_price = $4, image_url = $5, category = $6, is_available = $7, updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `, [name, description, price, original_price || null, image_url, category, is_available, params.id])
      
      if (result.rows.length === 0) {
        console.error("❌ Product not found in database:", params.id);
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      
      // Update weight options prices proportionally based on new base price
      // This ensures displayed prices match the updated product price
      try {
        const weightOptionsResult = await client.query(
          'SELECT id, weight FROM product_weight_options WHERE product_id = $1',
          [params.id]
        );
        
        if (weightOptionsResult.rows.length > 0) {
          const basePrice = parseFloat(price.toString());
          const oldBasePrice = parseFloat(currentProduct.rows[0]?.price || price.toString());
          
          // Only update if base price actually changed
          if (oldBasePrice > 0 && basePrice !== oldBasePrice) {
            const priceRatio = basePrice / oldBasePrice;
            
            for (const weightOption of weightOptionsResult.rows) {
              const newPrice = (parseFloat(weightOption.weight) / 1000) * basePrice;
              await client.query(
                'UPDATE product_weight_options SET price = $1 WHERE id = $2',
                [newPrice.toFixed(2), weightOption.id]
              );
            }
            
            console.log("✅ Updated weight options prices proportionally:", {
              productId: params.id,
              oldBasePrice,
              newBasePrice: basePrice,
              ratio: priceRatio,
              weightOptionsUpdated: weightOptionsResult.rows.length
            });
          }
        }
      } catch (error) {
        // If weight options table doesn't exist or update fails, log but don't fail the request
        console.log("⚠️ Could not update weight options (this is okay if table doesn't exist):", error);
      }
      
      console.log("✅ Product updated in database:", {
        id: result.rows[0].id,
        name: result.rows[0].name,
        newPrice: result.rows[0].price,
        newOriginalPrice: result.rows[0].original_price,
      });
      
      // Revalidate the homepage and products page to show updated prices immediately
      revalidatePath('/')
      revalidatePath('/#products')
      revalidatePath('/api/products')
      
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
      await client.query('BEGIN')
      
      // Check if product exists
      const productCheck = await client.query(
        'SELECT id, name FROM products WHERE id = $1',
        [params.id]
      )
      
      if (productCheck.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      
      // Handle foreign key constraints to allow product deletion
      // We'll temporarily drop foreign key constraints, set product_id to NULL, then delete
      
      // Get constraint names (if they exist)
      const fkConstraints = await client.query(`
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'order_items'::regclass 
        AND confrelid = 'products'::regclass
        AND contype = 'f'
      `)
      
      // Drop foreign key constraint on order_items if it exists
      for (const fk of fkConstraints.rows) {
        try {
          await client.query(`ALTER TABLE order_items DROP CONSTRAINT IF EXISTS ${fk.conname}`)
        } catch (err: any) {
          console.log('Note: Could not drop FK constraint:', err.message)
        }
      }
      
      // Allow NULL for product_id in order_items
      try {
        await client.query(`ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL`)
      } catch (err: any) {
        // Might already allow NULL
        if (err.code !== '42704') {
          console.log('Note:', err.message)
        }
      }
      
      // Set product_id to NULL in order_items (preserves order history)
      await client.query('UPDATE order_items SET product_id = NULL WHERE product_id = $1', [params.id])
      
      // Handle whatsapp_order_items similarly
      const whatsappFkConstraints = await client.query(`
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'whatsapp_order_items'::regclass 
        AND confrelid = 'products'::regclass
        AND contype = 'f'
      `)
      
      for (const fk of whatsappFkConstraints.rows) {
        try {
          await client.query(`ALTER TABLE whatsapp_order_items DROP CONSTRAINT IF EXISTS ${fk.conname}`)
        } catch (err: any) {
          console.log('Note: Could not drop WhatsApp FK constraint:', err.message)
        }
      }
      
      try {
        await client.query(`ALTER TABLE whatsapp_order_items ALTER COLUMN product_id DROP NOT NULL`)
      } catch (err: any) {
        if (err.code !== '42704') {
          console.log('Note:', err.message)
        }
      }
      
      // Set product_id to NULL in whatsapp_order_items (product_name is preserved)
      await client.query('UPDATE whatsapp_order_items SET product_id = NULL WHERE product_id = $1', [params.id])
      
      // Delete inventory record (CASCADE should handle this, but being explicit)
      await client.query('DELETE FROM inventory WHERE product_id = $1', [params.id])
      
      // Delete inventory history
      await client.query('DELETE FROM inventory_history WHERE product_id = $1', [params.id])
      
      // Delete the product
      const result = await client.query(
        'DELETE FROM products WHERE id = $1 RETURNING *',
        [params.id]
      )
      
      await client.query('COMMIT')
      
      // Revalidate the homepage and products page to remove deleted product immediately
      revalidatePath('/')
      revalidatePath('/#products')
      revalidatePath('/api/products')
      
      return NextResponse.json({ 
        success: true,
        message: 'Product deleted successfully' 
      })
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('Error deleting product:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorCode = (error as any)?.code
      console.error('Error details:', errorMessage, errorCode)
      return NextResponse.json({ 
        error: errorMessage || 'Failed to delete product. It may be referenced by existing orders.' 
      }, { status: 500 })
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Error in delete handler:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
