"use client";

import { Star, Quote } from "lucide-react";
import Image from "next/image";

export interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at?: string;
  reviewed_at?: string;
  source?: string;
  reviewer_avatar_url?: string;
  review_reply?: string;
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
      <Quote className="h-8 w-8 text-brand-red mb-2" />
      <p className="text-gray-700 leading-relaxed mb-4 line-clamp-4 break-words">
        {review.comment || "Great experience!"}
      </p>
      <div className="flex items-center gap-3">
        {review.reviewer_avatar_url ? (
          <Image
            src={review.reviewer_avatar_url}
            alt={review.user_name}
            width={36}
            height={36}
            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            unoptimized
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm flex-shrink-0">
            {review.user_name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-gray-900 break-words">{review.user_name}</p>
            {review.source === "google_business_profile" && (
              <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-100 shrink-0">
                Google
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">
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
  );
}
