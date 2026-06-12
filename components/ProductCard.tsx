"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Minus } from "lucide-react";
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
    <div className="product-card group flex h-full flex-col">
      <Link href={`/products/${product.id}`} className="block shrink-0">
        <div className="image-hover-zoom relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-[#F3E2C8] to-[#E9C9A1]">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-4xl">🍗</span>
            </div>
          )}
          <div className="absolute top-3 left-3 z-10">
            <span className="fresh-tag rounded-pill px-2.5 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-wider">
              {hasDiscount ? `${discountPercent}% OFF` : isBestseller ? "BESTSELLER" : "FRESH TODAY"}
            </span>
          </div>
          {outOfStock && (
            <div className="absolute top-3 right-3 z-10 rounded-pill bg-k2-green-deep px-2 py-1 text-xs font-medium text-k2-cream">
              Out of stock
            </div>
          )}
        </div>
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-display text-lg font-bold text-k2-green-deep transition-colors group-hover:text-k2-saffron line-clamp-2">
            {product.name}
          </h3>
        </Link>
        {!isWholeChicken &&
          product.weightOptions &&
          product.weightOptions.length > 1 && (
            <div className="weight-toggle" role="group" aria-label="weight">
              {product.weightOptions.map((w) => (
                <button
                  key={w.id ?? w.weight}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedWeight(w);
                  }}
                  className={selectedWeight?.weight === w.weight ? "on" : ""}
                >
                  {w.weight}
                  {w.weight_unit}
                </button>
              ))}
            </div>
          )}
        <div className="mt-auto flex items-center justify-between gap-2">
          <div>
            <span className="price-tag text-2xl">₹{currentPrice.toFixed(0)}</span>
            <small className="ml-1 font-mono text-[11px] text-[#7b877f]">incl. taxes</small>
          </div>
          {outOfStock ? (
            <button disabled className="rounded-pill bg-k2-cream-dark px-4 py-2 text-sm font-semibold text-[#7b877f]">
              Out of stock
            </button>
          ) : inCart && onUpdateQuantity ? (
            <div className="flex items-center gap-1.5 rounded-pill bg-k2-cream-dark p-1">
              <button
                type="button"
                onClick={() => onUpdateQuantity(product.id, currentQty - 1, activeWeight)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-k2-green hover:bg-k2-green hover:text-k2-cream"
                aria-label="Decrease"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-6 text-center text-sm font-semibold">{currentQty}</span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(product.id, currentQty + 1, activeWeight)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-k2-saffron text-white hover:bg-k2-saffron-hot"
                aria-label="Increase"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onAddToCart(product, activeWeight)}
              className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-k2-saffron text-2xl leading-none text-white transition-all hover:scale-110 hover:bg-k2-saffron-hot hover:rotate-90"
              aria-label={`Add ${product.name} to cart`}
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
