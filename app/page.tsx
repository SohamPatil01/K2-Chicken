import Hero from '@/components/Hero'
import ProductCatalog from '@/components/ProductCatalog'
import RecipeSection from '@/components/RecipeSection'
import WhyChooseUs from '@/components/WhyChooseUs'
import PromotionsFlyer from '@/components/PromotionsFlyer'
import ReviewsSection from '@/components/ReviewsSection'
import pool from '@/lib/db'

// Fetch data directly from database for better performance
async function getHomePageData() {
  const client = await pool.connect()
  try {
    // Fetch all data in parallel
    const [productsResult, recipesResult, promotionsResult, reviewsResult] = await Promise.all([
      (async () => {
        // Check if original_price column exists
        const columnCheck = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'products' AND column_name = 'original_price'
        `)
        const hasOriginalPrice = columnCheck.rows.length > 0
        
        return client.query(`
          SELECT id, name, description, price, ${hasOriginalPrice ? 'COALESCE(original_price, price) as original_price' : 'price as original_price'}, image_url, category, is_available,
                 COALESCE(stock_quantity, 100) as stock_quantity,
                 COALESCE(low_stock_threshold, 10) as low_stock_threshold,
                 COALESCE(in_stock, true) as in_stock
          FROM products 
          WHERE is_available = true 
          ORDER BY category, name
        `)
      })(),
      client.query(`
        SELECT id, title, description, ingredients, instructions, image_url, prep_time, cook_time, servings
        FROM recipes 
        ORDER BY created_at DESC
        LIMIT 3
      `),
      client.query(`
        SELECT * FROM promotions
        WHERE is_active = true AND (end_date IS NULL OR end_date >= CURRENT_DATE)
        ORDER BY display_order ASC, created_at DESC
      `),
      client.query(`
        SELECT id, user_name, rating, comment, created_at
        FROM reviews
        WHERE is_approved = true
        ORDER BY is_featured DESC, display_order ASC, created_at DESC
        LIMIT 12
      `)
    ])

    // Get weight options for products
    const productIds = productsResult.rows.map(p => p.id)
    let weightOptions: any[] = []
    if (productIds.length > 0) {
      const weightResult = await client.query(`
        SELECT * FROM product_weight_options 
        WHERE product_id = ANY($1::int[])
        ORDER BY product_id, weight
      `, [productIds])
      weightOptions = weightResult.rows
    }

    // Attach weight options to products
    const products = productsResult.rows.map(product => ({
      ...product,
      weightOptions: weightOptions.filter(wo => wo.product_id === product.id)
    }))

    return {
      products,
      recipes: recipesResult.rows,
      promotions: promotionsResult.rows,
      reviews: reviewsResult.rows
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', errorMessage)
    // Log the error but don't crash the page
    return { products: [], recipes: [], promotions: [], reviews: [] }
  } finally {
    client.release()
  }
}

export default async function Home() {
  // Fetch data server-side
  const { products, recipes, promotions, reviews } = await getHomePageData()
  
  // Debug logging
  console.log('Home page - Products count:', products.length)
  if (products.length === 0) {
    console.warn('⚠️ No products found! Check database connection and product availability.')
  }

  return (
    <div>
      <PromotionsFlyer initialPromotions={promotions} />
      <Hero />
      <div id="products">
        <ProductCatalog initialProducts={products} />
      </div>
      <RecipeSection initialRecipes={recipes} />
      <ReviewsSection initialReviews={reviews} />
      <WhyChooseUs />
    </div>
  )
}
