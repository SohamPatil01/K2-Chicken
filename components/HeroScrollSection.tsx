"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import Image from "next/image";
import { Sparkles } from "lucide-react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=1400&q=80";

export function HeroScrollSection() {
  return (
    <div className="flex flex-col overflow-hidden pb-[300px] pt-[400px] md:pt-[500px]">
      <ContainerScroll
        titleComponent={
          <>
            <h2 className="text-3xl md:text-4xl font-semibold text-black dark:text-white flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-brand-red" aria-hidden />
              Freshness you can taste
            </h2>
            <h1 className="text-4xl md:text-[5rem] font-bold mt-2 leading-none text-black dark:text-white">
              Premium Chicken
              <br />
              <span className="text-brand-red dark:text-brand-red/70">
                Delivered to You
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
              100% Halal · Farm-fresh · Delivered in 30–45 mins
            </p>
          </>
        }
      >
        <Image
          src={HERO_IMAGE}
          alt="Fresh premium chicken - K2 Chicken Pune"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-center"
          draggable={false}
          priority={false}
        />
      </ContainerScroll>
    </div>
  );
}
