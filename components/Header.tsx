"use client";

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
} from "lucide-react";
import { useState, useEffect } from "react";
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
          ? "bg-white/98 backdrop-blur-lg shadow-md border-b border-orange-100/50"
          : "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100/50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3.5">
          {/* Logo */}
          <Link
            href="/"
            prefetch={true}
            className="group flex items-center gap-3 animate-slide-down"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-400 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative w-11 h-11 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-300">
                <span className="text-white font-bold text-lg">K2</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="text-xl font-extrabold bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 bg-clip-text text-transparent">
                K2 Chicken
              </div>
              <div className="text-xs text-gray-500 -mt-0.5 font-medium">
                Fresh & Delicious
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1.5">
            <Link
              href="/"
              prefetch={true}
              className={`relative px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 group ${
                isActive("/")
                  ? "text-orange-600 bg-orange-50"
                  : "text-gray-700 hover:text-orange-600 hover:bg-orange-50/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Home
                  size={16}
                  className={
                    isActive("/")
                      ? "text-orange-600"
                      : "text-gray-500 group-hover:text-orange-600"
                  }
                />
                <span>Home</span>
              </div>
              {isActive("/") && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-600 rounded-full"></div>
              )}
            </Link>
            <Link
              href="/#products"
              prefetch={true}
              className={`relative px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 group ${
                isActive("/#products")
                  ? "text-orange-600 bg-orange-50"
                  : "text-gray-700 hover:text-orange-600 hover:bg-orange-50/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Package
                  size={16}
                  className={
                    isActive("/#products")
                      ? "text-orange-600"
                      : "text-gray-500 group-hover:text-orange-600 transition-colors"
                  }
                />
                <span>Products</span>
              </div>
              {isActive("/#products") && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-600 rounded-full"></div>
              )}
            </Link>
            <Link
              href="/recipes"
              prefetch={true}
              className={`relative px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 group ${
                isActive("/recipes")
                  ? "text-orange-600 bg-orange-50"
                  : "text-gray-700 hover:text-orange-600 hover:bg-orange-50/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <ChefHat
                  size={16}
                  className={
                    isActive("/recipes")
                      ? "text-orange-600"
                      : "text-gray-500 group-hover:text-orange-600"
                  }
                />
                <span>Recipes</span>
              </div>
              {isActive("/recipes") && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-600 rounded-full"></div>
              )}
            </Link>
          </nav>

          {/* Auth, Cart and Mobile Menu */}
          <div className="flex items-center space-x-2">
            {/* User Account / Login */}
            {!authLoading && (
              <>
                {isAuthenticated ? (
                  <div className="hidden md:flex items-center space-x-2">
                    <Link
                      href="/orders"
                      prefetch={true}
                      className="px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-orange-600 rounded-xl hover:bg-orange-50/50 transition-all duration-300 flex items-center gap-2 group"
                      title="My Orders"
                    >
                      <div className="p-1.5 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg group-hover:from-orange-100 group-hover:to-red-100 transition-colors">
                        <User size={16} className="text-orange-600" />
                      </div>
                      <span className="max-w-[120px] truncate">
                        {user?.name || user?.phone}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-red-600 rounded-xl hover:bg-red-50/50 transition-all duration-300 flex items-center gap-2 group"
                      title="Logout"
                    >
                      <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-red-50 transition-colors">
                        <LogOut
                          size={16}
                          className="text-gray-600 group-hover:text-red-600"
                        />
                      </div>
                      <span className="hidden lg:inline">Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    prefetch={true}
                    className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <LogIn size={16} />
                    <span>Login</span>
                  </Link>
                )}
              </>
            )}

            <Link
              href="/cart"
              prefetch={true}
              className="relative p-2.5 text-gray-700 hover:text-orange-600 transition-all duration-300 rounded-xl hover:bg-orange-50/50 group"
            >
              <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-orange-50 transition-colors">
                <ShoppingCart
                  size={20}
                  className="group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-bounce-in">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2.5 text-gray-700 hover:text-orange-600 transition-all duration-300 rounded-xl hover:bg-orange-50/50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="p-1.5 bg-gray-50 rounded-lg">
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
                    : "text-gray-700 hover:text-orange-600 hover:bg-orange-50/50"
                }`}
                onClick={() => setIsMenuOpen(false)}
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
                    : "text-gray-700 hover:text-orange-600 hover:bg-orange-50/50"
                }`}
                onClick={() => setIsMenuOpen(false)}
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
                    : "text-gray-700 hover:text-orange-600 hover:bg-orange-50/50"
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
                        className="px-4 py-3 text-sm font-semibold text-gray-700 hover:text-orange-600 rounded-xl hover:bg-orange-50/50 transition-all duration-300 flex items-center gap-3"
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
                    <Link
                      href="/login"
                      prefetch={true}
                      className="px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 flex items-center gap-3 shadow-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn size={18} />
                      <span>Login</span>
                    </Link>
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
