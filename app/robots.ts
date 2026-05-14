import { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/siteUrl'

export default function robots(): MetadataRoute.Robots {
    const siteUrl = getSiteUrl()
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/', '/checkout', '/cart', '/orders', '/order-confirmation'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/api/', '/admin/', '/checkout', '/cart', '/orders', '/order-confirmation'],
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: ['/api/', '/admin/', '/checkout', '/cart', '/orders', '/order-confirmation'],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    }
}
