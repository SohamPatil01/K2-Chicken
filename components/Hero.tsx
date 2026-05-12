"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface HeroProps {
  deliveryEnabled?: boolean;
  freeDeliveryAbove?: number;
}

export default function Hero({
  deliveryEnabled = true,
  freeDeliveryAbove = 350,
}: HeroProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-white">
      {/* Background image with heavy white overlay */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=2070&auto=format&fit=crop"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left text column */}
          <div className="space-y-6">
            {/* Fresh badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm font-semibold ${mounted ? "hero-text-reveal" : "opacity-0"}`}>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              100% Fresh Raw Chicken — Never Frozen, Never Cooked
            </div>

            {/* Headline */}
            <h1 className={`text-5xl md:text-6xl font-serif font-bold text-gray-900 leading-[1.1] ${mounted ? "hero-text-reveal stagger-1" : "opacity-0"}`}>
              Farm Fresh <br />
              <span className="text-brand-red italic">Raw Chicken</span><br />
              Delivered Daily
            </h1>

            {/* Sub */}
            <p className={`text-lg text-gray-600 max-w-lg leading-relaxed ${mounted ? "hero-text-reveal stagger-2" : "opacity-0"}`}>
              Premium quality raw chicken cuts, hand-cleaned by master butchers and hygienically packed. Delivered fresh to your kitchen in Pune.
              {deliveryEnabled && freeDeliveryAbove > 0 && (
                <span className="block mt-2 font-semibold text-brand-red">Free delivery above ₹{freeDeliveryAbove}</span>
              )}
            </p>

            {/* CTA buttons */}
            <div className={`flex flex-wrap gap-4 ${mounted ? "hero-text-reveal stagger-3" : "opacity-0"}`}>
              <Link
                href="/#products"
                className="btn-primary px-8 py-4 rounded-full text-white font-semibold text-lg flex items-center gap-3"
              >
                Shop Fresh Cuts
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("process");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-8 py-4 rounded-full border-2 border-gray-300 text-gray-700 font-semibold hover:border-brand-red hover:text-brand-red transition-all text-lg flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Our Process
              </button>
            </div>

            {/* Social proof */}
            <div className={`flex items-center gap-6 pt-2 ${mounted ? "hero-text-reveal stagger-4" : "opacity-0"}`}>
              <div className="flex -space-x-3">
                {["photo-1507003211169-0a1dd7228f2d", "photo-1494790108377-be9c29b29330", "photo-1500648767791-00dcc994a43e"].map((id, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={`https://images.unsplash.com/${id}?w=100&h=100&fit=crop`} className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="Customer" />
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">+2k</div>
              </div>
              <div className="text-sm text-gray-500"><span className="text-gray-900 font-bold">4.9/5</span> from 2,000+ home chefs</div>
            </div>
          </div>

          {/* Right floating product cards (desktop only) */}
          <div className="hidden lg:block relative h-[500px]">
            {/* Card 1 */}
            <div className="absolute top-0 right-0 w-60 bg-white rounded-2xl p-3 border border-gray-200 shadow-xl animate-float">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://kimi-web-img.moonshot.cn/img/static.vecteezy.com/5339c9121c7a3481ddc70f0574454df60ebc1a6f.jpg"
                className="w-full h-36 object-cover rounded-xl mb-3"
                alt="Chicken Breast"
                onError={(e) => { (e.target as HTMLImageElement).src = "/hero-fresh-simple.png"; }}
              />
              <div className="flex items-center gap-2 mb-1">
                <span className="fresh-tag text-[10px] font-bold px-2 py-0.5 rounded-full">FRESH</span>
                <span className="cut-badge text-[10px] font-bold px-2 py-0.5 rounded-full">BONELESS</span>
              </div>
              <h3 className="font-serif text-sm text-gray-900 font-semibold">Chicken Breast</h3>
              <p className="price-tag text-base">₹289 <span className="text-xs text-gray-400 font-normal">/500g</span></p>
            </div>

            {/* Card 2 */}
            <div className="absolute top-36 left-0 w-60 bg-white rounded-2xl p-3 border border-gray-200 shadow-xl animate-float" style={{ animationDelay: "2s" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://kimi-web-img.moonshot.cn/img/5.imimg.com/fb727c0dea5b0f27e5a26035d675c74dba083be4.png"
                className="w-full h-36 object-cover rounded-xl mb-3"
                alt="Whole Chicken"
                onError={(e) => { (e.target as HTMLImageElement).src = "/hero-fresh-simple.png"; }}
              />
              <div className="flex items-center gap-2 mb-1">
                <span className="fresh-tag text-[10px] font-bold px-2 py-0.5 rounded-full">FRESH</span>
                <span className="cut-badge text-[10px] font-bold px-2 py-0.5 rounded-full">WHOLE BIRD</span>
              </div>
              <h3 className="font-serif text-sm text-gray-900 font-semibold">Whole Chicken</h3>
              <p className="price-tag text-base">₹259 <span className="text-xs text-gray-400 font-normal">/kg</span></p>
            </div>

            {/* Card 3 */}
            <div className="absolute bottom-8 right-8 w-60 bg-white rounded-2xl p-3 border border-gray-200 shadow-xl animate-float" style={{ animationDelay: "4s" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://kimi-web-img.moonshot.cn/img/assets.tendercuts.in/5fa64d1ab650743d25f21156c24dd0bef06a8edf.jpg"
                className="w-full h-36 object-cover rounded-xl mb-3"
                alt="Chicken Drumsticks"
                onError={(e) => { (e.target as HTMLImageElement).src = "/hero-fresh-simple.png"; }}
              />
              <div className="flex items-center gap-2 mb-1">
                <span className="fresh-tag text-[10px] font-bold px-2 py-0.5 rounded-full">FRESH</span>
                <span className="cut-badge text-[10px] font-bold px-2 py-0.5 rounded-full">WITH BONE</span>
              </div>
              <h3 className="font-serif text-sm text-gray-900 font-semibold">Chicken Drumsticks</h3>
              <p className="price-tag text-base">₹249 <span className="text-xs text-gray-400 font-normal">/500g</span></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
