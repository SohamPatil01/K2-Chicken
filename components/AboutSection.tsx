"use client";

import { useState, useEffect, useRef } from "react";
import {
  Award,
  Users,
  Heart,
  ChefHat,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";

export default function AboutSection() {
  const [mounted, setMounted] = useState(false);
  const [visibleCards, setVisibleCards] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<number>>(
    new Set()
  );
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sectionRefs.current.indexOf(
              entry.target as HTMLDivElement
            );
            if (index !== -1) {
              setVisibleSections((prev) => new Set(prev).add(index));
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      sectionRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [mounted]);

  const features = [
    {
      icon: Award,
      title: "Premium Quality",
      description:
        "Only the finest grade chicken, sourced from trusted farms and delivered fresh",
      color: "from-yellow-400 to-brand-red-hover",
      borderColor: "border-yellow-300",
    },
    {
      icon: Heart,
      title: "Made with Love",
      description:
        "Every piece of chicken is handled with care, ensuring premium quality and freshness",
      color: "from-red-400 to-pink-400",
      borderColor: "border-red-300",
    },
    {
      icon: Users,
      title: "Farm Fresh Daily",
      description:
        "Sourced directly from trusted farms, delivered fresh to your doorstep every day",
      color: "from-blue-400 to-cyan-400",
      borderColor: "border-blue-300",
    },
    {
      icon: ChefHat,
      title: "Perfect Cuts & Portions",
      description:
        "Expertly cut and portioned chicken, ready for your favorite recipes",
      color: "from-green-400 to-emerald-400",
      borderColor: "border-green-300",
    },
  ];

  return (
    <section
      id="about"
      className="relative py-20 bg-gradient-to-b from-gray-50 via-gray-50 to-white overflow-hidden"
    >
      {/* Radial Gradient Overlay - Matching ProductCatalog */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.15),transparent_45%)] pointer-events-none" />

      {/* Decorative Elements - More subtle to match flow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-15"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div
            className={`inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-red-200 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold text-brand-red mb-5 shadow-sm transition-all duration-300 hover:shadow-md ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Sparkles className="w-4 h-4 text-brand-red" />
            <span>Our Story</span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 mb-5 leading-tight transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ animationDelay: "0.2s" }}
          >
            About{" "}
            <span className="bg-gradient-to-r from-brand-red via-gray-50 to-red-600 bg-clip-text text-transparent">
              K2 Chicken
            </span>
          </h2>
          <p
            className={`text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ animationDelay: "0.4s" }}
          >
            Freshness You Can Taste. Quality You Can Trust.
          </p>
        </div>

        {/* Legacy Section */}
        <div className="mb-16 lg:mb-20">
          <div
            ref={(el) => {
              sectionRefs.current[0] = el;
            }}
            className={`max-w-4xl mx-auto text-center transition-all duration-700 ${
              visibleSections.has(0)
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-4">
              A Legacy of Excellence
            </h3>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
              K2 Chicken was founded with a simple mission: to bring the most
              delicious, fresh, and high-quality chicken to your table. What
              started as a small neighborhood business has today grown into
              Pune's most trusted name in fresh chicken—and we are proud to take
              the next big leap forward.
            </p>
          </div>
        </div>

        {/* Franchise Partnership Section */}
        <div className="mb-16 lg:mb-20">
          <div
            ref={(el) => {
              sectionRefs.current[1] = el;
            }}
            className={`max-w-5xl mx-auto bg-white rounded-3xl shadow-lg border border-red-200 overflow-hidden transition-all duration-700 hover:shadow-xl ${
              visibleSections.has(1)
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="bg-gradient-to-r from-brand-red to-red-500 px-6 sm:px-8 py-4">
              <h4 className="text-xl sm:text-2xl font-semibold text-white">
                Now a Franchise Partner of Chicken Vicken – Baramati Agro
              </h4>
            </div>
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                To serve you even better, K2 Chicken is now officially a
                franchise of Chicken Vicken, Baramati Agro—one of India's most
                respected and fastest-growing brands in the poultry industry.
                With this partnership, we bring you:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {[
                  "International-grade processing standards",
                  "Farm-fresh chicken sourced directly from Baramati Agro farms",
                  "Unmatched hygiene, safety, and consistency",
                  "Premium cuts crafted with expert precision",
                ].map((point, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 bg-red-50/50 rounded-xl p-4 transition-all duration-300 hover:bg-red-50 hover:shadow-md hover:-translate-y-1"
                    style={{ transitionDelay: `${index * 0.1}s` }}
                  >
                    <CheckCircle className="w-5 h-5 text-brand-red mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm sm:text-base">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                This collaboration elevates K2 Chicken's commitment to quality
                while giving our customers access to trusted, certified, and
                professionally processed Chicken Vicken products—right here in
                your neighborhood.
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout - Freshness & Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-16 lg:mb-20">
          {/* Freshness Section */}
          <div
            ref={(el) => {
              sectionRefs.current[2] = el;
            }}
            className={`space-y-6 order-2 lg:order-1 transition-all duration-700 ${
              visibleSections.has(2)
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-8"
            }`}
          >
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <h4 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
                Freshness You Can Taste
              </h4>
              <p className="text-base text-gray-700 leading-relaxed mb-4">
                Our secret remains unchanged:
              </p>
              <p className="text-base text-gray-700 leading-relaxed mb-5">
                We source only the freshest, highest-grade chicken, cut and
                portioned with precision, and delivered chilled to preserve
                perfect texture and flavor.
              </p>
              <p className="text-base text-gray-900 font-medium mb-3">
                Every piece goes through:
              </p>
              <ul className="space-y-3 mb-5">
                {[
                  "Double cleaning process",
                  "Strict hygiene checks",
                  "Temperature-controlled handling",
                ].map((point, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 transition-all duration-300 hover:translate-x-2"
                    style={{ transitionDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{point}</span>
                  </li>
                ))}
              </ul>
              <p className="text-base text-gray-700 leading-relaxed italic border-l-4 border-red-200 pl-4">
                The result? Restaurant-quality chicken, ready for your favorite
                recipes—juicy, tender, and unbelievably fresh.
              </p>
            </div>
          </div>

          {/* Image */}
          <div
            ref={(el) => {
              sectionRefs.current[3] = el;
            }}
            className={`relative order-1 lg:order-2 transition-all duration-700 ${
              visibleSections.has(3)
                ? "opacity-100 scale-100 translate-x-0"
                : "opacity-0 scale-95 translate-x-8"
            }`}
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl transform hover:scale-[1.02] transition-all duration-500 border border-red-200 group">
              <Image
                src="/images/Whole-Chicken-5.jpg"
                alt="Fresh Premium Chicken - K2 Chicken offers the finest quality chicken, expertly cut and prepared for your favorite recipes"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
        </div>

        {/* Partnership Promise */}
        <div className="mb-16 lg:mb-20">
          <div
            ref={(el) => {
              sectionRefs.current[4] = el;
            }}
            className={`max-w-4xl mx-auto bg-gradient-to-r from-brand-red via-gray-50 to-red-600 rounded-3xl p-8 sm:p-10 lg:p-12 text-white shadow-2xl transition-all duration-700 hover:shadow-3xl hover:scale-[1.02] ${
              visibleSections.has(4)
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h4 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">
              K2 Chicken x Chicken Vicken
            </h4>
            <div className="space-y-4 text-center">
              {[
                "A partnership built on trust, quality, and customer delight.",
                "A promise to deliver only the best.",
                "A commitment to freshness—every single day.",
              ].map((text, index) => (
                <p
                  key={index}
                  className="text-lg sm:text-xl font-medium text-brand-red transition-all duration-500 hover:text-white hover:translate-x-1"
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  {text}
                </p>
              ))}
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
                className={`group bg-white border ${
                  feature.borderColor
                } rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
