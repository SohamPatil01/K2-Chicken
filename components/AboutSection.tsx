"use client";

import { useState, useEffect } from "react";
import { Award, Users, Heart, ChefHat, Sparkles, CheckCircle } from "lucide-react";
import Image from "next/image";

export default function AboutSection() {
  const [mounted, setMounted] = useState(false);
  const [visibleCards, setVisibleCards] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Staggered fade-in for feature cards
    const timer = setInterval(() => {
      setVisibleCards((prev) => {
        if (prev < 4) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 200);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: Award,
      title: "Premium Quality",
      description: "Only the finest grade chicken, sourced from trusted farms and delivered fresh",
      color: "from-yellow-400 to-orange-400",
      borderColor: "border-yellow-300",
    },
    {
      icon: Heart,
      title: "Made with Love",
      description: "Every piece of chicken is handled with care, ensuring premium quality and freshness",
      color: "from-red-400 to-pink-400",
      borderColor: "border-red-300",
    },
    {
      icon: Users,
      title: "Farm Fresh Daily",
      description: "Sourced directly from trusted farms, delivered fresh to your doorstep every day",
      color: "from-blue-400 to-cyan-400",
      borderColor: "border-blue-300",
    },
    {
      icon: ChefHat,
      title: "Perfect Cuts & Portions",
      description: "Expertly cut and portioned chicken, ready for your favorite recipes",
      color: "from-green-400 to-emerald-400",
      borderColor: "border-green-300",
    },
  ];

  return (
    <section id="about" className="py-20 sm:py-24 bg-gradient-to-b from-white via-orange-50/30 to-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className={`inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5 text-sm font-semibold text-orange-700 mb-4 ${mounted ? 'animate-slide-down' : 'opacity-0'}`}>
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Our Story</span>
          </div>
          <h2 className={`text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-4 ${mounted ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            About <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">K2 Chicken</span>
          </h2>
          <p className={`text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto ${mounted ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
            Serving the finest chicken since 1995
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          {/* Text Content - Slide in from left */}
          <div className={`space-y-6 ${mounted ? 'animate-slide-in-from-left' : 'opacity-0'}`}>
            <div className="space-y-4">
              <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">
                A Legacy of Excellence
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                K2 Chicken was founded with a simple mission: to bring the most delicious, 
                fresh, and high-quality chicken to your table. What started as a small business 
                has grown into Pune's most trusted chicken brand.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our secret? We source only the freshest, highest-grade chicken from trusted farms, 
                cut and portion it with precision, and deliver it chilled to preserve that perfect 
                texture and flavor. Every piece is cleaned twice, ensuring you get restaurant-quality 
                chicken ready for your favorite recipes.
              </p>
            </div>

            {/* Key Points */}
            <div className="space-y-3 pt-4">
              {[
                "Farm-fresh chicken delivered daily",
                "Expertly cut and portioned for your recipes",
                "Double-cleaned for spotless preparation",
                "100% quality guarantee on every order",
              ].map((point, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image - Scale in */}
          <div className={`relative ${mounted ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500 border-4 border-orange-100">
              <Image
                src="/images/shop-interior.jpg"
                alt="K2 Chicken Shop Interior - Clean, well-lit store with display refrigerators and fresh chicken products"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {/* Decorative overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              {/* Decorative spice icons */}
              <div className="absolute top-4 right-4 w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg animate-float">
                <span className="text-2xl">🌶️</span>
              </div>
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: '0.5s' }}>
                <span className="text-2xl">🍗</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards - Staggered fade-in */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isVisible = visibleCards > index;
            return (
              <div
                key={index}
                className={`group bg-white border-2 ${feature.borderColor} rounded-2xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

