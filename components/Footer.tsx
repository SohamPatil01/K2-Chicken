import Link from 'next/link';
import { Facebook, Instagram, Twitter, MapPin, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-12 pb-24 md:pb-12 safe-bottom">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="K2 Chicken" className="h-10 w-auto" />
              <span className="text-xl font-bold text-gray-900 hidden sm:block">K2 Chicken</span>
            </Link>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Premium quality fresh chicken delivered to your doorstep. Farm-fresh, antibiotic-free, and hygienically processed.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors border border-gray-100">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-100">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-sky-50 hover:text-sky-600 transition-colors border border-gray-100">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 text-xs tracking-wider uppercase">Know Us</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="/about" className="hover:text-orange-600 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-orange-600 transition-colors">Contact Us</Link></li>
              <li><Link href="/recipes" className="hover:text-orange-600 transition-colors">Our Recipes</Link></li>
              <li><Link href="/terms" className="hover:text-orange-600 transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-orange-600 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 text-xs tracking-wider uppercase">Contact</h3>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-orange-600 shrink-0 mt-0.5" />
                <span>Main Road, Bidar,<br />Karnataka 585401</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-orange-600 shrink-0" />
                <a href="tel:+918484978622" className="hover:text-orange-600 transition-colors">+91 84849 78622</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-orange-600 shrink-0" />
                <a href="mailto:support@k2chicken.com" className="hover:text-orange-600 transition-colors">support@k2chicken.com</a>
              </li>
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 text-xs tracking-wider uppercase">We Serve In</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <span className="font-medium text-gray-900">Bidar</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                Gulbarga (Coming Soon)
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                Hyderabad (Coming Soon)
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2026 K2 Chicken. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Made with ❤️ in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
