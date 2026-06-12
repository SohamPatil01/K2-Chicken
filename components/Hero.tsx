"use client";

import Link from "next/link";
import Image from "next/image";
import FreshnessClock from "@/components/FreshnessClock";
import HeroAreaChecker from "@/components/HeroAreaChecker";
import { getProductFallbackImage } from "@/lib/productImageFallbacks";

interface HeroProduct {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  category?: string;
  weightOptions?: { weight: string; price: number; is_default?: boolean }[];
}

interface HeroProps {
  deliveryEnabled?: boolean;
  freeDeliveryAbove?: number;
  heroProducts?: HeroProduct[];
}

function getBatchCode() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `K2-${mm}${dd}-A`;
}

export default function Hero({
  deliveryEnabled = true,
  freeDeliveryAbove = 350,
  heroProducts,
}: HeroProps) {
  const featured =
    heroProducts?.find((p) =>
      p.name.toLowerCase().includes("curry cut")
    ) ??
    heroProducts?.[0];

  const featuredImage = featured?.image_url
    ? featured.image_url
    : getProductFallbackImage(featured?.name || "Chicken Curry Cut");

  return (
    <header className="hero relative overflow-hidden bg-k2-green text-k2-cream">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 85% 20%, rgba(244,114,11,.18), transparent 60%), radial-gradient(ellipse 50% 60% at 10% 90%, rgba(191,232,217,.10), transparent 60%)",
        }}
      />

      <div className="relative mx-auto grid max-w-[1180px] items-center gap-14 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:px-6 lg:py-20">
        <div>
          <div className="mb-6 inline-flex max-w-full items-center gap-2.5 rounded-pill border border-k2-cream/25 bg-k2-cream/10 px-4 py-2 font-mono text-xs tracking-wide">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inset-0 rounded-full bg-emerald-400" />
              <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-pulse-ring" />
            </span>
            <span>
              TODAY&apos;S BATCH · CUT AT 6:00 AM ·{" "}
              <FreshnessClock /> FRESH
            </span>
          </div>

          <h1 className="font-display text-[clamp(2.75rem,6.2vw,4.75rem)] font-extrabold leading-[1.02] tracking-tight">
            Farm fresh chicken,
            <br />
            cut this morning,
            <br />
            <span className="relative whitespace-nowrap text-k2-saffron">
              at your door in 90&nbsp;min
              <svg
                className="absolute -bottom-2 left-0 h-3.5 w-full overflow-visible"
                viewBox="0 0 320 14"
                aria-hidden="true"
              >
                <path
                  d="M4 10 Q 160 -2 316 8"
                  stroke="#F4720B"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="320"
                  strokeDashoffset="320"
                  className="animate-draw-line"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-k2-cream/80">
            Hand-cleaned by master butchers, vacuum-packed at 0–4°C, and
            delivered the same day it&apos;s cut. No frozen stock. No chemicals.
            No compromises.
            {deliveryEnabled && freeDeliveryAbove > 0 && (
              <span className="mt-2 block font-semibold text-k2-saffron">
                Free delivery above ₹{freeDeliveryAbove}
              </span>
            )}
          </p>

          <div className="mt-8 flex flex-wrap gap-3.5">
            <Link
              href="/#products"
              className="btn-primary inline-flex items-center gap-2.5 rounded-pill px-7 py-4 text-[15px] font-semibold"
            >
              Shop Fresh Cuts
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="/#process"
              className="inline-flex items-center gap-2.5 rounded-pill border-[1.5px] border-k2-cream/35 px-7 py-4 text-[15px] font-semibold text-k2-cream transition-colors hover:bg-k2-cream/10"
            >
              See Our Process
            </Link>
          </div>

          <div className="mt-10">
            <HeroAreaChecker freeDeliveryAbove={freeDeliveryAbove} />
          </div>
        </div>

        <aside
          className="hero-card mx-auto w-full max-w-md rotate-[1.5deg] rounded-card-lg bg-k2-cream p-6 text-k2-ink shadow-hero transition-transform duration-300 hover:rotate-0 hover:scale-[1.01] lg:max-w-none"
          aria-label="featured product"
        >
          <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-orange-200 to-orange-400">
            <Image
              src={featuredImage}
              alt={featured?.name || "Fresh chicken curry cut"}
              fill
              sizes="(max-width: 1024px) 100vw, 420px"
              className="object-cover"
              priority
              unoptimized={featuredImage.startsWith("http")}
            />
          </div>
          <div className="mb-3 flex flex-wrap justify-between gap-2 rounded-lg bg-k2-ice px-3.5 py-2.5 font-mono text-[11.5px] text-k2-green">
            <span>BATCH #{getBatchCode()}</span>
            <span>CUT 06:00 · PACKED 07:15</span>
          </div>
          <h3 className="font-display text-xl font-bold">
            {featured?.name || "Chicken Curry Cut"}
          </h3>
          <p className="mt-1 text-sm text-[#5a6a61]">
            Today&apos;s most ordered ·{" "}
            <FreshnessClock className="font-mono font-semibold text-k2-saffron-hot" />{" "}
            since cutting
          </p>
        </aside>
      </div>
    </header>
  );
}
