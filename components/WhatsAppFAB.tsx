"use client";

import Link from "next/link";

const WHATSAPP_URL =
  "https://wa.me/918484978622?text=Hi%20K2%20Chicken!%20I%27d%20like%20to%20place%20an%20order.";

export default function WhatsAppFAB() {
  return (
    <Link
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-5 z-[60] flex items-center gap-2.5 rounded-pill bg-[#25D366] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(37,211,102,0.4)] transition-transform hover:scale-105 md:bottom-6 animate-fade-up"
      style={{ animationDelay: "1.5s", animationFillMode: "both" }}
    >
      <span aria-hidden="true">💬</span>
      Order on WhatsApp
    </Link>
  );
}
