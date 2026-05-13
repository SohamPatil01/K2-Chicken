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
  Users,
  MessageCircle,
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
        { id: "about", element: document.getElementById("about") },
        { id: "contact", element: document.getElementById("contact") },
      ];

      const scrollPosition = window.scrollY + 150; // Offset for header

      // Check which section is in view
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element) {
          const sectionTop = section.element.offsetTop;
          const sectionHeight = section.element.offsetHeight;

          if (
            scrollPosition >= sectionTop &&
            scrollPosition < sectionTop + sectionHeight
          ) {
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

  const handleAboutClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      event.preventDefault();
      scrollToSection("about");
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", "#about");
      }
      setHash("#about");
    }
  };

  const handleContactClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      event.preventDefault();
      scrollToSection("contact");
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", "#contact");
      }
      setHash("#contact");
    }
  };

  const isActive = (path: string) => {
    if (path === "/") {
      // Home is active only if we're on home page and not on products section
      return (
        pathname === "/" && activeSection !== "products" && hash !== "#products"
      );
    }
    if (path === "/#products") {
      return (
        pathname === "/" &&
        (activeSection === "products" || hash === "#products")
      );
    }
    if (path === "/#about") {
      return (
        pathname === "/" && (activeSection === "about" || hash === "#about")
      );
    }
    if (path === "/#contact") {
      return (
        pathname === "/" && (activeSection === "contact" || hash === "#contact")
      );
    }
    return pathname?.startsWith(path);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 safe-top ${
        scrolled
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
                className="text-lg sm:text-xl font-semibold text-brand-red leading-tight transition-colors duration-300"
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
                  ? "text-chicken-wood bg-gray-50 border border-red-200"
                  : "text-gray-600 hover:text-brand-red hover:bg-gray-50/50"
              }`}
              onClick={handleHomeClick}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Home
                  size={16}
                  className={`transition-all duration-300 ${
                    isActive("/")
                      ? "text-brand-red scale-110"
                      : "text-gray-400 group-hover:text-brand-red group-hover:scale-110"
                  }`}
                />
                Home
              </span>
            </Link>

            <Link
              href="/#products"
              prefetch={true}
              className={`group relative px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 overflow-hidden ${
                isActive("/#products")
                  ? "text-chicken-wood bg-gray-50 border border-red-200"
                  : "text-gray-600 hover:text-brand-red hover:bg-gray-50/50"
              }`}
              onClick={handleProductsClick}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Package
                  size={16}
                  className={`transition-all duration-300 ${
                    isActive("/#products")
                      ? "text-brand-red scale-110"
                      : "text-gray-400 group-hover:text-brand-red group-hover:scale-110"
                  }`}
                />
                Products
              </span>
            </Link>

            <Link
              href="/recipes"
              prefetch={true}
              className={`group relative px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 overflow-hidden ${
                isActive("/recipes")
                  ? "text-chicken-wood bg-gray-50 border border-red-200"
                  : "text-gray-600 hover:text-brand-red hover:bg-gray-50/50"
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <ChefHat
                  size={16}
                  className={`transition-all duration-300 ${
                    isActive("/recipes")
                      ? "text-brand-red scale-110"
                      : "text-gray-400 group-hover:text-brand-red group-hover:scale-110"
                  }`}
                />
                Recipes
              </span>
            </Link>

            <Link
              href="/#about"
              prefetch={true}
              className={`group relative px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 overflow-hidden ${
                isActive("/#about")
                  ? "text-chicken-wood bg-gray-50 border border-red-200"
                  : "text-gray-600 hover:text-brand-red hover:bg-gray-50/50"
              }`}
              onClick={handleAboutClick}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Users
                  size={16}
                  className={`transition-all duration-300 ${
                    isActive("/#about")
                      ? "text-brand-red scale-110"
                      : "text-gray-400 group-hover:text-brand-red group-hover:scale-110"
                  }`}
                />
                About Us
              </span>
            </Link>

            <Link
              href="/#contact"
              prefetch={true}
              className={`group relative px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 overflow-hidden ${
                isActive("/#contact")
                  ? "text-chicken-wood bg-gray-50 border border-red-200"
                  : "text-gray-600 hover:text-brand-red hover:bg-gray-50/50"
              }`}
              onClick={handleContactClick}
            >
              <span className="relative z-10 flex items-center gap-2">
                <MessageCircle
                  size={16}
                  className={`transition-all duration-300 ${
                    isActive("/#contact")
                      ? "text-brand-red scale-110"
                      : "text-gray-400 group-hover:text-brand-red group-hover:scale-110"
                  }`}
                />
                Contact
              </span>
            </Link>
          </nav>

          {/* Right Side Actions - Enhanced */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Phone Number - Enhanced */}
            <a
              href="tel:+918484978622"
              className="hidden lg:flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:text-green-800 rounded-xl hover:bg-green-50 transition-all duration-300 group border border-transparent hover:border-green-200"
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
                      className="relative p-2.5 text-gray-600 hover:text-brand-red rounded-xl hover:bg-red-50 transition-all duration-300 group border border-transparent hover:border-red-100"
                      title="My Orders"
                    >
                      <User
                        size={18}
                        className="group-hover:scale-110 transition-transform duration-300"
                      />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="relative p-2.5 text-gray-600 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all duration-300 group border border-transparent hover:border-red-100"
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
                    className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-brand-red hover:bg-brand-red-hover rounded-xl transition-colors duration-300 shadow-soft hover:shadow-card group"
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
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-red text-white text-[11px] font-extrabold rounded-full h-5 w-5 min-w-[20px] flex items-center justify-center shadow-md ring-2 ring-white">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </div>
            </Link>

            {/* Mobile Phone Number - Modern */}
            <a
              href="tel:+918484978622"
              className="md:hidden flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl active:scale-95 transition-all duration-200 shadow-md"
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
                  className={`absolute inset-0 transition-all duration-200 ${
                    isMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
                  }`}
                >
                  <Menu size={24} strokeWidth={2.5} />
                </div>
                <div
                  className={`absolute inset-0 transition-all duration-200 ${
                    isMenuOpen ? "rotate-0 opacity-100" : "rotate-90 opacity-0"
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
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-4 border-t border-gray-100/50 bg-white/98 backdrop-blur-sm">
            <nav className="flex flex-col space-y-2 px-4">
              <Link
                href="/"
                prefetch={true}
                className={`group relative px-5 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 ${
                  isActive("/")
                    ? "text-brand-red bg-red-50 border border-red-200"
                    : "text-gray-800 hover:text-brand-red hover:bg-gray-50 border border-transparent hover:border-gray-200"
                }`}
                onClick={(event) => {
                  handleHomeClick(event);
                  setIsMenuOpen(false);
                }}
              >
                <Home
                  size={18}
                  className={`transition-all duration-300 ${
                    isActive("/")
                      ? "text-brand-red scale-110"
                      : "text-gray-600 group-hover:text-brand-red group-hover:scale-110"
                  }`}
                />
                <span>Home</span>
                {isActive("/") && (
                  <div className="absolute right-4 w-2 h-2 bg-brand-red rounded-full animate-pulse"></div>
                )}
              </Link>

              <Link
                href="/#products"
                prefetch={true}
                className={`group relative px-5 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 ${
                  isActive("/#products")
                    ? "text-brand-red bg-red-50 border border-red-200"
                    : "text-gray-800 hover:text-brand-red hover:bg-gray-50 border border-transparent hover:border-gray-200"
                }`}
                onClick={(event) => {
                  handleProductsClick(event);
                  setIsMenuOpen(false);
                }}
              >
                <Package
                  size={18}
                  className={`transition-all duration-300 ${
                    isActive("/#products")
                      ? "text-brand-red scale-110"
                      : "text-gray-600 group-hover:text-brand-red group-hover:scale-110"
                  }`}
                />
                <span>Products</span>
                {isActive("/#products") && (
                  <div className="absolute right-4 w-2 h-2 bg-brand-red rounded-full animate-pulse"></div>
                )}
              </Link>

              <Link
                href="/recipes"
                prefetch={true}
                className={`group relative px-5 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 ${
                  isActive("/recipes")
                    ? "text-brand-red bg-red-50 border border-red-200"
                    : "text-gray-800 hover:text-brand-red hover:bg-gray-50 border border-transparent hover:border-gray-200"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <ChefHat
                  size={18}
                  className={`transition-all duration-300 ${
                    isActive("/recipes")
                      ? "text-brand-red scale-110"
                      : "text-gray-600 group-hover:text-brand-red group-hover:scale-110"
                  }`}
                />
                <span>Recipes</span>
                {isActive("/recipes") && (
                  <div className="absolute right-4 w-2 h-2 bg-brand-red rounded-full animate-pulse"></div>
                )}
              </Link>

              <Link
                href="/#about"
                prefetch={true}
                className={`group relative px-5 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 ${
                  isActive("/#about")
                    ? "text-brand-red bg-red-50 border border-red-200"
                    : "text-gray-800 hover:text-brand-red hover:bg-gray-50 border border-transparent hover:border-gray-200"
                }`}
                onClick={(e) => {
                  handleAboutClick(e);
                  setIsMenuOpen(false);
                }}
              >
                <Users size={18} className="transition-all duration-300 text-gray-600 group-hover:text-brand-red" />
                <span>About Us</span>
                {isActive("/#about") && (
                  <div className="absolute right-4 w-2 h-2 bg-brand-red rounded-full animate-pulse"></div>
                )}
              </Link>

              <Link
                href="/#contact"
                prefetch={true}
                className={`group relative px-5 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 ${
                  isActive("/#contact")
                    ? "text-brand-red bg-red-50 border border-red-200"
                    : "text-gray-800 hover:text-brand-red hover:bg-gray-50 border border-transparent hover:border-gray-200"
                }`}
                onClick={(e) => {
                  handleContactClick(e);
                  setIsMenuOpen(false);
                }}
              >
                <MessageCircle size={18} className="transition-all duration-300 text-gray-600 group-hover:text-brand-red" />
                <span>Contact</span>
                {isActive("/#contact") && (
                  <div className="absolute right-4 w-2 h-2 bg-brand-red rounded-full animate-pulse"></div>
                )}
              </Link>

              {!authLoading && (
                <>
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/orders"
                        prefetch={true}
                        className="group relative px-5 py-3.5 text-sm font-semibold text-gray-800 hover:text-brand-red rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-3 border border-transparent hover:border-gray-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User
                          size={18}
                          className="text-gray-600 group-hover:text-brand-red group-hover:scale-110 transition-all duration-300"
                        />
                        <span>My Orders</span>
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}
                        className="group relative px-5 py-3.5 text-sm font-semibold text-red-600 hover:text-red-700 rounded-xl hover:bg-red-50 transition-all duration-300 flex items-center gap-3 w-full text-left border border-transparent hover:border-red-100"
                      >
                        <LogOut
                          size={18}
                          className="group-hover:scale-110 transition-all duration-300"
                        />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <a
                        href="tel:+918484978622"
                        className="group relative px-5 py-3.5 text-sm font-semibold text-gray-800 hover:text-green-800 bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-all duration-300 flex items-center gap-3"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Phone
                          size={18}
                          className="text-green-700 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300"
                        />
                        <span>
                          Call: +91 84849 78622
                        </span>
                      </a>
                      <Link
                        href="/login"
                        prefetch={true}
                        className="group flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-white bg-brand-red hover:bg-brand-red-hover rounded-xl transition-colors duration-300 shadow-soft hover:shadow-card"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LogIn
                          size={18}
                          className="group-hover:translate-x-0.5 transition-transform duration-300"
                        />
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
