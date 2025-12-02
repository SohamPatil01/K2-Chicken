"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
  LogIn,
  Home,
  Package,
  ChefHat,
  Phone,
  Star,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { state } = useCart();
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  const [hash, setHash] = useState<string>("");

  useEffect(() => {
    // Check hash on mount and when pathname changes
    const checkHash = () => {
      if (typeof window !== "undefined") {
        setHash(window.location.hash);
      }
    };

    // Initial check
    checkHash();

    // Listen for hash changes
    window.addEventListener("hashchange", checkHash);
    // Listen for popstate (browser back/forward)
    window.addEventListener("popstate", checkHash);

    // Check hash after a short delay when pathname changes (for Next.js routing)
    const timeout = setTimeout(checkHash, 50);

    return () => {
      window.removeEventListener("hashchange", checkHash);
      window.removeEventListener("popstate", checkHash);
      clearTimeout(timeout);
    };
  }, [pathname]);

  const scrollToSection = (sectionId: string) => {
    if (typeof window === "undefined") return;
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleHomeClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      event.preventDefault();
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.replaceState(null, "", "/");
      }
      setHash("");
    }
  };

  const handleProductsClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      event.preventDefault();
      scrollToSection("products");
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", "#products");
      }
      setHash("#products");
    }
  };

  const isActive = (path: string) => {
    if (path === "/") {
      // Home is active only if we're on home page and not on products section
      return pathname === "/" && hash !== "#products";
    }
    if (path === "/#products") {
      // Products is active if we're on home page and hash is #products
      return pathname === "/" && hash === "#products";
    }
    return pathname?.startsWith(path);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/98 backdrop-blur-xl shadow-lg border-b border-orange-100/60"
          : "bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-100/40"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link
            href="/"
            prefetch={true}
            className="group flex items-center gap-3 animate-slide-down hover:opacity-90 transition-opacity duration-300"
          >
            <div className="relative">
              {/* Subtle glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              <img
                src="/logo.png"
                alt="Chicken Vicken - Baramati Agro"
                className="h-12 sm:h-16 w-auto rounded-2xl group-hover:scale-105 transition-all duration-300 drop-shadow-sm"
                onError={(e) => {
                  // Fallback to SVG if PNG doesn't exist
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = "/logo.svg";
                }}
              />
            </div>
            <div className="hidden sm:block">
              <div
                className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 bg-clip-text text-transparent leading-tight tracking-tight"
                style={{
                  letterSpacing: "-0.02em",
                  textShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
              >
                Chicken Vicken
              </div>
              <div className="text-xs sm:text-sm text-gray-500 font-semibold tracking-widest uppercase mt-1">
                K2 Chicken
              </div>
            </div>
          </Link>

          {/* Desktop Navigation - Clean & Minimal */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              prefetch={true}
              className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive("/")
                  ? "text-orange-600"
                  : "text-gray-600 hover:text-orange-600"
              }`}
              onClick={handleHomeClick}
            >
              Home
              {isActive("/") && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
              )}
            </Link>
            <Link
              href="/#products"
              prefetch={true}
              className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive("/#products")
                  ? "text-orange-600"
                  : "text-gray-600 hover:text-orange-600"
              }`}
              onClick={handleProductsClick}
            >
              Products
              {isActive("/#products") && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
              )}
            </Link>
            <Link
              href="/recipes"
              prefetch={true}
              className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive("/recipes")
                  ? "text-orange-600"
                  : "text-gray-600 hover:text-orange-600"
              }`}
            >
              Recipes
              {isActive("/recipes") && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
              )}
            </Link>
          </nav>

          {/* Right Side Actions - Clean & Minimal */}
          <div className="flex items-center space-x-3">
            {/* Phone Number - Compact */}
            <a
              href="tel:8484978622"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-green-700 rounded-lg hover:bg-green-50 transition-all duration-200"
              title="Call us: 8484978622"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>8484978622</span>
            </a>

            {/* User Account / Login */}
            {!authLoading && (
              <>
                {isAuthenticated ? (
                  <div className="hidden md:flex items-center space-x-2">
                    <Link
                      href="/orders"
                      prefetch={true}
                      className="p-2 text-gray-600 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition-all duration-200"
                      title="My Orders"
                    >
                      <User size={18} />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200"
                      title="Logout"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    prefetch={true}
                    className="hidden md:flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <LogIn size={16} />
                    <span>Login</span>
                  </Link>
                )}
              </>
            )}

            {/* Cart */}
            <Link
              href="/cart"
              prefetch={true}
              className="relative p-2 text-gray-600 hover:text-orange-600 transition-all duration-200 rounded-lg hover:bg-orange-50"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md ring-2 ring-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            {/* Mobile Phone Number */}
            <a
              href="tel:8484978622"
              className="md:hidden flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-gray-600 hover:text-green-700 rounded-lg hover:bg-green-50 transition-all duration-200"
              title="Call us"
            >
              <Phone className="h-4 w-4" />
              <span>Call</span>
            </a>

            <button
              className="md:hidden p-2 text-gray-600 hover:text-orange-600 transition-all duration-200 rounded-lg hover:bg-orange-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="p-1">
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-4 border-t border-gray-100/50 bg-white/98 backdrop-blur-sm">
            <nav className="flex flex-col space-y-1.5">
              <Link
                href="/"
                prefetch={true}
                className={`px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 ${
                  isActive("/")
                    ? "text-orange-600 bg-orange-50"
                    : "text-gray-800 hover:text-orange-600 hover:bg-orange-50/50"
                }`}
                onClick={(event) => {
                  handleHomeClick(event);
                  setIsMenuOpen(false);
                }}
              >
                <Home size={18} />
                <span>Home</span>
              </Link>
              <Link
                href="/#products"
                prefetch={true}
                className={`px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 ${
                  isActive("/#products")
                    ? "text-orange-600 bg-orange-50"
                    : "text-gray-800 hover:text-orange-600 hover:bg-orange-50/50"
                }`}
                onClick={(event) => {
                  handleProductsClick(event);
                  setIsMenuOpen(false);
                }}
              >
                <Package size={18} />
                <span>Products</span>
              </Link>
              <Link
                href="/recipes"
                prefetch={true}
                className={`px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 ${
                  isActive("/recipes")
                    ? "text-orange-600 bg-orange-50"
                    : "text-gray-800 hover:text-orange-600 hover:bg-orange-50/50"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <ChefHat size={18} />
                <span>Recipes</span>
              </Link>
              {!authLoading && (
                <>
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/orders"
                        prefetch={true}
                        className="px-4 py-3 text-sm font-semibold text-gray-800 hover:text-orange-600 rounded-xl hover:bg-orange-50/50 transition-all duration-300 flex items-center gap-3"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User size={18} />
                        <span>My Orders</span>
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}
                        className="px-4 py-3 text-sm font-semibold text-red-600 hover:text-red-700 rounded-xl hover:bg-red-50/50 transition-all duration-300 flex items-center gap-3 w-full text-left"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Mobile Phone Number */}
                      <a
                        href="tel:8484978622"
                        className="px-4 py-3 text-sm font-semibold text-gray-800 hover:text-green-700 bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-all duration-300 flex items-center gap-3"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Phone size={18} className="text-green-700" />
                        <span>Call: 8484978622</span>
                      </a>
                      <Link
                        href="/login"
                        prefetch={true}
                        className="px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 flex items-center gap-3 shadow-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LogIn size={18} />
                        <span>Login</span>
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
