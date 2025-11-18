"use client";

import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";

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

export default function ReviewsSection({
  initialReviews,
}: ReviewsSectionProps = {}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
  const [loading, setLoading] = useState(!initialReviews);

  useEffect(() => {
    if (!initialReviews) {
      fetchReviews();
    } else {
      setLoading(false);
    }
  }, [initialReviews]);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/reviews");
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating
            ? "fill-yellow-400 text-yellow-400"
            : "fill-gray-200 text-gray-200"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Customer Reviews
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12 animate-slide-down">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
            <Star className="h-4 w-4 fill-orange-500" />
            <span>Customer Feedback</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 sm:mb-4 animate-slide-up stagger-1">
            What Our{" "}
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Customers Say
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto animate-slide-up stagger-2">
            Real reviews from real customers who love our fresh chicken
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className="group bg-white border border-gray-100 rounded-xl p-6 hover:border-orange-200 hover:shadow-lg transition-all duration-500 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Quote Icon */}
              <div className="mb-4 transform transition-transform duration-300 group-hover:scale-110">
                <Quote className="h-8 w-8 text-orange-200 group-hover:text-orange-400 transition-colors" />
              </div>

              {/* Rating Stars */}
              <div className="flex items-center gap-1 mb-3">
                {renderStars(review.rating)}
              </div>

              {/* Review Comment */}
              <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-4">
                {review.comment}
              </p>

              {/* Customer Name */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {review.user_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Verified Customer
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm transform transition-transform duration-300 group-hover:scale-110">
                  {review.user_name.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {reviews.length === 0 && !loading && (
          <div className="text-center py-16 animate-bounce-in">
            <div className="bg-white border border-gray-200 rounded-2xl p-12 max-w-md mx-auto shadow-sm">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No reviews yet
              </h3>
              <p className="text-gray-600 text-sm">
                Be the first to share your experience!
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

