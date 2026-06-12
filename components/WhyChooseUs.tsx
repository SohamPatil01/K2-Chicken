"use client";

import { useEffect, useRef, useState } from "react";

const whyFeatures = [
  {
    icon: "🌾",
    title: "Premium Farm Sources",
    desc: "Partnered with certified farms raising chickens naturally — no antibiotics, no growth hormones.",
  },
  {
    icon: "🔪",
    title: "Master Butcher Cuts",
    desc: "Curry cut, biryani cut or fully custom portions — cut by hand to your exact preference.",
  },
  {
    icon: "🧊",
    title: "Cold Chain, Never Frozen",
    desc: "0–4°C from cutting table to your door. Vacuum-sealed to lock freshness, never stockpiled.",
  },
  {
    icon: "🔍",
    title: "100% Traceable",
    desc: "Every pack carries a batch code. FSSAI compliant with regular independent lab testing.",
  },
];

const processSteps = [
  {
    emoji: "🌅",
    time: "05:30 AM",
    title: "Farm Sourcing",
    desc: "Birds procured from certified farms within 50 km — antibiotic and hormone free.",
  },
  {
    emoji: "🔪",
    time: "06:00 AM",
    title: "Master Cutting",
    desc: "Hand-cut and halal processed in our FSSAI-approved unit, the same morning.",
  },
  {
    emoji: "📦",
    time: "07:15 AM",
    title: "Vacuum Packing",
    desc: "Sealed with ice-gel packs in a temperature-controlled room, batch-coded for traceability.",
  },
  {
    emoji: "🛵",
    time: "YOUR SLOT",
    title: "90-Min Delivery",
    desc: "Insulated bags hold 0–4°C until it reaches your kitchen — never frozen at any step.",
  },
];

const coldStats = [
  { target: 4, suffix: "", label: "°C max storage temp" },
  { target: 12, suffix: "", label: "hours farm to door" },
  { target: 100, suffix: "", label: "% halal & chemical-free" },
];

function AnimatedCounter({
  target,
  suffix = "",
  active,
}: {
  target: number;
  suffix?: string;
  active: boolean;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    const t0 = performance.now();
    let frame: number;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1200);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target]);

  return (
    <b className="block font-display text-[34px] font-extrabold text-k2-ice">
      {value}
      {suffix}
    </b>
  );
}

export default function WhyChooseUs() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsActive, setStatsActive] = useState(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <section className="px-6 py-20" id="about">
        <div className="mx-auto max-w-[1180px]">
          <div className="rv">
            <span className="section-eyebrow">Why K2 stands apart</span>
            <h2 className="font-display text-[clamp(1.875rem,4vw,2.875rem)] font-extrabold tracking-tight text-k2-green-deep">
              Not just another chicken shop
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whyFeatures.map((f) => (
              <div
                key={f.title}
                className="rv rounded-card border border-k2-paper bg-white p-7 transition-all hover:-translate-y-1 hover:border-k2-saffron"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-k2-ice text-2xl">
                  {f.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-k2-green-deep">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5a6a61]">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="bg-k2-green px-6 py-20 text-k2-cream"
        id="process"
      >
        <div className="mx-auto max-w-[1180px]">
          <div className="rv">
            <span className="section-eyebrow text-k2-ice">
              Farm to door in 12 hours
            </span>
            <h2 className="font-display text-[clamp(1.875rem,4vw,2.875rem)] font-extrabold leading-[1.08] tracking-tight text-k2-cream">
              Where your chicken
              <br />
              was at 6 AM today
            </h2>
            <p className="mt-3 max-w-xl text-base text-k2-cream/75">
              Full traceability on every batch-coded pack — here&apos;s the
              journey, hour by hour.
            </p>
          </div>

          <div className="process-timeline rv relative mt-16 grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <div
              className="tl-line absolute top-[26px] left-[6%] hidden h-0.5 bg-k2-saffron lg:block"
              aria-hidden="true"
            />
            <div
              className="absolute top-[26px] right-[6%] left-[6%] hidden h-0.5 process-line lg:block"
              aria-hidden="true"
            />
            {processSteps.map((step) => (
              <div key={step.title} className="relative px-2 text-center">
                <div className="timeline-node relative z-10 mx-auto mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 border-k2-cream/30 bg-k2-green-deep text-[22px] transition-all duration-400">
                  {step.emoji}
                </div>
                <span className="mb-1.5 block font-mono text-[11px] tracking-wider text-k2-ice">
                  {step.time}
                </span>
                <h3 className="font-display text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm text-k2-cream/70">{step.desc}</p>
              </div>
            ))}
          </div>

          <div
            ref={statsRef}
            className="rv mt-16 grid grid-cols-1 overflow-hidden rounded-card bg-k2-cream/15 sm:grid-cols-3"
          >
            {coldStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-k2-green-deep px-7 py-7 text-center"
              >
                <AnimatedCounter
                  target={stat.target}
                  suffix={stat.suffix}
                  active={statsActive}
                />
                <span className="mt-1 block font-mono text-[11.5px] uppercase tracking-wider text-k2-cream/60">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
