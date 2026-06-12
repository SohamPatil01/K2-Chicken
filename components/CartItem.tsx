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
      className={`group k2-card overflow-hidden transition-all duration-smooth hover:border-k2-saffron/40 ${className}`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-button overflow-hidden bg-k2-cream border border-k2-paper">
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
                <h3 className="font-display font-semibold text-k2-green-deep transition-colors duration-smooth line-clamp-2 group-hover:text-k2-saffron">
                  {item.product.name}
                </h3>
                {item.selectedWeight && (
                  <div className="k2-chip mt-1">
                    <Package className="w-3.5 h-3.5" />
                    {item.selectedWeight.weight}
                    {item.selectedWeight.weight_unit}
                  </div>
                )}
                <p className="text-sm text-[#5a6a61] mt-1">
                  Unit: ₹{Number(itemPrice).toFixed(0)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(item.product.id, item.selectedWeight)}
                className="p-2.5 text-gray-400 hover:text-k2-saffron-hot hover:bg-k2-cream-dark rounded-button transition-all duration-smooth min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Remove item"
                aria-label="Remove item"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-k2-paper">
              <div className="flex items-center gap-2 rounded-pill bg-k2-cream-dark p-1.5 border border-k2-paper">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateQuantity(
                      item.product.id,
                      item.quantity - 1,
                      item.selectedWeight
                    )
                  }
                  className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-pill bg-white text-k2-green transition-all duration-smooth hover:bg-k2-green hover:text-k2-cream"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium text-k2-green-deep">
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
                  className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-pill bg-k2-saffron text-white transition-all duration-smooth hover:bg-k2-saffron-hot"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="price-tag text-lg tabular-nums">
                ₹{totalPrice.toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
