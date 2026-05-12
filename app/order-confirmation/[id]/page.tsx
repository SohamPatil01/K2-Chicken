"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Printer,
  Package,
  Truck,
  Store,
  Calendar,
  Receipt,
  CreditCard,
  Wallet,
  ArrowRight,
  Sparkles,
  ChefHat,
  ShoppingBag,
  Home,
} from "lucide-react";

interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_type: string;
  subtotal?: number;
  delivery_charge?: number;
  discount_amount?: number;
  total_amount: number;
  payment_method?: string;
  status: string;
  estimated_delivery: string;
  created_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    console.log("useEffect triggered, params:", params);
    if (params.id) {
      console.log("Fetching order for ID:", params.id);
      fetchOrder(params.id as string);
      const cleanup = setupStatusStream(params.id as string);
      return cleanup;
    } else {
      console.log("No order ID found in params");
      setLoading(false);
    }
  }, [params.id]);

  const setupStatusStream = (orderId: string) => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(`/api/orders/${orderId}/status-stream`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Status update received:", data);
          if (data.status) {
            setCurrentStatus(data.status);
            // Update the order status in the state
            setOrder((prev) =>
              prev ? { ...prev, status: data.status } : null
            );
          }
        } catch (error) {
          console.error("Error parsing status update:", error);
        }
      };

      eventSource.onerror = (error) => {
        // Silently handle connection errors (browser extensions, network issues, etc.)
        if (eventSource) {
          try {
            eventSource.close();
          } catch (e) {
            // Ignore errors when closing
          }
        }
      };

      eventSource.onopen = () => {
        console.log("Status stream connected");
      };
    } catch (error) {
      console.error("Error setting up status stream:", error);
    }

    // Clean up on component unmount
    return () => {
      if (eventSource) {
        try {
          eventSource.close();
        } catch (e) {
          // Ignore errors when closing
        }
      }
    };
  };

  const fetchOrder = async (orderId: string) => {
    console.log("📋 Fetching order with ID:", orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      console.log("📡 Response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Order data received:", {
          id: data.id,
          status: data.status,
          total: data.total_amount,
          items: data.items?.length || 0,
        });
        setOrder(data);
        // Trigger animation after order is loaded
        setTimeout(() => {
          setShowAnimation(true);
          console.log("🎬 Animation triggered");
        }, 150);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          "❌ Failed to fetch order:",
          response.status,
          response.statusText,
          errorData
        );
        setOrder(null);
      }
    } catch (error) {
      console.error("❌ Error fetching order:", error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-red via-red-50 to-brand-red-hover py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-brand-red mx-auto"></div>
            <p className="mt-6 text-lg text-gray-600 font-medium">
              Loading order details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-red via-red-50 to-brand-red-hover py-16 flex items-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-brand-red-hover rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Order Not Found
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              The order you're looking for doesn't exist or has been removed.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r bg-brand-red text-white px-8 py-4 rounded-xl font-semibold hover:bg-brand-red-hover transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Home className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    // Parse the date string and format it in local timezone
    const date = new Date(dateString);
    // Use Indian timezone (IST) or local timezone
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "from-green-500 to-emerald-500";
      case "cancelled":
        return "from-red-500 to-rose-500";
      case "preparing":
        return "from-brand-red to-amber-500";
      case "ready":
      case "ready_for_pickup":
        return "from-blue-500 to-cyan-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      case "preparing":
        return "Preparing";
      case "ready":
        return "Ready";
      case "ready_for_pickup":
        return "Ready for Pickup";
      case "pending":
        return "Pending";
      case "received":
        return "Received";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const currentStatusDisplay = currentStatus || order.status;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-red via-red-50 to-brand-red-hover py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header with Subtle Animation */}
        <div className="text-center mb-8 sm:mb-10 no-print relative">
          {/* Subtle confetti particles */}
          {showAnimation && (
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              style={{ height: "200px" }}
            >
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full opacity-70"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    top: "0%",
                    backgroundColor: [
                      "#f97316",
                      "#ef4444",
                      "#22c55e",
                      "#eab308",
                      "#3b82f6",
                    ][Math.floor(Math.random() * 5)],
                    animation: `confetti-fall ${
                      1.5 + Math.random() * 1.5
                    }s ease-out forwards`,
                    animationDelay: `${Math.random() * 0.8}s`,
                  }}
                />
              ))}
            </div>
          )}

          <div
            className={`relative inline-block mb-5 transition-all duration-1000 ${
              showAnimation ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            {/* Animated background glow */}
            <div
              className={`absolute inset-0 bg-green-400 rounded-full blur-2xl transition-all duration-1000 ${
                showAnimation ? "opacity-30 scale-150" : "opacity-0 scale-100"
              }`}
            ></div>
            {/* Pulsing ring effects */}
            {showAnimation && (
              <>
                <div
                  className="absolute inset-0 border-2 border-green-300 rounded-full opacity-0 animate-ping"
                  style={{ animationDelay: "0.3s", animationDuration: "2s" }}
                ></div>
                <div
                  className="absolute inset-0 border-2 border-green-200 rounded-full opacity-0 animate-ping"
                  style={{ animationDelay: "0.6s", animationDuration: "2s" }}
                ></div>
              </>
            )}
            {/* Success icon with scale animation */}
            <div
              className={`relative inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full border-2 border-green-100 transition-all duration-700 ${
                showAnimation
                  ? "scale-100 rotate-0 animate-success-glow"
                  : "scale-0 rotate-180"
              }`}
            >
              <CheckCircle
                size={40}
                className={`text-green-500 transition-all duration-500 ${
                  showAnimation ? "scale-100 opacity-100" : "scale-0 opacity-0"
                }`}
                style={{ transitionDelay: "0.2s" }}
              />
            </div>
          </div>

          <h1
            className={`text-3xl sm:text-4xl font-bold text-gray-900 mb-3 transition-all duration-700 ${
              showAnimation
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "0.4s" }}
          >
            🎉 Order Placed Successfully!
          </h1>
          <p
            className={`text-lg sm:text-xl text-gray-700 max-w-xl mx-auto mb-3 font-semibold transition-all duration-700 ${
              showAnimation
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "0.6s" }}
          >
            {order
              ? `Your order #${order.id
                  .toString()
                  .padStart(6, "0")} has been confirmed`
              : "Your order has been confirmed"}
          </p>
          <p
            className={`text-base sm:text-lg text-gray-600 max-w-xl mx-auto mb-5 transition-all duration-700 ${
              showAnimation
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "0.7s" }}
          >
            Thank you for choosing K2 Chicken! Your order is being prepared with
            care.
          </p>
          {order.discount_amount && order.discount_amount > 0 && (
            <div
              className={`inline-flex items-center gap-2 bg-green-50 text-green-700 px-5 py-2.5 rounded-lg border border-green-200 shadow-md transition-all duration-700 ${
                showAnimation
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-90 translate-y-4"
              }`}
              style={{ transitionDelay: "0.8s" }}
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">
                You saved ₹{Number(order.discount_amount).toFixed(0)}!
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Order Info Card */}
          <div
            className={`bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] no-print ${
              showAnimation
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "1s" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-red-50 rounded-lg">
                <Receipt className="h-5 w-5 text-brand-red" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                Order Info
              </h2>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-red-50/50 rounded-lg border border-red-100">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Order Number
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  #{order.id}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1.5">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-xs font-medium text-gray-500">
                    Order Date
                  </p>
                </div>
                <p className="text-sm text-gray-700">
                  {formatDate(order.created_at)}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1.5">
                  <Clock className="h-4 w-4 text-brand-red" />
                  <p className="text-xs font-medium text-gray-500">
                    Estimated{" "}
                    {order.delivery_type === "pickup" ? "Pickup" : "Delivery"}
                  </p>
                </div>
                <p className="text-sm text-gray-700">
                  {formatDate(order.estimated_delivery)}
                </p>
              </div>

              <div
                className={`p-3 rounded-lg border ${
                  currentStatusDisplay === "delivered"
                    ? "bg-green-50 border-green-200"
                    : currentStatusDisplay === "preparing"
                    ? "bg-red-50 border-red-200"
                    : currentStatusDisplay === "ready" ||
                      currentStatusDisplay === "ready_for_pickup"
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Current Status
                </p>
                <p
                  className={`text-sm font-semibold ${
                    currentStatusDisplay === "delivered"
                      ? "text-green-700"
                      : currentStatusDisplay === "preparing"
                      ? "text-brand-red"
                      : currentStatusDisplay === "ready" ||
                        currentStatusDisplay === "ready_for_pickup"
                      ? "text-blue-700"
                      : "text-gray-700"
                  }`}
                >
                  {getStatusText(currentStatusDisplay)}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Info Card */}
          <div
            className={`bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] no-print ${
              showAnimation
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "1.2s" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div
                className={`p-2 rounded-lg ${
                  order.delivery_type === "pickup"
                    ? "bg-blue-50"
                    : "bg-purple-50"
                }`}
              >
                {order.delivery_type === "pickup" ? (
                  <Store className="h-5 w-5 text-blue-600" />
                ) : (
                  <Truck className="h-5 w-5 text-purple-600" />
                )}
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                {order.delivery_type === "pickup" ? "Pickup" : "Delivery"} Info
              </h2>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1.5">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p className="text-xs font-medium text-gray-500">
                    Contact Number
                  </p>
                </div>
                <p className="text-sm text-gray-700">{order.customer_phone}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1.5">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <p className="text-xs font-medium text-gray-500">
                    {order.delivery_type === "pickup"
                      ? "Pickup Location"
                      : "Delivery Address"}
                  </p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {order.delivery_type === "pickup"
                    ? "Shop No. 4, 24K Avenue, New DP Rd, Kolte Patil, Vishal Nagar, Pimple Nilakh, Pimpri-Chinchwad, Pune, Maharashtra 411027"
                    : order.delivery_address}
                </p>
              </div>

              {order.payment_method && (
                <div
                  className={`p-3 rounded-lg border ${
                    order.payment_method === "upi"
                      ? "bg-indigo-50 border-indigo-200"
                      : order.payment_method === "card"
                      ? "bg-blue-50 border-blue-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {order.payment_method === "upi" ? (
                      <CreditCard className="h-4 w-4 text-indigo-600" />
                    ) : order.payment_method === "card" ? (
                      <CreditCard className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Wallet className="h-4 w-4 text-green-600" />
                    )}
                    <p className="text-xs font-medium text-gray-500">
                      Payment Method
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold capitalize ${
                      order.payment_method === "upi"
                        ? "text-indigo-700"
                        : order.payment_method === "card"
                        ? "text-blue-700"
                        : "text-green-700"
                    }`}
                  >
                    {order.payment_method === "upi"
                      ? "UPI Payment"
                      : order.payment_method === "card"
                      ? "Card Payment"
                      : "Cash on Delivery"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Card */}
          <div
            className={`bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] ${
              showAnimation
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "1.4s" }}
          >
            <div className="flex items-center justify-between mb-5 no-print">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Order Summary
                </h2>
              </div>
              <button
                onClick={handlePrint}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300 transform hover:scale-110"
                title="Print Bill"
              >
                <Printer className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                {order.items &&
                  order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity} × ₹
                          {Number(item.price).toFixed(0)}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">
                        ₹{(Number(item.price) * item.quantity).toFixed(0)}
                      </p>
                    </div>
                  ))}
              </div>

              <div className="border-t border-gray-200 pt-3 space-y-2">
                {order.subtotal && order.subtotal !== order.total_amount && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">
                      ₹
                      {Number(
                        order.subtotal ||
                          order.total_amount -
                            (order.delivery_charge || 0) +
                            (order.discount_amount || 0)
                      ).toFixed(0)}
                    </span>
                  </div>
                )}
                {order.delivery_type === "delivery" &&
                  (order.delivery_charge || 0) > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Delivery Charge</span>
                      <span className="font-medium">
                        ₹{Number(order.delivery_charge || 0).toFixed(0)}
                      </span>
                    </div>
                  )}
                {order.delivery_type === "delivery" &&
                  (order.delivery_charge || 0) === 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Charge</span>
                      <span className="font-medium text-green-600">FREE</span>
                    </div>
                  )}
                {(order.discount_amount || 0) > 0 && (
                  <div className="flex justify-between items-center p-2.5 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-green-700 font-medium flex items-center gap-1.5 text-sm">
                      <Sparkles className="h-3.5 w-3.5" />
                      Discount
                    </span>
                    <span className="text-green-700 font-semibold">
                      -₹{Number(order.discount_amount || 0).toFixed(0)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                  <span className="text-base font-semibold text-gray-900">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-brand-red">
                    ₹{Number(order.total_amount).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Progress Timeline */}
        <div
          className={`bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6 no-print hover:shadow-md transition-all duration-300 ${
            showAnimation
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "1.6s" }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-brand-red" />
            Order Progress
          </h3>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200">
              <div
                className={`absolute top-0 left-0 w-full transition-all duration-500 ${
                  currentStatusDisplay === "delivered"
                    ? "bg-green-400 h-full"
                    : currentStatusDisplay === "ready" ||
                      currentStatusDisplay === "ready_for_pickup"
                    ? "bg-blue-400 h-3/4"
                    : currentStatusDisplay === "preparing"
                    ? "bg-red-50 h-1/2"
                    : "bg-gray-300 h-1/4"
                }`}
                style={{
                  height:
                    currentStatusDisplay === "delivered"
                      ? "100%"
                      : currentStatusDisplay === "ready" ||
                        currentStatusDisplay === "ready_for_pickup"
                      ? "75%"
                      : currentStatusDisplay === "preparing"
                      ? "50%"
                      : "25%",
                }}
              ></div>
            </div>

            <div className="space-y-6">
              {/* Step 1: Order Confirmed */}
              <div className="flex items-start gap-4 animate-slide-up stagger-1">
                <div
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 transform hover:scale-110 ${
                    currentStatusDisplay === "pending" ||
                    currentStatusDisplay === "received" ||
                    currentStatusDisplay === "preparing" ||
                    currentStatusDisplay === "ready" ||
                    currentStatusDisplay === "ready_for_pickup" ||
                    currentStatusDisplay === "delivered"
                      ? "bg-green-50 border-green-300"
                      : "bg-gray-100 border-gray-300"
                  }`}
                >
                  <CheckCircle
                    className={`h-6 w-6 transition-all duration-300 ${
                      currentStatusDisplay === "pending" ||
                      currentStatusDisplay === "received" ||
                      currentStatusDisplay === "preparing" ||
                      currentStatusDisplay === "ready" ||
                      currentStatusDisplay === "ready_for_pickup" ||
                      currentStatusDisplay === "delivered"
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">
                    Order Confirmed
                  </h4>
                  <p className="text-sm text-gray-600">
                    We've received your order and it's being processed
                  </p>
                </div>
              </div>

              {/* Step 2: Preparing */}
              <div className="flex items-start gap-4">
                <div
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    currentStatusDisplay === "preparing" ||
                    currentStatusDisplay === "ready" ||
                    currentStatusDisplay === "ready_for_pickup" ||
                    currentStatusDisplay === "delivered"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-100 border-gray-300"
                  }`}
                >
                  <ChefHat
                    className={`h-6 w-6 ${
                      currentStatusDisplay === "preparing" ||
                      currentStatusDisplay === "ready" ||
                      currentStatusDisplay === "ready_for_pickup" ||
                      currentStatusDisplay === "delivered"
                        ? "text-brand-red"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">
                    Preparing Your Order
                  </h4>
                  <p className="text-sm text-gray-600">
                    Our chefs are cooking your delicious chicken with care
                  </p>
                </div>
              </div>

              {/* Step 3: Ready */}
              <div className="flex items-start gap-4">
                <div
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    currentStatusDisplay === "ready" ||
                    currentStatusDisplay === "ready_for_pickup" ||
                    currentStatusDisplay === "delivered"
                      ? "bg-blue-50 border-blue-300"
                      : "bg-gray-100 border-gray-300"
                  }`}
                >
                  {order.delivery_type === "pickup" ? (
                    <Store
                      className={`h-6 w-6 ${
                        currentStatusDisplay === "ready" ||
                        currentStatusDisplay === "ready_for_pickup" ||
                        currentStatusDisplay === "delivered"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    />
                  ) : (
                    <Truck
                      className={`h-6 w-6 ${
                        currentStatusDisplay === "ready" ||
                        currentStatusDisplay === "ready_for_pickup" ||
                        currentStatusDisplay === "delivered"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">
                    {order.delivery_type === "pickup"
                      ? "Ready for Pickup"
                      : "Ready for Delivery"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {order.delivery_type === "pickup"
                      ? "Your order is ready! We'll call you when you can pick it up."
                      : "Your order is ready! We'll call you when it's out for delivery."}
                  </p>
                </div>
              </div>

              {/* Step 4: Delivered (if delivered) */}
              {currentStatusDisplay === "delivered" && (
                <div className="flex items-start gap-4">
                  <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 bg-green-50 border-green-300">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="text-base font-semibold text-gray-900 mb-1">
                      Delivered
                    </h4>
                    <p className="text-sm text-gray-600">
                      Enjoy your delicious meal! We hope you loved it 🍗
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Current Status Badge */}
          <div className="mt-6 pt-5 border-t border-gray-200">
            <div className="flex items-center justify-center">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
                  currentStatusDisplay === "delivered"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : currentStatusDisplay === "preparing"
                    ? "bg-red-50 border-red-200 text-brand-red"
                    : currentStatusDisplay === "ready" ||
                      currentStatusDisplay === "ready_for_pickup"
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-gray-50 border-gray-200 text-gray-700"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    currentStatusDisplay === "delivered"
                      ? "bg-green-500"
                      : currentStatusDisplay === "preparing"
                      ? "bg-brand-red"
                      : currentStatusDisplay === "ready" ||
                        currentStatusDisplay === "ready_for_pickup"
                      ? "bg-blue-500"
                      : "bg-gray-400"
                  }`}
                ></div>
                <span className="text-sm font-medium">
                  Status: {getStatusText(currentStatusDisplay)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-3 justify-center no-print ${
            showAnimation
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "1.8s" }}
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r bg-brand-red text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-red-hover transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Order More</span>
          </Link>
          <Link
            href="/orders"
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
          >
            <Receipt className="h-4 w-4" />
            <span>View All Orders</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
