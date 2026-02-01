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
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden">
            <Link href="/cart">
                <div className="bg-orange-600 text-white rounded-xl shadow-2xl shadow-orange-200 p-4 flex items-center justify-between animate-slide-up">
                    <div className="flex flex-col">
                        <span className="text-xs font-medium opacity-90">{totalItems} Items</span>
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
