"use client";

// CategoryRail is now a visual header above the product catalog.
// The actual category filter pills are inside ProductCatalog.
export default function CategoryRail() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="reveal-up mb-6 px-1 text-center sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3 px-2">
            Shop Fresh Chicken Cuts
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto px-2">
            Hand-cut daily by master butchers. Raw, fresh, and ready for your kitchen.
          </p>
        </div>
      </div>
    </section>
  );
}
