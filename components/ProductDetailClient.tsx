"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { getProductFallbackImage } from "@/lib/productImageFallbacks";
import { useCart } from "@/context/CartContext";
import type { Product, WeightOption } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import ReviewCard from "@/components/ReviewCard";

const LOW_STOCK_THRESHOLD = 5;

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
}

interface ProductDetailClientProps {
  product: Product;
  reviews: Review[];
  relatedProducts: Product[];
}

export default function ProductDetailClient({
  product,
  reviews,
  relatedProducts,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { state, dispatch } = useCart();
  const [selectedWeight, setSelectedWeight] = useState<WeightOption | undefined>(
    product.weightOptions?.find((w) => w.is_default) || product.weightOptions?.[0]
  );
  const [quantity, setQuantity] = useState(1);

  const addToCart = (p: Product, weight?: WeightOption) => {
    const w = weight ?? selectedWeight ?? p.weightOptions?.[0];
    dispatch({
      type: "ADD_ITEM",
      payload: { product: p, quantity: 1, selectedWeight: w },
    });
  };

  const getWeightQuantity = (productId: number, weight?: WeightOption) => {
    const item = state.items.find(
      (i) =>
        i.product.id === productId &&
        (!weight ||
          (i.selectedWeight &&
            i.selectedWeight.weight === weight.weight &&
            i.selectedWeight.weight_unit === weight.weight_unit))
    );
    return item?.quantity ?? 0;
  };

  const updateQuantity = (
    productId: number,
    qty: number,
    weight?: WeightOption
  ) => {
    if (qty <= 0) {
      dispatch({
        type: "REMOVE_ITEM",
        payload: { productId, selectedWeight: weight },
      });
    } else {
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { productId, quantity: qty, selectedWeight: weight },
      });
    }
  };

  const getStockStatus = (p: Product) => ({
    status: !p.in_stock || (p.stock_quantity ?? 0) === 0 ? "out" : "in",
    label: "",
    color: "",
    icon: () => null,
  });

  const handleBuyNow = () => {
    const w = selectedWeight ?? product.weightOptions?.[0];
    dispatch({
      type: "ADD_ITEM",
      payload: { product, quantity, selectedWeight: w },
    });
    router.push("/checkout");
  };

  const handleAddToCart = () => {
    const w = selectedWeight ?? product.weightOptions?.[0];
    dispatch({
      type: "ADD_ITEM",
      payload: { product, quantity, selectedWeight: w },
    });
  };

  const isWholeChicken = product.name.toLowerCase().includes("whole chicken");
  const activeWeight = isWholeChicken ? undefined : selectedWeight;
  const currentPrice = isWholeChicken
    ? Number(product.price)
    : Number(activeWeight?.price ?? product.price);
  const baseOriginal = Number(
    (product as { original_price?: number }).original_price ?? product.price
  );
  const hasDiscount = baseOriginal > Number(product.price);
  const lowStock =
    product.in_stock &&
    (product.stock_quantity ?? 999) <= LOW_STOCK_THRESHOLD &&
    (product.stock_quantity ?? 0) > 0;
  const outOfStock = (product.stock_quantity ?? 0) === 0 || !product.in_stock;

  return (
    <div className="k2-page py-6 sm:py-10">
      <div className="k2-wrap">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="bg-white rounded-card shadow-soft overflow-hidden">
            <div className="aspect-square relative bg-k2-cream-dark">
              <Image
                src={product.image_url || getProductFallbackImage(product.name)}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain object-center"
                priority
                unoptimized
              />
            </div>
          </div>

          <div>
            <h1 className="font-display text-2xl font-extrabold text-k2-green-deep text-balance sm:text-3xl mb-2">
              {product.name}
            </h1>
            {product.category && (
              <p className="text-sm text-[#7b877f] mb-4">{product.category}</p>
            )}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="price-tag text-2xl">
                ₹{currentPrice.toFixed(0)}
              </span>
              {activeWeight && (
                <span className="text-[#7b877f]">
                  / {activeWeight.weight}
                  {activeWeight.weight_unit}
                </span>
              )}
            </div>
            {hasDiscount && (
              <p className="text-sm text-green-600 font-medium mb-2">
                Discount available
              </p>
            )}
            {lowStock && !outOfStock && (
              <p className="text-amber-700 text-sm font-medium mb-2">
                Only {product.stock_quantity} left in stock
              </p>
            )}

            {!isWholeChicken &&
              product.weightOptions &&
              product.weightOptions.length > 1 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-k2-ink mb-2">
                    Weight
                  </label>
                  <div className="weight-toggle" role="group" aria-label="weight">
                    {product.weightOptions.map((w) => (
                      <button
                        key={w.id ?? w.weight}
                        type="button"
                        onClick={() => setSelectedWeight(w)}
                        className={
                          selectedWeight?.weight === w.weight ? "on" : ""
                        }
                      >
                        {w.weight}
                        {w.weight_unit}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 bg-k2-cream rounded-button p-2 border border-k2-paper">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-button bg-white hover:bg-k2-cream-dark text-k2-ink hover:text-brand-red min-w-[44px] min-h-[44px]"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-button bg-brand-red hover:bg-brand-red-hover text-white min-w-[44px] min-h-[44px]"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={outOfStock}
                className="btn-primary flex min-h-[48px] items-center gap-2 rounded-pill px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={outOfStock}
                className="btn-secondary min-h-[48px] px-6 py-3 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Buy now
              </button>
            </div>

            {product.description && (
              <div className="mt-8 pt-6 border-t border-k2-paper">
                <h2 className="text-lg font-semibold text-k2-green-deep mb-2">
                  Description
                </h2>
                <p className="text-[#5a6a61] leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-k2-paper">
              <h2 className="text-lg font-semibold text-k2-green-deep mb-2">
                Storage tips
              </h2>
              <p className="text-[#5a6a61] text-sm">
                Store in the refrigerator and use within 1–2 days for best
                quality.
              </p>
            </div>
          </div>
        </div>

        {reviews.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-k2-green-deep mb-4">
              Customer reviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </section>
        )}

        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-k2-green-deep mb-4">
              You may also like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={addToCart}
                  onUpdateQuantity={updateQuantity}
                  getWeightQuantity={getWeightQuantity}
                  getStockStatus={getStockStatus}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
