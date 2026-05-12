"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "Is your chicken fresh or frozen?",
    answer: "We sell 100% fresh, never frozen chicken. Our birds are sourced daily from local farms, processed the same morning, and delivered to you within 12 hours. We maintain a strict cold chain at 0–4°C but never freeze the meat.",
  },
  {
    question: "Is the chicken Halal certified?",
    answer: "Yes, all our chicken is 100% Halal certified. We follow strict halal guidelines in sourcing and processing. Every batch is hand-slaughtered by certified personnel according to Islamic principles.",
  },
  {
    question: "How fast is the delivery?",
    answer: "We offer fast delivery in 30-45 minutes for orders in Pune. Our delivery team ensures your fresh chicken reaches you quickly and safely in temperature-controlled packaging.",
  },
  {
    question: "What are the delivery charges and areas?",
    answer: "We deliver across Pune including Koregaon Park, Kalyani Nagar, Baner, Aundh, Pimple Nilakh, and surrounding areas. Free delivery on orders above ₹350. Orders below ₹350 have a small delivery fee.",
  },
  {
    question: "How should I store the chicken after delivery?",
    answer: "For best freshness, refrigerate immediately at 0–4°C and consume within 24 hours of delivery. Our vacuum packs can be frozen for up to 30 days without quality loss.",
  },
  {
    question: "Do you offer custom cutting?",
    answer: "Absolutely! We offer custom butchery services. Need your whole chicken cut into 16 pieces for biryani? Or breast butterflied for grilling? Just add instructions in the order notes.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept UPI, credit cards, debit cards, and cash on delivery for your convenience.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 section-alt">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
          <p className="text-gray-500">Everything you need to know about our fresh chicken</p>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="faq-item">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-900 font-medium pr-4">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-48" : "max-h-0"}`}>
                  <div className="px-6 pb-6 text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-4">
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
