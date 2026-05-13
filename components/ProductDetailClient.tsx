"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChefHat, Minus, Plus, ShoppingBag } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="bg-white rounded-card shadow-soft overflow-hidden">
            <div className="aspect-square relative bg-gray-100">
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-balance mb-2">
              {product.name}
            </h1>
            {product.category && (
              <p className="text-sm text-gray-500 mb-4">{product.category}</p>
            )}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-bold text-gray-900">
                ₹{currentPrice.toFixed(0)}
              </span>
              {activeWeight && (
                <span className="text-gray-500">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.weightOptions.map((w) => (
                      <button
                        key={w.id ?? w.weight}
                        type="button"
                        onClick={() => setSelectedWeight(w)}
                        className={`px-4 py-2 rounded-button text-sm font-medium transition-all duration-smooth ${
                          selectedWeight?.weight === w.weight
                            ? "bg-brand-red text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {w.weight}
                        {w.weight_unit}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 bg-gray-50 rounded-button p-2 border border-gray-100">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-button bg-white hover:bg-red-50 text-gray-700 hover:text-brand-red min-w-[44px] min-h-[44px]"
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
                className="px-6 py-3 rounded-button bg-brand-red hover:bg-brand-red-hover text-white font-semibold flex items-center gap-2 shadow-soft hover:shadow-card transition-all duration-smooth disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={outOfStock}
                className="px-6 py-3 rounded-button bg-white border-2 border-red-200 text-brand-red hover:bg-red-50 font-semibold flex items-center gap-2 transition-all duration-smooth disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
              >
                Buy now
              </button>
            </div>

            {product.description && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Description
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Cooking suggestions
              </h2>
              <p className="text-gray-600 text-sm mb-2">
                Perfect for curries, grills, and traditional recipes. Store in the
                refrigerator and use within 1-2 days for best quality.
              </p>
              <Link
                href="/recipes"
                className="inline-flex items-center gap-2 text-gray-700 font-medium hover:text-brand-red transition-colors"
              >
                <ChefHat className="w-4 h-4" />
                View recipes
              </Link>
            </div>
          </div>
        </div>

        {reviews.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">
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
