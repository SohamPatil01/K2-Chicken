"use client";

import { useEffect, useState } from "react";

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewsSectionProps {
  initialReviews?: Review[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="mb-3.5 tracking-widest text-k2-saffron" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(Math.floor(rating))}
      {"☆".repeat(5 - Math.floor(rating))}
    </div>
  );
}

export default function ReviewsSection({
  initialReviews,
}: ReviewsSectionProps = {}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
  const [loading, setLoading] = useState(!initialReviews);

  useEffect(() => {
    if (!initialReviews) {
      fetch("/api/reviews")
        .then((r) => r.json())
        .then((data) =>
          setReviews(Array.isArray(data) ? data.slice(0, 6) : [])
        )
        .catch(() => setReviews([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [initialReviews]);

  if (loading) {
    return (
      <section
        className="px-6 py-20"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Loading reviews"
      >
        <span className="sr-only">Loading reviews</span>
        <div className="mx-auto max-w-[1180px]">
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-card border border-k2-paper bg-white"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const displayed = reviews.slice(0, 3);

  return (
    <section className="px-6 pb-20 pt-4" id="reviews">
      <div className="mx-auto max-w-[1180px]">
        <div className="rv">
          <span className="section-eyebrow">What home chefs say</span>
          <h2 className="font-display text-[clamp(1.875rem,4vw,2.875rem)] font-extrabold tracking-tight text-k2-green-deep">
            Trusted in 2,000+ Pune kitchens
          </h2>
        </div>

        {displayed.length === 0 ? (
          <div className="py-12 text-center text-[#7b877f]">
            <p>Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {displayed.map((review) => (
              <div key={review.id} className="testimonial-card rv p-7">
                <StarRating rating={review.rating} />
                <p className="mb-4 text-sm leading-relaxed text-k2-ink">
                  {review.comment}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-k2-green font-display font-bold text-k2-cream">
                    {review.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <b className="block text-sm">{review.user_name}</b>
                    <span className="font-mono text-[11px] uppercase tracking-wide text-[#7b877f]">
                      Verified Customer
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
