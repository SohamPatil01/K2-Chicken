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
  Search,
  Phone,
  Egg,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import LocationSelector from "./LocationSelector";

// Custom Chicken Icon (Lucide doesn't have a specific chicken icon, using ChefHat as fallback or custom SVG if preferred)
// Using text/emoji for simplicity or generic icons for categories
const CategoryLink = ({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active?: boolean }) => (
  <Link
    href={href}
    className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-orange-600 ${active ? "text-orange-600" : "text-gray-600"}`}
  >
    <Icon size={18} />
    <span>{label}</span>
  </Link>
);

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { state } = useCart();
  const { isAuthenticated, logout, loading: authLoading } = useAuth();
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search navigation
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? "shadow-md" : "shadow-sm border-b border-gray-100"}`}
      >
        {/* Top Bar - Location & Brand */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3 md:gap-0">

            {/* Logo & Location - Left */}
            <div className="flex items-center justify-between md:justify-start gap-4 md:gap-8">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Toggle */}
                <button
                  className="md:hidden p-1 text-gray-700"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <Link href="/" className="flex-shrink-0">
                  <img
                    src="/logo.png"
                    alt="K2 Chicken"
                    className="h-8 sm:h-10 w-auto"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = "/logo.svg";
                    }}
                  />
                </Link>
              </div>

              <div className="hidden md:block h-8 w-[1px] bg-gray-200"></div>

              <div className="hidden md:block">
                <LocationSelector />
              </div>

              {/* Mobile Cart Icon (Right aligned on mobile) */}
              <div className="md:hidden flex items-center gap-3">
                <Link href="/cart" className="relative text-gray-700">
                  <ShoppingCart size={24} />
                  {mounted && totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Search Bar - Center/Right */}
            <div className="flex-1 max-w-2xl px-0 md:px-8 w-full">
              <form onSubmit={handleSearch} className="relative group">
                <input
                  type="text"
                  placeholder="Search for 'Chicken Curry Cut'..."
                  className="w-full bg-gray-100 border border-transparent focus:bg-white focus:border-orange-500 text-gray-800 text-sm rounded-lg pl-10 pr-4 py-2.5 transition-all outline-none"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-orange-500 transition-colors" />
              </form>
            </div>

            {/* Actions - Right (Desktop) */}
            <div className="hidden md:flex items-center gap-6">
              {!authLoading && (
                isAuthenticated ? (
                  <div className="flex items-center gap-4">
                    <Link href="/orders" className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-orange-600 transition-colors group">
                      <User size={20} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-medium">Profile</span>
                    </Link>
                    <button onClick={handleLogout} className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-red-600 transition-colors group">
                      <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-medium">Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="flex items-center gap-2 text-gray-700 hover:text-orange-600 font-medium transition-colors">
                    <span className="text-sm">Login</span>
                  </Link>
                )
              )}

              <Link href="/cart" className="flex items-center gap-2 group">
                <div className="relative">
                  <ShoppingCart size={24} className="text-gray-700 group-hover:text-orange-600 transition-colors" />
                  {mounted && totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">Cart</span>
              </Link>
            </div>
          </div>

          {/* Mobile Location (Below Search) */}
          <div className="md:hidden py-2 flex items-center justify-between border-t border-gray-100 mt-2">
            <LocationSelector />
            {!authLoading && !isAuthenticated && (
              <Link href="/login" className="text-xs font-bold text-orange-600">
                LOGIN
              </Link>
            )}
          </div>
        </div>

        {/* Secondary Navigation - Categories (Desktop Only) */}
        <div className="hidden md:block border-t border-gray-100 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8 py-2 overflow-x-auto no-scrollbar">
              <CategoryLink href="/" icon={Egg} label="Chicken" active={pathname === "/"} />
              <CategoryLink href="/#products" icon={Egg} label="Eggs" active={pathname === "/#products"} />
              <div className="h-4 w-[1px] bg-gray-300 mx-2"></div>
              <CategoryLink href="/recipes" icon={Phone} label="Recipes" active={pathname === "/recipes"} />
              <Link href="tel:+918484978622" className="ml-auto flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-green-600 transition-colors">
                <Phone size={14} />
                <span>+91 84849 78622</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed inset-0 z-50 transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 md:hidden`}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
        <div className="relative w-[80%] max-w-[300px] h-full bg-white shadow-2xl flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-orange-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-orange-100">
                <User size={20} className="text-orange-600" />
              </div>
              <div>
                {isAuthenticated ? (
                  <p className="font-bold text-gray-900 text-sm">Welcome Back</p>
                ) : (
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="font-bold text-gray-900 text-sm hover:text-orange-600">Login / Sign Up</Link>
                )}
              </div>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="text-gray-500 hover:text-red-500">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${pathname === "/" ? "bg-orange-50 text-orange-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}>
              <img src="/logo.svg" className="w-5 h-5 opacity-70" alt="" />
              Chicken
            </Link>
            <Link href="/#products" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
              <Egg size={20} className="text-gray-500" />
              Eggs
            </Link>
            <div className="my-2 border-t border-gray-100"></div>
            <Link href="/recipes" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
              <span className="text-xl">👨‍🍳</span>
              Recipes
            </Link>
            <Link href="/orders" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
              <span className="text-xl">📦</span>
              My Orders
            </Link>
          </nav>

          {isAuthenticated && (
            <div className="p-4 border-t border-gray-100">
              <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="flex items-center gap-2 text-red-600 font-medium w-full px-4 py-2 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
