"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/seo/faq";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section-alt px-6 py-20">
      <div className="mx-auto max-w-[1180px]">
        <div className="rv text-center">
          <span className="section-eyebrow">Good to know</span>
          <h2 className="font-display text-[clamp(1.875rem,4vw,2.875rem)] font-extrabold tracking-tight text-k2-green-deep">
            Frequently asked questions
          </h2>
        </div>

        <div className="rv mx-auto mt-12 max-w-3xl">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="faq-item mb-3">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left text-[15.5px] font-semibold text-k2-ink transition-colors hover:bg-k2-cream/50"
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>
                  <span
                    className={`shrink-0 font-display text-2xl text-k2-saffron transition-transform ${isOpen ? "rotate-45" : ""}`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96" : "max-h-0"}`}
                >
                  <p className="px-5 pb-5 text-sm leading-relaxed text-[#4d5a52]">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
