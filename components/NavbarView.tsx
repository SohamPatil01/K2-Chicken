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
  Users,
  MessageCircle,
} from "lucide-react";
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
    <div
      role="banner"
      className={"sticky top-0 z-50 w-full transition-all duration-smooth safe-top " + bannerClass}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile: logo | actions. Desktop: equal side columns so nav is truly centered */}
        <div className="flex items-center justify-between gap-3 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:justify-items-stretch min-h-14 py-2 sm:min-h-16 sm:py-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2 shrink-0 justify-self-start group min-w-0 max-w-[55%] sm:max-w-none"
          >
            <img
              src="/logo.png"
              alt="K2 Chicken"
              className="h-8 sm:h-9 w-auto rounded-button transition-transform duration-smooth group-hover:scale-105 shrink-0"
              onError={(e) => {
                const t = e.currentTarget;
                t.src = "/logo.svg";
              }}
            />
            <span className="hidden sm:block text-base font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-smooth truncate">
              K2 Chicken
            </span>
          </Link>

          <nav
            className="hidden md:flex items-center justify-center gap-1 lg:gap-1.5 justify-self-center whitespace-nowrap px-2"
            aria-label="Primary"
          >
            <Link href="/" className={isActive("/") ? "text-orange-600 bg-orange-50 border border-orange-200 px-3 py-2 rounded-button text-sm font-medium" : "text-gray-600 hover:text-orange-600 px-3 py-2 rounded-button text-sm font-medium hover:bg-orange-50/50"}>
              Home
            </Link>
            <button type="button" onClick={() => scrollToSection("products")} className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-button text-sm font-medium hover:bg-orange-50/50">
              Products
            </button>
            <Link href="/recipes" className={isActive("/recipes") ? "text-orange-600 bg-orange-50 border border-orange-200 px-3 py-2 rounded-button text-sm font-medium" : "text-gray-600 hover:text-orange-600 px-3 py-2 rounded-button text-sm font-medium hover:bg-orange-50/50"}>
              Recipes
            </Link>
            <button type="button" onClick={() => scrollToSection("about")} className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-button text-sm font-medium hover:bg-orange-50/50">
              About
            </button>
            <button type="button" onClick={() => scrollToSection("contact")} className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-button text-sm font-medium hover:bg-orange-50/50">
              Contact
            </button>
          </nav>

          <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0 justify-self-end">
            {!authLoading && (
              <>
                {isAuthenticated ? (
                  <div className="hidden md:flex items-center gap-1">
                    <Link
                      href="/orders"
                      className="p-2.5 rounded-button text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-smooth"
                      title="My Orders"
                    >
                      <User className="w-5 h-5" />
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="p-2.5 rounded-button text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-smooth"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-button bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition-all duration-smooth shadow-soft hover:shadow-card"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                )}
              </>
            )}

            <Link
              href="/cart"
              className="relative p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-button text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-all duration-smooth"
            >
              <ShoppingCart className="w-5 h-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-orange-600 text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            <button
              type="button"
              className="md:hidden p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-button text-gray-700 hover:bg-gray-100 transition-all duration-smooth"
              onClick={onMenuToggle}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-smooth ${
          isMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="py-4 px-4 sm:px-6 border-t border-gray-100 bg-white max-w-7xl mx-auto w-full">
          <nav className="flex flex-col gap-1">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-button text-gray-800 hover:bg-orange-50 hover:text-orange-600 font-medium" onClick={onMenuClose}>
              <Home className="w-5 h-5" /> Home
            </Link>
            <button type="button" onClick={() => { scrollToSection("products"); onMenuClose(); }} className="flex items-center gap-3 px-4 py-3 rounded-button text-gray-800 hover:bg-orange-50 hover:text-orange-600 font-medium w-full text-left">
              <Package className="w-5 h-5" /> Products
            </button>
            <Link href="/recipes" className="flex items-center gap-3 px-4 py-3 rounded-button text-gray-800 hover:bg-orange-50 hover:text-orange-600 font-medium" onClick={onMenuClose}>
              <ChefHat className="w-5 h-5" /> Recipes
            </Link>
            <button type="button" onClick={() => { scrollToSection("about"); onMenuClose(); }} className="flex items-center gap-3 px-4 py-3 rounded-button text-gray-800 hover:bg-orange-50 hover:text-orange-600 font-medium w-full text-left">
              <Users className="w-5 h-5" /> About
            </button>
            <button type="button" onClick={() => { scrollToSection("contact"); onMenuClose(); }} className="flex items-center gap-3 px-4 py-3 rounded-button text-gray-800 hover:bg-orange-50 hover:text-orange-600 font-medium w-full text-left">
              <MessageCircle className="w-5 h-5" /> Contact
            </button>
            {!authLoading && (
              isAuthenticated ? (
                <>
                  <Link href="/orders" className="flex items-center gap-3 px-4 py-3 rounded-button text-gray-800 hover:bg-orange-50 font-medium" onClick={onMenuClose}>
                    <User className="w-5 h-5" /> My Orders
                  </Link>
                  <button type="button" onClick={() => { onMenuClose(); handleLogout(); }} className="flex items-center gap-3 px-4 py-3 rounded-button text-red-600 hover:bg-red-50 font-medium w-full text-left">
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </>
              ) : (
                <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-button bg-orange-600 text-white font-semibold mt-2" onClick={onMenuClose}>
                  <LogIn className="w-5 h-5" /> Login
                </Link>
              )
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
