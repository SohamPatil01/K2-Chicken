"use client";

import { useState, useEffect } from "react";
import {
  Star,
  ShoppingCart,
  Heart,
  Zap,
  ArrowRight,
  Plus,
  Minus,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Product } from "@/context/CartContext";
import Link from "next/link";

interface FeaturedProductsProps {
  products?: Product[];
}

const ProductCard = ({ product }: { product: Product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { state, dispatch } = useCart();

  const cartItem = state.items.find((item) => item.product.id === product.id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const addToCart = () => {
    dispatch({ type: "ADD_ITEM", payload: { product, quantity: 1 } });
  };

  const updateQuantity = (quantity: number) => {
    if (quantity <= 0) {
      dispatch({ type: "REMOVE_ITEM", payload: { productId: product.id } });
    } else {
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { productId: product.id, quantity },
      });
    }
  };

  return (
    <div
      className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-orange-300 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container - Licious Style */}
      <div className="relative h-56 bg-white overflow-hidden border-b border-gray-100">
        {product.image_url ? (
          <div className="relative w-full h-full p-4">
            <img
              src={product.image_url}
              alt={product.name}
              className={`w-full h-full object-contain transition-transform duration-300 ${
                isHovered ? "scale-105" : "scale-100"
              }`}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget
                  .nextElementSibling as HTMLElement | null;
                if (fallback) {
                  fallback.style.display = "flex";
                }
              }}
            />
          </div>
        ) : null}
        <div
          className={`w-full h-full ${
            product.image_url ? "hidden" : "flex"
          } bg-gray-50 items-center justify-center`}
        >
          <span className="text-6xl">🍗</span>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold rounded-full capitalize">
            {product.category}
          </span>
        </div>

        {/* Add to Cart Button - Slides up on hover */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${
            isHovered && cartQuantity === 0
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0"
          }`}
        >
          <button
            onClick={addToCart}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-orange-700 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <ShoppingCart size={20} />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        {/* Product Name */}
        <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-orange-600 transition-colors duration-300">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">
              ₹{Number(product.price).toFixed(0)}
            </span>
          </div>
        </div>

        {/* Cart Controls */}
        {cartQuantity > 0 ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(cartQuantity - 1)}
                className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
              >
                <Minus size={16} className="text-gray-700" />
              </button>
              <div className="w-10 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
                <span className="font-bold text-gray-900">{cartQuantity}</span>
              </div>
              <button
                onClick={() => updateQuantity(cartQuantity + 1)}
                className="w-9 h-9 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg flex items-center justify-center transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                ₹{(Number(product.price) * cartQuantity).toFixed(0)}
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={addToCart}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus size={18} />
            <span>Add to Cart</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default function FeaturedProducts({
  products: propProducts,
}: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      const allProducts = Array.isArray(data) ? data : [];
      // Get featured products (first 4 or products with specific IDs)
      const featuredIds = [1, 2, 3, 4]; // Adjust based on your featured product IDs
      const featured = allProducts
        .filter((p: Product) => featuredIds.includes(p.id))
        .slice(0, 4);
      setProducts(featured.length > 0 ? featured : allProducts.slice(0, 4));
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products if not provided
  useEffect(() => {
    if (propProducts) {
      setProducts(propProducts);
      setLoading(false);
    } else {
      fetchProducts();
    }
  }, [propProducts]);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 rounded-full px-4 py-2 mb-6">
            <Zap className="text-orange-600" size={18} />
            <span className="text-sm font-semibold text-orange-700">
              Featured Products
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
            Our{" "}
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Best Sellers
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Handpicked selection of premium chicken products with exceptional
            quality
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Link href="/#products">
            <button className="group bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto">
              View All Products
              <ArrowRight
                className="group-hover:translate-x-1 transition-transform duration-300"
                size={20}
              />
            </button>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { number: "10K+", label: "Happy Customers" },
            { number: "500+", label: "Orders Delivered" },
            { number: "30min", label: "Fast Delivery" },
            { number: "4.8★", label: "Average Rating" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 border border-gray-100"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
