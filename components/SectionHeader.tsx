"use client";

import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** Show orange accent bar under title (default true) */
  accentBar?: boolean;
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  accentBar = true,
}: SectionHeaderProps) {
  return (
    <div className="w-full text-center mb-10 sm:mb-12">
      <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium text-brand-red mb-4 shadow-soft">
        {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        <span>{eyebrow}</span>
      </div>
      <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 text-balance mb-3">
        {title}
      </h2>
      {accentBar && (
        <div className="w-16 h-1 bg-brand-red rounded-full mx-auto mb-4" aria-hidden />
      )}
      {subtitle && (
        <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
