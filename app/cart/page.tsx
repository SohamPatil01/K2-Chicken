"use client";

import { useCart, WeightOption } from "@/context/CartContext";
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
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function CartPage() {
  const { state, dispatch } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
    // Staggered animation for cart items
    if (state.items.length > 0) {
      state.items.forEach((item, index) => {
        const itemKey = `${item.product.id}-${
          item.selectedWeight?.weight ?? "default"
        }-${item.selectedWeight?.id ?? "base"}`;
        setTimeout(() => {
          setVisibleItems((prev) => new Set(prev).add(itemKey));
        }, index * 100);
      });
    }
  }, [state.items]);

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
