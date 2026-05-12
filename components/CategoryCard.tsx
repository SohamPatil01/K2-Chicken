"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

export interface CategoryCardProps {
  href: string;
  label: string;
  icon?: LucideIcon;
  imageUrl?: string;
  description?: string;
}

export default function CategoryCard({
  href,
  label,
  icon: Icon,
  imageUrl,
  description,
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group block bg-white rounded-card shadow-soft hover:shadow-card-hover transition-all duration-smooth overflow-hidden border border-gray-100 hover:border-red-200"
    >
      <div className="aspect-square sm:aspect-[4/3] relative bg-gradient-to-br from-brand-red to-red-50 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-smooth"
          />
        ) : Icon ? (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-brand-red group-hover:text-brand-red group-hover:scale-110 transition-all duration-smooth" />
          </div>
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-smooth">
            🍗
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-brand-red transition-colors duration-smooth text-balance">
          {label}
        </h3>
        {description && (
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}
