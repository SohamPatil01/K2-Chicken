'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/logo.svg" 
                alt="Chicken Vicken Logo" 
                className="h-8 w-auto"
              />
            </div>
            <p className="text-gray-300 mb-4">
              The best chicken in town! We serve crispy, juicy, and absolutely delicious chicken 
              that will make your taste buds dance with joy.
            </p>
            <p className="text-chicken-yellow font-semibold">
              "Finger Lickin' Good!"
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-chicken-yellow transition-colors">
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
                  className="text-gray-300 hover:text-chicken-yellow transition-colors text-left"
                >
                  Products
                </button>
              </li>
              <li>
                <Link href="/recipes" className="text-gray-300 hover:text-chicken-yellow transition-colors">
                  Recipes
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-gray-300 hover:text-chicken-yellow transition-colors">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-2 text-gray-300">
              <p>📞 (555) CHICKEN-1</p>
              <p>📧 hello@chickenvicken.com</p>
              <p>📍 123 Chicken Street<br />Cluck City, CC 12345</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 Chicken Vicken. All rights reserved. Made with ❤️ and lots of 🐔</p>
        </div>
      </div>
    </footer>
  )
}
