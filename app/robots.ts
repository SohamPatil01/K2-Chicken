import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
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
        sitemap: 'https://k2-chicken.vercel.app/sitemap.xml',
    }
}
