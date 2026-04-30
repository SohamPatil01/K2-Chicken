import { MetadataRoute } from 'next'
import pool from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://k2-chicken.vercel.app'
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
        },
        {
            url: `${baseUrl}/cart`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/checkout`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        }
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
            
            routes.push(...recipeRoutes)
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error fetching recipes for sitemap:', error)
    }

    return routes
}
