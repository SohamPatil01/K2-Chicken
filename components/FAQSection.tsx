"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import SectionHeader from "./SectionHeader";

const FAQ_ITEMS = [
  {
    question: "How fast is the delivery?",
    answer:
      "We offer fast delivery in 30-45 minutes for orders in Pune. Our delivery team ensures your fresh chicken reaches you quickly and safely.",
  },
  {
    question: "Is the chicken halal?",
    answer:
      "Yes, all our chicken is 100% Halal certified. We follow strict halal guidelines in sourcing and preparation.",
  },
  {
    question: "What is the minimum order for free delivery?",
    answer:
      "Free delivery is available for orders above ₹350 within our delivery radius. Orders below ₹350 may incur a delivery charge.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept multiple payment methods including UPI, credit cards, debit cards, and cash on delivery for your convenience.",
  },
  {
    question: "Is the chicken fresh?",
    answer:
      "Yes, we guarantee 100% fresh, farm-fresh chicken. All our products are sourced daily and delivered fresh to your doorstep. We do not use any chemicals or preservatives.",
  },
  {
    question: "What are your operating hours?",
    answer:
      "We are open from 8:00 AM to 8:00 PM, Monday through Sunday. You can place orders anytime during these hours.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 sm:py-20 bg-white border-t border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="FAQ"
          title="Frequently asked questions"
          subtitle="Quick answers about delivery, quality, and ordering."
          icon={HelpCircle}
        />

        <div className="max-w-3xl mx-auto space-y-2">
          {FAQ_ITEMS.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-card border border-gray-100 shadow-soft overflow-hidden hover:border-orange-200 transition-colors duration-smooth"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50/80 transition-colors duration-smooth"
                aria-expanded={openIndex === index}
              >
                <span className="font-semibold text-gray-900 text-sm sm:text-base">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 text-gray-500 transition-transform duration-smooth ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-smooth ${
                  openIndex === index ? "max-h-[320px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="px-5 pb-5 pt-0 text-gray-600 text-sm sm:text-base leading-relaxed border-t border-gray-100">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
