"use client";

import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  accentBar?: boolean;
  centered?: boolean;
  light?: boolean;
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  centered = true,
  light = false,
}: SectionHeaderProps) {
  return (
    <div
      className={`w-full mb-10 sm:mb-12 ${centered ? "text-center" : "text-left"}`}
    >
      <span
        className={`section-eyebrow ${light ? "text-k2-ice" : ""} ${centered ? "mx-auto" : ""}`}
      >
        {Icon && <Icon className="mr-1.5 inline h-3.5 w-3.5" />}
        {eyebrow}
      </span>
      <h2
        className={`font-display text-[clamp(1.875rem,4vw,2.875rem)] font-extrabold leading-[1.08] tracking-tight text-balance ${
          light ? "text-k2-cream" : "text-k2-green-deep"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-3 text-base leading-relaxed ${
            centered ? "mx-auto max-w-xl" : "max-w-xl"
          } ${light ? "text-k2-cream/75" : "text-[#4d5a52]"}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
