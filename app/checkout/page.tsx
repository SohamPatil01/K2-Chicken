"use client";

// Note: This page intentionally uses client-side rendering because it requires:
// - Cart state (useCart hook)
// - Authentication state (useAuth hook)
// - Form state and user interactions
// - Router navigation (useRouter, useSearchParams)
// The "deopted into client-side rendering" warning is expected and harmless for this page.

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MessageCircle,
  MapPin,
  Tag,
  Check,
  X,
  Plus,
  Home,
  ArrowRight,
  User,
  Phone,
  Truck,
  Store,
  Sparkles,
  ShoppingBag,
  LogIn,
  CreditCard,
  Wallet,
  QrCode,
  Info,
  CheckCircle,
  Shield,
  Zap,
  Award,
  Receipt,
  AlertCircle,
} from "lucide-react";
import AddressMapPicker from "@/components/AddressMapPicker";
import { QRCodeSVG } from "qrcode.react";

interface SavedAddress {
  id: number;
  address: string;
  latitude?: number;
  longitude?: number;
  label: string;
  is_default: boolean;
}

export default function CheckoutPage() {
  const { state, dispatch } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [deliveryEnabled, setDeliveryEnabled] = useState<boolean>(true);
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">(
    "delivery"
  );
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    deliveryAddress: "",
    deliveryInstructions: "",
  });
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [distance, setDistance] = useState<number | null>(null);
  const [freeDeliveryRadius, setFreeDeliveryRadius] = useState<number>(5);
  const [calculatingDelivery, setCalculatingDelivery] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi" | "card">(
    "cash"
  );
  const [showUPIQR, setShowUPIQR] = useState(false);
  const [upiPaymentUrl, setUpiPaymentUrl] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const [orderTotalAmount, setOrderTotalAmount] = useState<number | null>(null);
  const [redirectingToOrder, setRedirectingToOrder] = useState<number | null>(
    null
  );
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [activePromotions, setActivePromotions] = useState<any[]>([]);
  const WHATSAPP_NUMBER = "8484978622";

  // Calculate subtotal (needed for promo code validation and calculations)
  const subtotal = state.total;

  // Calculate minimum order for free delivery (from delivery config)
  const MIN_ORDER_FOR_FREE_DELIVERY = 500; // ₹500 minimum order for free delivery
  const amountNeededForFreeDelivery = Math.max(
    0,
    MIN_ORDER_FOR_FREE_DELIVERY - subtotal
  );
  const qualifiesForFreeDelivery = subtotal >= MIN_ORDER_FOR_FREE_DELIVERY;

  // Load saved addresses and order history if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSavedAddresses();
      fetchOrderHistory();
      setFormData((prev) => ({
        ...prev,
        customerName: user.name || "",
        customerPhone: user.phone,
      }));
    }
  }, [isAuthenticated, user]);

  // Fetch suggested products (products not in cart)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (state.items.length === 0) return;

      setLoadingSuggestions(true);
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const allProducts = await response.json();
          const cartProductIds = new Set(
            state.items.map((item) => item.product.id)
          );

          // Filter out products already in cart and get top 4 available products
          const suggestions = allProducts
            .filter(
              (p: any) =>
                p.is_available !== false &&
                !cartProductIds.has(p.id) &&
                p.in_stock !== false
            )
            .slice(0, 4);

          setSuggestedProducts(suggestions);
        }
      } catch (error) {
        console.error("Error fetching suggested products:", error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [state.items]);

  // Fetch active promotions/offers
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await fetch("/api/promotions?active=true");
        if (response.ok) {
          const promotions = await response.json();
          setActivePromotions(promotions);
        }
      } catch (error) {
        console.error("Error fetching promotions:", error);
      }
    };

    fetchPromotions();
  }, []);

  // Redirect to cart if empty (but not if we're redirecting to order confirmation)
  useEffect(() => {
    if (!authLoading && state.items.length === 0 && !redirectingToOrder) {
      router.push("/cart");
    }
  }, [state.items.length, authLoading, router, redirectingToOrder]);

  // Fetch order history to calculate loyalty discount and inaugural discount
  const fetchOrderHistory = async () => {
    try {
      const response = await fetch("/api/orders/my", {
        credentials: "include",
      });
      if (response.ok) {
        const orders = await response.json();
        setOrderCount(orders.length);

        // Apply inaugural discount: 10% for first order (0 orders)
        if (orders.length === 0) {
          setLoyaltyDiscount(10); // 10% inaugural discount for first-time customers
        } else if (orders.length >= 10) {
          setLoyaltyDiscount(10); // 10% discount for 10+ orders
        } else if (orders.length >= 3) {
          setLoyaltyDiscount(5); // 5% discount for 3+ orders
        }
      }
    } catch (error) {
      console.error("Error fetching order history:", error);
    }
  };

  const fetchSavedAddresses = async () => {
    try {
      const response = await fetch("/api/addresses");
      if (response.ok) {
        const addresses = await response.json();
        setSavedAddresses(addresses);
        const defaultAddress = addresses.find(
          (a: SavedAddress) => a.is_default
        );
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          setFormData((prev) => ({
            ...prev,
            deliveryAddress: defaultAddress.address,
          }));
          if (defaultAddress.latitude && defaultAddress.longitude) {
            setSelectedCoordinates({
              lat: defaultAddress.latitude,
              lng: defaultAddress.longitude,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const handleAddressSelect = (addressId: number) => {
    const address = savedAddresses.find((a) => a.id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      setFormData((prev) => ({ ...prev, deliveryAddress: address.address }));
      if (address.latitude && address.longitude) {
        setSelectedCoordinates({
          lat: address.latitude,
          lng: address.longitude,
        });
      }
    }
  };

  const saveNewAddress = async () => {
    if (!formData.deliveryAddress || !selectedCoordinates) return;

    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: formData.deliveryAddress,
          latitude: selectedCoordinates.lat,
          longitude: selectedCoordinates.lng,
          label: "Home",
          is_default: savedAddresses.length === 0,
        }),
      });

      if (response.ok) {
        await fetchSavedAddresses();
        setShowAddAddress(false);
      }
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset delivery charge when switching to pickup
  useEffect(() => {
    if (deliveryType === "pickup") {
      setDeliveryCharge(0);
      setDistance(null);
      setCalculatingDelivery(false);
    }
  }, [deliveryType]);

  // Calculate delivery charge when delivery address or coordinates change
  useEffect(() => {
    if (
      deliveryType === "delivery" &&
      (formData.deliveryAddress.trim().length > 10 || selectedCoordinates)
    ) {
      const timer = setTimeout(async () => {
        setCalculatingDelivery(true);
        try {
          const response = await fetch("/api/delivery/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deliveryAddress: formData.deliveryAddress,
              coordinates: selectedCoordinates,
            }),
          });
          const data = await response.json();
          console.log("Delivery calculation response:", data);

          if (data.success) {
            // Round the delivery charge to ensure consistency
            const roundedCharge = Math.round(data.deliveryCharge || 0);
            setDeliveryCharge(roundedCharge);
            setDistance(data.distance);
            if (data.freeDeliveryRadius) {
              setFreeDeliveryRadius(data.freeDeliveryRadius);
            }
            // Update address if Google Maps provided a better formatted address
            if (
              data.formattedAddress &&
              data.formattedAddress !== formData.deliveryAddress
            ) {
              setFormData((prev) => ({
                ...prev,
                deliveryAddress: data.formattedAddress,
              }));
            }
          } else {
            console.warn(
              "Delivery calculation failed:",
              data.error || "Unknown error"
            );
            // Still set delivery charge to 0, but log the error
            setDeliveryCharge(0);
            setDistance(null);
          }
        } catch (error) {
          console.error("Error calculating delivery:", error);
          setDeliveryCharge(0);
          setDistance(null);
        } finally {
          setCalculatingDelivery(false);
        }
      }, 1000); // Debounce for 1 second
      return () => clearTimeout(timer);
    } else if (deliveryType === "pickup") {
      // Ensure delivery charge is 0 for pickup
      setDeliveryCharge(0);
      setDistance(null);
    }
  }, [formData.deliveryAddress, deliveryType, selectedCoordinates]);

  const handleMapAddressSelect = (
    address: string,
    coordinates: { lat: number; lng: number }
  ) => {
    setFormData((prev) => ({ ...prev, deliveryAddress: address }));
    setSelectedCoordinates(coordinates);
    setShowMapPicker(false);
  };

  // Calculate loyalty discount amount (needed for WhatsApp function)
  const loyaltyDiscountAmount =
    loyaltyDiscount > 0 ? (subtotal * loyaltyDiscount) / 100 : 0;
  // Total discount = promo discount + loyalty discount
  const totalDiscountAmount = discountAmount + loyaltyDiscountAmount;
  const totalWithDiscount = subtotal - totalDiscountAmount;
  // If free delivery promo is applied, delivery charge is 0
  // Also ensure delivery charge is 0 for pickup
  const finalDeliveryChargeCalc =
    deliveryType === "delivery"
      ? appliedPromo?.discount_type === "free_delivery"
        ? 0
        : Math.round(deliveryCharge || 0)
      : 0;
  const totalWithDelivery = Math.max(
    0,
    Math.round(totalWithDiscount + finalDeliveryChargeCalc)
  );

  const handleWhatsAppOrder = () => {
    const orderItems = state.items
      .map((item) => {
        const weightInfo = item.selectedWeight
          ? ` (${item.selectedWeight.weight}${item.selectedWeight.weight_unit})`
          : "";
        const itemPrice = item.selectedWeight?.price || item.product.price;
        return `${item.product.name}${weightInfo} x${item.quantity} - ₹${(
          Number(itemPrice) * item.quantity
        ).toFixed(0)}`;
      })
      .join("\n");

    const subtotal = state.total.toFixed(0);
    const finalDeliveryCharge =
      deliveryType === "delivery"
        ? appliedPromo?.discount_type === "free_delivery"
          ? 0
          : deliveryCharge
        : 0;
    const total = totalWithDelivery.toFixed(0);
    const discountInfo =
      discountAmount > 0
        ? `\n*Discount (${
            appliedPromo?.promo_code
          }):* -₹${discountAmount.toFixed(0)}`
        : "";
    const loyaltyDiscountInfo =
      loyaltyDiscountAmount > 0
        ? `\n*Loyalty Discount:* -₹${loyaltyDiscountAmount.toFixed(0)}`
        : "";
    const deliveryInfo =
      deliveryType === "delivery"
        ? `\n*Delivery Address:* ${
            formData.deliveryAddress || selectedCoordinates
              ? formData.deliveryAddress ||
                `${selectedCoordinates?.lat}, ${selectedCoordinates?.lng}`
              : "To be provided"
          }${
            selectedCoordinates
              ? `\n*Coordinates:* ${selectedCoordinates.lat}, ${selectedCoordinates.lng}`
              : ""
          }${
            formData.deliveryInstructions
              ? `\n*Delivery Instructions:* ${formData.deliveryInstructions}`
              : ""
          }\n*Delivery Charge:* ₹${finalDeliveryCharge}${
            appliedPromo?.discount_type === "free_delivery"
              ? " (FREE - Promo Applied)"
              : ""
          }`
        : "\n*Order Type:* Pickup\n*Pickup Location:* K2 Chicken Store";

    // Use authenticated user data if available, otherwise use form data
    const customerName =
      user?.name || formData.customerName || "To be provided";
    const customerPhone =
      user?.phone || formData.customerPhone || "To be provided";

    const message = encodeURIComponent(
      `🍗 *Order from K2 Chicken*\n\n` +
        `*Customer Details:*\n` +
        `Name: ${customerName}\n` +
        `Phone: ${customerPhone}\n\n` +
        `*Order Details:*\n${orderItems}\n\n` +
        `*Subtotal:* ₹${subtotal}${discountInfo}${loyaltyDiscountInfo}${deliveryInfo}\n\n` +
        `*Total Amount:* ₹${total}\n\n` +
        `*Payment Method:* ${
          paymentMethod === "cash"
            ? "Cash on Delivery"
            : paymentMethod === "upi"
            ? "UPI"
            : "Card"
        }\n\n` +
        `Please confirm this order.`
    );

    const whatsappUrl = `https://wa.me/91${WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  // Use calculated values (already defined above)
  const finalDeliveryCharge = finalDeliveryChargeCalc;

  const handleApplyPromoCode = async (codeToApply?: string) => {
    const code = codeToApply || promoCode.trim();
    if (!code) {
      setPromoError("Please enter a promo code");
      return;
    }

    setValidatingPromo(true);
    setPromoError("");

    try {
      const response = await fetch("/api/promotions/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promoCode: code.toUpperCase(),
          subtotal: subtotal,
          deliveryCharge: finalDeliveryCharge,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setAppliedPromo(data.promotion);
        setDiscountAmount(data.discountAmount);
        setPromoCode(code.toUpperCase());
        setPromoError("");
        // Remove promo from URL after successful application
        if (codeToApply) {
          const url = new URL(window.location.href);
          url.searchParams.delete("promo");
          router.replace(url.pathname + url.search, { scroll: false });
        }
      } else {
        setAppliedPromo(null);
        setDiscountAmount(0);
        setPromoError(data.error || "Invalid promo code");
      }
    } catch (error) {
      console.error("Error validating promo code:", error);
      setPromoError("Failed to validate promo code. Please try again.");
      setAppliedPromo(null);
      setDiscountAmount(0);
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromoCode = () => {
    setPromoCode("");
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoError("");
  };

  // Check for promo code in URL and auto-apply it (moved after handleApplyPromoCode is defined)
  useEffect(() => {
    const promoFromUrl = searchParams.get("promo");
    if (promoFromUrl && !appliedPromo && !promoCode && subtotal > 0) {
      // Set the promo code and apply it
      setPromoCode(promoFromUrl.toUpperCase());
      // Auto-apply after a short delay to ensure state is updated
      const timer = setTimeout(() => {
        handleApplyPromoCode(promoFromUrl);
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, subtotal, appliedPromo, promoCode]);

  // Generate UPI payment URL with customer details
  const generateUPIUrl = (
    orderId: number,
    customerName: string,
    total: number
  ) => {
    // Ensure total is a valid number and round it to match bill display (no decimals)
    const orderTotal = Math.round(parseFloat(String(total)) || 0);

    const timestamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Create order summary
    const orderItems = state.items
      .map((item) => {
        const weightInfo = item.selectedWeight
          ? ` (${item.selectedWeight.weight}${item.selectedWeight.weight_unit})`
          : "";
        return `${item.product.name}${weightInfo} x${item.quantity}`;
      })
      .join(", ");

    // UPI payment URL format: upi://pay?pa=UPI_ID&pn=PAYEE_NAME&am=AMOUNT&cu=INR&tn=TRANSACTION_NOTE
    // Get UPI ID from environment variable - set NEXT_PUBLIC_UPI_ID in .env.local
    const upiId = process.env.NEXT_PUBLIC_UPI_ID;
    if (!upiId) {
      console.warn(
        "NEXT_PUBLIC_UPI_ID is not set in environment variables. UPI payments will not work."
      );
      // Return a placeholder URL that won't work but won't crash the app
      return `upi://pay?pa=SET_UPI_ID@paytm&pn=${encodeURIComponent(
        "K2 Chicken"
      )}&am=${orderTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
        `Order #${orderId} - ${customerName}`
      )}`;
    }
    const payeeName = "K2 Chicken";
    // UPI amount must be formatted with exactly 2 decimal places (even if rounded to whole number)
    const amount = orderTotal.toFixed(2);

    // Transaction note with customer name, order details, and timestamp
    const transactionNote = `Order #${orderId} - ${customerName} - ${orderItems} - ${timestamp}`;

    // Encode the transaction note
    const encodedNote = encodeURIComponent(transactionNote);

    // Generate UPI URL
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
      payeeName
    )}&am=${amount}&cu=INR&tn=${encodedNote}`;

    return upiUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission if delivery is disabled but user selected delivery
    if (!deliveryEnabled && deliveryType === "delivery") {
      alert(
        "Delivery service is currently unavailable. Please select pickup instead."
      );
      setDeliveryType("pickup");
      return;
    }

    // Validate cart is not empty
    if (state.items.length === 0) {
      alert("Your cart is empty. Please add items before placing an order.");
      router.push("/");
      return;
    }

    // Require login before placing order
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
      return;
    }

    // Validate required fields
    if (!formData.customerName || !formData.customerName.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!formData.customerPhone || !formData.customerPhone.trim()) {
      alert("Please enter your phone number");
      return;
    }

    if (
      deliveryType === "delivery" &&
      (!formData.deliveryAddress || !formData.deliveryAddress.trim())
    ) {
      alert("Please enter your delivery address");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        ...formData,
        deliveryType: deliveryType,
        items: state.items,
        subtotal: subtotal,
        discountAmount: totalDiscountAmount,
        loyaltyDiscount: loyaltyDiscountAmount,
        promoCode: appliedPromo?.promo_code || null,
        deliveryCharge: finalDeliveryCharge,
        total: totalWithDelivery,
        paymentMethod: paymentMethod,
      };

      console.log("Placing order with payload:", orderPayload);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify(orderPayload),
      });

      console.log("Order API response status:", response.status);

      if (response.ok) {
        const order = await response.json();

        // If UPI payment, show QR code with actual order ID (only once during checkout)
        if (paymentMethod === "upi") {
          // Use the order's total_amount from the server response and round it to match bill display
          const orderTotal = Math.round(
            parseFloat(order.total_amount || order.total || totalWithDelivery)
          );
          setOrderTotalAmount(orderTotal); // Store the rounded order total
          const upiUrl = generateUPIUrl(
            order.id,
            formData.customerName || user?.name || "Customer",
            orderTotal
          );
          setCurrentOrderId(order.id); // Store the actual order ID
          setUpiPaymentUrl(upiUrl);
          setShowUPIQR(true);
          setIsSubmitting(false);
          return;
        }

        // For other payment methods, redirect to order confirmation page
        console.log("✅ Order placed successfully! Order ID:", order.id);
        console.log("📦 Order details:", {
          id: order.id,
          total: order.total_amount,
          status: order.status,
          items: order.items?.length || 0,
        });

        // Set redirecting flag BEFORE clearing cart to prevent empty cart UI and useEffect redirect
        setRedirectingToOrder(order.id);
        setIsSubmitting(false);

        // Redirect immediately to order confirmation page BEFORE clearing cart
        console.log("🔄 Redirecting to order confirmation page...");
        router.replace(`/order-confirmation/${order.id}`);

        // Clear cart AFTER redirect (with small delay to ensure redirect happens first)
        setTimeout(() => {
          dispatch({ type: "CLEAR_CART" });
        }, 100);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Order API error response:", errorData);

        // Handle delivery disabled error specifically
        if (
          errorData.code === "DELIVERY_DISABLED" ||
          errorData.error?.includes("Delivery service is currently unavailable")
        ) {
          alert(
            "Delivery service is currently unavailable. Please select pickup instead."
          );
          setDeliveryType("pickup");
          setIsSubmitting(false);
          return;
        }

        const errorMessage =
          errorData.details || errorData.error || "Failed to place order";
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("Error placing order:", error);
      console.error("Error details:", error);
      alert(error.message || "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle UPI payment confirmation (after user has paid)
  const handleUPIPaymentConfirm = async () => {
    console.log("✅ UPI payment confirmed. Order ID:", currentOrderId);
    setShowUPIQR(false);
    setUpiPaymentUrl("");
    // Set redirecting flag BEFORE clearing cart
    if (currentOrderId) {
      setRedirectingToOrder(currentOrderId);
      console.log("🔄 Redirecting to order confirmation page for UPI order...");
      // Redirect BEFORE clearing cart
      router.replace(`/order-confirmation/${currentOrderId}`);
      // Clear cart AFTER redirect (with small delay to ensure redirect happens first)
      setTimeout(() => {
        dispatch({ type: "CLEAR_CART" });
      }, 100);
    } else {
      console.warn("⚠️ No order ID found, redirecting to orders page");
      router.replace("/orders");
      setTimeout(() => {
        dispatch({ type: "CLEAR_CART" });
      }, 100);
    }
  };

  // Don't show empty cart if we're redirecting to order confirmation
  if (state.items.length === 0 && !redirectingToOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <ShoppingBag
                size={120}
                className="relative text-gray-300 mx-auto"
              />
            </div>
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Your Cart is Empty
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-md mx-auto">
              You need to add some delicious chicken to your cart first!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <Sparkles className="h-5 w-5" />
              <span>Start Shopping </span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 py-6 sm:py-8 md:py-12 pb-24 sm:pb-20 md:pb-0 relative">
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center animate-scale-in">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Placing Your Order
            </h3>
            <p className="text-gray-600 mb-4">
              Please wait while we process your order...
            </p>
            <div className="flex items-center justify-center gap-2">
              <div
                className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"
                style={{ animationDelay: "0s" }}
              ></div>
              <div
                className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8 animate-slide-down">
          <div className="relative inline-block mb-2 sm:mb-3">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full blur-3xl opacity-30"></div>
            <h1 className="relative text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-1 sm:mb-2">
              Checkout{" "}
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Details
              </span>
            </h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg animate-slide-up stagger-1">
            Complete your order in just a few steps
          </p>
        </div>

        {/* Login Prompt */}
        {!authLoading && !isAuthenticated && (
          <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6 animate-scale-in stagger-1 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 animate-bounce-in">
                <div className="p-3 bg-white rounded-full shadow-md">
                  <User className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Login Required to Place Order
                </h3>
                <p className="text-gray-700 mb-4">
                  Please login or create an account to place your order. As a
                  registered customer, you'll get:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>
                      Automatic discounts on repeat orders (5% after 3 orders,
                      10% after 10 orders)
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Access to your order history</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Save delivery addresses for faster checkout</span>
                  </li>
                </ul>
                <Link
                  href="/login?redirect=/checkout"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <LogIn className="h-5 w-5" />
                  Login or Register
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Offers Section - Subtle and Animated */}
        {(deliveryType === "delivery" || activePromotions.length > 0) && (
          <div className="mb-6 animate-fade-in">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="bg-gray-50/50 px-5 py-3.5 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-orange-100 rounded-lg">
                    <Tag className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-800">
                      Available Offers
                    </h2>
                    <p className="text-xs text-gray-500">
                      Save more on your order
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2.5">
                {/* Free Delivery Offer */}
                {deliveryType === "delivery" &&
                  !qualifiesForFreeDelivery &&
                  amountNeededForFreeDelivery > 0 && (
                    <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-3.5 hover:bg-orange-50 transition-all duration-300 animate-slide-in">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                          <Truck className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-sm mb-0.5">
                            Free Delivery Available
                          </h3>
                          <p className="text-xs text-gray-600 mb-2.5">
                            Add{" "}
                            <span className="font-semibold text-orange-600">
                              ₹{amountNeededForFreeDelivery.toFixed(0)}
                            </span>{" "}
                            more
                          </p>
                          {loadingSuggestions ? (
                            <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-500">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                              Loading suggestions...
                            </div>
                          ) : suggestedProducts.length > 0 ? (
                            <div className="space-y-1.5">
                              {suggestedProducts
                                .slice(0, 2)
                                .map((product, idx) => {
                                  const productPrice =
                                    Number(product.price) || 0;
                                  const willQualify =
                                    subtotal + productPrice >=
                                    MIN_ORDER_FOR_FREE_DELIVERY;
                                  return (
                                    <button
                                      key={product.id}
                                      type="button"
                                      onClick={() => {
                                        dispatch({
                                          type: "ADD_ITEM",
                                          payload: {
                                            product,
                                            quantity: 1,
                                          },
                                        });
                                      }}
                                      className="w-full flex items-center gap-2.5 p-2.5 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all duration-200 group animate-fade-in"
                                      style={{
                                        animationDelay: `${idx * 100}ms`,
                                      }}
                                    >
                                      {product.image_url ? (
                                        <img
                                          src={product.image_url}
                                          alt={product.name}
                                          className="w-10 h-10 rounded-md object-contain flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
                                        />
                                      ) : (
                                        <div className="w-10 h-10 rounded-md bg-orange-50 flex items-center justify-center flex-shrink-0">
                                          <span className="text-lg">🍗</span>
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0 text-left">
                                        <p className="text-xs font-medium text-gray-800 truncate group-hover:text-orange-600 transition-colors">
                                          {product.name}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                          <p className="text-xs font-semibold text-orange-600">
                                            ₹{productPrice.toFixed(0)}
                                          </p>
                                          {willQualify && (
                                            <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-medium">
                                              ✓ Free delivery
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex-shrink-0 p-1.5 bg-orange-50 rounded-md group-hover:bg-orange-100 transition-colors">
                                        <Plus className="h-3.5 w-3.5 text-orange-600 group-hover:rotate-90 transition-transform duration-200" />
                                      </div>
                                    </button>
                                  );
                                })}
                              <Link
                                href="/#products"
                                className="block text-center text-xs text-orange-600 hover:text-orange-700 font-medium py-1 mt-1.5 transition-colors"
                              >
                                View all →
                              </Link>
                            </div>
                          ) : (
                            <Link
                              href="/#products"
                              className="block text-center text-sm text-orange-600 hover:text-orange-700 font-semibold bg-white px-3 py-2 rounded-lg border border-orange-200 hover:border-orange-400 transition-all"
                            >
                              Browse Products →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                {/* Active Promotions from Database */}
                {activePromotions.map((promo, idx) => {
                  // Skip if it's already applied
                  if (appliedPromo?.id === promo.id) return null;

                  return (
                    <div
                      key={promo.id}
                      className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 hover:bg-blue-50 transition-all duration-300 animate-slide-in"
                      style={{ animationDelay: `${(idx + 1) * 100}ms` }}
                    >
                      <div className="flex items-start gap-2.5">
                        {promo.image_url ? (
                          <img
                            src={promo.image_url}
                            alt={promo.title}
                            className="w-12 h-12 rounded-md object-contain flex-shrink-0"
                          />
                        ) : (
                          <div className="p-2 bg-blue-100 rounded-md flex-shrink-0">
                            <Tag className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-sm mb-0.5">
                            {promo.title}
                          </h3>
                          {promo.description && (
                            <p className="text-xs text-gray-600 mb-2">
                              {promo.description}
                            </p>
                          )}
                          {promo.promo_code && (
                            <button
                              type="button"
                              onClick={() => {
                                setPromoCode(promo.promo_code);
                                handleApplyPromoCode(promo.promo_code);
                              }}
                              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-md font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                              Apply: {promo.promo_code}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Success Message for Free Delivery */}
                {deliveryType === "delivery" && qualifiesForFreeDelivery && (
                  <div className="bg-green-50/50 border border-green-100 rounded-lg p-3 animate-fade-in">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-green-100 rounded-md">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-800 text-sm">
                          Free Delivery Applied ✓
                        </h3>
                        <p className="text-xs text-green-700 mt-0.5">
                          Your order qualifies for free delivery
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
              {/* Form Header - More Subtle */}
              <div className="bg-gradient-to-br from-orange-50 via-white to-red-50 p-6 border-b border-gray-200/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200/60">
                    <ShoppingBag className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Order Details
                    </h2>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Complete your information to proceed
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Delivery Type Selection - Subtle Design */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Order Type
                  </label>
                  {!deliveryEnabled && (
                    <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <p className="text-sm font-semibold text-red-800">
                          Delivery service is currently unavailable. Please
                          select pickup.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`relative flex flex-col items-center justify-center p-5 border rounded-xl transition-all duration-200 ${
                        !deliveryEnabled
                          ? "border-gray-200 bg-gray-100/50 cursor-not-allowed opacity-50"
                          : deliveryType === "delivery"
                          ? "border-orange-400 bg-orange-50/50 shadow-sm cursor-pointer"
                          : "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-100/50 cursor-pointer"
                      }`}
                    >
                      <input
                        type="radio"
                        value="delivery"
                        checked={deliveryType === "delivery"}
                        onChange={(e) =>
                          deliveryEnabled &&
                          setDeliveryType(
                            e.target.value as "delivery" | "pickup"
                          )
                        }
                        disabled={!deliveryEnabled}
                        className="sr-only"
                      />
                      <Truck
                        className={`h-6 w-6 mb-2 transition-colors ${
                          !deliveryEnabled
                            ? "text-gray-400"
                            : deliveryType === "delivery"
                            ? "text-orange-600"
                            : "text-gray-400"
                        }`}
                      />
                      <div
                        className={`font-semibold text-sm transition-colors ${
                          !deliveryEnabled
                            ? "text-gray-500"
                            : deliveryType === "delivery"
                            ? "text-orange-600"
                            : "text-gray-700"
                        }`}
                      >
                        Delivery
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {!deliveryEnabled ? "Unavailable" : "30-45 min"}
                      </div>
                      {!deliveryEnabled && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <X className="h-8 w-8 text-red-500 opacity-75" />
                        </div>
                      )}
                    </label>

                    <label
                      className={`relative flex flex-col items-center justify-center p-5 border rounded-xl cursor-pointer transition-all duration-200 ${
                        deliveryType === "pickup"
                          ? "border-orange-400 bg-orange-50/50 shadow-sm"
                          : "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-100/50"
                      }`}
                    >
                      <input
                        type="radio"
                        value="pickup"
                        checked={deliveryType === "pickup"}
                        onChange={(e) =>
                          setDeliveryType(
                            e.target.value as "delivery" | "pickup"
                          )
                        }
                        className="sr-only"
                      />
                      <Store
                        className={`h-6 w-6 mb-2 transition-colors ${
                          deliveryType === "pickup"
                            ? "text-orange-600"
                            : "text-gray-400"
                        }`}
                      />
                      <div
                        className={`font-semibold text-sm transition-colors ${
                          deliveryType === "pickup"
                            ? "text-orange-600"
                            : "text-gray-700"
                        }`}
                      >
                        Pickup
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        15-20 min
                      </div>
                    </label>
                  </div>
                </div>

                {/* Customer Name */}
                <div>
                  <label
                    htmlFor="customerName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all duration-200 bg-white text-base placeholder:text-gray-400"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="customerPhone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="customerPhone"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all duration-200 bg-white placeholder:text-gray-400"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                {deliveryType === "delivery" && (
                  <>
                    {/* Saved Addresses */}
                    {isAuthenticated && savedAddresses.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Home className="inline h-4 w-4 mr-1" />
                          Saved Addresses
                        </label>
                        <select
                          value={selectedAddressId || ""}
                          onChange={(e) => {
                            const addressId = parseInt(e.target.value);
                            if (addressId) {
                              handleAddressSelect(addressId);
                            } else {
                              setSelectedAddressId(null);
                              setFormData((prev) => ({
                                ...prev,
                                deliveryAddress: "",
                              }));
                              setSelectedCoordinates(null);
                            }
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                        >
                          <option value="">Select a saved address</option>
                          {savedAddresses.map((address) => (
                            <option key={address.id} value={address.id}>
                              {address.label} -{" "}
                              {address.address.substring(0, 50)}...
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowAddAddress(true)}
                          className="mt-2 text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                        >
                          <Plus size={14} />
                          Add New Address
                        </button>
                      </div>
                    )}

                    {/* Address Input */}
                    <div>
                      <label
                        htmlFor="deliveryAddress"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        <MapPin className="inline h-4 w-4 mr-1" />
                        {isAuthenticated && savedAddresses.length > 0
                          ? "Or Enter New Address"
                          : "Delivery Address *"}
                      </label>
                      <div className="space-y-3">
                        <textarea
                          id="deliveryAddress"
                          name="deliveryAddress"
                          value={formData.deliveryAddress}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 resize-none"
                          placeholder="Enter your complete delivery address (street, area, landmark)"
                          required={!selectedAddressId}
                        />
                        <button
                          type="button"
                          onClick={() => setShowMapPicker(true)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 text-sm font-semibold"
                        >
                          <MapPin size={18} className="text-orange-600" />
                          <span>Pick Address on Map</span>
                        </button>
                        {isAuthenticated &&
                          formData.deliveryAddress &&
                          selectedCoordinates && (
                            <button
                              type="button"
                              onClick={saveNewAddress}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-all duration-200"
                            >
                              <Home size={16} />
                              <span>Save This Address</span>
                            </button>
                          )}
                      </div>
                      {calculatingDelivery && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                          <span>Calculating delivery charge...</span>
                        </div>
                      )}
                      {!calculatingDelivery && deliveryCharge > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                          <p className="text-sm text-gray-700">
                            <span className="text-orange-600 font-semibold">
                              Delivery charge: ₹{deliveryCharge}
                            </span>
                          </p>
                        </div>
                      )}
                      {!calculatingDelivery &&
                        deliveryCharge === 0 &&
                        distance !== null && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                            <p className="text-sm text-green-700 font-semibold flex items-center gap-2">
                              <Check size={16} />
                              Free delivery within service area!
                            </p>
                          </div>
                        )}
                    </div>
                  </>
                )}

                {/* Delivery Instructions */}
                {deliveryType === "delivery" && (
                  <div>
                    <label
                      htmlFor="deliveryInstructions"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      <Info className="inline h-4 w-4 mr-1" />
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      id="deliveryInstructions"
                      name="deliveryInstructions"
                      value={formData.deliveryInstructions}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 resize-none"
                      placeholder="Add special instructions for delivery (e.g., Gate code: A123, Floor: 3rd, Landmark: Near blue building, Call before delivery, etc.)"
                      maxLength={200}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Help our delivery team find you easily
                    </p>
                  </div>
                )}

                {deliveryType === "pickup" && (
                  <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Store className="h-6 w-6 text-orange-600" />
                      <h3 className="font-bold text-gray-900 text-lg">
                        Pickup Information
                      </h3>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Store Address:</strong> Shop No. 4, 24K Avenue,
                      New DP Rd, Kolte Patil, Vishal Nagar, Pimple Nilakh,
                      Pimpri-Chinchwad, Pune, Maharashtra 411027
                    </p>
                    <p className="text-sm text-gray-600">
                      We'll call you when your order is ready for pickup!
                    </p>
                  </div>
                )}

                {/* Promo Code Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Tag className="inline h-4 w-4 mr-1" />
                    Promo Code
                  </label>
                  {!appliedPromo ? (
                    <div className="space-y-2">
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => {
                              setPromoCode(e.target.value.toUpperCase());
                              setPromoError("");
                            }}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleApplyPromoCode();
                              }
                            }}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                            placeholder="Enter promo code"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleApplyPromoCode()}
                          disabled={validatingPromo || !promoCode.trim()}
                          className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                          {validatingPromo ? "Applying..." : "Apply"}
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">
                        Try{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setPromoCode("FIRST20");
                            handleApplyPromoCode("FIRST20");
                          }}
                          disabled={validatingPromo}
                          className="text-orange-600 font-semibold hover:underline disabled:opacity-50"
                        >
                          FIRST20
                        </button>{" "}
                        for extra savings
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 rounded-full">
                          <Check className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-green-800">
                            {appliedPromo.title} Applied!
                          </p>
                          <p className="text-xs text-green-600">
                            Code: {appliedPromo.promo_code} • Save ₹
                            {discountAmount.toFixed(0)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromoCode}
                        className="p-2 hover:bg-green-100 rounded-full transition-colors"
                        title="Remove promo code"
                      >
                        <X className="h-5 w-5 text-green-600" />
                      </button>
                    </div>
                  )}
                  {promoError && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <X size={14} />
                      {promoError}
                    </p>
                  )}
                </div>

                {/* Payment Method Selection - Subtle */}
                <div className="pt-6 border-t border-gray-200/60">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <label
                      className={`relative flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        paymentMethod === "cash"
                          ? "border-orange-400 bg-orange-50/50 shadow-sm"
                          : "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-100/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === "cash"}
                        onChange={(e) =>
                          setPaymentMethod(
                            e.target.value as "cash" | "upi" | "card"
                          )
                        }
                        className="sr-only"
                      />
                      <Wallet
                        className={`h-6 w-6 mb-2 ${
                          paymentMethod === "cash"
                            ? "text-orange-600"
                            : "text-gray-400"
                        }`}
                      />
                      <div
                        className={`font-bold text-sm ${
                          paymentMethod === "cash"
                            ? "text-orange-600"
                            : "text-gray-700"
                        }`}
                      >
                        Cash
                      </div>
                      <div className="text-xs text-gray-600 mt-1 text-center">
                        Pay on delivery
                      </div>
                    </label>

                    <label
                      className={`relative flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        paymentMethod === "upi"
                          ? "border-orange-400 bg-orange-50/50 shadow-sm"
                          : "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-100/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        checked={paymentMethod === "upi"}
                        onChange={(e) =>
                          setPaymentMethod(
                            e.target.value as "cash" | "upi" | "card"
                          )
                        }
                        className="sr-only"
                      />
                      <QrCode
                        className={`h-6 w-6 mb-2 ${
                          paymentMethod === "upi"
                            ? "text-orange-600"
                            : "text-gray-400"
                        }`}
                      />
                      <div
                        className={`font-semibold text-sm ${
                          paymentMethod === "upi"
                            ? "text-orange-600"
                            : "text-gray-700"
                        }`}
                      >
                        UPI
                      </div>
                      <div className="text-xs text-gray-600 mt-1 text-center">
                        QR Code
                      </div>
                    </label>

                    <label
                      className={`relative flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        paymentMethod === "card"
                          ? "border-orange-400 bg-orange-50/50 shadow-sm"
                          : "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-100/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={(e) =>
                          setPaymentMethod(
                            e.target.value as "cash" | "upi" | "card"
                          )
                        }
                        className="sr-only"
                      />
                      <CreditCard
                        className={`h-6 w-6 mb-2 ${
                          paymentMethod === "card"
                            ? "text-orange-600"
                            : "text-gray-400"
                        }`}
                      />
                      <div
                        className={`font-semibold text-sm ${
                          paymentMethod === "card"
                            ? "text-orange-600"
                            : "text-gray-700"
                        }`}
                      >
                        Card
                      </div>
                      <div className="text-xs text-gray-600 mt-1 text-center">
                        Debit/Credit
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="space-y-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent relative z-10"></div>
                        <span className="relative z-10">Processing...</span>
                      </>
                    ) : (
                      <>
                        <span className="relative z-10">
                          {paymentMethod === "upi"
                            ? "Show QR Code"
                            : "Place Order"}{" "}
                          🍗
                        </span>
                        {paymentMethod === "upi" ? (
                          <QrCode className="h-5 w-5 relative z-10" />
                        ) : (
                          <ArrowRight className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                        )}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppOrder}
                    disabled={
                      !formData.customerName ||
                      !formData.customerPhone ||
                      (deliveryType === "delivery" && !formData.deliveryAddress)
                    }
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Order via WhatsApp</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary - Subtle Design */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden sticky top-8">
              {/* Summary Header - Subtle */}
              <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 p-6 border-b border-gray-200/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Order Summary
                    </h2>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {state.items.length}{" "}
                      {state.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200/60">
                    <ShoppingBag className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Items List */}
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 max-h-64 overflow-y-auto">
                  {state.items.map((item) => {
                    const itemPrice =
                      item.selectedWeight?.price || item.product.price;
                    const totalPrice = Number(itemPrice) * item.quantity;
                    return (
                      <div key={item.product.id} className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                          {item.product.image_url ? (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="w-full h-full object-contain"
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
                            } bg-gradient-to-br from-orange-100 to-red-100 items-center justify-center`}
                          >
                            <span className="text-2xl">🍗</span>
                          </div>
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {item.product.name}
                          </p>
                          {item.selectedWeight && (
                            <p className="text-xs text-gray-500">
                              {item.selectedWeight.weight}
                              {item.selectedWeight.weight_unit}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-bold text-gray-900 mt-1">
                            ₹{totalPrice.toFixed(0)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      ₹{subtotal.toFixed(0)}
                    </span>
                  </div>
                  {loyaltyDiscountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>
                        {orderCount === 0
                          ? `🎉 Inaugural Discount (${loyaltyDiscount}%)`
                          : `Loyalty Discount (${orderCount} orders - ${loyaltyDiscount}%)`}
                      </span>
                      <span className="font-bold">
                        -₹{loyaltyDiscountAmount.toFixed(0)}
                      </span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Promo Discount ({appliedPromo?.promo_code})</span>
                      <span className="font-bold">
                        -₹{discountAmount.toFixed(0)}
                      </span>
                    </div>
                  )}
                  {deliveryType === "delivery" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Charge</span>
                      <span>
                        {calculatingDelivery ? (
                          <span className="text-gray-400">Calculating...</span>
                        ) : distance !== null ? (
                          distance <= freeDeliveryRadius ||
                          appliedPromo?.discount_type === "free_delivery" ? (
                            <span className="text-green-600 font-semibold">
                              Free{" "}
                              {appliedPromo?.discount_type === "free_delivery"
                                ? "(Promo)"
                                : `(within ${freeDeliveryRadius}km)`}
                            </span>
                          ) : (
                            <span className="font-semibold">
                              ₹{deliveryCharge}
                            </span>
                          )
                        ) : (
                          <span className="text-gray-400">Enter address</span>
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200">
                    <span className="text-xl font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      ₹
                      {calculatingDelivery
                        ? "..."
                        : totalWithDelivery.toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Order Info - Subtle */}
                <div className="p-4 bg-gray-50/50 border border-gray-200/60 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {deliveryType === "delivery" ? (
                      <Truck className="h-4 w-4 text-orange-600" />
                    ) : (
                      <Store className="h-4 w-4 text-orange-600" />
                    )}
                    <p className="text-sm font-semibold text-gray-900">
                      {deliveryType === "delivery" ? "Delivery" : "Pickup"}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600">
                    Estimated time:{" "}
                    <span className="font-medium">
                      {deliveryType === "delivery" ? "30-45 min" : "15-20 min"}
                    </span>
                  </p>
                </div>

                {/* Trust Badges - Subtle */}
                <div className="mt-6 pt-6 border-t border-gray-200/60">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center p-3 bg-gray-50/50 rounded-lg border border-gray-200/60">
                      <Shield className="h-4 w-4 text-gray-600 mb-1" />
                      <span className="text-xs text-gray-600 font-medium">
                        Secure
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gray-50/50 rounded-lg border border-gray-200/60">
                      <Zap className="h-4 w-4 text-gray-600 mb-1" />
                      <span className="text-xs text-gray-600 font-medium">
                        Fast
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gray-50/50 rounded-lg border border-gray-200/60">
                      <Award className="h-4 w-4 text-gray-600 mb-1" />
                      <span className="text-xs text-gray-600 font-medium">
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

      {/* Address Map Picker Modal */}
      {showMapPicker && (
        <AddressMapPicker
          onAddressSelect={handleMapAddressSelect}
          onClose={() => setShowMapPicker(false)}
          initialAddress={formData.deliveryAddress}
        />
      )}

      {/* UPI QR Code Modal */}
      {showUPIQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-bounce-in">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-2xl overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Pay via UPI</h3>
                    <p className="text-sm text-white/90">
                      Scan QR code to complete payment
                    </p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (currentOrderId) {
                      try {
                        const response = await fetch(
                          `/api/orders/${currentOrderId}`,
                          {
                            method: "DELETE",
                          }
                        );
                        if (response.ok) {
                          setShowUPIQR(false);
                          setUpiPaymentUrl("");
                          setCurrentOrderId(null);
                          setOrderTotalAmount(null);
                        } else {
                          const errorData = await response
                            .json()
                            .catch(() => ({}));
                          alert(errorData.error || "Failed to cancel order.");
                        }
                      } catch (error) {
                        console.error("Error cancelling order:", error);
                        alert("Failed to cancel order.");
                      }
                    } else {
                      setShowUPIQR(false);
                      setUpiPaymentUrl("");
                      setOrderTotalAmount(null);
                    }
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 text-center">
                <p className="text-3xl font-bold">
                  ₹{(orderTotalAmount || totalWithDelivery).toFixed(0)}
                </p>
                <p className="text-sm text-white/80 mt-1">
                  Total Amount to Pay
                </p>
              </div>
            </div>

            <div className="p-6">
              {/* Order Summary */}
              {currentOrderId && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Order ID
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      #{currentOrderId}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Customer:</span>
                      <span className="font-medium text-gray-900">
                        {formData.customerName || user?.name || "Customer"}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Date & Time:</span>
                      <span className="font-medium text-gray-900">
                        {new Date().toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items Breakdown */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Order Details
                </h4>
                <div className="space-y-2 mb-4">
                  {state.items.map((item, index) => {
                    const weightInfo = item.selectedWeight
                      ? ` (${item.selectedWeight.weight}${item.selectedWeight.weight_unit})`
                      : "";
                    const itemTotal =
                      Number(item.product.price) * item.quantity;
                    return (
                      <div
                        key={index}
                        className="flex justify-between items-start p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {item.product.name}
                            {weightInfo}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity} × ₹
                            {Number(item.product.price).toFixed(0)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{itemTotal.toFixed(0)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-gray-200 pt-3 space-y-2">
                  {subtotal !== totalWithDelivery && (
                    <>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium">
                          ₹{subtotal.toFixed(0)}
                        </span>
                      </div>
                      {deliveryType === "delivery" &&
                        (deliveryCharge || 0) > 0 && (
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Delivery Charge</span>
                            <span className="font-medium">
                              ₹{deliveryCharge.toFixed(0)}
                            </span>
                          </div>
                        )}
                      {deliveryType === "delivery" &&
                        (deliveryCharge || 0) === 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Delivery Charge
                            </span>
                            <span className="font-semibold text-green-600">
                              FREE
                            </span>
                          </div>
                        )}
                      {(totalDiscountAmount || 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Discount</span>
                          <span className="font-semibold text-green-600">
                            -₹{totalDiscountAmount.toFixed(0)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t-2 border-gray-300">
                    <span className="text-base font-bold text-gray-900">
                      Total Amount
                    </span>
                    <span className="text-2xl font-bold text-orange-600">
                      ₹{(orderTotalAmount || totalWithDelivery).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="mb-6">
                <div className="flex justify-center p-6 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                  {upiPaymentUrl && (
                    <QRCodeSVG
                      value={upiPaymentUrl}
                      size={280}
                      level="H"
                      includeMargin={true}
                    />
                  )}
                </div>
                <p className="text-center text-xs text-gray-500 mt-3">
                  Scan with PhonePe, Google Pay, Paytm, or any UPI app
                </p>
              </div>

              {/* Payment Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-semibold text-blue-900">
                    Payment Steps
                  </p>
                </div>
                <ol className="text-xs text-blue-800 space-y-2 list-decimal list-inside">
                  <li>Open your UPI app (PhonePe, Google Pay, Paytm, etc.)</li>
                  <li>Tap on "Scan QR Code" in your app</li>
                  <li>Point your camera at the QR code above</li>
                  <li>
                    Verify the amount{" "}
                    <strong>
                      ₹{(orderTotalAmount || totalWithDelivery).toFixed(0)}
                    </strong>{" "}
                    and merchant name <strong>K2 Chicken</strong>
                  </li>
                  <li>Enter your UPI PIN to complete payment</li>
                  <li>Click "I've Paid" below after successful payment</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleUPIPaymentConfirm}
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] duration-200"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      I've Paid Successfully
                    </span>
                  )}
                </button>

                <button
                  onClick={async () => {
                    if (currentOrderId) {
                      try {
                        const response = await fetch(
                          `/api/orders/${currentOrderId}`,
                          {
                            method: "DELETE",
                          }
                        );
                        if (response.ok) {
                          setShowUPIQR(false);
                          setUpiPaymentUrl("");
                          setCurrentOrderId(null);
                        } else {
                          const errorData = await response
                            .json()
                            .catch(() => ({}));
                          alert(errorData.error || "Failed to cancel order.");
                        }
                      } catch (error) {
                        console.error("Error cancelling order:", error);
                        alert("Failed to cancel order.");
                      }
                    } else {
                      setShowUPIQR(false);
                      setUpiPaymentUrl("");
                    }
                  }}
                  className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel Order
                </button>

                {/* Alternative: Open UPI App Link */}
                <a
                  href={upiPaymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center text-sm text-orange-600 hover:text-orange-700 font-medium py-2"
                >
                  Or open in UPI app directly →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
