"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Product, WeightOption } from "@/context/CartContext";
import { getProductFallbackImage } from "@/lib/productImageFallbacks";
import {
  Plus,
  Minus,
  Search,
  CheckCircle,
  AlertCircle,
  XCircle,
  ShoppingBag,
} from "lucide-react";

interface ProductCardProps {
  product: Product;
  isBestseller: boolean;
  onAddToCart: (product: Product, weight?: WeightOption) => void;
  onUpdateQuantity: (productId: number, quantity: number, weight?: WeightOption) => void;
  getStockStatus: (product: Product) => { status: string; label: string; color: string; icon: any };
  getWeightQuantity: (productId: number, weight?: WeightOption) => number;
  index?: number;
}

function getProductBadges(product: Product): string[] {
  const text = `${product.name} ${product.description || ""}`.toLowerCase();
  const badges = ["FRESH"];

  if (
    /\bboneless\b|fillet|mince|keema|kheema/.test(text) ||
    product.category === "boneless" ||
    product.category === "mince"
  ) {
    badges.push("BONELESS");
  } else if (
    /with bone|bone-in|whole chicken|whole bird|wing|drumstick|leg quarter|biryani cut|curry cut|soup bone|bones/.test(text) ||
    product.category === "withbone" ||
    product.category === "whole"
  ) {
    badges.push("WITH BONE");
  }

  if (/skinless/.test(text)) {
    badges.push("SKINLESS");
  } else if (/with skin|skin on|wing|drumstick|leg quarter|whole chicken|whole bird/.test(text)) {
    badges.push("WITH SKIN");
  }

  if (/curry cut/.test(text)) badges.push("CURRY CUT");
  else if (/whole chicken|whole bird/.test(text) || product.category === "whole") badges.push("WHOLE BIRD");
  else if (/biryani cut/.test(text)) badges.push("BIRYANI CUT");
  else if (/drumstick/.test(text)) badges.push("DRUMSTICKS");
  else if (/wing/.test(text)) badges.push("WINGS");
  else if (/mince|keema|kheema/.test(text)) badges.push("MINCE");

  return Array.from(new Set(badges)).slice(0, 3);
}

function matchesBoneFilter(product: Product, filter: string): boolean {
  const badges = getProductBadges(product);
  if (filter === "with-bone") return badges.includes("WITH BONE");
  if (filter === "without-bone") return badges.includes("BONELESS");
  return false;
}

function normalizeSelectedCategory(category?: string | null): string {
  if (!category) return "all";
  if (category === "withbone" || category === "with-bone") return "with-bone";
  if (category === "boneless" || category === "without-bone")
    return "without-bone";
  return category;
}

