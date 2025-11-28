import dynamic from 'next/dynamic'
import Hero from '@/components/Hero'
import pool from '@/lib/db'

// Lazy load heavy components for better performance
const ProductCatalog = dynamic(() => import('@/components/ProductCatalog'), {
  loading: () => <div className="min-h-[400px] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div></div>,
  ssr: true
})

const RecipeSection = dynamic(() => import('@/components/RecipeSection'), {
  loading: () => <div className="min-h-[300px] flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-200 border-t-orange-500"></div></div>,
  ssr: true
})

const WhyChooseUs = dynamic(() => import('@/components/WhyChooseUs'), {
  ssr: true
})

const AboutSection = dynamic(() => import('@/components/AboutSection'), {
  ssr: true
})

const ContactSection = dynamic(() => import('@/components/ContactSection'), {
  ssr: false // Client-side only for map
})

const PromotionsFlyer = dynamic(() => import('@/components/PromotionsFlyer'), {
  loading: () => <div className="min-h-[200px]"></div>,
  ssr: true
})

const ReviewsSection = dynamic(() => import('@/components/ReviewsSection'), {
  loading: () => <div className="min-h-[300px]"></div>,
  ssr: true
})

const InauguralDiscountFlyer = dynamic(() => import('@/components/InauguralDiscountFlyer'), {
  ssr: false // Client-side only component
})

// Cache column existence check (only check once, reuse result)
let hasOriginalPriceColumn: boolean | null = null

async function checkOriginalPriceColumn(client: any): Promise<boolean> {
  if (hasOriginalPriceColumn !== null) {
    return hasOriginalPriceColumn
  }
  try {
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'original_price'
    `)
    hasOriginalPriceColumn = columnCheck.rows.length > 0
    return hasOriginalPriceColumn
  } catch {
    hasOriginalPriceColumn = false
    return false
  }
}

// Fetch data directly from database for better performance
export const revalidate = 60 // Revalidate every 60 seconds

async function getHomePageData() {
  const client = await pool.connect()
  try {
    // Check column existence once
    const hasOriginalPrice = await checkOriginalPriceColumn(client)
    
    // Fetch all data in parallel
    const [productsResult, recipesResult, promotionsResult, reviewsResult] = await Promise.all([
      client.query(`
        SELECT id, name, description, price, ${hasOriginalPrice ? 'COALESCE(original_price, price) as original_price' : 'price as original_price'}, image_url, category, is_available,
               COALESCE(stock_quantity, 100) as stock_quantity,
               COALESCE(low_stock_threshold, 10) as low_stock_threshold,
               COALESCE(in_stock, true) as in_stock
        FROM products 
        WHERE is_available = true 
        ORDER BY category, name
      `),
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
        LIMIT 6
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

  return (
    <div>
      <InauguralDiscountFlyer />
      <PromotionsFlyer initialPromotions={promotions} />
      <Hero />
      <div id="products">
        <ProductCatalog initialProducts={products} />
      </div>
      <AboutSection />
      <RecipeSection initialRecipes={recipes} />
      <ReviewsSection initialReviews={reviews} />
      <WhyChooseUs />
      <ContactSection />
    </div>
  )
}
