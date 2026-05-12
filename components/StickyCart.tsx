"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";

export default function StickyCart() {
  const { state } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalItems = state.items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = state.total;

  if (totalItems === 0) return null;

  return (
    <div
      className="fixed left-0 right-0 z-[45] p-3 md:hidden safe-bottom"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <Link href="/cart" className="block min-h-[48px] rounded-card">
        <div className="bg-brand-red text-white rounded-card shadow-card p-4 flex items-center justify-between animate-slide-up active:scale-[0.98] min-h-[52px]">
          <div className="flex flex-col">
            <span className="text-xs font-medium opacity-90">
              {totalItems} Items
            </span>
            <span className="text-lg font-bold">₹{totalPrice.toFixed(0)}</span>
          </div>

          <div className="flex items-center gap-2 font-bold text-sm">
            <span>View Cart</span>
            <ArrowRight size={18} />
          </div>
        </div>
      </Link>
    </div>
  );
}