function shouldHideRawCategory(category?: string | null): boolean {
  return category === "withbone" || category === "boneless";
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
  const defaultWeight = product.weightOptions?.find((w) => w.is_default) || product.weightOptions?.[0];
  const [selectedWeight, setSelectedWeight] = useState<WeightOption | undefined>(defaultWeight);
  const [customWeightEnabled, setCustomWeightEnabled] = useState(false);
  const [customWeight, setCustomWeight] = useState<string>((defaultWeight?.weight || 500).toString());

  useEffect(() => {
    const currentWeightValue = selectedWeight?.weight;
    const matchingWeight = product.weightOptions?.find((w) => w.weight === currentWeightValue);
    if (!selectedWeight || !matchingWeight) {
      const newDefault = product.weightOptions?.find((w) => w.is_default) || product.weightOptions?.[0];
      if (newDefault) setSelectedWeight(newDefault);
    } else {
      setSelectedWeight(matchingWeight);
    }
  }, [product.id]);

  const baseProductPrice = Number(product.price);
  const baseOriginalPrice = Number((product as any).original_price || product.price);
  const isWholeChicken = product.name.toLowerCase().includes("whole chicken");

  const referenceWeight = selectedWeight?.weight || defaultWeight?.weight || 1000;
  const referencePrice = Number(selectedWeight?.price || defaultWeight?.price || product.price);
  const pricePerGram = referenceWeight > 0 ? referencePrice / referenceWeight : referencePrice;
  const originalPricePerGram = baseOriginalPrice > baseProductPrice ? baseOriginalPrice / referenceWeight : pricePerGram;

  const normalizeWeight = (v: number) => Math.max(100, Math.min(5000, isNaN(v) ? 500 : v));
  const customWeightValue = normalizeWeight(parseFloat(customWeight));
  const customPrice = Math.round(pricePerGram * customWeightValue);
  const customWeightOption: WeightOption = { id: customWeightValue, weight: customWeightValue, weight_unit: selectedWeight?.weight_unit || "g", price: customPrice, is_default: false };

  const activeWeight = isWholeChicken ? undefined : customWeightEnabled ? customWeightOption : selectedWeight;
  const currentPrice = isWholeChicken ? Number(product.price) : Number(activeWeight?.price || product.price);
  const hasDiscount = baseOriginalPrice > baseProductPrice;
  const discountPercent = hasDiscount ? Math.round(((baseOriginalPrice - baseProductPrice) / baseOriginalPrice) * 100) : 0;
  const currentWeightQuantity = getWeightQuantity(product.id, activeWeight);
  const badges = getProductBadges(product);

  return (
    <div className="product-card group relative">
      {/* Discount / bestseller badge */}
      {hasDiscount ? (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-brand-red text-white text-xs font-bold px-3 py-1.5 rounded-full badge-glow">{discountPercent}% OFF</span>
        </div>
      ) : isBestseller ? (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-brand-red text-white text-xs font-bold px-3 py-1.5 rounded-full badge-glow">Best Seller</span>
        </div>
      ) : null}

      {stockStatus.status === "out" && (
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-gray-700 text-white text-xs font-medium px-2 py-1 rounded-full">Out of Stock</span>
        </div>
      )}

      {/* Product image */}
      <div className="image-hover-zoom relative h-52 bg-gray-100">
        <Image
          src={product.image_url || getProductFallbackImage(product.name)}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-50" />
        <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
          {badges.map((badge, badgeIndex) => (
            <span
              key={`${product.id}-${badge}-${badgeIndex}`}
              className={badge === "FRESH"
                ? "fresh-tag text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
                : "cut-badge text-[10px] font-bold px-2 py-0.5 rounded-full"}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 min-w-0">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-base font-serif font-semibold text-gray-900 group-hover:text-brand-red transition-colors mb-1.5 leading-tight break-words">
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <p className="text-gray-500 text-sm mb-3 line-clamp-2 leading-relaxed break-words">
            {product.description}
          </p>
        )}

        {/* Weight options */}
        {!isWholeChicken && product.weightOptions && product.weightOptions.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.weightOptions.map((w) => (
              <button
                key={w.id || w.weight}
                type="button"
                onClick={() => { setSelectedWeight(w); setCustomWeightEnabled(false); }}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                  selectedWeight?.weight === w.weight && !customWeightEnabled
                    ? "bg-brand-red text-white border-brand-red"
                    : "bg-white text-gray-600 border-gray-200 hover:border-brand-red hover:text-brand-red"
                }`}
              >
                {w.weight}{w.weight_unit}
              </button>
            ))}
          </div>
        )}

        {/* Price + Add */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-xl font-bold price-tag">
              ₹{currentPrice.toFixed(0)}
            </span>
            {activeWeight && !isWholeChicken && (
              <span className="text-gray-400 text-xs ml-1">/{activeWeight.weight}{activeWeight.weight_unit}</span>
            )}
            {hasDiscount && (
              <span className="ml-2 text-xs line-through text-gray-400">
                ₹{Math.round(originalPricePerGram * referenceWeight)}
              </span>
            )}
          </div>

          {stockStatus.status === "out" ? (
            <button disabled className="px-4 py-2 rounded-full bg-gray-100 text-gray-400 text-sm font-semibold cursor-not-allowed">
              Out of Stock
            </button>
          ) : currentWeightQuantity === 0 ? (
            <button
              type="button"
              onClick={() => onAddToCart(product, isWholeChicken ? undefined : activeWeight)}
              className="btn-primary px-5 py-2 rounded-full text-white text-sm font-semibold flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
              <button
                type="button"
                onClick={() => onUpdateQuantity(product.id, currentWeightQuantity - 1, isWholeChicken ? undefined : activeWeight)}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-700 hover:bg-brand-red hover:text-white transition-colors border border-gray-200"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-gray-900 font-semibold w-6 text-center text-sm">{currentWeightQuantity}</span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(product.id, currentWeightQuantity + 1, isWholeChicken ? undefined : activeWeight)}
                disabled={stockStatus.status === "out"}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-700 hover:bg-brand-red hover:text-white transition-colors border border-gray-200 disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ProductCatalogProps {
  initialProducts?: Product[];
  deliveryEnabled?: boolean;
}

export default function ProductCatalog({ initialProducts, deliveryEnabled = true }: ProductCatalogProps = {}) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);
  const [searchTerm, setSearchTerm] = useState(searchParams?.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(() =>
    normalizeSelectedCategory(searchParams?.get("category"))
  );
  const [sortBy, setSortBy] = useState<"popular" | "price_low" | "price_high" | "name">("popular");
  const { state, dispatch } = useCart();

  const bestsellerIds = [1, 2, 3];

  const categoryFilters = [
    { value: "all", label: "All Cuts" },
    { value: "with-bone", label: "With Bone" },
    { value: "without-bone", label: "Without Bone" },
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))
      .filter((category) => !shouldHideRawCategory(category as string))
      .map((category) => ({
        value: category as string,
        label: String(category).replace(/[_-]/g, " "),
      })),
  ].filter(
    (filter, index, arr) =>
      arr.findIndex((item) => item.value === filter.value) === index
  );

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
      setFilteredProducts(initialProducts);
      setLoading(false);
    } else if (!initialProducts) {
      fetchProducts();
    }
    const urlSearch = searchParams?.get("search");
    if (urlSearch) setSearchTerm(urlSearch);
    const urlCategory = searchParams?.get("category");
    if (urlCategory) setSelectedCategory(normalizeSelectedCategory(urlCategory));
  }, []);

  useEffect(() => {
    if (!initialProducts || initialProducts.length === 0) {
      const interval = setInterval(fetchProducts, 30000);
      return () => clearInterval(interval);
    }
  }, [initialProducts]);

  const filterAndSortProducts = () => {
    let filtered = products;
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) =>
        selectedCategory === "with-bone" || selectedCategory === "without-bone"
          ? matchesBoneFilter(product, selectedCategory)
          : product.category === selectedCategory
      );
    }
    if (searchTerm) filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase()));

    if (sortBy === "price_low") filtered = [...filtered].sort((a, b) => Number(a.price) - Number(b.price));
    else if (sortBy === "price_high") filtered = [...filtered].sort((a, b) => Number(b.price) - Number(a.price));
    else if (sortBy === "name") filtered = [...filtered].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    else filtered = [...filtered].sort((a, b) => { const ai = bestsellerIds.indexOf(a.id), bi = bestsellerIds.indexOf(b.id); if (ai !== -1 && bi !== -1) return ai - bi; if (ai !== -1) return -1; if (bi !== -1) return 1; return 0; });

    setFilteredProducts(filtered);
  };

  useEffect(() => { filterAndSortProducts(); }, [products, searchTerm, selectedCategory, sortBy]);

  const getStockStatus = (product: Product) => {
    if (!product.in_stock || (product.stock_quantity ?? 0) === 0) return { status: "out", label: "Out of Stock", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle };
    if ((product.stock_quantity ?? 100) <= (product.low_stock_threshold ?? 10)) return { status: "low", label: "Low Stock", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: AlertCircle };
    return { status: "in", label: "In Stock", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle };
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) return;
      const data = await res.json();
      const newProducts = Array.isArray(data) ? data : [];
      setProducts((prev) => {
        if (prev.length === 0) return newProducts;
        const oldMap = new Map(prev.map((p) => [p.id, p]));
        const changed = prev.length !== newProducts.length || newProducts.some((np) => {
          const op = oldMap.get(np.id);
          return !op || op.price !== np.price || (op as any).original_price !== (np as any).original_price || op.stock_quantity !== np.stock_quantity || op.in_stock !== np.in_stock;
        });
        return changed ? newProducts : prev;
      });
    } catch {}
    finally { setLoading(false); }
  };

  const addToCart = (product: Product, selectedWeight?: WeightOption) => {
    const productToAdd = selectedWeight ? { ...product, price: selectedWeight.price } : product;
    dispatch({ type: "ADD_ITEM", payload: { product: productToAdd, quantity: 1, selectedWeight: selectedWeight || product.weightOptions?.find((w) => w.is_default) || undefined } });
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const updateQuantity = (productId: number, quantity: number, selectedWeight?: WeightOption) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity, selectedWeight } });
  };

  const isSameWeightOption = (a?: WeightOption, b?: WeightOption) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a.weight === b.weight && a.weight_unit === b.weight_unit && a.id === b.id;
  };

  const getWeightQuantity = (productId: number, weightOption?: WeightOption) => {
    const item = state.items.find((i) => i.product.id === productId && isSameWeightOption(i.selectedWeight, weightOption));
    return item ? item.quantity : 0;
  };

  if (loading && !products.length) {
    return (
      <section className="pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl h-80 animate-pulse">
                <div className="bg-gray-100 h-52 w-full" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="pb-20 bg-white w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category filter pills */}
        <div className="flex gap-3 overflow-x-auto scroll-hidden mobile-scroll touch-pan-x pb-4 pr-4 justify-start md:justify-center mb-8 snap-x snap-proximity">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`category-pill px-5 py-2.5 rounded-full ${selectedCategory === "all" ? "active" : ""}`}
          >
            All Cuts
          </button>
          {categoryFilters
            .filter((filter) => filter.value !== "all")
            .map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setSelectedCategory(filter.value)}
              className={`category-pill px-5 py-2.5 rounded-full capitalize snap-start ${selectedCategory === filter.value ? "active" : ""}`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Search + sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search chicken cuts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 text-gray-900 pl-11 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none search-glow transition-all text-sm placeholder-gray-400"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none search-glow"
          >
            <option value="popular">Popular</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        {/* Products grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                isBestseller={bestsellerIds.includes(product.id)}
                getStockStatus={getStockStatus}
                getWeightQuantity={getWeightQuantity}
                onAddToCart={addToCart}
                onUpdateQuantity={updateQuantity}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 text-sm mb-6">Try a different search term or category filter.</p>
            <button
              type="button"
              onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}
              className="btn-primary px-6 py-2.5 rounded-full text-white font-semibold text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
