"use client";
import React from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Layout } from "lucide-react";
import Image from "next/image";

const DEMO_IMAGE =
  "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop&q=80";

export function BackgroundGradientDemo() {
  return (
    <div>
      <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-10 bg-white dark:bg-zinc-900">
        <Image
          src={DEMO_IMAGE}
          alt="Fresh chicken"
          height={400}
          width={400}
          className="object-contain"
        />
        <p className="text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
          Premium Chicken Cuts
        </p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Farm-fresh, 100% Halal chicken delivered to your doorstep. Perfect for
          curries, grills, and everyday cooking.
        </p>
        <button className="rounded-full pl-4 pr-1 py-1 text-white flex items-center space-x-1 bg-black mt-4 text-xs font-bold dark:bg-zinc-800">
          <Layout className="h-3.5 w-3.5 mr-1" />
          <span>Order now</span>
          <span className="bg-zinc-700 rounded-full text-[0.6rem] px-2 py-0 text-white">
            From ₹199
          </span>
        </button>
      </BackgroundGradient>
    </div>
  );
}
