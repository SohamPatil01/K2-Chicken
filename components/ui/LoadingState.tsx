import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton";
import RecipeCardSkeleton from "@/components/skeletons/RecipeCardSkeleton";

const spinnerSizes = {
  sm: "h-8 w-8 border-[3px]",
  md: "h-12 w-12 border-4",
  lg: "h-16 w-16 border-4",
} as const;

export function LoadingSpinner({
  label,
  size = "md",
  showLabel = true,
  className,
}: {
  label: string;
  size?: keyof typeof spinnerSizes;
  showLabel?: boolean;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={className}
    >
      <div
        className={`animate-spin rounded-full border-red-200 border-t-brand-red ${spinnerSizes[size]} mx-auto`}
        aria-hidden
      />
      {showLabel ? (
        <p className="mt-4 text-lg text-gray-600 font-medium text-center">
          {label}
        </p>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
}

/** next/dynamic fallback while ProductCatalog chunk loads */
export function HomeProductCatalogFallback() {
  return (
    <section
      className="min-h-[400px] pb-20 bg-white"
      role="status"
      aria-live="polite"
      aria-label="Loading product catalog"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <span className="sr-only">Loading products</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** next/dynamic fallback while RecipeSection chunk loads */
export function HomeRecipeSectionFallback() {
  return (
    <section
      className="min-h-[300px] py-16 sm:py-20 bg-gray-50 border-t border-gray-100"
      role="status"
      aria-live="polite"
      aria-label="Loading recipes"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <span className="sr-only">Loading recipes</span>
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4 max-w-full" />
        <div className="h-6 w-full max-w-lg bg-gray-200 rounded animate-pulse mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** next/dynamic fallback while ReviewsSection chunk loads */
export function HomeReviewsSectionFallback() {
  return (
    <section
      className="min-h-[300px] py-20 bg-white"
      role="status"
      aria-live="polite"
      aria-label="Loading reviews"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <span className="sr-only">Loading reviews</span>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="testimonial-card p-8 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/4 mb-4" />
              <div className="h-20 bg-gray-100 rounded mb-6" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** next/dynamic fallback while PromotionsFlyer chunk loads */
export function HomePromotionsSectionFallback() {
  return (
    <div
      className="min-h-[200px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      role="status"
      aria-live="polite"
      aria-label="Loading promotions"
    >
      <span className="sr-only">Loading promotions</span>
      <div className="h-36 rounded-2xl bg-gray-100 animate-pulse border border-gray-200" />
    </div>
  );
}

/** next/dynamic fallback for client-only ContactSection */
export function HomeContactSectionFallback() {
  return (
    <section
      className="min-h-[320px] py-16 bg-gray-50 border-t border-gray-100"
      role="status"
      aria-live="polite"
      aria-label="Loading contact section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <span className="sr-only">Loading contact information</span>
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-8 mx-auto" />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4 animate-pulse">
            <div className="h-12 bg-gray-200 rounded-xl" />
            <div className="h-12 bg-gray-200 rounded-xl" />
            <div className="h-24 bg-gray-200 rounded-xl" />
          </div>
          <div className="h-64 lg:h-auto min-h-[200px] bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    </section>
  );
}
