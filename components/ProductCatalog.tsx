"use client";

import { useEffect, useState } from "react";
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
  const [customWeightEnabled, setCustomWeightEnabled] = useState(false);
  const [customWeight, setCustomWeight] = useState<string>(
    (defaultWeight?.weight || 500).toString()
  );

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
    // Logging helps us verify the component is detecting the change
    console.log(
      "🔄 ProductCard price changed:",
      product.id,
      product.name,
      "New price:",
      product.price
    );
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
  const activeWeight = customWeightEnabled
    ? customWeightOption
    : selectedWeight;
  const currentPrice = Number(activeWeight?.price || product.price);

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

  return (
    <div
      className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-orange-400 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl"
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 shadow-md">
          <Sparkles className="h-2.5 w-2.5" />
          <span>{discountPercent}% OFF</span>
        </div>
      )}

      {/* Bestseller Badge */}
      {isBestseller && !hasDiscount && (
        <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 shadow-md">
          <Star className="h-2.5 w-2.5 fill-white" />
          <span>Bestseller</span>
        </div>
      )}

      {/* Stock Badge - Only show if out of stock */}
      {stockStatus.status === "out" && (
        <div className="absolute top-2 right-2 z-10 bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 border border-red-200 shadow-sm backdrop-blur-sm bg-white/90">
          <XCircle className="h-2.5 w-2.5" />
          <span>Out</span>
        </div>
      )}

      {/* Product Image Container - Filled Style */}
      <div className="relative w-full h-48 sm:h-52 bg-white overflow-hidden border-b border-gray-100">
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
          className={`absolute inset-0 w-full h-full ${
            product.image_url ? "hidden" : "flex"
          } bg-gray-50 items-center justify-center`}
        >
          <span className="text-4xl transform transition-transform duration-300 group-hover:scale-110">
            🍗
          </span>
        </div>
      </div>

      {/* Product Info - Sliding Panel */}
      <div className="relative overflow-hidden bg-white">
        {/* Basic Info (Always Visible) */}
        <div className="p-3 pb-2">
          <div className="mb-1.5">
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-300 leading-tight mb-1 line-clamp-2">
              {product.name}
            </h3>
            <span className="inline-block text-xs text-gray-500 capitalize bg-gray-50 px-1.5 py-0.5 rounded font-medium">
              {product.category}
            </span>
          </div>

          {/* Price Section with Discount */}
          <div className="flex flex-col gap-0.5 mb-2">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              {hasDiscount ? (
                <>
                  <span className="text-lg font-bold text-orange-600">
                    ₹{currentPrice.toFixed(0)}
                  </span>
                  <span className="text-sm text-gray-400 line-through font-medium">
                    ₹{originalPrice.toFixed(0)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-900">
                  ₹{currentPrice.toFixed(0)}
                </span>
              )}
              {activeWeight && (
                <span className="text-xs text-gray-500 font-medium">
                  / {activeWeight.weight}
                  {activeWeight.weight_unit}
                </span>
              )}
            </div>
            {hasDiscount && (
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                  Save ₹{(originalPrice - currentPrice).toFixed(0)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Sliding Info Panel */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showInfo ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
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
            {product.weightOptions && product.weightOptions.length > 1 && (
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
                      className={`px-1.5 py-0.5 rounded text-xs font-medium transition-all duration-200 ${
                        selectedWeight?.weight === weight.weight
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
              {stockStatus.status === "out" ? (
                <button
                  disabled
                  className="w-full bg-gray-100 text-gray-400 font-medium py-2 px-3 rounded-lg cursor-not-allowed text-xs"
                >
                  Out of Stock
                </button>
              ) : currentWeightQuantity === 0 ? (
                <button
                  onClick={() =>
                    onAddToCart(
                      product,
                      customWeightEnabled ? activeWeight : selectedWeight
                    )
                  }
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 text-xs"
                >
                  <ShoppingBag
                    size={14}
                    className="transform transition-transform duration-300 group-hover:rotate-12"
                  />
                  <span>Add to Cart</span>
                </button>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        onUpdateQuantity(
                          product.id,
                          currentWeightQuantity - 1,
                          customWeightEnabled ? activeWeight : selectedWeight
                        )
                      }
                      className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center transition-colors"
                    >
                      <Minus size={10} className="text-gray-700" />
                    </button>
                    <div className="w-7 h-6 bg-orange-50 rounded flex items-center justify-center">
                      <span className="font-semibold text-gray-900 text-xs">
                        {currentWeightQuantity}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        onUpdateQuantity(
                          product.id,
                          currentWeightQuantity + 1,
                          customWeightEnabled ? activeWeight : selectedWeight
                        )
                      }
                      disabled={stockStatus.status === "out"}
                      className="w-6 h-6 bg-orange-600 hover:bg-orange-700 text-white rounded flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-gray-900">
                      ₹
                      {(
                        Number(
                          (customWeightEnabled
                            ? activeWeight?.price
                            : selectedWeight?.price) || product.price
                        ) * currentWeightQuantity
                      ).toFixed(0)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Add Button (Visible when info is hidden) */}
        {!showInfo &&
          currentWeightQuantity === 0 &&
          stockStatus.status !== "out" && (
            <div className="px-3 pb-3">
              <button
                onClick={() =>
                  onAddToCart(
                    product,
                    customWeightEnabled ? activeWeight : selectedWeight
                  )
                }
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 text-xs"
              >
                <ShoppingBag
                  size={14}
                  className="transform transition-transform duration-300"
                />
                <span>Add to Cart</span>
              </button>
            </div>
          )}
      </div>
    </div>
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
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(
    initialProducts || []
  );
  const [loading, setLoading] = useState(!initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Set up periodic refresh - always runs regardless of initialProducts
  useEffect(() => {
    // Start refreshing immediately, then every 2 seconds for faster updates
    console.log("🔄 Starting product refresh interval...");
    fetchProducts(); // Fetch immediately

    const refreshInterval = setInterval(() => {
      console.log("🔄 Refreshing products...");
      fetchProducts();
    }, 2000); // Refresh every 2 seconds for faster updates

    return () => {
      console.log("🛑 Stopping product refresh interval");
      clearInterval(refreshInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only set up once on mount

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
      // Add timestamp to prevent browser caching
      const timestamp = Date.now();
      const response = await fetch(`/api/products?t=${timestamp}`, {
        cache: "no-store", // Always fetch fresh data
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });
      if (!response.ok) {
        // Don't clear products on error, keep existing ones
        return;
      }
      const data = await response.json();
      const newProducts = Array.isArray(data) ? data : [];

      // ALWAYS update products - no comparison, just update
      // This ensures price changes from admin console are immediately reflected
      console.log(
        "🔄 Updating products from API:",
        newProducts.length,
        "products"
      );
      console.log(
        "📊 Product prices:",
        newProducts.slice(0, 5).map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          original_price: (p as any).original_price,
        }))
      );

      // Force update by creating a completely new array with new object references
      // This ensures React detects the change and re-renders all ProductCards
      // Use a unique timestamp for each product to force re-render
      const updateTimestamp = Date.now();
      const updatedProducts = newProducts.map((p, index) => ({
        ...p,
        // Create new object reference for each product with unique timestamp
        _updated: updateTimestamp + index, // Unique timestamp per product
        _refreshKey: Math.random(), // Random key to force React to see it as new
      }));

      console.log(
        "🔄 Setting products state with",
        updatedProducts.length,
        "products at",
        new Date().toLocaleTimeString()
      );

      // Force state update by clearing first, then setting new data
      // This guarantees React will re-render all ProductCards
      setProducts([]); // Clear first to force re-render
      setTimeout(() => {
        setProducts(updatedProducts);
      }, 0);

      // Update filtered products immediately with new references
      const updatedFiltered = newProducts.map((p, index) => ({
        ...p,
        _updated: updateTimestamp + index,
        _refreshKey: Math.random(),
      }));

      setFilteredProducts([]); // Clear first
      setTimeout(() => {
        setFilteredProducts(updatedFiltered);
      }, 0);
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

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Products
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="bg-gray-200 h-56"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 bg-gradient-to-b from-gray-50 via-orange-50/15 to-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.15),transparent_45%)] pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
          }`}
        >
          <p
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-orange-200 text-orange-700 text-xs sm:text-sm font-semibold shadow-sm transition-all duration-500 ${
              mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            style={{ transitionDelay: "0.1s" }}
          >
            <Sparkles className="h-4 w-4 text-orange-500" />
            Chef-selected for your kitchen
          </p>
          <h2
            className={`mt-4 text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "0.2s" }}
          >
            Product{" "}
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Collection
            </span>
          </h2>
          <p
            className={`mt-3 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "0.3s" }}
          >
            Browse ready-to-cook cuts, premium marinades, and chef specials
            crafted for weeknight dinners and weekend feasts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-8 items-start">
          {/* Sidebar */}
          <aside
            className={`space-y-6 transition-all duration-700 ${
              mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
            style={{ transitionDelay: "0.4s" }}
          >
            <div className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
              <p className="text-sm font-semibold text-gray-700">
                Search our catalog
              </p>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                <input
                  type="text"
                  placeholder="Chicken wings, curry cut..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-400 text-sm bg-white transition-all duration-300 hover:border-orange-300"
                />
              </div>
            </div>

            {categories.length > 1 && (
              <div className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-gray-700">
                    Browse by category
                  </p>
                  <span className="text-xs text-gray-500">
                    {categories.length - 1} options
                  </span>
                </div>
                <div className="space-y-2">
                  {categories.map((category, index) => {
                    const isActive = selectedCategory === category;
                    const label =
                      category === "all"
                        ? "All Products"
                        : category.charAt(0).toUpperCase() + category.slice(1);
                    const count =
                      category === "all"
                        ? products.length
                        : categoryCounts[category] || 0;
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] ${
                          isActive
                            ? "border-orange-300 bg-orange-50 text-orange-700 shadow-sm"
                            : "border-gray-100 bg-white text-gray-700 hover:border-orange-200 hover:bg-orange-50/60"
                        }`}
                      >
                        <span>{label}</span>
                        <span className="text-xs text-gray-500">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div
              className={`bg-gradient-to-br from-orange-600 to-red-600 text-white rounded-2xl p-6 shadow-lg space-y-4 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.5s" }}
            >
              <div>
                <p className="text-xs uppercase tracking-wide opacity-80">
                  Need a hand?
                </p>
                <h3 className="text-2xl font-bold">Talk to butcher-in-chief</h3>
              </div>
              <p className="text-sm text-orange-50/90 leading-relaxed">
                Unsure about portions or cuts? Call us and we'll portion it for
                your recipe, just like at the store.
              </p>
              <button
                onClick={() => (window.location.href = "tel:+918484978622")}
                className="w-full inline-flex items-center justify-center gap-2 bg-white/15 border border-white/30 rounded-xl py-3 text-sm font-semibold backdrop-blur transition-all duration-300 hover:bg-white/25 transform hover:scale-105 active:scale-95"
              >
                <PhoneCall className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                +91 84849 78622
              </button>
              {deliveryEnabled && (
                <div className="flex items-center gap-2 text-xs text-orange-50/80">
                  <Truck className="h-4 w-4" />
                  Same-day chilled delivery across Pune
                </div>
              )}
              {!deliveryEnabled && (
                <div className="flex items-center gap-2 text-xs text-orange-50/80">
                  <Store className="h-4 w-4" />
                  Available for pickup at store
                </div>
              )}
            </div>
          </aside>

          {/* Main content */}
          <div
            className={`space-y-8 transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "0.6s" }}
          >
            <div className="flex flex-wrap gap-3">
              {quickFilterOptions.map((filter, index) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedQuickFilter(filter.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border transform hover:scale-105 active:scale-95 ${
                    selectedQuickFilter === filter.id
                      ? "bg-gray-900 text-white border-gray-900 shadow-md"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                  style={{ transitionDelay: `${0.7 + index * 0.1}s` }}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filteredProducts.map((product, index) => {
                const isVisible = visibleProducts.has(product.id) || mounted;
                return (
                  <div
                    key={`product-${product.id}-${product.price}-${
                      (product as any).original_price || ""
                    }`}
                    className={`transition-all duration-500 ${
                      isVisible
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 translate-y-8 scale-95"
                    }`}
                    style={{ transitionDelay: `${index * 0.05}s` }}
                  >
                    <ProductCard
                      product={product}
                      isBestseller={bestsellerIds.includes(product.id)}
                      onAddToCart={addToCart}
                      onUpdateQuantity={updateQuantity}
                      getStockStatus={getStockStatus}
                      getWeightQuantity={getWeightQuantity}
                      index={index}
                    />
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-16 animate-bounce-in">
                <div className="bg-white border border-gray-200 rounded-2xl p-12 max-w-md mx-auto shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-6 text-sm">
                    We couldn't find any products matching your search.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedQuickFilter("all");
                    }}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
