"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X, User, LogOut, LogIn, Search, MapPin, ChevronDown, Home, Package, ChefHat, Users, MessageCircle } from "lucide-react";

export type NavbarViewProps = {
  bannerClass: string;
  isMenuOpen: boolean;
  isActive: (path: string) => boolean;
  scrollToSection: (id: string) => void;
  onMenuToggle: () => void;
  onMenuClose: () => void;
  handleLogout: () => void;
  authLoading: boolean;
  isAuthenticated: boolean;
  totalItems: number;
  mounted: boolean;
};

export default function NavbarView({
  bannerClass,
  isMenuOpen,
  isActive,
  scrollToSection,
  onMenuToggle,
  onMenuClose,
  handleLogout,
  authLoading,
  isAuthenticated,
  totalItems,
  mounted,
}: NavbarViewProps) {
  return (
    <div role="banner" className="sticky top-0 z-50 w-full">
      {/* Promo top bar */}
      <div className="bg-brand-red text-white text-xs py-2 px-4 text-center font-semibold tracking-wide">
        <span className="inline-flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-5a1 1 0 00-.293-.707l-3-3A1 1 0 0016 4H3z"/>
          </svg>
          FREE DELIVERY on orders above ₹350 &nbsp;|&nbsp; Fresh chicken delivered in 90 mins across Pune
        </span>
      </div>

      {/* Main nav */}
      <nav className="glass-nav w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-base font-serif bg-brand-red shadow-brand-sm shrink-0">
                K2
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-xl font-serif font-bold text-gray-900 group-hover:text-brand-red transition-colors tracking-tight">K2 Chicken</span>
                <span className="text-[9px] text-gray-400 uppercase tracking-widest">Only Fresh, Never Frozen</span>
              </div>
            </Link>

            {/* Desktop search */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search chicken cuts, mince, whole bird..."
                  className="w-full bg-gray-100 text-gray-900 pl-11 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none search-glow transition-all text-sm placeholder-gray-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) window.location.href = `/?search=${encodeURIComponent(val)}#products`;
                    }
                  }}
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Desktop right actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Location indicator */}
              <div className="hidden lg:flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded-full text-sm text-gray-600 border border-gray-200 cursor-default select-none">
                <MapPin className="w-3.5 h-3.5 text-brand-red" />
                <span>Pune</span>
                <ChevronDown className="w-3 h-3" />
              </div>

              {/* Desktop nav links */}
              <nav className="hidden md:flex items-center gap-0.5">
                <Link href="/" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive("/") ? "text-brand-red" : "text-gray-600 hover:text-brand-red hover:bg-gray-50"}`}>Home</Link>
                <button type="button" onClick={() => scrollToSection("products")} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-brand-red hover:bg-gray-50 transition-colors">Products</button>
                <Link href="/recipes" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive("/recipes") ? "text-brand-red" : "text-gray-600 hover:text-brand-red hover:bg-gray-50"}`}>Recipes</Link>
                <button type="button" onClick={() => scrollToSection("about")} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-brand-red hover:bg-gray-50 transition-colors">About</button>
                <button type="button" onClick={() => scrollToSection("contact")} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-brand-red hover:bg-gray-50 transition-colors">Contact</button>
              </nav>

              {/* Auth */}
              {!authLoading && (
                <>
                  {isAuthenticated ? (
                    <div className="hidden md:flex items-center gap-1">
                      <Link href="/orders" title="My Orders" className="p-2 rounded-lg text-gray-600 hover:text-brand-red hover:bg-gray-50 transition-colors">
                        <User className="w-5 h-5" />
                      </Link>
                      <button type="button" onClick={handleLogout} title="Logout" className="p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <Link href="/login" className="hidden md:block px-5 py-2 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-700 transition-all text-sm">
                      Sign In
                    </Link>
                  )}
                </>
              )}

              {/* Cart */}
              <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ShoppingBag className="w-5 h-5 text-gray-800" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-red text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center badge-glow">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Link>

              {/* Mobile menu toggle */}
              <button
                type="button"
                className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={onMenuToggle}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          <div className="md:hidden pb-3">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search chicken cuts..."
                className="w-full bg-gray-100 text-gray-900 pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none search-glow transition-all text-sm placeholder-gray-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) window.location.href = `/?search=${encodeURIComponent(val)}#products`;
                  }
                }}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="py-3 px-4 border-t border-gray-100 bg-white">
            <nav className="flex flex-col gap-0.5">
              <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-800 hover:bg-gray-50 hover:text-brand-red font-medium" onClick={onMenuClose}>
                <Home className="w-5 h-5" /> Home
              </Link>
              <button type="button" onClick={() => { scrollToSection("products"); onMenuClose(); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-800 hover:bg-gray-50 hover:text-brand-red font-medium w-full text-left">
                <Package className="w-5 h-5" /> Products
              </button>
              <Link href="/recipes" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-800 hover:bg-gray-50 hover:text-brand-red font-medium" onClick={onMenuClose}>
                <ChefHat className="w-5 h-5" /> Recipes
              </Link>
              <button type="button" onClick={() => { scrollToSection("about"); onMenuClose(); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-800 hover:bg-gray-50 hover:text-brand-red font-medium w-full text-left">
                <Users className="w-5 h-5" /> About
              </button>
              <button type="button" onClick={() => { scrollToSection("contact"); onMenuClose(); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-800 hover:bg-gray-50 hover:text-brand-red font-medium w-full text-left">
                <MessageCircle className="w-5 h-5" /> Contact
              </button>
              {!authLoading && (
                isAuthenticated ? (
                  <>
                    <Link href="/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-800 hover:bg-gray-50 font-medium" onClick={onMenuClose}>
                      <User className="w-5 h-5" /> My Orders
                    </Link>
                    <button type="button" onClick={() => { onMenuClose(); handleLogout(); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium w-full text-left">
                      <LogOut className="w-5 h-5" /> Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-900 text-white font-semibold mt-2" onClick={onMenuClose}>
                    <LogIn className="w-5 h-5" /> Sign In
                  </Link>
                )
              )}
            </nav>
          </div>
        </div>
      </nav>
    </div>
  );
}
