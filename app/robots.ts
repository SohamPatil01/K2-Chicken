import { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/siteUrl'

export default function robots(): MetadataRoute.Robots {
    const siteUrl = getSiteUrl()
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/', '/checkout', '/cart', '/orders'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/api/', '/admin/', '/checkout', '/cart', '/orders'],
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: ['/api/', '/admin/', '/checkout', '/cart', '/orders'],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    }
}
