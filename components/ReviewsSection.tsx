"use client";

import { useEffect, useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import SectionHeader from "./SectionHeader";
import ReviewCard from "./ReviewCard";

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
      }, 5000);
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
      <section id="reviews" className="py-16 sm:py-20 bg-white border-t border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Customer feedback"
            title="What our customers say"
            subtitle="Real reviews from real customers."
            icon={Star}
          />
          <div className="flex justify-center">
            <div className="bg-white border border-gray-100 rounded-card shadow-soft p-12 w-full max-w-3xl animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
              <div className="h-20 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section id="reviews" className="py-16 sm:py-20 bg-white border-t border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Customer feedback"
            title="What our customers say"
            subtitle="Real reviews from real customers."
            icon={Star}
          />
          <div className="text-center py-12">
            <div className="bg-white border border-gray-100 rounded-card shadow-soft p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-600 text-sm">Be the first to share your experience!</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentReview = reviews[currentIndex];

  return (
    <section id="reviews" className="py-16 sm:py-20 bg-white border-t border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Customer feedback"
          title="What our customers say"
          subtitle="Real reviews from real customers who love our fresh chicken."
          icon={Star}
        />

        <div className="relative max-w-4xl mx-auto">
          <div
            key={currentReview.id}
            className="bg-white border border-gray-100 rounded-card shadow-soft overflow-hidden"
          >
            <ReviewCard review={currentReview} className="p-8 sm:p-12" />
          </div>

          <button
            onClick={prevReview}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-12 w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-soft hover:bg-orange-50 hover:border-orange-200 transition-all duration-smooth z-20"
            aria-label="Previous review"
          >
            <ChevronLeft className="w-6 h-6 text-orange-600" />
          </button>
          <button
            onClick={nextReview}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-12 w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-soft hover:bg-orange-50 hover:border-orange-200 transition-all duration-smooth z-20"
            aria-label="Next review"
          >
            <ChevronRight className="w-6 h-6 text-orange-600" />
          </button>

          <div className="flex justify-center gap-2 mt-8">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => goToReview(index)}
                className={`h-3 rounded-full transition-all duration-smooth ${
                  index === currentIndex ? "bg-orange-600 w-8" : "bg-gray-300 hover:bg-gray-400 w-3"
                }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Showing {currentIndex + 1} of {reviews.length} reviews
        </p>
      </div>
    </section>
  );
}
