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
  const [activeSection, setActiveSection] = useState<string>("");

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

  // Scroll spy - detect which section is in view
  useEffect(() => {
    if (pathname !== "/") return; // Only on homepage

    const handleScroll = () => {
      const sections = [
        { id: "products", element: document.getElementById("products") },
        // Add more sections here if needed
      ];

      const scrollPosition = window.scrollY + 150; // Offset for header

      // Check which section is in view
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element) {
          const sectionTop = section.element.offsetTop;
          const sectionHeight = section.element.offsetHeight;

          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            setActiveSection(section.id);
            // Update hash without scrolling
            if (window.location.hash !== `#${section.id}`) {
              window.history.replaceState(null, "", `#${section.id}`);
              setHash(`#${section.id}`);
            }
            return;
          }
        }
      }

      // If at top of page, clear active section
      if (window.scrollY < 100) {
        setActiveSection("");
        if (window.location.hash) {
          window.history.replaceState(null, "", "/");
          setHash("");
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check on mount

    return () => {
      window.removeEventListener("scroll", handleScroll);
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
      return pathname === "/" && activeSection !== "products" && hash !== "#products";
    }
    if (path === "/#products") {
      // Products is active if we're on home page and hash is #products or activeSection is products
      return pathname === "/" && (activeSection === "products" || hash === "#products");
    }
    return pathname?.startsWith(path);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 safe-top ${scrolled
        ? "bg-white/98 backdrop-blur-xl shadow-md border-b border-gray-200/50"
        : "bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-100/30"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center py-3 md:py-4">
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
                  alt="K2 Chicken"
                  className="h-10 sm:h-12 md:h-16 w-auto rounded-xl md:rounded-2xl drop-shadow-sm transition-all duration-200"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = "/logo.svg";
                  }}
                />
              </div>
            </div>

            <div className="hidden sm:block transform group-hover:translate-x-1 transition-transform duration-300">
              <div
                className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-orange-700 via-orange-600 to-orange-500 bg-clip-text text-transparent leading-tight group-hover:from-orange-800 group-hover:via-orange-700 group-hover:to-orange-600 transition-all duration-300"
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
              className={`group relative px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 overflow-hidden ${isActive("/")
                ? "text-chicken-wood bg-chicken-cream border border-orange-200"
                : "text-gray-600 hover:text-orange-600 hover:bg-chicken-cream/50"
                }`}
              onClick={handleHomeClick}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Home
                  size={16}
                  className={`transition-all duration-300 ${isActive("/")
                    ? "text-orange-500 scale-110"
                    : "text-gray-400 group-hover:text-orange-500 group-hover:scale-110"
                    }`}
                />
                Home
              </span>
            </Link>

            <Link
              href="/#products"
              prefetch={true}
              className={`group relative px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 overflow-hidden ${isActive("/#products")
                ? "text-chicken-wood bg-chicken-cream border border-orange-200"
                : "text-gray-600 hover:text-orange-600 hover:bg-chicken-cream/50"
                }`}
              onClick={handleProductsClick}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Package
                  size={16}
                  className={`transition-all duration-300 ${isActive("/#products")
                    ? "text-orange-500 scale-110"
                    : "text-gray-400 group-hover:text-orange-500 group-hover:scale-110"
                    }`}
                />
                Products
              </span>
            </Link>

            <Link
              href="/recipes"
              prefetch={true}
              className={`group relative px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 overflow-hidden ${isActive("/recipes")
                ? "text-chicken-wood bg-chicken-cream border border-orange-200"
                : "text-gray-600 hover:text-orange-600 hover:bg-chicken-cream/50"
                }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <ChefHat
                  size={16}
                  className={`transition-all duration-300 ${isActive("/recipes")
                    ? "text-orange-500 scale-110"
                    : "text-gray-400 group-hover:text-orange-500 group-hover:scale-110"
                    }`}
                />
                Recipes
              </span>
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
                    className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 group"
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

            {/* Cart - Modern Mobile Design */}
            <Link
              href="/cart"
              prefetch={true}
              className="relative p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-800 rounded-xl active:scale-95 transition-all duration-200 group"
            >
              <div className="relative">
                <ShoppingCart
                  size={22}
                  className="transition-transform duration-200"
                />
                {totalItems > 0 && mounted && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-[11px] font-extrabold rounded-full h-5 w-5 min-w-[20px] flex items-center justify-center shadow-lg ring-2 ring-white">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>
            </Link>

            {/* Mobile Phone Number - Modern */}
            <a
              href="tel:+918484978622"
              className="md:hidden flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] text-xs font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl active:scale-95 transition-all duration-200 shadow-md"
              title="Call us: +91 84849 78622"
            >
              <Phone className="h-4 w-4" />
            </a>

            {/* Mobile menu button - Modern */}
            <button
              className="md:hidden p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-800 rounded-xl active:scale-95 transition-all duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <div
                  className={`absolute inset-0 transition-all duration-200 ${isMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
                    }`}
                >
                  <Menu size={24} strokeWidth={2.5} />
                </div>
                <div
                  className={`absolute inset-0 transition-all duration-200 ${isMenuOpen ? "rotate-0 opacity-100" : "rotate-90 opacity-0"
                    }`}
                >
                  <X size={24} strokeWidth={2.5} />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Enhanced */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${isMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <div className="py-4 border-t border-gray-100/50 bg-white/98 backdrop-blur-sm">
            <nav className="flex flex-col space-y-2 px-4">
              <Link
                href="/"
                prefetch={true}
                className={`group relative px-5 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 overflow-hidden ${isActive("/")
                  ? "text-orange-600 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200"
                  : "text-gray-800 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 border border-transparent hover:border-orange-200"
                  }`}
                onClick={(event) => {
                  handleHomeClick(event);
                  setIsMenuOpen(false);
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-100/50 to-orange-200/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Home
                  size={18}
                  className={`relative z-10 transition-all duration-300 ${isActive("/")
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
                className={`group relative px-5 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 overflow-hidden ${isActive("/#products")
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
                  className={`relative z-10 transition-all duration-300 ${isActive("/#products")
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
                className={`group relative px-5 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 overflow-hidden ${isActive("/recipes")
                  ? "text-orange-600 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200"
                  : "text-gray-800 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 border border-transparent hover:border-orange-200"
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-100/50 to-red-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <ChefHat
                  size={18}
                  className={`relative z-10 transition-all duration-300 ${isActive("/recipes")
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
                        className="group relative px-5 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 flex items-center gap-3 shadow-md hover:shadow-lg transform hover:scale-[1.02] overflow-hidden"
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
