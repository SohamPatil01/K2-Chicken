"use client";

import { Star, Quote } from "lucide-react";

export interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at?: string;
}

export interface ReviewCardProps {
  review: Review;
  className?: string;
}

export default function ReviewCard({ review, className = "" }: ReviewCardProps) {
  return (
    <div
      className={`bg-white rounded-card shadow-soft hover:shadow-card transition-all duration-smooth p-6 border border-gray-100 ${className}`}
    >
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < review.rating
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
      <Quote className="h-8 w-8 text-orange-100 mb-2" />
      <p className="text-gray-700 leading-relaxed mb-4 line-clamp-4">
        {review.comment}
      </p>
      <p className="font-medium text-gray-900">{review.user_name}</p>
    </div>
  );
}
