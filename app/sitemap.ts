import { MetadataRoute } from 'next'
import pool from '@/lib/db'
import { getSiteUrl } from '@/lib/siteUrl'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getSiteUrl()
    const routes: MetadataRoute.Sitemap = []

    // Static routes
    routes.push(
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/recipes`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        }
        // /shop redirects to /#products, and private/noindex pages are omitted.
    )

    // Fetch recipes for dynamic routes
    try {
        const client = await pool.connect()
        try {
            const recipesResult = await client.query(
                'SELECT id, created_at FROM recipes ORDER BY COALESCE(created_at, CURRENT_TIMESTAMP) DESC'
            )
            
            const recipeRoutes = recipesResult.rows.map((recipe: any) => ({
                url: `${baseUrl}/recipes/${recipe.id}`,
                lastModified: recipe.created_at ? new Date(recipe.created_at) : new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }))

            const productsResult = await client.query(
                `SELECT id, COALESCE(updated_at, created_at, CURRENT_TIMESTAMP) AS lm
                 FROM products WHERE is_available = true ORDER BY id ASC`
            )

            const productRoutes = productsResult.rows.map((row: { id: number; lm: Date }) => ({
                url: `${baseUrl}/products/${row.id}`,
                lastModified: row.lm ? new Date(row.lm) : new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.85,
            }))
            
            routes.push(...recipeRoutes, ...productRoutes)
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error fetching recipes for sitemap:', error)
    }

    return routes
}
