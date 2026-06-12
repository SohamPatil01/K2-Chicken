"use client";

import { MapPin, ChevronDown } from "lucide-react";
import { useState } from "react";
import { DELIVERY_AREAS_COMPACT } from "@/lib/deliveryAreas";

export default function LocationSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const location = "Pimple Nilakh & nearby";

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 text-xs sm:text-sm text-k2-ink hover:text-brand-red transition-colors group"
            >
                <MapPin className="w-4 h-4 text-brand-red group-hover:scale-110 transition-transform" />
                <span className="font-semibold truncate max-w-[150px]">{location}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-k2-paper p-4 z-50 animate-fade-in-down">
                        <p className="text-xs text-[#7b877f] font-medium mb-3">SELECT LOCATION</p>

                        <div className="flex items-start gap-3 p-3 bg-k2-cream-dark rounded-lg border border-k2-paper cursor-pointer">
                            <MapPin className="w-5 h-5 text-brand-red mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-k2-green-deep">Delivery areas</p>
                                <p className="text-xs text-[#5a6a61] mt-0.5 leading-snug">{DELIVERY_AREAS_COMPACT}</p>
                                <p className="text-xs text-brand-red font-medium mt-1">~90 mins delivery</p>
                            </div>
                            <div className="ml-auto w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-k2-paper text-center">
                            <button className="text-xs text-brand-red font-bold hover:underline">
                                Change Location
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
