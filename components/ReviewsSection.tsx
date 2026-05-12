"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import Image from "next/image";

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewed_at?: string;
  source?: string;
  reviewer_avatar_url?: string;
  review_reply?: string;
}

interface ReviewsSectionProps {
  initialReviews?: Review[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-brand-red mb-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className="w-4 h-4" fill={i <= Math.floor(rating) ? "currentColor" : "none"} />
      ))}
    </div>
  );
}

function ReviewerAvatar({ review }: { review: Review }) {
  if (review.reviewer_avatar_url) {
    return (
      <Image
        src={review.reviewer_avatar_url}
        alt={review.user_name}
        width={40}
        height={40}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        unoptimized
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm flex-shrink-0">
      {review.user_name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function ReviewsSection({ initialReviews }: ReviewsSectionProps = {}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
  const [loading, setLoading] = useState(!initialReviews);

  useEffect(() => {
    if (!initialReviews) {
      fetch("/api/reviews")
        .then((r) => r.json())
        .then((data) => setReviews(Array.isArray(data) ? data.slice(0, 6) : []))
        .catch(() => setReviews([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [initialReviews]);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

  const displayed = reviews.slice(0, 6);
  const hasGoogleReviews = displayed.some((r) => r.source === "google_business_profile");

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3">What Our Customers Say</h2>
          <p className="text-gray-500">
            {hasGoogleReviews
              ? "Real reviews from Google Business Profile"
              : "Real reviews from Pune\u2019s cooking enthusiasts"}
          </p>
        </div>

        {displayed.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Star className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {displayed.map((review) => (
              <div key={review.id} className="testimonial-card p-8 hover:shadow-lg transition-shadow min-w-0">
                <StarRating rating={review.rating} />
                <p className="text-gray-600 mb-6 leading-relaxed text-sm break-words">
                  &ldquo;{review.comment || "Great experience!"}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <ReviewerAvatar review={review} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-gray-900 font-semibold text-sm break-words">{review.user_name}</h4>
                      {review.source === "google_business_profile" && (
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-100 shrink-0">
                          Google
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs">
                      {review.source === "google_business_profile" ? "Google Review" : "Verified Customer"}
                    </p>
                  </div>
                </div>
                {review.review_reply && (
                  <div className="mt-4 pl-3 border-l-2 border-brand-red/30">
                    <p className="text-xs text-gray-500 font-semibold mb-0.5">Owner reply</p>
                    <p className="text-xs text-gray-600 line-clamp-2">{review.review_reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
