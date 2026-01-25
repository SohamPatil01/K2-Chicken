import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'K2 Chicken - Fresh Delivery',
        short_name: 'K2 Chicken',
        description: 'Order fresh, premium quality chicken online in Bidar.',
        start_url: '/',
        display: 'standalone',
        background_color: '#FFFAF5', // chicken-cream
        theme_color: '#F97316', // chicken-fresh-orange
        icons: [
            {
                src: '/logo.svg',
                sizes: '192x192',
                type: 'image/svg+xml',
            },
            {
                src: '/logo.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
            },
        ],
    }
}
