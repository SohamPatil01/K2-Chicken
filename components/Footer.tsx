"use client";

import Link from "next/link";
import { FOOTER_PRODUCT_LINKS } from "@/lib/footerProductLinks";

export default function Footer() {
  return (
    <footer className="bg-k2-green-deep px-6 pb-8 pt-16 text-k2-cream/80">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-10">
        <div>
          <Link href="/" className="group mb-4 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-k2-saffron font-display text-base font-extrabold text-k2-cream">
              K2
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-display text-xl font-extrabold text-k2-cream">
                K2 Chicken
              </span>
              <span className="font-mono text-[9.5px] uppercase tracking-widest text-k2-ice">
                Only fresh, never frozen
              </span>
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed">
            Pune&apos;s trusted source for 100% fresh, raw, halal-certified
            chicken. Sourced daily, cut to order, delivered fresh.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href="https://facebook.com/k2chicken"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-k2-cream/10 text-k2-cream/60 transition-colors hover:bg-k2-saffron hover:text-white"
              aria-label="Facebook"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </a>
            <a
              href="https://instagram.com/k2chicken"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-k2-cream/10 text-k2-cream/60 transition-colors hover:bg-k2-saffron hover:text-white"
              aria-label="Instagram"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5a5 5 0 100 10 5 5 0 000-10zm6.5-.75a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z" />
              </svg>
            </a>
            <a
              href="https://wa.me/918484978622"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-k2-cream/10 text-k2-cream/60 transition-colors hover:bg-k2-saffron hover:text-white"
              aria-label="WhatsApp"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              </svg>
            </a>
          </div>
        </div>

        <ul>
          <h4 className="mb-4 font-display text-[15px] text-k2-cream">
            Fresh Cuts
          </h4>
          {FOOTER_PRODUCT_LINKS.map(({ id, label }) => (
            <li key={id} className="mb-2.5 text-sm">
              <Link
                href={`/products/${id}`}
                className="transition-colors hover:text-k2-saffron"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <ul>
          <h4 className="mb-4 font-display text-[15px] text-k2-cream">
            Customer Service
          </h4>
          <li className="mb-2.5 text-sm">
            <Link href="/#products" className="hover:text-k2-saffron">
              How to Order
            </Link>
          </li>
          <li className="mb-2.5 text-sm">
            <Link href="/#faq" className="hover:text-k2-saffron">
              Delivery Areas
            </Link>
          </li>
          <li className="mb-2.5 text-sm">
            <Link href="/recipes" className="hover:text-k2-saffron">
              Recipes &amp; Tips
            </Link>
          </li>
          <li className="mb-2.5 text-sm">
            <Link href="/orders" className="hover:text-k2-saffron">
              My Orders
            </Link>
          </li>
          <li className="mb-2.5 text-sm">
            <Link href="/login" className="hover:text-k2-saffron">
              Sign In
            </Link>
          </li>
        </ul>

        <ul>
          <h4 className="mb-4 font-display text-[15px] text-k2-cream">
            Visit Us
          </h4>
          <li className="mb-2.5 text-sm leading-relaxed">
            Shop No. 4, 24K Avenue, New DP Rd, Vishal Nagar, Pimple Nilakh, Pune
            411027
          </li>
          <li className="mb-2.5 text-sm">
            <a href="tel:+918484978622" className="hover:text-k2-saffron">
              +91 84849 78622
            </a>
          </li>
          <li className="mb-2.5 text-sm">
            <a
              href="mailto:k2foodindia@gmail.com"
              className="break-all hover:text-k2-saffron"
            >
              k2foodindia@gmail.com
            </a>
          </li>
          <li className="text-sm">Open 8:00 AM – 8:00 PM daily</li>
        </ul>
      </div>

      <div className="mx-auto mt-12 flex max-w-[1180px] flex-wrap justify-between gap-4 border-t border-k2-cream/10 pt-6 font-mono text-[11.5px] text-k2-cream/50">
        <span>© 2026 K2 CHICKEN · FSSAI LICENSED</span>
        <span>SECURE PAYMENTS · SSL ENCRYPTED · HALAL CERTIFIED</span>
      </div>
    </footer>
  );
}
