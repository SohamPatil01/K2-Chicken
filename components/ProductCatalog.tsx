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

  const tagLabel = hasDiscount
    ? `${discountPercent}% OFF`
    : isBestseller
      ? "BESTSELLER"
      : "FRESH TODAY";

  return (
    <div className="product-card group relative flex flex-col">
      <div className="absolute top-3 left-3 z-10">
        <span className="fresh-tag rounded-pill px-2.5 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-wider">
          {tagLabel}
        </span>
      </div>

      {stockStatus.status === "out" && (
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-gray-700 text-white text-xs font-medium px-2 py-1 rounded-full">Out of Stock</span>
        </div>
      )}

      <div className="image-hover-zoom relative aspect-[4/3] bg-gradient-to-br from-[#F3E2C8] to-[#E9C9A1]">
        <Image
          src={product.image_url || getProductFallbackImage(product.name)}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center"
          unoptimized
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5 min-w-0">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-display text-lg font-bold text-k2-green-deep transition-colors group-hover:text-k2-saffron leading-tight break-words">
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <p className="flex-1 text-[13.5px] text-[#5a6a61] line-clamp-2 leading-relaxed break-words">
            {product.description}
          </p>
        )}

        {!isWholeChicken && product.weightOptions && product.weightOptions.length > 1 && (
          <div className="weight-toggle" role="group" aria-label="weight">
            {product.weightOptions.map((w) => (
              <button
                key={w.id || w.weight}
                type="button"
                onClick={() => { setSelectedWeight(w); setCustomWeightEnabled(false); }}
                className={selectedWeight?.weight === w.weight && !customWeightEnabled ? "on" : ""}
              >
                {w.weight}{w.weight_unit}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="price-tag text-2xl">
              ₹{currentPrice.toFixed(0)}
            </span>
            <small className="ml-1 font-mono text-[11px] text-[#7b877f]">
              incl. taxes
            </small>
            {hasDiscount && (
              <span className="ml-2 text-xs line-through text-[#7b877f]">
                ₹{Math.round(originalPricePerGram * referenceWeight)}
              </span>
            )}
          </div>

          {stockStatus.status === "out" ? (
            <button disabled className="rounded-pill bg-k2-cream-dark px-4 py-2 text-sm font-semibold text-[#7b877f] cursor-not-allowed">
              Out of Stock
            </button>
          ) : currentWeightQuantity === 0 ? (
            <button
              type="button"
              onClick={() => onAddToCart(product, isWholeChicken ? undefined : activeWeight)}
              className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-k2-saffron text-2xl leading-none text-white transition-all hover:scale-110 hover:bg-k2-saffron-hot hover:rotate-90"
              aria-label={`Add ${product.name} to cart`}
            >
              +
            </button>
          ) : (
            <div className="flex items-center gap-1.5 rounded-pill bg-k2-cream-dark p-1">
              <button
                type="button"
                onClick={() => onUpdateQuantity(product.id, currentWeightQuantity - 1, isWholeChicken ? undefined : activeWeight)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-k2-green transition-colors hover:bg-k2-green hover:text-k2-cream"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-sm font-semibold text-k2-ink">{currentWeightQuantity}</span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(product.id, currentWeightQuantity + 1, isWholeChicken ? undefined : activeWeight)}
                disabled={stockStatus.status === "out"}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-k2-saffron text-white transition-colors hover:bg-k2-saffron-hot disabled:opacity-50"
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
    if (!product.in_stock || (product.stock_quantity ?? 0) === 0) return { status: "out", label: "Out of Stock", color: "bg-red-100 text-k2-saffron-hot border-k2-paper", icon: XCircle };
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
      <section
        className="pb-20 bg-white"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Loading products"
      >
        <span className="sr-only">Loading products</span>
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-k2-paper rounded-card h-80 animate-pulse">
                <div className="bg-k2-cream-dark h-52 w-full" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-k2-cream-dark rounded w-3/4" />
                  <div className="h-4 bg-k2-cream-dark rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="w-full overflow-x-hidden bg-k2-cream pb-20">
      <div className="mx-auto max-w-[1180px] px-6">
        {/* Category filter pills — centered on phone; wrap instead of one-sided scroll */}
        <div className="mb-8 flex w-full justify-center">
          <div className="flex w-full max-w-4xl flex-wrap justify-center gap-2 sm:gap-2.5 md:gap-3">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`category-pill shrink-0 rounded-full px-3.5 py-2 text-xs font-medium sm:px-5 sm:py-2.5 sm:text-sm ${selectedCategory === "all" ? "active" : ""}`}
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
                  className={`category-pill shrink-0 rounded-full px-3.5 py-2 text-xs font-medium capitalize sm:px-5 sm:py-2.5 sm:text-sm ${selectedCategory === filter.value ? "active" : ""}`}
                >
                  {filter.label}
                </button>
              ))}
          </div>
        </div>

        {/* Search + sort */}
        <div className="mb-8 flex w-full flex-col gap-3 sm:flex-row sm:items-stretch">
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <input
              type="text"
              placeholder="Search chicken cuts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-k2-paper bg-k2-cream-dark py-3 pl-11 pr-4 text-sm text-k2-green-deep placeholder-gray-400 transition-all search-glow focus:outline-none"
            />
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full shrink-0 rounded-full border border-k2-paper bg-white px-4 py-3 text-sm font-medium text-k2-ink focus:outline-none search-glow sm:w-auto sm:min-w-[11rem]"
          >
            <option value="popular">Popular</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="text-center py-20 bg-white rounded-card-lg border border-dashed border-k2-paper">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-k2-green-deep mb-2">No products found</h3>
            <p className="text-[#7b877f] text-sm mb-6">Try a different search term or category filter.</p>
            <button
              type="button"
              onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}
              className="btn-primary px-6 py-2.5 rounded-full text-white font-semibold text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 rounded-card bg-k2-green p-7 text-k2-cream sm:p-8">
          <div className="max-w-xl">
            <h3 className="font-display text-[22px] font-bold">
              🔪 Want it cut your way?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-k2-cream/80">
              Biryani cut, 16 pieces, butterflied breast, skin off — our master
              butchers cut to your exact instructions. Just add a note at
              checkout, free of charge.
            </p>
          </div>
          <Link
            href="/cart"
            className="btn-primary inline-flex items-center gap-2 rounded-pill px-7 py-3.5 text-[15px] font-semibold"
          >
            Add Custom Instructions
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
