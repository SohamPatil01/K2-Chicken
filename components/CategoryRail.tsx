"use client";

import Link from "next/link";
import { Egg, CheckCircle } from "lucide-react";

// Use Lucide icons or emojis if images are not ready
const categories = [
    {
        id: "chicken",
        name: "Chicken",
        image: "/icons/chicken-leg.png",
        icon: (props: any) => (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                {...props}
            >
                <path d="M12 22a9 9 0 0 0 9-9c0-3.5-2-6.5-5-8l-4-4-4 4C5 6.5 3 9.5 3 13a9 9 0 0 0 9 9Z" />
                <path d="M12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
            </svg>
        ), // Fallback icon
        href: "/#products",
    },
    {
        id: "eggs",
        name: "Eggs",
        icon: Egg,
        href: "/#products?filter=eggs",
    },
    {
        id: "masala",
        name: "Spreads",
        icon: CheckCircle, // Placeholder
        href: "/#products",
        comingSoon: true,
    },
    {
        id: "mutton",
        name: "Mutton",
        icon: CheckCircle, // Placeholder
        href: "/#products",
        comingSoon: true,
    },
];

export default function CategoryRail() {
    return (
        <div className="bg-white pt-8 sm:pt-10 pb-6 sm:pb-8 rounded-t-2xl sm:rounded-t-3xl border-t border-b border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5">Shop by Category</h2>

                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <Link
                                key={cat.id}
                                href={cat.href}
                                className={`flex flex-col items-center gap-2 min-w-[80px] group ${cat.comingSoon ? 'opacity-50 pointer-events-none grayscale' : ''}`}
                            >
                                <div className="w-20 h-20 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:bg-orange-100">
                                    <Icon className="w-8 h-8 text-orange-600" />
                                </div>
                                <span className="text-xs font-semibold text-gray-700 group-hover:text-orange-600 text-center">
                                    {cat.name}
                                    {cat.comingSoon && <span className="block text-[9px] font-normal text-gray-400">Coming Soon</span>}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
