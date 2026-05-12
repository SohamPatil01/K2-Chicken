"use client";

import { useState } from "react";
import { MapPin, Check, X } from "lucide-react";

export default function DeliveryChecker() {
  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "yes" | "no" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleCheck = async () => {
    const pin = pincode.trim();
    if (!pin) return;
    setStatus("checking");
    setMessage("");
    try {
      const res = await fetch("/api/delivery/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryAddress: pin }),
      });
      const data = await res.json();
      if (data.success !== false && data.deliveryCharge !== undefined) {
        setStatus(data.deliveryCharge === 0 ? "yes" : "yes");
        setMessage(
          data.deliveryCharge === 0
            ? "We deliver here! Free delivery."
            : `We deliver here. Delivery charge: ₹${data.deliveryCharge?.toFixed(0) ?? "—"}`
        );
      } else {
        setStatus("no");
        setMessage(data.error || "We don't deliver to this area yet.");
      }
    } catch {
      setStatus("error");
      setMessage("Could not check. Try again.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value);
              setStatus("idle");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            placeholder="Enter pincode"
            className="w-full pl-10 pr-4 py-3 rounded-button border border-gray-200 bg-white/80 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-200 shadow-soft"
          />
        </div>
        <button
          type="button"
          onClick={handleCheck}
          disabled={status === "checking" || !pincode.trim()}
          className="px-4 py-3 rounded-button bg-brand-red hover:bg-brand-red-hover text-white font-semibold shadow-soft disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-smooth min-h-[48px]"
        >
          {status === "checking" ? "..." : "Check"}
        </button>
      </div>
      {message && (
        <div
          className={`mt-2 flex items-center gap-2 text-sm font-medium ${
            status === "yes" ? "text-green-700" : status === "no" || status === "error" ? "text-red-700" : "text-gray-600"
          }`}
        >
          {status === "yes" && <Check className="w-4 h-4 flex-shrink-0" />}
          {(status === "no" || status === "error") && <X className="w-4 h-4 flex-shrink-0" />}
          {message}
        </div>
      )}
    </div>
  );
}
