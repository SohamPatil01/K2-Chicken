"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Product, WeightOption } from "@/context/CartContext";
import {
  Plus,
  Minus,
  Search,
  Filter,
  Star,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";

type SortOption =
  | "default"
  | "price-low"
  | "price-high"
  | "name-asc"
  | "name-desc"
  | "newest";

interface ProductCardProps {
  product: Product;
  isBestseller: boolean;
  cartQuantity: number;
  onAddToCart: (product: Product, weight?: WeightOption) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  getStockStatus: (product: Product) => {
    status: string;
    label: string;
    color: string;
    icon: any;
  };
  index?: number;
}

function ProductCard({
  product,
  isBestseller,
  cartQuantity,
  onAddToCart,
  onUpdateQuantity,
  getStockStatus,
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

  return (
    <div
      className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-all duration-500 hover:shadow-lg"
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
    >
      {/* Bestseller Badge */}
      {isBestseller && (
        <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm text-orange-600 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm border border-orange-100">
          <Star className="h-3 w-3 fill-orange-500" />
          <span>Bestseller</span>
        </div>
      )}

      {/* Stock Badge */}
      <div
        className={`absolute top-3 right-3 z-10 ${stockStatus.color} px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border shadow-sm backdrop-blur-sm bg-white/90`}
      >
        <StockIcon className="h-3 w-3" />
        <span className="hidden sm:inline">{stockStatus.label}</span>
      </div>

      {/* Product Image Container */}
      <div className="relative h-52 sm:h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {product.image_url ? (
          <div className="relative w-full h-full">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              quality={95}
              priority={index < 6}
              style={{
                objectFit: 'cover',
              }}
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                const fallback = target.parentElement?.nextElementSibling as HTMLElement | null;
                if (fallback) {
                  fallback.style.display = "flex";
                }
              }}
            />
          </div>
        ) : null}
        <div
          className={`absolute inset-0 w-full h-full ${
            product.image_url ? "hidden" : "flex"
          } bg-gradient-to-br from-orange-50 to-red-50 items-center justify-center`}
        >
          <span className="text-6xl transform transition-transform duration-500 group-hover:scale-110">
            🍗
          </span>
        </div>

        {/* Gradient Overlay for Info Panel */}
        <div
          className={`absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent transition-opacity duration-500 ${
            showInfo ? "opacity-0" : "opacity-100"
          }`}
        ></div>
      </div>

      {/* Product Info - Sliding Panel */}
      <div className="relative overflow-hidden">
        {/* Basic Info (Always Visible) */}
        <div className="p-3 pb-2.5">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
              {product.name}
            </h3>
            <span className="text-xs text-gray-400 capitalize bg-gray-50 px-2 py-0.5 rounded-md font-medium ml-2 whitespace-nowrap">
              {product.category}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-xl font-semibold text-gray-900">
              ₹{Number(selectedWeight?.price || product.price).toFixed(0)}
            </span>
            {selectedWeight && (
              <span className="text-xs text-gray-400 font-normal">
                / {selectedWeight.weight}
                {selectedWeight.weight_unit}
              </span>
            )}
          </div>
        </div>

        {/* Sliding Info Panel */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            showInfo ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description ||
                "Fresh and delicious premium quality chicken."}
            </p>

            {/* Weight Options Selector */}
            {product.weightOptions && product.weightOptions.length > 1 && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">
                  Select Weight:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {product.weightOptions.map((weight) => (
                    <button
                      key={weight.id || weight.weight}
                      onClick={() => setSelectedWeight(weight)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
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
            <div className="pt-2">
              {stockStatus.status === "out" ? (
                <button
                  disabled
                  className="w-full bg-gray-100 text-gray-400 font-medium py-2.5 px-4 rounded-lg cursor-not-allowed text-sm"
                >
                  Out of Stock
                </button>
              ) : cartQuantity === 0 ? (
                <button
                  onClick={() => onAddToCart(product, selectedWeight)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md text-sm"
                >
                  <Plus
                    size={16}
                    className="transform transition-transform duration-300"
                  />
                  <span>Add to Cart</span>
                </button>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        onUpdateQuantity(product.id, cartQuantity - 1)
                      }
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Minus size={14} className="text-gray-700" />
                    </button>
                    <div className="w-9 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                      <span className="font-semibold text-gray-900 text-sm">
                        {cartQuantity}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        onUpdateQuantity(product.id, cartQuantity + 1)
                      }
                      disabled={stockStatus.status === "out"}
                      className="w-8 h-8 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-semibold text-gray-900">
                      ₹
                      {(
                        Number(selectedWeight?.price || product.price) *
                        cartQuantity
                      ).toFixed(0)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Add Button (Visible when info is hidden) */}
        {!showInfo && cartQuantity === 0 && stockStatus.status !== "out" && (
          <div className="px-4 pb-4">
            <button
              onClick={() => onAddToCart(product, selectedWeight)}
              className="w-full bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-600 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 text-sm border border-gray-100 hover:border-orange-200"
            >
              <Plus size={16} />
              <span>Quick Add</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface ProductCatalogProps {
  initialProducts?: Product[];
}

export default function ProductCatalog({
  initialProducts,
}: ProductCatalogProps = {}) {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(!initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const { state, dispatch } = useCart();

  // Bestseller products (you can make this dynamic based on order data)
  const bestsellerIds = [1, 2, 3]; // Chicken Breast, Chicken Curry Cut, Chicken Wings

  useEffect(() => {
    if (!initialProducts) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [initialProducts]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortOption]);

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

  const filterAndSortProducts = () => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Sort products
    filtered = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "price-low":
          return Number(a.price) - Number(b.price);
        case "price-high":
          return Number(b.price) - Number(a.price);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "newest":
          return (b.id || 0) - (a.id || 0);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const getCategories = () => {
    const categories = [
      "all",
      ...Array.from(new Set(products.map((p) => p.category))),
    ];
    return categories;
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
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

  const updateQuantity = (productId: number, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
  };

  const getCartQuantity = (productId: number) => {
    const item = state.items.find((item) => item.product.id === productId);
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
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 px-4 animate-slide-down">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
            <span>🍗</span>
            <span>Fresh Daily</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-3 sm:mb-4 animate-slide-up stagger-1">
            Our{" "}
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Products
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto animate-slide-up stagger-2">
            Handcrafted with premium ingredients and our secret family recipes
          </p>
        </div>

        {/* Search, Filter and Sort Bar */}
        <div className="mb-8 sm:mb-12 bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 mx-4 sm:mx-0 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up stagger-3">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white text-sm sm:text-base"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Filter className="text-gray-400 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white font-medium sm:min-w-[180px] text-sm sm:text-base"
              >
                {getCategories().map((category) => (
                  <option key={category} value={category}>
                    {category === "all"
                      ? "All Categories"
                      : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Option */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ArrowUpDown className="text-gray-400 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white font-medium sm:min-w-[180px] text-sm sm:text-base"
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard
                product={product}
                isBestseller={bestsellerIds.includes(product.id)}
                cartQuantity={getCartQuantity(product.id)}
                onAddToCart={addToCart}
                onUpdateQuantity={updateQuantity}
                getStockStatus={getStockStatus}
                index={index}
              />
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-16 animate-bounce-in">
            <div className="bg-white border border-gray-200 rounded-2xl p-12 max-w-md mx-auto shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-transform duration-300 hover:scale-110">
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
                  setSelectedCategory("all");
                  setSortOption("default");
                }}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
