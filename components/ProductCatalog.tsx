"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Product, WeightOption } from "@/context/CartContext";
import {
  Plus,
  Minus,
  Search,
  Sparkles,
  ShoppingBag,
  Filter,
  X,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StickyCart from "./StickyCart";

interface ProductCardProps {
  product: Product;
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
}

function ProductCard({
  product,
  onAddToCart,
  onUpdateQuantity,
  getStockStatus,
  getWeightQuantity,
}: ProductCardProps) {
  const stockStatus = getStockStatus(product);

  // Set default weight
  const defaultWeight =
    product.weightOptions?.find((w) => w.is_default) ||
    product.weightOptions?.[0];

  const [selectedWeight, setSelectedWeight] = useState<WeightOption | undefined>(defaultWeight);

  useEffect(() => {
    if (!selectedWeight && product.weightOptions?.length) {
      const def = product.weightOptions.find((w) => w.is_default) || product.weightOptions[0];
      setSelectedWeight(def);
    }
  }, [product.id, product.weightOptions]);

  const isWholeChicken = product.name.toLowerCase().includes("whole chicken");
  const activeWeight = isWholeChicken ? undefined : selectedWeight;

  // Price Calculation
  const currentPrice = isWholeChicken
    ? Number(product.price)
    : Number(activeWeight?.price || product.price);

  const originalPriceBase = Number((product as any).original_price || product.price);
  const priceBase = Number(product.price);
  const hasDiscount = originalPriceBase > priceBase;
  const discountPercent = hasDiscount
    ? Math.round(((originalPriceBase - priceBase) / originalPriceBase) * 100)
    : 0;

  const displayOriginalPrice = hasDiscount ? Math.round(currentPrice * (1 + discountPercent / 100)) : currentPrice;

  const currentWeightQuantity = getWeightQuantity(product.id, activeWeight);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full bg-gray-50 overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={`${product.name} - Fresh premium chicken from K2 Chicken, Bidar. ${product.category} category.`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl" aria-label={`${product.name} - Fresh premium chicken`}>🍗</div>
        )}

        {/* Badges */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <Sparkles size={10} />
            {discountPercent}% OFF
          </div>
        )}

        {/* Express Delivery Badge */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-[2px] text-gray-800 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 border border-gray-100">
          <Clock size={10} className="text-orange-500" />
          <span>45 MINS</span>
        </div>

        {stockStatus.status === "out" && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="bg-gray-900 text-white px-3 py-1 text-xs font-bold rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 mb-1 group-hover:text-orange-600 transition-colors">
              {product.name}
            </h3>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3 h-8 leading-relaxed">
          {product.description || "Fresh, premium quality meat cut for perfection. Antibiotic-free and farm fresh."}
        </p>

        {/* Specs Row */}
        <div className="flex items-center gap-2 mb-4 text-[10px] sm:text-xs text-gray-500 font-medium bg-gray-50 p-1.5 rounded-lg w-fit">
          {!isWholeChicken && activeWeight ? (
            <span>Net wt: {activeWeight.weight}{activeWeight.weight_unit}</span>
          ) : (
            <span>Gross wt: 1kg</span> // Fallback
              )}
            </div>

        {/* Spacer */}
        <div className="flex-grow"></div>

        {/* Bottom Row - Price & Action */}
        <div className="flex items-end justify-between gap-2 pt-2 border-t border-dashed border-gray-100 mt-2">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[10px] text-gray-400 line-through">₹{displayOriginalPrice}</span>
            )}
            <span className="text-base sm:text-lg font-bold text-gray-900">₹{currentPrice}</span>
        </div>

          <div className="w-24 sm:w-28 relative h-9 sm:h-10">
            {stockStatus.status === "out" ? (
              <button disabled className="w-full h-full bg-gray-100 text-gray-400 text-xs font-bold rounded-lg border border-gray-200 cursor-not-allowed">
                SOLD OUT
                    </button>
            ) : currentWeightQuantity === 0 ? (
                  <button
                onClick={() => onAddToCart(product, activeWeight)}
                className="w-full h-full bg-white text-orange-600 border border-orange-200 hover:bg-orange-50 hover:border-orange-300 text-xs sm:text-sm font-bold rounded-lg uppercase transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1"
                  >
                ADD <Plus size={14} strokeWidth={3} />
                  </button>
            ) : (
              <div className="w-full h-full flex items-center justify-between bg-orange-600 rounded-lg text-white shadow-md overflow-hidden">
                <button
                  onClick={() => onUpdateQuantity(product.id, currentWeightQuantity - 1, activeWeight)}
                  className="w-8 h-full flex items-center justify-center hover:bg-orange-700 transition-colors"
                >
                  <Minus size={14} strokeWidth={3} />
                </button>
                <span className="text-sm font-bold">{currentWeightQuantity}</span>
                <button
                  onClick={() => onUpdateQuantity(product.id, currentWeightQuantity + 1, activeWeight)}
                  className="w-8 h-full flex items-center justify-center hover:bg-orange-700 transition-colors"
                >
                  <Plus size={14} strokeWidth={3} />
                </button>
                </div>
              )}
          </div>
        </div>
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
  const searchParams = useSearchParams();
  const { state, dispatch } = useCart();
  const [products] = useState<Product[]>(initialProducts || []);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts || []);
  const [searchTerm, setSearchTerm] = useState(searchParams?.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string>("all");
  const [mounted, setMounted] = useState(false);

  // Categories Handling
  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
  ];

  /* 
  const categoryCounts = products.reduce<Record<string, number>>(
    (acc, product) => {
      const group = product.category || "Other";
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    },
    {}
  );
  */

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter products when dependencies change
  useEffect(() => {
    let result = products;

    // 1. Search Query
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
      );
    }

    // 2. Category Filter
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, products]); // Updated dependencies

  // Cart Actions
  const addToCart = (product: Product, weight?: WeightOption) => {
    dispatch({
      type: "ADD_ITEM",
      payload: { product, selectedWeight: weight, quantity: 1 },
    });
  };

  const updateQuantity = (
    productId: number,
    quantity: number,
    weight?: WeightOption
  ) => {
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { productId, selectedWeight: weight, quantity },
    });
  };

  const getWeightQuantity = (productId: number, weight?: WeightOption) => {
    if (!mounted) return 0;
    const item = state.items.find(
      (item) =>
        item.product.id === productId &&
        (weight ? item.selectedWeight?.id === weight.id : true)
    );
    return item?.quantity || 0;
  };

  const getStockStatus = (product: Product) => {
    if ((product.in_stock === false) || (product.stock_quantity ?? 100) <= 0) {
      return { status: "out", label: "Out of Stock", color: "red", icon: XCircle };
    }
    return { status: "in", label: "In Stock", color: "green", icon: CheckCircle };
  };

    return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header & Filters */}
      <div className="flex flex-col space-y-6 mb-8 sm:mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              Explore Our Menu
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{filteredProducts.length} items</span>
            </h2>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">Fresh cuts delivered directly from farm to your kitchen.</p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80 group">
                <input
                  type="text"
              placeholder="Search for 'Chicken Breast'..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm group-hover:shadow-md"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-orange-500 transition-colors" size={20} />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
              )}
            </div>
        </div>

        {/* Categories Rail (Simple version for Filter Catalog) */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((category) => (
                <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border ${selectedCategory === category
                ? "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-200 transform scale-105"
                : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50"
                }`}
            >
              {category === "all" ? "All Products" : category}
                </button>
              ))}
        </div>
            </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="h-full"
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={addToCart}
                      onUpdateQuantity={updateQuantity}
                      getStockStatus={getStockStatus}
                      getWeightQuantity={getWeightQuantity}
                    />
              </motion.div>
            ))}
          </AnimatePresence>
                  </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Search className="text-orange-400" size={32} />
            </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 max-w-xs mx-auto mb-8">
            We couldn't find any items matching your search. Try different keywords or browse all categories.
                  </p>
                  <button
            onClick={() => { setSelectedCategory("all"); setSearchTerm("") }}
            className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
          >
            Clear All Filters
                  </button>
        </div>
      )}

      {/* Sticky Cart on Mobile */}
      <StickyCart />
      </div>
  );
}
