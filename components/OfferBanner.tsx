"use client";

import Link from "next/link";
import Image from "next/image";
import { Tag, Truck, Sparkles } from "lucide-react";

export interface OfferBannerProps {
  title: string;
  description?: string;
  promoCode?: string;
  imageUrl?: string;
  type?: "discount" | "free_delivery" | "seasonal" | "generic";
  link?: string;
  linkLabel?: string;
  className?: string;
}

export default function OfferBanner({
  title,
  description,
  promoCode,
  imageUrl,
  type = "generic",
  link = "/#products",
  linkLabel = "Shop now",
  className = "",
}: OfferBannerProps) {
  const Icon = type === "free_delivery" ? Truck : type === "discount" || type === "seasonal" ? Tag : Sparkles;

  return (
    <div
      className={`bg-white rounded-card shadow-soft hover:shadow-card transition-all duration-smooth overflow-hidden border border-gray-100 flex flex-col sm:flex-row ${className}`}
    >
      {imageUrl && (
        <div className="relative w-full sm:w-40 h-32 sm:h-auto sm:min-h-[120px] flex-shrink-0 bg-gray-100">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-contain object-center"
            sizes="160px"
          />
        </div>
      )}
      {!imageUrl && (
        <div className="w-full sm:w-24 flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4 flex-shrink-0">
          <Icon className="w-10 h-10 text-orange-500" />
        </div>
      )}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
        <h3 className="font-semibold text-gray-900 text-balance">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {description}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {promoCode && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 text-orange-800 rounded-button text-xs font-semibold">
              <Tag className="w-3.5 h-3.5" />
              {promoCode}
            </span>
          )}
          <Link
            href={link}
            className="inline-flex items-center text-orange-600 font-medium text-sm hover:text-orange-700 transition-colors duration-smooth"
          >
            {linkLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
