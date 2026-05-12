"use client";

// CategoryRail is now a visual header above the product catalog.
// The actual category filter pills are inside ProductCatalog.
export default function CategoryRail() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 reveal-up">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3">
            Shop Fresh Chicken Cuts
          </h2>
          <p className="text-gray-500">
            Hand-cut daily by master butchers. Raw, fresh, and ready for your kitchen.
          </p>
        </div>
      </div>
    </section>
  );
}
