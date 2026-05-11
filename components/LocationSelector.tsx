"use client";

import { MapPin, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function LocationSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const location = "Pune, Maharashtra"; // Service area

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-700 hover:text-orange-600 transition-colors group"
            >
                <MapPin className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
                <span className="font-semibold truncate max-w-[150px]">{location}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 animate-fade-in-down">
                        <p className="text-xs text-gray-500 font-medium mb-3">SELECT LOCATION</p>

                        <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100 cursor-pointer">
                            <MapPin className="w-5 h-5 text-orange-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-gray-900">Pune</p>
                                <p className="text-xs text-gray-600 mt-0.5">Delivery available in 30-45 mins</p>
                            </div>
                            <div className="ml-auto w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                            <button className="text-xs text-orange-600 font-bold hover:underline">
                                Change Location
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
