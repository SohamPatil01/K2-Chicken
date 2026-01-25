"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Product, WeightOption } from "@/context/CartContext";
import {
  Plus,
  Minus,
  Search,
  Star,
  CheckCircle,
  AlertCircle,
  XCircle,
  Sparkles,
  ShoppingBag,
  Truck,
  ChevronRight,
  PhoneCall,
  Store,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductCardProps {
  product: Product;
  isBestseller: boolean;
  onAddToCart: (product: Product, weight?: WeightOption) => void;
  onUpdateQuantity: (
    productId: number,
    quantity: number,
    weight?: WeightOption
  ) => void;
  getStockStatus: (product: Product) => {
    status: string;
    label: string;
    color: string;
    icon: any;
  };
  getWeightQuantity: (productId: number, weight?: WeightOption) => number;
  index?: number;
}

function ProductCard({
  product,
  isBestseller,
  onAddToCart,
  onUpdateQuantity,
  getStockStatus,
  getWeightQuantity,
  index = 0,
}: ProductCardProps) {
  const stockStatus = getStockStatus(product);
  const StockIcon = stockStatus.icon;
  const defaultWeight =
    product.weightOptions?.find((w) => w.is_default) ||
    product.weightOptions?.[0];
  const [selectedWeight, setSelectedWeight] = useState<
    WeightOption | undefined
  >(defaultWeight);
  const [showInfo, setShowInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [customWeightEnabled, setCustomWeightEnabled] = useState(false);
  const [customWeight, setCustomWeight] = useState<string>(
    (defaultWeight?.weight || 500).toString()
  );

  // Swipe state
  const [swipePage, setSwipePage] = useState(0); // 0 = image, 1 = info
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const swipeContainerRef = useRef<HTMLDivElement>(null);

  // Update container width when component mounts or resizes
  useEffect(() => {
    const updateWidth = () => {
      if (swipeContainerRef.current) {
        setContainerWidth(swipeContainerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Auto-rotate between image and info (only on desktop when hovered, not when swiping)
  useEffect(() => {
    if (isMobile || !isHovered || isSwiping) {
      // Reset to image page when not hovered (only on desktop)
      if (!isHovered && !isMobile) {
        setSwipePage(0);
      }
      return;
    }

    const interval = setInterval(() => {
      setSwipePage((prev) => (prev === 0 ? 1 : 0));
    }, 4000); // Switch every 4 seconds

    return () => clearInterval(interval);
  }, [isMobile, isHovered, isSwiping]);

  // Detect if device is mobile/touch
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update selectedWeight only when product ID changes (new product)
  // Don't reset when price or weightOptions update - preserve user's selection
  useEffect(() => {
    // Only set default weight if we don't have a selected weight yet
    // or if this is a different product (check by comparing weight values)
    const currentWeightValue = selectedWeight?.weight;
    const matchingWeight = product.weightOptions?.find(
      (w) => w.weight === currentWeightValue
    );

    if (!selectedWeight || !matchingWeight) {
      // No selection yet or selected weight doesn't exist - use default
      const newDefaultWeight =
        product.weightOptions?.find((w) => w.is_default) ||
        product.weightOptions?.[0];
      if (newDefaultWeight) {
        setSelectedWeight(newDefaultWeight);
      }
    } else {
      // Product updated but same product - update the weight option with new price data
      // but keep the same weight selection (preserve user's choice)
      setSelectedWeight(matchingWeight);
    }
  }, [product.id]); // Only depend on product.id, not price or weightOptions

  // Force re-render when product price changes
  useEffect(() => {
    // This effect will run whenever product.price changes
    // Component will automatically re-render when price changes
  }, [product.price, (product as any).original_price]);

  // Calculate discount if original_price exists
  // Base product prices (for 1kg or default weight)
  const baseProductPrice = Number(product.price);
  const baseOriginalPrice = Number(
    (product as any).original_price || product.price
  );

  // Calculate price per gram from base price
  const referenceWeight =
    selectedWeight?.weight || defaultWeight?.weight || 1000;
  const referencePrice = Number(
    selectedWeight?.price || defaultWeight?.price || product.price
  );
  const pricePerGram =
    referenceWeight > 0 ? referencePrice / referenceWeight : referencePrice;

  // Calculate original price per gram (if discount exists)
  const originalPricePerGram =
    baseOriginalPrice > baseProductPrice
      ? baseOriginalPrice / referenceWeight
      : pricePerGram;

  const normalizeWeight = (value: number) => {
    if (Number.isNaN(value)) return 500;
    return Math.max(100, Math.min(5000, value));
  };
  const customWeightValue = normalizeWeight(parseFloat(customWeight));
  const customPrice = Math.round(pricePerGram * customWeightValue);
  const customOriginalPrice = Math.round(
    originalPricePerGram * customWeightValue
  );
  const customWeightOption: WeightOption = {
    id: customWeightValue,
    weight: customWeightValue,
    weight_unit: selectedWeight?.weight_unit || "g",
    price: customPrice,
    is_default: false,
  };
  // Check if this is Whole Chicken product - hide weight options
  const isWholeChicken = product.name.toLowerCase().includes("whole chicken");

  const activeWeight = isWholeChicken
    ? undefined
    : (customWeightEnabled ? customWeightOption : selectedWeight);
  const currentPrice = isWholeChicken
    ? Number(product.price)
    : Number(activeWeight?.price || product.price);

  // Calculate original price for current weight
  const currentWeight = activeWeight?.weight || referenceWeight;
  const originalPriceForCurrentWeight = customWeightEnabled
    ? customOriginalPrice
    : Math.round(originalPricePerGram * currentWeight);

  // Calculate discount based on base product price (not weight-specific)
  // This ensures discount percentage stays constant regardless of weight
  const hasDiscount = baseOriginalPrice > baseProductPrice;
  const discountPercent = hasDiscount
    ? Math.round(
      ((baseOriginalPrice - baseProductPrice) / baseOriginalPrice) * 100
    )
    : 0;

  // For display, use the original price for current weight
  const originalPrice = originalPriceForCurrentWeight;

  const currentWeightQuantity = getWeightQuantity(product.id, activeWeight);

  // Product Schema for SEO
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image_url,
    offers: {
      "@type": "Offer",
      price: currentPrice,
      priceCurrency: "INR",
      availability: stockStatus.status === "in" || stockStatus.status === "low" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  // Swipe handlers
  const minSwipeDistance = 50;

  // Common function to handle swipe end
  const handleSwipeEnd = (startX: number, endX: number) => {
    const distance = startX - endX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && swipePage === 0) {
      // Swipe left to show info
      setSwipePage(1);
    } else if (isRightSwipe && swipePage === 1) {
      // Swipe right to show image
      setSwipePage(0);
    }

    setTouchStart(null);
    setSwipeOffset(0);
  };

  // Touch handlers (for mobile swipe) - Improved version
  const onTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.touches[0];
    if (touch) {
      setIsSwiping(true);
      setTouchStart(touch.clientX);
      setSwipeOffset(0);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touch = e.touches[0];
    if (!touch) return;

    const currentTouch = touch.clientX;
    const distance = touchStart - currentTouch;

    // Only prevent default if we're actually swiping horizontally
    if (Math.abs(distance) > 5) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Calculate swipe offset as percentage of container width
    if (containerWidth > 0) {
      const percentage = (distance / containerWidth) * 100;
      const maxPercentage = 100;
      const clampedPercentage = Math.max(-maxPercentage, Math.min(maxPercentage, percentage));
      setSwipeOffset((clampedPercentage / 100) * containerWidth);
    } else {
      // Fallback to pixel-based if container width not available
      const maxOffset = 200;
      const clampedDistance = Math.max(-maxOffset, Math.min(maxOffset, distance));
      setSwipeOffset(clampedDistance);
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();

    if (touchStart === null) {
      setSwipeOffset(0);
      setIsSwiping(false);
      return;
    }

    const touch = e.changedTouches[0];
    if (!touch) {
      setTouchStart(null);
      setSwipeOffset(0);
      setIsSwiping(false);
      return;
    }

    const endTouch = touch.clientX;
    const distance = touchStart - endTouch;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && swipePage === 0) {
      // Swipe left to show info
      setSwipePage(1);
    } else if (isRightSwipe && swipePage === 1) {
      // Swipe right to show image
      setSwipePage(0);
    }

    setTouchStart(null);
    setSwipeOffset(0);
    setIsSwiping(false);
  };


  // Handle click on mobile to toggle info panel (for non-swipeable areas)
  const handleCardClick = (e: React.MouseEvent) => {
    // Only handle clicks on mobile devices
    if (!isMobile) return;

    // Don't toggle if clicking on interactive elements (buttons, inputs, etc.)
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('a') ||
      target.closest('.swipeable-container')
    ) {
      return;
    }

    // Toggle info panel on mobile
    setShowInfo((prev) => !prev);
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <div
        className="group relative bg-white border border-gray-100/80 rounded-2xl overflow-hidden hover:border-orange-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl shadow-sm"
        onMouseEnter={() => {
          // Only use hover on desktop (non-mobile)
          if (!isMobile) {
            setShowInfo(true);
            setIsHovered(true);
          }
        }}
        onMouseLeave={() => {
          // Only use hover on desktop (non-mobile)
          if (!isMobile) {
            setShowInfo(false);
            setIsHovered(false);
            setSwipePage(0); // Reset to image when leaving
          }
        }}
        onClick={handleCardClick}
      >
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-0.5 left-0.5 sm:top-2 sm:left-2 z-10 bg-gradient-to-r from-orange-400 to-orange-600 text-white px-1 sm:px-2 py-0.5 rounded text-[9px] sm:text-xs font-semibold sm:font-bold flex items-center gap-0.5 sm:gap-1 shadow-md">
            <Sparkles className="h-1.5 w-1.5 sm:h-2.5 sm:w-2.5" />
            <span>{discountPercent}% OFF</span>
          </div>
        )}

        {/* Bestseller Badge - Licious Style */}
        {isBestseller && !hasDiscount && (
          <div className="absolute bottom-2 left-2 z-10 bg-white/95 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 sm:py-1.5 shadow-lg border border-orange-200 flex items-center gap-1 sm:gap-1.5">
            <span className="text-[8px] sm:text-[10px] font-bold text-gray-800">
              INDIA'S JUICIEST CHICKEN
            </span>
            <span className="text-xs sm:text-sm">🍗</span>
          </div>
        )}

        {/* Stock Badge - Only show if out of stock */}
        {stockStatus.status === "out" && (
          <div className="absolute top-0.5 right-0.5 sm:top-2 sm:right-2 z-10 bg-red-100 text-red-700 px-1 sm:px-2 py-0.5 rounded text-[9px] sm:text-xs font-medium sm:font-semibold flex items-center gap-0.5 sm:gap-1 border border-red-200 shadow-sm backdrop-blur-sm bg-white/90">
            <XCircle className="h-1.5 w-1.5 sm:h-2.5 sm:w-2.5" />
            <span>Out</span>
          </div>
        )}

        {/* Swipeable Product Container */}
        <div
          className="relative w-full h-20 sm:h-36 md:h-40 bg-white overflow-hidden rounded-t-lg"
          style={{ touchAction: 'pan-x', WebkitOverflowScrolling: 'touch' }}
        >
          <div
            ref={swipeContainerRef}
            className="swipeable-container relative w-full h-full flex select-none"
            style={{
              transform: `translateX(${containerWidth > 0
                ? swipePage === 0
                  ? `${(-swipeOffset / containerWidth) * 100}%`
                  : `${-100 + (swipeOffset / containerWidth) * 100}%`
                : swipePage === 0
                  ? '0%'
                  : '-100%'
                })`,
              transition: swipeOffset === 0 && !isSwiping ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
              willChange: 'transform',
              userSelect: 'none',
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={() => {
              setTouchStart(null);
              setSwipeOffset(0);
              setIsSwiping(false);
            }}
          >
            {/* Page 1: Product Image */}
            <div className="min-w-full h-full relative bg-white">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  quality={95}
                  priority={index < 6}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    const fallback = target.parentElement
                      ?.nextElementSibling as HTMLElement | null;
                    if (fallback) {
                      fallback.style.display = "flex";
                    }
                  }}
                />
              ) : null}
              <div
                className={`absolute inset-0 w-full h-full ${product.image_url ? "hidden" : "flex"
                  } bg-gray-50 items-center justify-center`}
              >
                <span className="text-xl sm:text-3xl transform transition-transform duration-300 group-hover:scale-110">
                  🍗
                </span>
              </div>
            </div>

            {/* Page 2: Product Information */}
            <div className="min-w-full h-full bg-chicken-cream border-t border-dashed border-gray-200 p-3 sm:p-4 flex flex-col justify-center">
              <div className="text-center">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-2 sm:mb-3">
                  {product.name}
                </h4>
                <p className="text-[10px] sm:text-xs text-gray-700 leading-relaxed mb-3 sm:mb-4 px-1">
                  {product.description ||
                    "Fresh and delicious premium quality chicken, carefully selected and prepared to ensure the best taste and nutrition for your family."}
                </p>
                <div className="space-y-2 sm:space-y-2.5">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-orange-600 text-xs sm:text-sm flex-shrink-0">✓</span>
                    <span className="text-[10px] sm:text-xs text-gray-700">
                      Premium quality, fresh daily
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-orange-600 text-xs sm:text-sm flex-shrink-0">✓</span>
                    <span className="text-[10px] sm:text-xs text-gray-700">
                      Rich in protein and nutrients
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-orange-600 text-xs sm:text-sm flex-shrink-0">✓</span>
                    <span className="text-[10px] sm:text-xs text-gray-700">
                      Perfect for all your recipes
                    </span>
                  </div>
                  {hasDiscount && (
                    <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-orange-200">
                      <span className="text-green-600 text-xs sm:text-sm font-bold flex-shrink-0">🎉</span>
                      <span className="text-[10px] sm:text-xs text-green-700 font-semibold">
                        Save {discountPercent}% - Limited time offer!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Swipe Indicator Dots */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
            <div
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${swipePage === 0
                ? "bg-orange-600 w-4"
                : "bg-white/60 w-1.5"
                }`}
            />
            <div
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${swipePage === 1
                ? "bg-orange-600 w-4"
                : "bg-white/60 w-1.5"
                }`}
            />
          </div>
        </div>

        {/* Product Info - Sliding Panel */}
        <div className="relative overflow-hidden bg-white">
          {/* Basic Info (Always Visible) */}
          <div className="p-1.5 sm:p-2.5 pb-1.5 sm:pb-2">
            <div className="mb-0.5 sm:mb-1.5">
              <h3 className="text-[10px] sm:text-sm font-medium sm:font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-300 leading-tight mb-0.5 sm:mb-1 line-clamp-2">
                {product.name}
              </h3>
              {/* Category label removed as per request */}
            </div>

            {/* Price Section with Discount */}
            <div className="flex flex-col gap-0.5 mb-1 sm:mb-2">
              <div className="flex items-baseline gap-0.5 sm:gap-1.5 flex-wrap">
                {hasDiscount ? (
                  <>
                    <span className="text-sm sm:text-lg font-semibold sm:font-bold text-orange-600">
                      ₹{currentPrice.toFixed(0)}
                    </span>
                    <span className="text-[10px] sm:text-sm text-gray-400 line-through font-normal sm:font-medium">
                      ₹{originalPrice.toFixed(0)}
                    </span>
                  </>
                ) : (
                  <span className="text-sm sm:text-lg font-semibold sm:font-bold text-gray-900">
                    ₹{currentPrice.toFixed(0)}
                  </span>
                )}
                {activeWeight && !isWholeChicken && (
                  <span className="text-[9px] sm:text-xs text-gray-500 font-normal sm:font-medium">
                    / {activeWeight.weight}
                    {activeWeight.weight_unit}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <div className="flex items-center gap-1">
                  <span className="text-[9px] sm:text-xs font-medium sm:font-semibold text-green-600 bg-green-50 px-1 sm:px-1.5 py-0.5 rounded">
                    Save ₹{(originalPrice - currentPrice).toFixed(0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sliding Info Panel */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${showInfo ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            <div className="px-3 pb-2 space-y-2 border-t border-gray-100 pt-2">
              {/* Description */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">
                  Description
                </p>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                  {product.description ||
                    "Fresh and delicious premium quality chicken."}
                </p>
              </div>

              {/* Weight Options Selector */}
              {product.weightOptions && product.weightOptions.length > 1 && !isWholeChicken && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">
                    Select Weight:
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {product.weightOptions.map((weight) => (
                      <button
                        key={weight.id || weight.weight}
                        onClick={() => {
                          setSelectedWeight(weight);
                          setCustomWeightEnabled(false);
                        }}
                        className={`px-1.5 py-0.5 rounded text-xs font-medium transition-all duration-200 ${selectedWeight?.weight === weight.weight
                          ? "bg-orange-100 text-orange-700 border border-orange-200"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100"
                          }`}
                      >
                        {weight.weight}
                        {weight.weight_unit}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cart Controls */}
              <div className="pt-1">
                {!isWholeChicken && (
                  <div className="mb-3 border border-gray-100 rounded-lg p-2 bg-gray-50/80">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-2">
                      <span>Custom Weight</span>
                      <button
                        onClick={() => setCustomWeightEnabled((prev) => !prev)}
                        className="text-orange-600"
                      >
                        {customWeightEnabled ? "Disable" : "Enable"}
                      </button>
                    </div>
                    {customWeightEnabled && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={100}
                            max={5000}
                            step={50}
                            value={customWeight}
                            onChange={(e) =>
                              setCustomWeight(
                                normalizeWeight(Number(e.target.value)).toString()
                              )
                            }
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          />
                          <span className="text-xs text-gray-500">grams</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>{(customWeightValue / 1000).toFixed(2)} kg</span>
                          <span className="font-semibold text-gray-900">
                            ₹{customPrice.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {stockStatus.status === "out" ? (
                  <button
                    disabled
                    className="w-full bg-gray-100 text-gray-400 font-semibold py-3.5 px-4 rounded-xl cursor-not-allowed text-sm min-h-[48px]"
                  >
                    Out of Stock
                  </button>
                ) : currentWeightQuantity === 0 ? (
                  <button
                    onClick={() =>
                      onAddToCart(
                        product,
                        isWholeChicken ? undefined : (customWeightEnabled ? activeWeight : selectedWeight)
                      )
                    }
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-orange-200 active:scale-95 text-sm min-h-[48px]"
                  >
                    <ShoppingBag
                      size={16}
                      className="transform transition-transform duration-200"
                    />
                    <span>Add to Cart</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                      <button
                        onClick={() =>
                          onUpdateQuantity(
                            product.id,
                            currentWeightQuantity - 1,
                            isWholeChicken ? undefined : (customWeightEnabled ? activeWeight : selectedWeight)
                          )
                        }
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-white rounded-lg active:bg-gray-100 transition-colors shadow-sm"
                      >
                        <Minus size={18} className="text-gray-700" />
                      </button>
                      <div className="min-w-[40px] text-center">
                        <span className="font-bold text-gray-900 text-base">
                          {currentWeightQuantity}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onUpdateQuantity(
                            product.id,
                            currentWeightQuantity + 1,
                            isWholeChicken ? undefined : (customWeightEnabled ? activeWeight : selectedWeight)
                          )
                        }
                        disabled={stockStatus.status === "out"}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-orange-600 active:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-gray-900">
                        ₹
                        {(
                          Number(
                            isWholeChicken
                              ? product.price
                              : ((customWeightEnabled
                                ? activeWeight?.price
                                : selectedWeight?.price) || product.price)
                          ) * currentWeightQuantity
                        ).toFixed(0)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Add Button (Visible when info is hidden) - Licious Style */}
          {!showInfo &&
            currentWeightQuantity === 0 &&
            stockStatus.status !== "out" && (
              <div className="absolute bottom-2 right-2 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(
                      product,
                      isWholeChicken ? undefined : (customWeightEnabled ? activeWeight : selectedWeight)
                    );
                  }}
                  className="bg-white hover:bg-orange-50 text-orange-600 hover:text-orange-700 rounded-lg p-2 sm:p-2.5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 border border-gray-100 hover:border-orange-200"
                  aria-label="Add to cart"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            )}
        </div>
      </div>
    </>
  );
}

interface ProductCatalogProps {
  initialProducts?: Product[];
  deliveryEnabled?: boolean;
}

export default function ProductCatalog({
  initialProducts,
  deliveryEnabled = true,
}: ProductCatalogProps = {}) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(
    initialProducts || []
  );
  const [loading, setLoading] = useState(!initialProducts);
  const [searchTerm, setSearchTerm] = useState(
    searchParams?.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string>("all");
  const [mounted, setMounted] = useState(false);
  const [visibleProducts, setVisibleProducts] = useState<Set<number>>(
    new Set()
  );
  const { state, dispatch } = useCart();

  // Bestseller products (you can make this dynamic based on order data)
  const bestsellerIds = [1, 2, 3]; // Chicken Breast, Chicken Curry Cut, Chicken Wings

  // Get unique categories
  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
  ];

  const quickFilterOptions = [
    { id: "all", label: "Show All" },
    { id: "bestsellers", label: "Best Sellers" },
    { id: "in_stock", label: "In Stock" },
    { id: "offers", label: "On Offer" },
  ];

  const categoryCounts = products.reduce<Record<string, number>>(
    (acc, product) => {
      const group = product.category || "Other";
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    },
    {}
  );

  const totalInStock = products.filter(
    (product) => product.in_stock && (product.stock_quantity ?? 0) > 0
  ).length;

  const totalDiscounted = products.filter((product) => {
    const base = Number((product as any).original_price);
    return base && base > Number(product.price);
  }).length;

  useEffect(() => {
    setMounted(true);
    // Staggered animation for products
    if (filteredProducts.length > 0) {
      const timeouts: NodeJS.Timeout[] = [];
      filteredProducts.forEach((product, index) => {
        const timeout = setTimeout(() => {
          setVisibleProducts((prev) => new Set(prev).add(product.id));
        }, index * 50);
        timeouts.push(timeout);
      });

      return () => {
        timeouts.forEach((timeout) => clearTimeout(timeout));
      };
    }
  }, [filteredProducts]);

  // Initialize with server-side data only once on mount
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
      setFilteredProducts(initialProducts);
      setLoading(false);
    } else if (!initialProducts) {
      fetchProducts();
    }
    // Read search query from URL
    const urlSearch = searchParams?.get("search");
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Set up periodic refresh - only if no initial products provided
  // Refresh every 30 seconds instead of 2 seconds for better performance
  useEffect(() => {
    // Only set up refresh if we don't have initial products
    if (!initialProducts || initialProducts.length === 0) {
      const refreshInterval = setInterval(() => {
        fetchProducts();
      }, 30000); // Refresh every 30 seconds instead of 2 seconds

      return () => {
        clearInterval(refreshInterval);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProducts]); // Only set up once on mount

  const filterAndSortProducts = () => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Quick filter logic
    if (selectedQuickFilter === "bestsellers") {
      filtered = filtered.filter((product) =>
        bestsellerIds.includes(product.id)
      );
    } else if (selectedQuickFilter === "in_stock") {
      filtered = filtered.filter(
        (product) => product.in_stock && (product.stock_quantity ?? 0) > 0
      );
    } else if (selectedQuickFilter === "offers") {
      filtered = filtered.filter((product) => {
        const base = Number((product as any).original_price);
        return base && base > Number(product.price);
      });
    }

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    filterAndSortProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, searchTerm, selectedCategory, selectedQuickFilter]);

  const getStockStatus = (product: Product) => {
    if (!product.in_stock || (product.stock_quantity ?? 0) === 0) {
      return {
        status: "out",
        label: "Out of Stock",
        color: "bg-red-100 text-red-700 border-red-200",
        icon: XCircle,
      };
    }
    if (
      (product.stock_quantity ?? 100) <= (product.low_stock_threshold ?? 10)
    ) {
      return {
        status: "low",
        label: "Low Stock",
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: AlertCircle,
      };
    }
    return {
      status: "in",
      label: "In Stock",
      color: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle,
    };
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/products`, {
        next: { revalidate: 10 }, // Cache for 10 seconds
      });
      if (!response.ok) {
        // Don't clear products on error, keep existing ones
        return;
      }
      const data = await response.json();
      const newProducts = Array.isArray(data) ? data : [];

      // Only update if products actually changed (compare by ID and price)
      if (products.length === 0) {
        // First load - always set
        setProducts(newProducts);
      } else {
        // Create a map for efficient comparison
        const oldProductMap = new Map(products.map(p => [p.id, p]));
        const hasChanged =
          products.length !== newProducts.length ||
          newProducts.some((newProduct) => {
            const oldProduct = oldProductMap.get(newProduct.id);
            return !oldProduct ||
              oldProduct.price !== newProduct.price ||
              (oldProduct as any).original_price !== (newProduct as any).original_price ||
              oldProduct.stock_quantity !== newProduct.stock_quantity ||
              oldProduct.in_stock !== newProduct.in_stock;
          });

        if (hasChanged) {
          // Only update state if products actually changed
          setProducts(newProducts);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      // Don't clear products on error, keep existing ones
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product, selectedWeight?: WeightOption) => {
    const productToAdd = selectedWeight
      ? { ...product, price: selectedWeight.price }
      : product;

    dispatch({
      type: "ADD_ITEM",
      payload: {
        product: productToAdd,
        quantity: 1,
        selectedWeight:
          selectedWeight ||
          product.weightOptions?.find((w) => w.is_default) ||
          undefined,
      },
    });

    // Add haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const updateQuantity = (
    productId: number,
    quantity: number,
    selectedWeight?: WeightOption
  ) => {
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { productId, quantity, selectedWeight },
    });
  };

  const isSameWeightOption = (a?: WeightOption, b?: WeightOption): boolean => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return (
      a.weight === b.weight && a.weight_unit === b.weight_unit && a.id === b.id
    );
  };

  const getWeightQuantity = (
    productId: number,
    weightOption?: WeightOption
  ) => {
    const item = state.items.find(
      (item) =>
        item.product.id === productId &&
        isSameWeightOption(item.selectedWeight, weightOption)
    );
    return item ? item.quantity : 0;
  };

  if (loading && !products.length) {
    return (
      <section className="py-20 bg-white min-h-[500px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Fresh Collection
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-2xl h-80 overflow-hidden animate-pulse"
              >
                <div className="bg-gray-200 h-48 w-full"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div id="products" className="py-12 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div className="animate-slide-up">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-chicken-wood mb-3 sm:mb-4 tracking-tight">
              Our Fresh Collection
            </h2>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl leading-relaxed">
              Premium cuts, delivered fresh to your doorstep. NO antibiotics, NO preservatives.
            </p>
          </div>

          {/* Animated Search & Filter Group */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-slide-up stagger-1 w-full md:w-auto">
            <div className="relative group w-full sm:w-64">
              <input
                type="text"
                placeholder="Search for chicken..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-300 bg-gray-50/50 focus:bg-white"
              />
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300 h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Animated Category Filters - Removed as per request */}
        {/* Filters and sorting */}
        {/* Filters and sorting - Removed Quick Filters as per request for cleaner UI */}

        {/* Product Grid with AnimatePresence */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-2xl h-80 animate-pulse border border-gray-100"
              />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 min-h-[400px]"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard
                    product={product}
                    index={index}
                    isBestseller={bestsellerIds.includes(product.id)}
                    getStockStatus={getStockStatus}
                    getWeightQuantity={getWeightQuantity}
                    onAddToCart={addToCart}
                    onUpdateQuantity={updateQuantity}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 rounded-full mb-4">
              <Search className="h-8 w-8 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No chicken found!
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              We couldn't find any products matching your search. Try adjusting
              your filters or search term.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedQuickFilter("all");
              }}
              className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
