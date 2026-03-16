"use client";

import { Award, Clock, Heart, Shield, Sparkles } from "lucide-react";
import SectionHeader from "./SectionHeader";

export default function WhyChooseUs() {
  const features = [
    {
      icon: Award,
      title: "Premium Quality",
      description:
        "We use only the freshest, highest quality chicken and ingredients in all our dishes.",
      color: "from-yellow-100 to-orange-100",
      iconColor: "text-yellow-600",
      borderColor: "border-yellow-200",
    },
    {
      icon: Clock,
      title: "Fast Delivery",
      description:
        "Get your delicious chicken delivered hot and fresh in 30-45 minutes or less.",
      color: "from-green-100 to-emerald-100",
      iconColor: "text-green-600",
      borderColor: "border-green-200",
    },
    {
      icon: Heart,
      title: "Made with Love",
      description:
        "Every dish is prepared with care and passion by our experienced chefs.",
      color: "from-pink-100 to-red-100",
      iconColor: "text-pink-600",
      borderColor: "border-pink-200",
    },
    {
      icon: Shield,
      title: "100% Safe",
      description:
        "We follow strict food safety standards and hygiene practices in our kitchen.",
      color: "from-blue-100 to-blue-200",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Why choose us"
          title="Why Choose K2 Chicken?"
          subtitle="We're not just another chicken shop — we're your neighborhood's favorite for a reason."
          icon={Sparkles}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white border border-gray-100 rounded-card shadow-soft hover:shadow-card-hover hover:border-orange-200 p-6 sm:p-7 transition-all duration-smooth transform hover:-translate-y-0.5 text-center"
              >
                <div className="relative mb-5 sm:mb-6">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-smooth`}
                  />
                  <div
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center border-2 ${feature.borderColor} mx-auto group-hover:scale-110 transition-all duration-smooth shadow-soft`}
                  >
                    <Icon size={28} className={`${feature.iconColor} sm:w-8 sm:h-8`} />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2.5 group-hover:text-orange-600 transition-colors duration-smooth">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 sm:mt-14">
          <div className="bg-white border border-gray-100 rounded-card shadow-soft p-8 sm:p-10">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium text-orange-700 mb-4">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Customer trust</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                &ldquo;Finger Lickin&apos; Good!&rdquo;
              </h3>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Join thousands of satisfied customers who choose K2 Chicken for the best chicken
                experience in town.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center bg-gray-50 border border-gray-100 rounded-card p-5 sm:p-6">
                <div className="text-3xl sm:text-4xl font-bold text-orange-600 mb-2">10,000+</div>
                <div className="text-sm text-gray-600 font-medium">Happy Customers</div>
              </div>
              <div className="text-center bg-gray-50 border border-gray-100 rounded-card p-5 sm:p-6">
                <div className="text-3xl sm:text-4xl font-bold text-orange-600 mb-2">4.9★</div>
                <div className="text-sm text-gray-600 font-medium">Average Rating</div>
              </div>
              <div className="text-center bg-gray-50 border border-gray-100 rounded-card p-5 sm:p-6">
                <div className="text-3xl sm:text-4xl font-bold text-orange-600 mb-2">30min</div>
                <div className="text-sm text-gray-600 font-medium">Average Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
