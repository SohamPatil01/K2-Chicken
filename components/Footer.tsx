'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">K2</span>
              </div>
              <div>
                <div className="text-xl font-bold text-white">K2 Chicken</div>
                <div className="text-xs text-gray-400">Fresh & Delicious</div>
              </div>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed max-w-md text-sm sm:text-base">
              The best chicken in town! We serve crispy, juicy, and absolutely delicious chicken 
              that will make your taste buds dance with joy.
            </p>
            <p className="text-orange-400 font-semibold text-base sm:text-lg">
              "Finger Lickin' Good!"
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-orange-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => {
                    const productsSection = document.getElementById('products');
                    if (productsSection) {
                      productsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="text-gray-400 hover:text-orange-400 transition-colors text-left"
                >
                  Products
                </button>
              </li>
              <li>
                <Link href="/recipes" className="text-gray-400 hover:text-orange-400 transition-colors">
                  Recipes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Contact Us</h4>
            <div className="space-y-3 text-gray-400">
              <p className="flex items-center gap-2">
                <span>📞</span>
                <span>8484978622</span>
              </p>
              <p className="flex items-center gap-2">
                <span>📧</span>
                <span>hello@k2chicken.com</span>
              </p>
              <p className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed">
                <span className="flex-shrink-0 mt-0.5">📍</span>
                <span>Shop No. 4, 24K Avenue, New DP Rd, Kolte Patil, Vishal Nagar, Pimple Nilakh, Pimpri-Chinchwad, Pune, Maharashtra 411027</span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <Link 
            href="/admin/console" 
            className="block group cursor-pointer"
            title="Click to access Admin Console"
          >
            <p className="text-gray-400 group-hover:text-orange-400 transition-colors text-sm">
              &copy; 2024 K2 Chicken. All rights reserved. Made with ❤️ and lots of 🐔
            </p>
            <p className="text-xs text-gray-600 group-hover:text-orange-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              [Admin Console]
            </p>
          </Link>
        </div>
      </div>
    </footer>
  )
}
