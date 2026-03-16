"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, Star, Sparkles, ShoppingBag } from "lucide-react";
import type { Product, WeightOption } from "@/context/CartContext";

export interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, weight?: WeightOption) => void;
  onUpdateQuantity?: (
    productId: number,
    quantity: number,
    weight?: WeightOption
  ) => void;
  getWeightQuantity?: (productId: number, weight?: WeightOption) => number;
  getStockStatus?: (product: Product) => {
    status: string;
    label: string;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  isBestseller?: boolean;
  showRating?: boolean;
  rating?: number;
  compact?: boolean;
}

const LOW_STOCK_THRESHOLD = 5;

export default function ProductCard({
  product,
  onAddToCart,
  onUpdateQuantity,
  getWeightQuantity = () => 0,
  getStockStatus,
  isBestseller = false,
  showRating = false,
  rating = 0,
  compact = false,
}: ProductCardProps) {
  const defaultWeight =
    product.weightOptions?.find((w) => w.is_default) ||
    product.weightOptions?.[0];
  const [selectedWeight, setSelectedWeight] = useState<
    WeightOption | undefined
  >(defaultWeight);

  useEffect(() => {
    const next =
      product.weightOptions?.find((w) => w.is_default) ||
      product.weightOptions?.[0];
    if (next) setSelectedWeight(next);
  }, [product.id, product.weightOptions]);

  const isWholeChicken = product.name.toLowerCase().includes("whole chicken");
  const activeWeight = isWholeChicken ? undefined : selectedWeight;
  const baseProductPrice = Number(product.price);
  const baseOriginalPrice = Number(
    (product as { original_price?: number }).original_price || product.price
  );
  const hasDiscount = baseOriginalPrice > baseProductPrice;
  const discountPercent = hasDiscount
    ? Math.round(
        ((baseOriginalPrice - baseProductPrice) / baseOriginalPrice) * 100
      )
    : 0;
  const currentPrice = isWholeChicken
    ? baseProductPrice
    : Number(activeWeight?.price ?? product.price);
  const stockStatus = getStockStatus?.(product);
  const inCart = onUpdateQuantity
    ? (getWeightQuantity?.(product.id, activeWeight) ?? 0) > 0
    : false;
  const currentQty = getWeightQuantity?.(product.id, activeWeight) ?? 0;
  const lowStock =
    product.in_stock &&
    (product.stock_quantity ?? 999) <= LOW_STOCK_THRESHOLD &&
    (product.stock_quantity ?? 0) > 0;
  const outOfStock = stockStatus?.status === "out" || (product.stock_quantity ?? 0) === 0;

  return (
    <div className="group flex flex-col bg-white rounded-card border border-gray-200 hover:border-orange-200 transition-all duration-smooth overflow-hidden h-full">
      <Link href={`/products/${product.id}`} className="block flex-shrink-0">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-smooth"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl">🍗</span>
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white px-2 py-0.5 rounded-button text-xs font-semibold flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {discountPercent}% OFF
            </div>
          )}
          {isBestseller && !hasDiscount && (
            <div className="absolute top-2 left-2 z-10 bg-white/95 backdrop-blur-sm rounded-button px-2 py-1 text-xs font-bold text-gray-800 shadow-soft border border-orange-200">
              Best Seller
            </div>
          )}
          {outOfStock && (
            <div className="absolute top-2 right-2 z-10 bg-red-100 text-red-700 px-2 py-0.5 rounded-button text-xs font-medium">
              Out of stock
            </div>
          )}
          {lowStock && !outOfStock && (
            <div className="absolute bottom-2 left-2 right-2 z-10 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-button text-xs font-medium text-center">
              Only {(product.stock_quantity ?? 0)} left
            </div>
          )}
        </div>
      </Link>
      <div className="p-4 flex-1 flex flex-col min-w-0">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-smooth line-clamp-2 text-balance">
            {product.name}
          </h3>
        </Link>
        {showRating && rating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
                }`}
              />
            ))}
          </div>
        )}
        {!isWholeChicken &&
          product.weightOptions &&
          product.weightOptions.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {product.weightOptions.map((w) => (
                <button
                  key={w.id ?? w.weight}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedWeight(w);
                  }}
                  className={`px-2.5 py-1 rounded-button text-xs font-medium transition-all duration-smooth ${
                    selectedWeight?.weight === w.weight
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {w.weight}
                  {w.weight_unit}
                </button>
              ))}
            </div>
          )}
        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <div>
            <span className="text-lg font-bold text-orange-600">
              ₹{currentPrice.toFixed(0)}
            </span>
            {activeWeight && (
              <span className="text-xs text-gray-500 ml-1">
                /{activeWeight.weight}
                {activeWeight.weight_unit}
              </span>
            )}
          </div>
          {outOfStock ? (
            <button
              disabled
              className="px-4 py-2 rounded-button bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed"
            >
              Out of stock
            </button>
          ) : inCart && onUpdateQuantity ? (
            <div className="flex items-center gap-1.5 bg-gray-50 rounded-button p-1 border border-gray-100">
              <button
                type="button"
                onClick={() =>
                  onUpdateQuantity(product.id, currentQty - 1, activeWeight)
                }
                className="w-9 h-9 flex items-center justify-center rounded-button bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors duration-smooth min-w-[44px] min-h-[44px]"
                aria-label="Decrease"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-semibold text-sm">
                {currentQty}
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdateQuantity(product.id, currentQty + 1, activeWeight)
                }
                className="w-9 h-9 flex items-center justify-center rounded-button bg-orange-600 hover:bg-orange-700 text-white transition-colors duration-smooth min-w-[44px] min-h-[44px]"
                aria-label="Increase"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onAddToCart(product, activeWeight)}
              className="px-4 py-2 rounded-button bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-smooth shadow-soft hover:shadow-card min-w-[44px] min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
