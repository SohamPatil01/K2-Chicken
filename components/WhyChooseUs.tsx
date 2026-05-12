"use client";

import {
  Award,
  Package,
  Scissors,
  ShieldCheck,
  Snowflake,
  Tractor,
  Truck,
} from "lucide-react";

const features = [
  {
    icon: Award,
    title: "Premium Farm Sources",
    desc: "Partnered with certified farms that raise chickens naturally without antibiotics or growth hormones.",
  },
  {
    icon: Scissors,
    title: "Master Butcher Cuts",
    desc: "Hand-cut by experienced butchers to your exact preference — curry cut, biryani cut, or custom portions.",
  },
  {
    icon: Package,
    title: "Hygienic Vacuum Packing",
    desc: "Sealed in food-grade vacuum packs to lock in freshness and prevent contamination during transit.",
  },
  {
    icon: ShieldCheck,
    title: "100% Safe & Traceable",
    desc: "Batch-coded packaging for full traceability. Strict FSSAI compliance and regular lab testing.",
  },
];

const images = [
  {
    src: "https://kimi-web-img.moonshot.cn/img/static.vecteezy.com/5339c9121c7a3481ddc70f0574454df60ebc1a6f.jpg",
    alt: "Fresh chicken breast",
    cls: "h-64",
  },
  {
    src: "https://kimi-web-img.moonshot.cn/img/rollingwoodfarms.com/bf703c09d3970f00266fa9480f7bd35adecce33f.jpg",
    alt: "Chicken drumsticks",
    cls: "h-48",
  },
  {
    src: "https://kimi-web-img.moonshot.cn/img/5.imimg.com/fb727c0dea5b0f27e5a26035d675c74dba083be4.png",
    alt: "Whole chicken",
    cls: "h-48",
  },
  {
    src: "https://kimi-web-img.moonshot.cn/img/onestophalal.com/f26ae8db86477b04ea6cf7f3a30ec4f1175fb252.jpg",
    alt: "Chicken wings",
    cls: "h-64",
  },
];

const processSteps = [
  {
    num: 1,
    icon: Tractor,
    label: "Farm Sourcing",
    desc: "Daily morning procurement from certified local farms within 50km radius.",
  },
  {
    num: 2,
    icon: Scissors,
    label: "Master Cutting",
    desc: "Hand-cut by expert butchers in our FSSAI-approved processing unit.",
  },
  {
    num: 3,
    icon: Package,
    label: "Vacuum Packing",
    desc: "Hygienically packed in temperature-controlled environment with ice gel packs.",
  },
  {
    num: 4,
    icon: Truck,
    label: "Swift Delivery",
    desc: "Insulated delivery bags ensure your chicken arrives at 0-4C freshness.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-white" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text column */}
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
              Why K2 Chicken{" "}
              <br />
              <span className="text-brand-red">Stands Apart</span>
            </h2>
            <p className="text-gray-500 text-lg mb-10 leading-relaxed">
              We&apos;re not just another chicken shop &mdash; we&apos;re your trusted source for premium
              raw chicken. Every cut tells a story of quality, hygiene, and uncompromising freshness.
            </p>

            <div className="space-y-6 stagger-children">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="flex gap-5 group">
                    <div className="trust-icon w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{f.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Image mosaic */}
          <div className="relative hidden md:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 mt-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="rounded-2xl overflow-hidden h-64 shadow-lg">
                  <img src={images[0].src} className="w-full h-full object-cover" alt={images[0].alt} onError={(e) => { (e.target as HTMLImageElement).src = "/hero-fresh-simple.png"; }} />
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="rounded-2xl overflow-hidden h-48 shadow-lg">
                  <img src={images[1].src} className="w-full h-full object-cover" alt={images[1].alt} onError={(e) => { (e.target as HTMLImageElement).src = "/hero-fresh-simple.png"; }} />
                </div>
              </div>
              <div className="space-y-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="rounded-2xl overflow-hidden h-48 shadow-lg">
                  <img src={images[2].src} className="w-full h-full object-cover" alt={images[2].alt} onError={(e) => { (e.target as HTMLImageElement).src = "/hero-fresh-simple.png"; }} />
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="rounded-2xl overflow-hidden h-64 shadow-lg">
                  <img src={images[3].src} className="w-full h-full object-cover" alt={images[3].alt} onError={(e) => { (e.target as HTMLImageElement).src = "/hero-fresh-simple.png"; }} />
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-6 bg-brand-red text-white p-6 rounded-2xl shadow-xl">
              <div className="text-3xl font-bold">8+</div>
              <div className="text-sm opacity-90">Years of Freshness</div>
            </div>
          </div>
        </div>
      </div>

      {/* Process section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24" id="process">
        <div className="text-center mb-14 reveal-up">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-3">
            From Farm to Your Kitchen
          </h2>
          <p className="text-gray-500 text-sm md:text-base">
            Our 4-step freshness guarantee
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-10 relative stagger-children">
          <div className="hidden md:block absolute top-9 left-[11%] right-[11%] h-px process-line" />

          {processSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="relative text-center group">
                <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-6 border border-gray-200 group-hover:border-brand-red transition-all duration-300 relative z-10 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                  <Icon className="w-7 h-7 text-brand-red" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.num}. {step.label}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-[240px] mx-auto">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats bar */}
        <div className="mt-20 bg-white border border-gray-200 rounded-[28px] p-8 md:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)] reveal-up">
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center text-brand-green">
                <Snowflake className="w-4 h-4" />
              </div>
              <span className="text-brand-green font-semibold text-xs sm:text-sm uppercase tracking-[0.18em]">
                Cold Chain Maintained
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3">
              Freshness You Can Trust
            </h3>
            <p className="text-gray-500 leading-relaxed text-sm md:text-base max-w-xl">
              Every cut is sourced daily from certified farms, processed in our hygienic facility, and
              delivered in temperature-controlled packaging. We never freeze, never stockpile.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-0 w-full lg:w-auto border border-gray-100 rounded-2xl overflow-hidden">
            {[
              { val: "0-4C", label: "Storage Temp" },
              { val: "12h", label: "Farm to Door" },
              { val: "100%", label: "Halal Cut" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`px-6 py-5 text-center bg-white ${i > 0 ? "border-l border-gray-100" : ""}`}
              >
                <div className="text-3xl md:text-4xl font-bold text-brand-red mb-1">
                  {stat.val}
                </div>
                <div className="text-xs md:text-sm text-gray-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
