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
  X,
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
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-orange-200 group relative">
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 shadow-md">
          <Sparkles className="h-2.5 w-2.5" />
          <span>{discountPercent}% OFF</span>
        </div>
      )}

      <div className="relative h-40 bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🍗</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
          {product.name}
        </h3>

        {/* Weight Options */}
        {product.weightOptions && product.weightOptions.length > 0 && (
          <div className="mb-3">
            {product.weightOptions.length > 1 ? (
              <>
                <p className="text-xs text-gray-600 mb-1.5 font-medium">
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
                            ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                <Package className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-600 font-medium">
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
                <span className="text-xs text-gray-500 line-through">
                  ₹{displayOriginalPrice.toFixed(0)}
                </span>
                <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">
                  {discountPercent}% OFF
                </span>
              </div>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-orange-600">
                ₹{currentPrice.toFixed(0)}
              </span>
              {selectedWeight && (
                <span className="text-xs text-gray-500">
                  / {selectedWeight.weight}
                  {selectedWeight.weight_unit}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => onAdd(product, selectedWeight)}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white text-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-1.5"
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div
              className={`relative inline-block mb-8 transition-all duration-700 ${
                mounted
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-90 translate-y-10"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <ShoppingBag
                size={120}
                className="relative text-gray-300 mx-auto animate-bounce"
                style={{ animationDuration: "3s" }}
              />
            </div>
            <h1
              className={`text-5xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent transition-all duration-700 ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.2s" }}
            >
              Your Cart is Empty
            </h1>
            <p
              className={`text-xl text-gray-600 mb-10 max-w-md mx-auto transition-all duration-700 ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.4s" }}
            >
              Looks like you haven't added any delicious chicken to your cart
              yet! Let's fix that.
            </p>
            <Link
              href="/"
              className={`inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.6s" }}
            >
              <Sparkles className="h-5 w-5" />
              <span>Start Shopping 🍗</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/20 to-white py-8 sm:py-12 pb-24 sm:pb-20 md:pb-0">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div
          className={`mb-8 sm:mb-12 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-1">
                  Your Cart
                </h1>
                <p className="text-gray-600 text-sm sm:text-base flex items-center gap-2">
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
                className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300 font-medium text-sm transform hover:scale-105 active:scale-95 border border-red-200 hover:border-red-300"
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
              const itemPrice =
                item.selectedWeight?.price || item.product.price;
              const totalPrice = Number(itemPrice) * item.quantity;
              const itemKey = `${item.product.id}-${
                item.selectedWeight?.weight ?? "default"
              }-${item.selectedWeight?.id ?? "base"}`;

              const isVisible = visibleItems.has(itemKey) || mounted;
              return (
                <div
                  key={itemKey}
                  className={`group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border-2 border-transparent hover:border-orange-200 ${
                    isVisible
                      ? "opacity-100 translate-x-0 scale-100"
                      : "opacity-0 -translate-x-8 scale-95"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex gap-5">
                      {/* Product Image */}
                      <div className="relative flex-shrink-0">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-100 group-hover:border-orange-300 transition-all duration-300 shadow-sm group-hover:shadow-md">
                          {item.product.image_url ? (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const fallback = e.currentTarget
                                  .nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-full ${
                              item.product.image_url ? "hidden" : "flex"
                            } items-center justify-center group-hover:scale-110 transition-transform duration-500`}
                          >
                            <span className="text-5xl">🍗</span>
                          </div>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-grow min-w-0">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-2">
                              {item.product.name}
                            </h3>
                            {item.selectedWeight && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 rounded-lg text-xs font-semibold mb-2 border border-orange-200">
                                <Package className="w-3 h-3" />
                                <span>
                                  {item.selectedWeight.weight}
                                  {item.selectedWeight.weight_unit}
                                </span>
                              </div>
                            )}
                            <div className="flex items-baseline gap-2 mb-3">
                              <span className="text-sm text-gray-500">
                                Unit Price:
                              </span>
                              <span className="text-lg font-bold text-orange-600">
                                ₹{Number(itemPrice).toFixed(0)}
                              </span>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() =>
                              removeItem(item.product.id, item.selectedWeight)
                            }
                            className="flex-shrink-0 p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 border border-transparent hover:border-red-200"
                            title="Remove item"
                          >
                            <X
                              size={20}
                              className="transition-transform duration-300 hover:rotate-90"
                            />
                          </button>
                        </div>

                        {/* Quantity Controls & Total */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-2xl p-1.5 border border-gray-200">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1,
                                  item.selectedWeight
                                )
                              }
                              className="w-10 h-10 flex items-center justify-center bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-110 active:scale-95"
                            >
                              <Minus size={18} />
                            </button>
                            <div className="w-14 text-center">
                              <span className="text-lg font-bold text-gray-900">
                                {item.quantity}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1,
                                  item.selectedWeight
                                )
                              }
                              className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 active:scale-95"
                            >
                              <Plus
                                size={18}
                                className="transition-transform duration-300 hover:rotate-90"
                              />
                            </button>
                          </div>

                          {/* Item Total */}
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1 font-medium">
                              Item Total
                            </p>
                            <p className="text-2xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                              ₹{totalPrice.toFixed(0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Save Cart for Later */}
            {state.items.length > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Save Cart for Later
                      </p>
                      <p className="text-sm text-gray-600">
                        Your cart is automatically saved and will persist across
                        sessions
                      </p>
                    </div>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            )}

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
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
                  <Heart className="w-6 h-6 text-red-600 fill-red-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your Favorite Orders
                  </h2>
                </div>
                <div className="space-y-3">
                  {favoriteOrders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border-2 border-gray-100 hover:border-orange-200 p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1">
                            {order.order_name || `Order #${order.order_id}`}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {order.items?.length || 0} items • ₹
                            {Number(order.total_amount || 0).toFixed(0)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleQuickReorder(order)}
                          className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2"
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
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg"
                              >
                                {item.product_name} × {item.quantity}
                              </span>
                            ))}
                          {order.items.length > 3 && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
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
                  className="mt-4 inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold text-sm"
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
            <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden sticky top-8 hover:shadow-2xl transition-all duration-300">
              {/* Summary Header */}
              <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-red-600 p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent)]"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-bold">Order Summary</h2>
                  </div>
                  <p className="text-orange-100 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {state.items.length}{" "}
                    {state.items.length === 1 ? "item" : "items"} in cart
                  </p>
                </div>
              </div>

              <div className="p-6">
                {/* Items Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b-2 border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Order Details
                  </p>
                  {state.items.map((item, index) => {
                    const itemPrice =
                      item.selectedWeight?.price || item.product.price;
                    const totalPrice = Number(itemPrice) * item.quantity;
                    return (
                      <div
                        key={item.product.id}
                        className={`flex justify-between items-start p-3 bg-gray-50 rounded-xl transition-all duration-500 ${
                          mounted
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
                        }`}
                        style={{ transitionDelay: `${0.4 + index * 0.1}s` }}
                      >
                        <div className="flex-grow min-w-0 pr-2">
                          <p className="font-semibold text-gray-900 truncate text-sm">
                            {item.product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {item.selectedWeight && (
                              <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">
                                {item.selectedWeight.weight}
                                {item.selectedWeight.weight_unit}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              × {item.quantity}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900 whitespace-nowrap text-sm">
                          ₹{totalPrice.toFixed(0)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Total */}
                <div className="mb-6 space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-base font-semibold text-gray-700">
                      Subtotal
                    </span>
                    <span className="text-base font-bold text-gray-900">
                      ₹{state.total.toFixed(0)}
                    </span>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 border border-orange-200">
                    <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                      <Truck className="w-3 h-3 text-orange-600" />
                      Delivery charges calculated at checkout
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200">
                    <span className="text-xl font-bold text-gray-900">
                      Total Amount
                    </span>
                    <span className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      ₹{state.total.toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-95 group"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href="/"
                    className="w-full flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 transform hover:scale-[1.02] active:scale-95 group"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180 transition-transform duration-300 group-hover:-translate-x-1" />
                    <span>Continue Shopping</span>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t-2 border-gray-100">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center gap-1.5 p-2 bg-gray-50 rounded-xl">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span className="text-xs font-semibold text-gray-700">
                        Secure
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 p-2 bg-gray-50 rounded-xl">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <span className="text-xs font-semibold text-gray-700">
                        Fast
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 p-2 bg-gray-50 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-orange-600" />
                      <span className="text-xs font-semibold text-gray-700">
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
