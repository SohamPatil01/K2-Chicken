"use client";

import { useState } from "react";
import { DELIVERY_AREAS } from "@/lib/deliveryAreas";

interface HeroAreaCheckerProps {
  freeDeliveryAbove?: number;
}

export default function HeroAreaChecker({
  freeDeliveryAbove = 350,
}: HeroAreaCheckerProps) {
  const [area, setArea] = useState("");
  const [result, setResult] = useState<{
    type: "success" | "warn" | "error";
    message: string;
  } | null>(null);

  const handleCheck = () => {
    if (!area) {
      setResult({
        type: "warn",
        message: "Please select an area first.",
      });
      return;
    }

    if (area === "other") {
      setResult({
        type: "warn",
        message:
          "We don't deliver there yet — message us on WhatsApp and we'll notify you when we expand.",
      });
      return;
    }

    setResult({
      type: "success",
      message: `Great news! We deliver to ${area} in ~90 minutes. Free delivery above ₹${freeDeliveryAbove}.`,
    });
  };

  return (
    <div className="area-check max-w-lg rounded-card border border-k2-cream/20 bg-k2-green-deep/55 p-5">
      <label
        htmlFor="hero-area-sel"
        className="mb-2.5 block font-mono text-[11px] uppercase tracking-widest text-k2-ice"
      >
        Check if we deliver to you
      </label>
      <div className="flex gap-2.5">
        <select
          id="hero-area-sel"
          value={area}
          onChange={(e) => {
            setArea(e.target.value);
            setResult(null);
          }}
          className="flex-1 rounded-button border border-k2-cream/25 bg-k2-green-deep px-3.5 py-2.5 font-body text-sm text-k2-cream focus:outline-none focus:ring-2 focus:ring-k2-saffron/40"
        >
          <option value="">Select your area…</option>
          {DELIVERY_AREAS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
          <option value="other">Somewhere else</option>
        </select>
        <button
          type="button"
          onClick={handleCheck}
          className="rounded-button bg-k2-cream px-5 py-2.5 text-sm font-semibold text-k2-green transition-transform hover:scale-[1.03]"
        >
          Check
        </button>
      </div>
      {result && (
        <div
          className={`mt-3 flex animate-fade-up items-center gap-2 text-sm ${
            result.type === "success"
              ? "text-emerald-300"
              : result.type === "warn"
                ? "text-amber-200"
                : "text-red-300"
          }`}
          role="status"
        >
          <span aria-hidden="true">
            {result.type === "success" ? "✅" : "⚠️"}
          </span>
          <span>{result.message}</span>
        </div>
      )}
    </div>
  );
}
