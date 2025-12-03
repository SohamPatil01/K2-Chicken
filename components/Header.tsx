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
  const [mounted, setMounted] = useState(false);
  const { state } = useCart();
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/98 backdrop-blur-xl shadow-lg border-b border-orange-100/60"
          : "bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-100/40"
      }`}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-50/30 via-transparent to-red-50/30 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo - Enhanced with animations */}
          <Link
            href="/"
            prefetch={true}
            className="group flex items-center gap-3 relative z-10"
          >
            <div className="relative">
              {/* Animated glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 via-red-400/20 to-orange-400/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10 scale-110"></div>
              {/* Pulse effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 animate-pulse -z-10"></div>

              <div className="relative transform group-hover:scale-105 transition-all duration-300">
                <img
                  src="/logo.png"
                  alt="Chicken Vicken - Baramati Agro"
                  className="h-12 sm:h-16 w-auto rounded-2xl drop-shadow-md group-hover:drop-shadow-xl transition-all duration-300"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = "/logo.svg";
                  }}
                />
              </div>
            </div>

            <div className="hidden sm:block transform group-hover:translate-x-1 transition-transform duration-300">
              <div
                className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 bg-clip-text text-transparent leading-tight group-hover:from-orange-700 group-hover:via-orange-600 group-hover:to-red-700 transition-all duration-300"
                style={{
                  fontFamily: "var(--font-poppins), sans-serif",
                  letterSpacing: "0.01em",
                  fontWeight: 600,
                }}
              >
                Chicken Vicken
              </div>
              <div className="text-xs sm:text-sm text-gray-500 font-medium tracking-wide mt-0.5 group-hover:text-gray-600 transition-colors duration-300">
                K2 Chicken
              </div>
            </div>
          </Link>

          {/* Desktop Navigation - Modern & Animated */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              prefetch={true}
              className={`group relative px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 overflow-hidden ${
                isActive("/")
                  ? "text-orange-600"
                  : "text-gray-700 hover:text-orange-600"
              }`}
              onClick={handleHomeClick}
            >
              {/* Animated background */}
              <div
                className={`absolute inset-0 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl transition-all duration-300 ${
                  isActive("/")
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
                }`}
              ></div>

              {/* Text with icon */}
              <span className="relative z-10 flex items-center gap-2">
                <Home
                  size={16}
                  className={`transition-all duration-300 ${
                    isActive("/")
                      ? "text-orange-600 scale-110"
                      : "text-gray-500 group-hover:text-orange-600 group-hover:scale-110"
                  }`}
                />
                Home
              </span>

              {/* Active indicator */}
              {isActive("/") && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-scale-in"></div>
              )}
            </Link>

            <Link
              href="/#products"
              prefetch={true}
              className={`group relative px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 overflow-hidden ${
                isActive("/#products")
                  ? "text-orange-600"
                  : "text-gray-700 hover:text-orange-600"
              }`}
              onClick={handleProductsClick}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl transition-all duration-300 ${
                  isActive("/#products")
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
                }`}
              ></div>

              <span className="relative z-10 flex items-center gap-2">
                <Package
                  size={16}
                  className={`transition-all duration-300 ${
                    isActive("/#products")
                      ? "text-orange-600 scale-110"
                      : "text-gray-500 group-hover:text-orange-600 group-hover:scale-110"
                  }`}
                />
                Products
              </span>

              {isActive("/#products") && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-scale-in"></div>
              )}
            </Link>

            <Link
              href="/recipes"
              prefetch={true}
              className={`group relative px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 overflow-hidden ${
                isActive("/recipes")
                  ? "text-orange-600"
                  : "text-gray-700 hover:text-orange-600"
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl transition-all duration-300 ${
                  isActive("/recipes")
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
                }`}
              ></div>

              <span className="relative z-10 flex items-center gap-2">
                <ChefHat
                  size={16}
                  className={`transition-all duration-300 ${
                    isActive("/recipes")
                      ? "text-orange-600 scale-110"
                      : "text-gray-500 group-hover:text-orange-600 group-hover:scale-110"
                  }`}
                />
                Recipes
              </span>

              {isActive("/recipes") && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-scale-in"></div>
              )}
            </Link>
          </nav>

          {/* Right Side Actions - Enhanced */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Phone Number - Enhanced */}
            <a
              href="tel:+918484978622"
              className="hidden lg:flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:text-green-700 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 group border border-transparent hover:border-green-200"
              title="Call us: +91 84849 78622"
            >
              <Phone className="h-4 w-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
              <span className="font-semibold">+91 84849 78622</span>
            </a>

            {/* User Account / Login */}
            {!authLoading && (
              <>
                {isAuthenticated ? (
                  <div className="hidden md:flex items-center space-x-1.5">
                    <Link
                      href="/orders"
                      prefetch={true}
                      className="relative p-2.5 text-gray-600 hover:text-orange-600 rounded-xl hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 transition-all duration-300 group border border-transparent hover:border-orange-200"
                      title="My Orders"
                    >
                      <User
                        size={18}
                        className="group-hover:scale-110 transition-transform duration-300"
                      />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="relative p-2.5 text-gray-600 hover:text-red-600 rounded-xl hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 transition-all duration-300 group border border-transparent hover:border-red-200"
                      title="Logout"
                    >
                      <LogOut
                        size={18}
                        className="group-hover:scale-110 transition-transform duration-300"
                      />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    prefetch={true}
                    className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 group"
                  >
                    <LogIn
                      size={16}
                      className="group-hover:translate-x-0.5 transition-transform duration-300"
                    />
                    <span>Login</span>
                  </Link>
                )}
              </>
            )}

            {/* Cart - Enhanced */}
            <Link
              href="/cart"
              prefetch={true}
              className="relative p-2.5 text-gray-600 hover:text-orange-600 rounded-xl hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 transition-all duration-300 group border border-transparent hover:border-orange-200"
            >
              <ShoppingCart
                size={20}
                className="group-hover:scale-110 transition-transform duration-300"
              />
              {totalItems > 0 && mounted && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg ring-2 ring-white animate-bounce-in">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Phone Number */}
            <a
              href="tel:+918484978622"
              className="md:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 hover:text-green-700 rounded-xl hover:bg-green-50 transition-all duration-300 border border-transparent hover:border-green-200"
              title="Call us: +91 84849 78622"
            >
              <Phone className="h-4 w-4" />
              <span className="font-semibold">+91 84849 78622</span>
            </a>

            {/* Mobile menu button - Enhanced */}
            <button
              className="md:hidden p-2.5 text-gray-600 hover:text-orange-600 rounded-xl hover:bg-orange-50 transition-all duration-300 border border-transparent hover:border-orange-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="relative p-1">
                <div
                  className={`absolute inset-0 transition-all duration-300 ${
                    isMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
                  }`}
                >
                  <Menu size={20} />
                </div>
                <div
                  className={`transition-all duration-300 ${
                    isMenuOpen ? "rotate-0 opacity-100" : "rotate-90 opacity-0"
                  }`}
                >
                  <X size={20} />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Enhanced */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-4 border-t border-gray-100/50 bg-white/98 backdrop-blur-sm">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/"
                prefetch={true}
                className={`group relative px-5 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 overflow-hidden ${
                  isActive("/")
                    ? "text-orange-600 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200"
                    : "text-gray-800 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 border border-transparent hover:border-orange-200"
                }`}
                onClick={(event) => {
                  handleHomeClick(event);
                  setIsMenuOpen(false);
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-100/50 to-red-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Home
                  size={18}
                  className={`relative z-10 transition-all duration-300 ${
                    isActive("/")
                      ? "text-orange-600 scale-110"
                      : "text-gray-600 group-hover:text-orange-600 group-hover:scale-110"
                  }`}
                />
                <span className="relative z-10">Home</span>
                {isActive("/") && (
                  <div className="absolute right-4 w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                )}
              </Link>

              <Link
                href="/#products"
                prefetch={true}
                className={`group relative px-5 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 overflow-hidden ${
                  isActive("/#products")
                    ? "text-orange-600 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200"
                    : "text-gray-800 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 border border-transparent hover:border-orange-200"
                }`}
                onClick={(event) => {
                  handleProductsClick(event);
                  setIsMenuOpen(false);
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-100/50 to-red-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Package
                  size={18}
                  className={`relative z-10 transition-all duration-300 ${
                    isActive("/#products")
                      ? "text-orange-600 scale-110"
                      : "text-gray-600 group-hover:text-orange-600 group-hover:scale-110"
                  }`}
                />
                <span className="relative z-10">Products</span>
                {isActive("/#products") && (
                  <div className="absolute right-4 w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                )}
              </Link>

              <Link
                href="/recipes"
                prefetch={true}
                className={`group relative px-5 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 overflow-hidden ${
                  isActive("/recipes")
                    ? "text-orange-600 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200"
                    : "text-gray-800 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 border border-transparent hover:border-orange-200"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-100/50 to-red-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <ChefHat
                  size={18}
                  className={`relative z-10 transition-all duration-300 ${
                    isActive("/recipes")
                      ? "text-orange-600 scale-110"
                      : "text-gray-600 group-hover:text-orange-600 group-hover:scale-110"
                  }`}
                />
                <span className="relative z-10">Recipes</span>
                {isActive("/recipes") && (
                  <div className="absolute right-4 w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                )}
              </Link>

              {!authLoading && (
                <>
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/orders"
                        prefetch={true}
                        className="group relative px-5 py-3.5 text-sm font-semibold text-gray-800 hover:text-orange-600 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-300 flex items-center gap-3 border border-transparent hover:border-orange-200 overflow-hidden"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-100/50 to-red-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <User
                          size={18}
                          className="relative z-10 text-gray-600 group-hover:text-orange-600 group-hover:scale-110 transition-all duration-300"
                        />
                        <span className="relative z-10">My Orders</span>
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}
                        className="group relative px-5 py-3.5 text-sm font-semibold text-red-600 hover:text-red-700 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 flex items-center gap-3 w-full text-left border border-transparent hover:border-red-200 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-100/50 to-pink-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <LogOut
                          size={18}
                          className="relative z-10 group-hover:scale-110 transition-all duration-300"
                        />
                        <span className="relative z-10">Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <a
                        href="tel:+918484978622"
                        className="group relative px-5 py-3.5 text-sm font-semibold text-gray-800 hover:text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl border border-green-200 transition-all duration-300 flex items-center gap-3 overflow-hidden"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Phone
                          size={18}
                          className="relative z-10 text-green-700 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300"
                        />
                        <span className="relative z-10">
                          Call: +91 84849 78622
                        </span>
                      </a>
                      <Link
                        href="/login"
                        prefetch={true}
                        className="group relative px-5 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 flex items-center gap-3 shadow-md hover:shadow-lg transform hover:scale-[1.02] overflow-hidden"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <LogIn
                          size={18}
                          className="relative z-10 group-hover:translate-x-0.5 transition-transform duration-300"
                        />
                        <span className="relative z-10">Login</span>
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
