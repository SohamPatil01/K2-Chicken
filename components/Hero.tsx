"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const banners = [
  {
    id: 1,
    title: "Freshness You Can Taste",
    subtitle: "Farm-fresh chicken delivered in 45 mins",
    image: "/hero-fresh-simple.png", // Using existing asset
    cta: "Shop Now",
    link: "/#products",
    bg: "bg-orange-50",
  },
  {
    id: 2,
    title: "Sunday Special Offer",
    subtitle: "Get flat 15% OFF on Curry Cuts",
    image: "/hero-fresh-simple.png", // Reusing for demo, ideally would be different
    cta: "Order Today",
    link: "/#products",
    bg: "bg-red-50",
  },
];

export default function Hero({ deliveryEnabled = true }: { deliveryEnabled?: boolean }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <section className="relative w-full overflow-hidden bg-white pt-4 pb-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative w-full aspect-[21/9] md:aspect-[21/8] lg:aspect-[21/7] min-h-[200px] md:min-h-[300px] rounded-2xl overflow-hidden shadow-lg border border-gray-100">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`absolute inset-0 w-full h-full flex items-center ${banners[currentSlide].bg}`}
            >
              {/* Content Side */}
              <div className="w-1/2 h-full flex flex-col justify-center px-6 md:px-12 lg:px-20 z-10">
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-2 md:mb-4"
                >
                  {banners[currentSlide].title}
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xs md:text-lg text-gray-600 mb-4 md:mb-6 font-medium"
                >
                  {banners[currentSlide].subtitle}
                </motion.p>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link
                    href={banners[currentSlide].link}
                    className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs md:text-sm font-bold px-4 py-2 md:px-6 md:py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                  >
                    {banners[currentSlide].cta}
                    <ChevronRight size={16} />
                  </Link>
                </motion.div>
              </div>

              {/* Image Side - Simple Absolute Position */}
              <div className="absolute right-0 top-0 w-3/5 h-full">
                <div className="relative w-full h-full">
                  {/* Gradient Overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent z-10 w-1/3"></div>
                  <Image
                    src={banners[currentSlide].image}
                    alt={banners[currentSlide].title}
                    fill
                    className="object-cover object-center"
                    priority
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md backdrop-blur-sm z-20 transition-all active:scale-90"
          >
            <ChevronLeft size={20} className="text-gray-800" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md backdrop-blur-sm z-20 transition-all active:scale-90"
          >
            <ChevronRight size={20} className="text-gray-800" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? "bg-orange-600 w-6" : "bg-gray-300"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
