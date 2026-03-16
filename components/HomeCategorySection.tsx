"use client";

import CategoryCard from "./CategoryCard";
import { Package } from "lucide-react";

const CATEGORIES = [
  { label: "Whole Chicken", slug: "Whole Chicken", href: "/?category=Whole+Chicken#products" },
  { label: "Boneless Chicken", slug: "Boneless", href: "/?category=Boneless#products" },
  { label: "Chicken Curry Cut", slug: "Curry Cut", href: "/?category=Curry+Cut#products" },
  { label: "Chicken Wings", slug: "Wings", href: "/?category=Wings#products" },
  { label: "Ready To Cook", slug: "Ready To Cook", href: "/?category=Ready+To+Cook#products" },
  { label: "Marinated Chicken", slug: "Marinated", href: "/?category=Marinated#products" },
];

export default function HomeCategorySection() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-balance mb-2">
            Shop by Category
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Choose from our range of fresh chicken cuts and products.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.slug}
              href={cat.href}
              label={cat.label}
              icon={Package}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
