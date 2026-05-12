"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, Gift } from "lucide-react";
import Link from "next/link";

export default function InauguralDiscountFlyer() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      sessionStorage.setItem("inauguralFlyerShown", "true");
      return;
    }
    if (sessionStorage.getItem("inauguralFlyerShown") === "true") return;

    // Slide in after 4 seconds — not intrusive on landing
    const timer = setTimeout(() => {
      setIsVisible(true);
      sessionStorage.setItem("inauguralFlyerShown", "true");
    }, 4000);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-6 right-4 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 ${
        isExiting
          ? "opacity-0 translate-y-4 pointer-events-none"
          : "opacity-100 translate-y-0"
      }`}
      style={{
        animation: isExiting ? undefined : "slideInRight 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
      }}
    >
      {/* Red top bar */}
      <div className="bg-brand-red px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Gift className="w-4 h-4 shrink-0" />
          <span className="text-sm font-bold tracking-wide">Welcome Offer 🎉</span>
        </div>
        <button
          onClick={handleClose}
          className="text-white/80 hover:text-white transition-colors ml-2"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <p className="text-2xl font-extrabold text-brand-red leading-none mb-0.5">10% OFF</p>
        <p className="text-sm text-gray-700 font-medium">your first order</p>
        <p className="text-xs text-gray-500 mt-1 mb-3">Sign up now and save on fresh premium chicken delivered to your door.</p>
        <Link
          href="/login?redirect=/checkout"
          onClick={handleClose}
          className="block w-full text-center bg-brand-red hover:bg-brand-red-hover text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          Sign Up &amp; Claim Offer
        </Link>
        <button
          onClick={handleClose}
          className="block w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-2 transition-colors"
        >
          No thanks
        </button>
      </div>
    </div>
  );
}
