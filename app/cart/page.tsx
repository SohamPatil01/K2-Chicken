"use client";

import { useCart, WeightOption, Product } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  ShoppingCart,
  Package,
  Shield,
  Truck,
  CheckCircle,
  Heart,
  Clock,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import CartItem from "@/components/CartItem";

// Recommendation Card Component
function RecommendationCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (product: Product, weight?: WeightOption) => void;
}) {
  const defaultWeight =
    product.weightOptions?.find((w) => w.is_default) ||
    product.weightOptions?.[0];
  const [selectedWeight, setSelectedWeight] = useState<
    WeightOption | undefined
  >(defaultWeight);

  // Calculate pricing
  const baseProductPrice = Number(product.price);
  const baseOriginalPrice = Number(
    (product as any).original_price || product.price
  );
  const hasDiscount = baseOriginalPrice > baseProductPrice;
  const discountPercent = hasDiscount
    ? Math.round(
        ((baseOriginalPrice - baseProductPrice) / baseOriginalPrice) * 100
      )
    : 0;

  const currentPrice = Number(selectedWeight?.price || product.price);
  const referenceWeight =
    selectedWeight?.weight || defaultWeight?.weight || 1000;
  const originalPricePerGram = baseOriginalPrice / referenceWeight;
  const originalPriceForWeight = Math.round(
    originalPricePerGram * referenceWeight
  );
  const displayOriginalPrice = hasDiscount
    ? originalPriceForWeight
    : currentPrice;

  return (
    <div className="bg-white rounded-card shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-k2-saffron/40 group relative">
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-2 left-2 z-10 bg-brand-red text-white px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
          <Sparkles className="h-2.5 w-2.5" />
          <span>{discountPercent}% OFF</span>
        </div>
      )}

      <div className="relative h-28 bg-k2-cream-dark overflow-hidden border-b border-k2-paper">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl">🍗</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-k2-green-deep mb-2 line-clamp-2 text-sm">
          {product.name}
        </h3>

        {/* Weight Options */}
        {product.weightOptions && product.weightOptions.length > 0 && (
          <div className="mb-3">
            {product.weightOptions.length > 1 ? (
              <>
                <p className="text-xs text-[#5a6a61] mb-1.5 font-medium">
                  Select Weight:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.weightOptions &&
                    Array.isArray(product.weightOptions) &&
                    product.weightOptions.length > 0 &&
                    product.weightOptions.map((weight) => (
                      <button
                        key={weight.id || weight.weight}
                        onClick={() => setSelectedWeight(weight)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${
                          selectedWeight?.weight === weight.weight
                            ? "bg-brand-red text-white"
                            : "bg-white text-k2-ink border border-k2-paper hover:border-k2-paper"
                        }`}
                      >
                        {weight.weight}
                        {weight.weight_unit}
                      </button>
                    ))}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 mb-2">
                <Package className="w-3 h-3 text-[#7b877f]" />
                <span className="text-xs text-[#5a6a61] font-medium">
                  {selectedWeight?.weight || defaultWeight?.weight}
                  {selectedWeight?.weight_unit || defaultWeight?.weight_unit}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-center justify-between">
          <div>
            {hasDiscount && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-[#7b877f] line-through">
                  ₹{displayOriginalPrice.toFixed(0)}
                </span>
                <span className="text-xs bg-red-100 text-k2-saffron-hot px-1.5 py-0.5 rounded font-semibold">
                  {discountPercent}% OFF
                </span>
              </div>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-k2-green-deep">
                ₹{currentPrice.toFixed(0)}
              </span>
              {selectedWeight && (
                <span className="text-xs text-[#7b877f]">
                  / {selectedWeight.weight}
                  {selectedWeight.weight_unit}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => onAdd(product, selectedWeight)}
            className="px-4 py-2 bg-brand-red hover:bg-brand-red-hover text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { state, dispatch } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [favoriteOrders, setFavoriteOrders] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Staggered animation for cart items
    if (state.items.length > 0) {
      const timeouts: NodeJS.Timeout[] = [];
      state.items.forEach((item, index) => {
        const itemKey = `${item.product.id}-${
          item.selectedWeight?.weight ?? "default"
        }-${item.selectedWeight?.id ?? "base"}`;
        const timeout = setTimeout(() => {
          setVisibleItems((prev) => new Set(prev).add(itemKey));
        }, index * 100);
        timeouts.push(timeout);
      });

      return () => {
        timeouts.forEach((timeout) => clearTimeout(timeout));
      };
    }
  }, [state.items]);

  // Fetch recommendations
  useEffect(() => {
    if (state.items.length > 0) {
      fetchRecommendations();
    }
  }, [state.items]);

  // Fetch favorite orders
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchFavoriteOrders();
    }
  }, [isAuthenticated, user]);

  const fetchRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      // Get product IDs from cart
      const cartProductIds = state.items.map((item) => item.product.id);

      // Fetch all products
      const response = await fetch("/api/products");
      if (response.ok) {
        const allProducts = await response.json();
        if (!Array.isArray(allProducts)) {
          setRecommendations([]);
          return;
        }

        // Filter out products already in cart
        const recommended = allProducts
          .filter(
            (p: Product) => !cartProductIds.includes(p.id) && p.is_available
          )
          .slice(0, 6); // Get top 6 recommendations

        setRecommendations(recommended);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const fetchFavoriteOrders = async () => {
    setLoadingFavorites(true);
    try {
      const params = new URLSearchParams();
      if (user?.id) params.append("user_id", user.id.toString());
      if (user?.phone) params.append("phone", user.phone);

      const response = await fetch(`/api/orders/favorites?${params}`);
      if (response.ok) {
        const favorites = await response.json();
        setFavoriteOrders(favorites);
      }
    } catch (error) {
      console.error("Error fetching favorite orders:", error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const handleQuickReorder = async (order: any) => {
    if (!order.items || order.items.length === 0) return;

    try {
      // Fetch current product details
      const productIds = order.items
        .map((item: any) => item.product_id)
        .filter(Boolean);
      if (productIds.length === 0) return;

      const response = await fetch(`/api/products?ids=${productIds.join(",")}`);
      if (!response.ok) return;

      const products = await response.json();
      if (!Array.isArray(products)) return;
      const productMap = new Map(products.map((p: Product) => [p.id, p]));

      // Add items to cart
      for (const item of order.items) {
        const product = productMap.get(item.product_id) as Product | undefined;
        if (product && product.is_available !== false) {
          const defaultWeight =
            product.weightOptions?.find((w) => w.is_default) ||
            product.weightOptions?.[0];
          dispatch({
            type: "ADD_ITEM",
            payload: {
              product,
              quantity: item.quantity,
              selectedWeight: defaultWeight,
            },
          });
        }
      }

      // Scroll to top of cart
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error reordering:", error);
    }
  };

  const handleAddRecommendation = (
    product: Product,
    selectedWeight?: WeightOption
  ) => {
    const weightToUse =
      selectedWeight ||
      product.weightOptions?.find((w) => w.is_default) ||
      product.weightOptions?.[0];
    dispatch({
      type: "ADD_ITEM",
      payload: {
        product,
        quantity: 1,
        selectedWeight: weightToUse,
      },
    });
  };

  const updateQuantity = (
    productId: number,
    quantity: number,
    selectedWeight?: WeightOption
  ) => {
    if (quantity <= 0) {
      dispatch({ type: "REMOVE_ITEM", payload: { productId, selectedWeight } });
    } else {
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { productId, quantity, selectedWeight },
      });
    }
  };

  const removeItem = (productId: number, selectedWeight?: WeightOption) => {
    dispatch({ type: "REMOVE_ITEM", payload: { productId, selectedWeight } });
  };

  const clearCart = () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      dispatch({ type: "CLEAR_CART" });
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="k2-page py-20">
        <div className="k2-wrap mx-auto max-w-2xl text-center">
          <ShoppingBag size={96} className="mx-auto mb-6 text-k2-ice" />
          <h1 className="k2-title mb-4">Your Cart is Empty</h1>
          <p className="mb-8 text-[#5a6a61]">
            Looks like you haven&apos;t added any delicious chicken to your cart
            yet! Let&apos;s fix that.
          </p>
          <Link href="/#products" className="btn-primary inline-flex items-center gap-2 rounded-pill px-8 py-4 font-semibold">
            Shop Fresh Cuts →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="k2-page py-8 sm:py-12 pb-24 sm:pb-20 md:pb-0 relative">
      <div className="k2-wrap relative z-10">
        {/* Header */}
        <div
          className={`mb-8 sm:mb-12 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-card border border-k2-paper bg-k2-ice">
                <ShoppingCart className="h-7 w-7 text-k2-green" />
              </div>
              <div>
                <h1 className="k2-title mb-1">
                  Your Cart
                </h1>
                <p className="text-[#5a6a61] text-sm sm:text-base flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  {state.items.length}{" "}
                  {state.items.length === 1 ? "item" : "items"} ready to
                  checkout
                </p>
              </div>
            </div>
            {state.items.length > 0 && (
              <button
                onClick={clearCart}
                className="flex items-center gap-2 px-4 py-2.5 text-k2-saffron-hot hover:text-k2-saffron-hot hover:bg-k2-cream-dark rounded-xl transition-all duration-300 font-medium text-sm transform hover:scale-105 active:scale-95 border border-k2-paper hover:border-k2-saffron/50"
              >
                <Trash2
                  size={18}
                  className="transition-transform duration-300 hover:rotate-12"
                />
                <span>Clear Cart</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item, index) => {
              const itemKey = `${item.product.id}-${
                item.selectedWeight?.weight ?? "default"
              }-${item.selectedWeight?.id ?? "base"}`;
              const isVisible = visibleItems.has(itemKey) || mounted;
              return (
                <div
                  key={itemKey}
                  className={isVisible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-8 scale-95"}
                  style={{ transition: "all 0.3s ease", transitionDelay: `${index * 100}ms` }}
                >
                  <CartItem
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                </div>
              );
            })}

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-brand-red" />
                  <h2 className="text-2xl font-semibold text-k2-green-deep">
                    You May Also Like
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                  {recommendations.map((product) => (
                    <RecommendationCard
                      key={product.id}
                      product={product}
                      onAdd={handleAddRecommendation}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Favorite Orders Section */}
            {isAuthenticated && favoriteOrders.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="w-6 h-6 text-k2-saffron-hot fill-red-600" />
                  <h2 className="text-2xl font-semibold text-k2-green-deep">
                    Your Favorite Orders
                  </h2>
                </div>
                <div className="space-y-3">
                  {favoriteOrders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-card shadow-sm hover:shadow-lg transition-all duration-300 border-2 border-k2-paper hover:border-k2-saffron/40 p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-k2-ink mb-1">
                            {order.order_name || `Order #${order.order_id}`}
                          </h3>
                          <p className="text-sm text-[#5a6a61]">
                            {order.items?.length || 0} items • ₹
                            {Number(order.total_amount || 0).toFixed(0)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleQuickReorder(order)}
                          className="px-4 py-2 bg-brand-red hover:bg-brand-red-hover text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Reorder
                        </button>
                      </div>
                      {order.items && order.items.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {order.items
                            .slice(0, 3)
                            .map((item: any, idx: number) => (
                              <span
                                key={idx}
                                className="text-xs bg-k2-cream-dark text-k2-ink px-2 py-1 rounded-lg"
                              >
                                {item.product_name} × {item.quantity}
                              </span>
                            ))}
                          {order.items.length > 3 && (
                            <span className="text-xs bg-k2-cream-dark text-k2-ink px-2 py-1 rounded-lg">
                              +{order.items.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <Link
                  href="/orders"
                  className="mt-4 inline-flex items-center gap-2 text-brand-red hover:text-brand-red font-semibold text-sm"
                >
                  View All Orders
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Order Summary - Sticky */}
          <div
            className={`lg:col-span-1 transition-all duration-700 ${
              mounted
                ? "opacity-100 translate-x-0 scale-100"
                : "opacity-0 translate-x-8 scale-95"
            }`}
            style={{ transitionDelay: "0.3s" }}
          >
            <div className="k2-card sticky top-8 overflow-hidden transition-shadow hover:shadow-card">
              <div className="k2-summary-header">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-k2-cream/15">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-xl font-semibold tracking-tight">
                    Order Summary
                  </h2>
                </div>
                <p className="flex items-center gap-2 text-sm text-k2-cream/90">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  {state.items.length}{" "}
                  {state.items.length === 1 ? "item" : "items"} in cart
                </p>
              </div>

              <div className="p-6">
                {/* Items Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b-2 border-k2-paper">
                  <p className="text-xs font-semibold text-[#7b877f] uppercase tracking-wide mb-3">
                    Order Details
                  </p>
                  {state.items.map((item, index) => {
                    const itemPrice =
                      item.selectedWeight?.price || item.product.price;
                    const totalPrice = Number(itemPrice) * item.quantity;
                    return (
                      <div
                        key={item.product.id}
                        className={`flex justify-between items-start p-3 bg-k2-cream rounded-xl transition-all duration-500 ${
                          mounted
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
                        }`}
                        style={{ transitionDelay: `${0.4 + index * 0.1}s` }}
                      >
                        <div className="flex-grow min-w-0 pr-2">
                          <p className="font-medium text-k2-ink truncate text-sm">
                            {item.product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {item.selectedWeight && (
                              <span className="text-xs text-[#7b877f] bg-white px-2 py-0.5 rounded">
                                {item.selectedWeight.weight}
                                {item.selectedWeight.weight_unit}
                              </span>
                            )}
                            <span className="text-xs text-[#7b877f]">
                              × {item.quantity}
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-k2-ink whitespace-nowrap text-sm">
                          ₹{totalPrice.toFixed(0)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Total */}
                <div className="mb-6 space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-base font-medium text-[#5a6a61]">
                      Subtotal
                    </span>
                    <span className="text-base font-semibold text-k2-ink">
                      ₹{state.total.toFixed(0)}
                    </span>
                  </div>
                  <div className="rounded-xl p-3 border border-k2-paper bg-k2-cream">
                    <p className="text-xs text-[#5a6a61] flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-[#7b877f] shrink-0" />
                      Delivery charges calculated at checkout
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t-2 border-k2-paper">
                    <span className="text-xl font-semibold text-k2-green-deep">
                      Total Amount
                    </span>
                    <span className="text-2xl sm:text-3xl font-bold text-k2-green-deep">
                      ₹{state.total.toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    className="btn-primary group flex min-h-[56px] w-full items-center justify-center gap-2 rounded-pill py-4 text-base font-bold sm:text-lg"
                  >
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href="/"
                    className="w-full flex items-center justify-center gap-2 text-k2-ink hover:text-k2-green-deep font-semibold py-3 px-6 rounded-card transition-all duration-300 hover:bg-k2-cream border-2 border-k2-paper hover:border-k2-paper transform hover:scale-[1.02] active:scale-95 group"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180 transition-transform duration-300 group-hover:-translate-x-1" />
                    <span>Continue Shopping</span>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t-2 border-k2-paper">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center gap-1.5 p-2 bg-k2-cream rounded-xl">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span className="text-xs font-semibold text-k2-ink">
                        Secure
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 p-2 bg-k2-cream rounded-xl">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <span className="text-xs font-semibold text-k2-ink">
                        Fast
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 p-2 bg-k2-cream rounded-xl">
                      <CheckCircle className="w-5 h-5 text-brand-red" />
                      <span className="text-xs font-semibold text-k2-ink">
                        Fresh
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
