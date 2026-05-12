"use client";

import { Minus, Plus, Package, X } from "lucide-react";
import type { CartItem as CartItemType, WeightOption } from "@/context/CartContext";

export interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (
    productId: number,
    quantity: number,
    selectedWeight?: WeightOption
  ) => void;
  onRemove: (productId: number, selectedWeight?: WeightOption) => void;
  className?: string;
}

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  className = "",
}: CartItemProps) {
  const itemPrice = item.selectedWeight?.price ?? item.product.price;
  const totalPrice = Number(itemPrice) * item.quantity;

  return (
    <div
      className={`group bg-white rounded-card shadow-soft hover:shadow-card transition-all duration-smooth overflow-hidden border border-gray-100 hover:border-red-200 ${className}`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-button overflow-hidden bg-gray-50 border border-gray-100">
              {item.product.image_url ? (
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-smooth"
                  onError={(e) => {
                    const t = e.currentTarget;
                    t.style.display = "none";
                    const fallback = t.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full ${item.product.image_url ? "hidden" : "flex"} items-center justify-center`}
              >
                <span className="text-3xl">🍗</span>
              </div>
            </div>
          </div>

          <div className="flex-grow min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-brand-red transition-colors duration-smooth line-clamp-2">
                  {item.product.name}
                </h3>
                {item.selectedWeight && (
                  <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 bg-red-50 text-brand-red rounded-button text-xs font-medium border border-red-100">
                    <Package className="w-3.5 h-3.5" />
                    {item.selectedWeight.weight}
                    {item.selectedWeight.weight_unit}
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Unit: ₹{Number(itemPrice).toFixed(0)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(item.product.id, item.selectedWeight)}
                className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-button transition-all duration-smooth min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Remove item"
                aria-label="Remove item"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 bg-gray-50 rounded-button p-1.5 border border-gray-100">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateQuantity(
                      item.product.id,
                      item.quantity - 1,
                      item.selectedWeight
                    )
                  }
                  className="w-10 h-10 flex items-center justify-center bg-white hover:bg-red-50 text-gray-700 hover:text-brand-red rounded-button shadow-soft transition-all duration-smooth min-w-[44px] min-h-[44px]"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium text-gray-900">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateQuantity(
                      item.product.id,
                      item.quantity + 1,
                      item.selectedWeight
                    )
                  }
                  className="w-10 h-10 flex items-center justify-center bg-brand-red hover:bg-brand-red-hover text-white rounded-button shadow-soft transition-all duration-smooth min-w-[44px] min-h-[44px]"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-lg font-bold text-brand-red">
                ₹{totalPrice.toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
