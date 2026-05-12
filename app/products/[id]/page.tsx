"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, ShoppingBag, ChefHat } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { Product, WeightOption } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import ReviewCard from "@/components/ReviewCard";

const LOW_STOCK_THRESHOLD = 5;

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { state, dispatch } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState<WeightOption | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<{ id: number; user_name: string; rating: number; comment: string }[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then((r) => {
        if (r.status === 404) return null;
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (data?.error) {
          setProduct(null);
          return;
        }
        setProduct(data);
        const defaultW = data.weightOptions?.find((w: WeightOption) => w.is_default) || data.weightOptions?.[0];
        setSelectedWeight(defaultW);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => setReviews(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!product?.category) return;
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const sameCategory = list.filter(
          (p: Product) => p.category === product.category && p.id !== product.id
        );
        setRelatedProducts(sameCategory.slice(0, 4));
      })
      .catch(() => {});
  }, [product?.id, product?.category]);

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
        (!weight || (i.selectedWeight && i.selectedWeight.weight === weight.weight && i.selectedWeight.weight_unit === weight.weight_unit))
    );
    return item?.quantity ?? 0;
  };

  const updateQuantity = (productId: number, qty: number, weight?: WeightOption) => {
    if (qty <= 0) dispatch({ type: "REMOVE_ITEM", payload: { productId, selectedWeight: weight } });
    else dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity: qty, selectedWeight: weight } });
  };

  const getStockStatus = (p: Product) => ({
    status: !p.in_stock || (p.stock_quantity ?? 0) === 0 ? "out" : "in",
    label: "",
    color: "",
    icon: () => null,
  });

  const handleBuyNow = () => {
    if (!product) return;
    const w = selectedWeight ?? product.weightOptions?.[0];
    dispatch({
      type: "ADD_ITEM",
      payload: { product, quantity, selectedWeight: w },
    });
    router.push("/checkout");
  };

  const handleAddToCart = () => {
    if (!product) return;
    const w = selectedWeight ?? product.weightOptions?.[0];
    dispatch({
      type: "ADD_ITEM",
      payload: { product, quantity, selectedWeight: w },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse bg-white rounded-card h-96" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Product not found.</p>
          <Link href="/#products" className="text-brand-red font-medium hover:underline">
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  const isWholeChicken = product.name.toLowerCase().includes("whole chicken");
  const activeWeight = isWholeChicken ? undefined : selectedWeight;
  const currentPrice = isWholeChicken
    ? Number(product.price)
    : Number(activeWeight?.price ?? product.price);
  const baseOriginal = Number((product as { original_price?: number }).original_price ?? product.price);
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
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain object-center"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  🍗
                </div>
              )}
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
              <span className="text-2xl font-bold text-brand-red">
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

            {!isWholeChicken && product.weightOptions && product.weightOptions.length > 1 && (
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
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-button bg-brand-red hover:bg-brand-red-hover text-white min-w-[44px] min-h-[44px]"
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
                Perfect for curries, grills, and traditional recipes. Store in the refrigerator and use within 1–2 days for best quality.
              </p>
              <Link
                href="/recipes"
                className="inline-flex items-center gap-2 text-brand-red font-medium hover:underline"
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
