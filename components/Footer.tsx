"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Clock, Lock, ShieldCheck, BadgeCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-10 text-center sm:gap-12 md:grid-cols-2 md:text-left lg:grid-cols-4">
          {/* Brand column */}
          <div className="md:text-left">
            <div className="mb-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:justify-start">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-red shadow-brand-sm shrink-0">
                <Image src="/logo.png" alt="K2 Chicken" width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-serif font-bold break-words">K2 Chicken</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Pune&apos;s trusted source for 100% fresh, raw, Halal-certified chicken. Sourced daily, cut to order, delivered fresh. No frozen stock, no compromises.
            </p>
            <div className="flex justify-center gap-3 md:justify-start">
              <a href="https://facebook.com/k2chicken" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-brand-red hover:text-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href="https://instagram.com/k2chicken" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-brand-red hover:text-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </a>
              <a href="https://wa.me/918484978622" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-brand-red hover:text-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
              </a>
            </div>
          </div>

          {/* Fresh Cuts */}
          <div>
            <h4 className="text-white font-semibold mb-6">Fresh Cuts</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {["Chicken Breast (Boneless)", "Chicken Curry Cut", "Chicken Drumsticks", "Chicken Mince / Keema", "Whole Chicken", "Liver & Gizzard"].map((item) => (
                <li key={item}>
                  <Link href="/#products" className="hover:text-brand-red transition-colors break-words">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-6">Customer Service</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/#products" className="hover:text-brand-red transition-colors">How to Order</Link></li>
              <li><Link href="/#contact" className="hover:text-brand-red transition-colors">Delivery Areas</Link></li>
              <li><Link href="/recipes" className="hover:text-brand-red transition-colors">Recipes & Tips</Link></li>
              <li><Link href="/orders" className="hover:text-brand-red transition-colors">My Orders</Link></li>
              <li><Link href="/login" className="hover:text-brand-red transition-colors">Sign In</Link></li>
              <li>
                <Link href="/admin" className="hover:text-brand-red transition-colors opacity-50 hover:opacity-100">
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start justify-center gap-3 md:justify-start">
                <MapPin className="w-4 h-4 text-brand-red mt-0.5 flex-shrink-0" />
                <span className="break-words">Shop No. 4, 24K Avenue, New DP Rd, Kolte Patil, Vishal Nagar, Pimple Nilakh, Pimpri-Chinchwad, Pune 411027</span>
              </li>
              <li className="flex items-center justify-center gap-3 md:justify-start">
                <Phone className="w-4 h-4 text-brand-red flex-shrink-0" />
                <a href="tel:+918484978622" className="hover:text-brand-red transition-colors">+91 84849 78622</a>
              </li>
              <li className="flex items-center justify-center gap-3 md:justify-start">
                <Mail className="w-4 h-4 text-brand-red flex-shrink-0" />
                <a href="mailto:k2foodindia@gmail.com" className="hover:text-brand-red transition-colors break-all">k2foodindia@gmail.com</a>
              </li>
              <li className="flex items-center justify-center gap-3 md:justify-start">
                <Clock className="w-4 h-4 text-brand-red flex-shrink-0" />
                <span>8:00 AM – 8:00 PM Daily</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm text-center md:text-left break-words">© 2026 K2 Chicken. All rights reserved. FSSAI Licensed.</p>
          <div className="flex items-center gap-4 md:gap-6 text-sm text-gray-500 flex-wrap justify-center">
            <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Secure Payments</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> SSL Encrypted</span>
            <span className="flex items-center gap-1.5"><BadgeCheck className="w-3.5 h-3.5" /> FSSAI Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
