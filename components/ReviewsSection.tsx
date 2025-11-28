"use client";

import { useEffect, useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!initialReviews) {
      fetchReviews();
    } else {
      setLoading(false);
    }
  }, [initialReviews]);

  useEffect(() => {
    if (isAutoPlaying && reviews.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
      }, 5000); // Auto-rotate every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, reviews.length]);

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
        className={`h-5 w-5 transition-all duration-500 ${
          index < rating
            ? "fill-yellow-400 text-yellow-400 scale-110"
            : "fill-gray-200 text-gray-200"
        }`}
        style={{ animationDelay: `${index * 0.1}s` }}
      />
    ));
  };

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
    setIsAutoPlaying(false);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    setIsAutoPlaying(false);
  };

  const goToReview = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
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
          <div className="flex justify-center">
            <div className="bg-white border border-gray-200 rounded-2xl p-12 w-full max-w-3xl animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
      </section>
    );
  }

  const currentReview = reviews[currentIndex];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Parallax Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-200 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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

        {/* Carousel Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Review Card */}
          <div
            key={currentReview.id}
            className="bg-white border-2 border-orange-200 rounded-3xl p-8 sm:p-12 shadow-2xl transform transition-all duration-500 hover:scale-[1.02]"
          >
            {/* Quote Icon */}
            <div className="mb-6 transform transition-transform duration-300 hover:scale-110">
              <Quote className="h-12 w-12 text-orange-200" />
            </div>

            {/* Rating Stars with Animation */}
            <div className="flex items-center gap-2 mb-6">
              {renderStars(currentReview.rating)}
              <span className="ml-2 text-sm font-semibold text-gray-600">
                {currentReview.rating}/5
              </span>
            </div>

            {/* Review Comment */}
            <p className="text-lg sm:text-xl text-gray-800 leading-relaxed mb-8 min-h-[120px]">
              "{currentReview.comment}"
            </p>

            {/* Customer Info */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <div>
                <p className="font-bold text-gray-900 text-lg">
                  {currentReview.user_name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Verified Customer
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xl shadow-lg transform transition-transform duration-300 hover:scale-110">
                {currentReview.user_name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevReview}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-12 w-12 h-12 bg-white border-2 border-orange-300 rounded-full flex items-center justify-center shadow-lg hover:bg-orange-50 hover:scale-110 transition-all duration-300 z-20"
            aria-label="Previous review"
          >
            <ChevronLeft className="w-6 h-6 text-orange-600" />
          </button>
          <button
            onClick={nextReview}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-12 w-12 h-12 bg-white border-2 border-orange-300 rounded-full flex items-center justify-center shadow-lg hover:bg-orange-50 hover:scale-110 transition-all duration-300 z-20"
            aria-label="Next review"
          >
            <ChevronRight className="w-6 h-6 text-orange-600" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => goToReview(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-orange-600 w-8 scale-110"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Review Count */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Showing {currentIndex + 1} of {reviews.length} reviews
          </p>
        </div>
      </div>
    </section>
  );
}
