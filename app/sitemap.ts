import { MetadataRoute } from 'next'

// In a real implementation you would import your DB client here to fetch dynamic product IDs
// import pool from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://k2-chicken.vercel.app'

    // Fetch products for dynamic routes (Example logic)
    /*
    const client = await pool.connect()
    const { rows } = await client.query('SELECT id FROM products WHERE is_available = true')
    client.release()
    
    const products = rows.map((product) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }))
    */

    // Manual routes
    const routes: MetadataRoute.Sitemap = [
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
            priority: 0.8,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        // Add other static pages here as they are created (e.g., /about, /contact)
    ]

    return [...routes]
}
