import { MetadataRoute } from 'next'
import pool from '@/lib/db'
import { getSiteUrl } from '@/lib/siteUrl'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getSiteUrl()
    const routes: MetadataRoute.Sitemap = []

    routes.push({
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
    })

    try {
        const client = await pool.connect()
        try {
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

            routes.push(...productRoutes)
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error fetching products for sitemap:', error)
    }

    return routes
}
