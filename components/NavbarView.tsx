"use client";

import Link from "next/link";
import {
  ShoppingBag,
  Menu,
  X,
  User,
  LogOut,
  LogIn,
  Search,
  Home,
  Package,
  Users,
  MessageCircle,
} from "lucide-react";
import { DELIVERY_AREAS_COMPACT } from "@/lib/deliveryAreas";

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

const TICKER_ITEMS = [
  "FREE DELIVERY ON ORDERS ABOVE ₹350",
  "FRESH CHICKEN IN ~90 MINUTES",
  DELIVERY_AREAS_COMPACT,
  "CUT FRESH EVERY MORNING — NEVER FROZEN",
  "100% HALAL CERTIFIED · FSSAI LICENSED",
];

function TickerContent() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <>
      {items.map((text, i) => (
        <span key={`${text}-${i}`} className="flex items-center gap-2.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/70" />
          {text}
        </span>
      ))}
    </>
  );
}

export default function NavbarView({
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
      {/* Promo ticker */}
      <div
        className="overflow-hidden bg-k2-saffron py-2 text-white"
        aria-label="offers"
      >
        <div className="marquee-track animate-marquee font-mono text-[12.5px] tracking-wide">
          <TickerContent />
          <TickerContent />
        </div>
      </div>

      {/* Main nav */}
      <nav className="glass-nav w-full">
        <div className="mx-auto max-w-[1180px] px-6">
          <div className="flex h-[60px] items-center justify-between gap-4">
            <Link href="/" className="group flex shrink-0 items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-k2-green font-display text-base font-extrabold text-k2-cream">
                K2
              </span>
              <span className="hidden flex-col leading-tight sm:flex">
                <span className="font-display text-[22px] font-extrabold text-k2-green transition-colors group-hover:text-k2-green-soft">
                  K2 Chicken
                </span>
                <span className="font-mono text-[9.5px] font-normal uppercase tracking-widest text-k2-saffron-hot">
                  Only fresh, never frozen
                </span>
              </span>
            </Link>

            <div className="hidden items-center gap-7 font-medium text-[15px] md:flex">
              <button
                type="button"
                onClick={() => scrollToSection("products")}
                className="nav-link relative py-1 text-k2-ink transition-colors hover:text-k2-green"
              >
                Fresh Cuts
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("process")}
                className="nav-link relative py-1 text-k2-ink transition-colors hover:text-k2-green"
              >
                Our Process
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("reviews")}
                className="nav-link relative py-1 text-k2-ink transition-colors hover:text-k2-green"
              >
                Reviews
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("faq")}
                className="nav-link relative py-1 text-k2-ink transition-colors hover:text-k2-green"
              >
                FAQ
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden lg:block">
                <div className="relative w-52">
                  <input
                    type="text"
                    placeholder="Search cuts..."
                    className="search-glow w-full rounded-pill border border-k2-paper bg-white/80 py-2 pl-10 pr-4 text-sm text-k2-ink placeholder:text-[#7b877f] focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val)
                          window.location.href = `/?search=${encodeURIComponent(val)}#products`;
                      }
                    }}
                  />
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b877f]" />
                </div>
              </div>

              {!authLoading && (
                <>
                  {isAuthenticated ? (
                    <div className="hidden items-center gap-0.5 md:flex">
                      <Link
                        href="/orders"
                        title="My Orders"
                        className="rounded-lg p-2 text-k2-ink transition-colors hover:bg-k2-cream-dark hover:text-k2-green"
                      >
                        <User className="h-5 w-5" />
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        title="Logout"
                        className="rounded-lg p-2 text-k2-ink transition-colors hover:bg-k2-cream-dark hover:text-k2-saffron-hot"
                      >
                        <LogOut className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="hidden rounded-pill px-4 py-2 text-sm font-semibold text-k2-green transition-colors hover:text-k2-saffron md:block"
                    >
                      Sign In
                    </Link>
                  )}
                </>
              )}

              <Link
                href="/cart"
                className="relative rounded-full p-2 transition-colors hover:bg-k2-cream-dark"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5 text-k2-ink" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-k2-saffron text-xs font-bold text-white badge-glow">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => scrollToSection("products")}
                className="btn-green hidden items-center gap-2 rounded-pill px-5 py-2.5 text-sm font-semibold sm:inline-flex"
              >
                🛒 Order Now
              </button>

              <button
                type="button"
                className="rounded-lg p-2 text-k2-ink transition-colors hover:bg-k2-cream-dark md:hidden"
                onClick={onMenuToggle}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="pb-3 lg:hidden">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search chicken cuts..."
                className="search-glow w-full rounded-pill border border-k2-paper bg-white/80 py-2.5 pl-10 pr-4 text-sm placeholder:text-[#7b877f] focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val)
                      window.location.href = `/?search=${encodeURIComponent(val)}#products`;
                  }
                }}
              />
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b877f]" />
            </div>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 md:hidden ${isMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="border-t border-k2-paper bg-k2-cream px-4 py-3">
            <nav className="flex flex-col gap-0.5">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-k2-ink hover:bg-white"
                onClick={onMenuClose}
              >
                <Home className="h-5 w-5" /> Home
              </Link>
              <button
                type="button"
                onClick={() => {
                  scrollToSection("products");
                  onMenuClose();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-k2-ink hover:bg-white"
              >
                <Package className="h-5 w-5" /> Fresh Cuts
              </button>
              <button
                type="button"
                onClick={() => {
                  scrollToSection("process");
                  onMenuClose();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-k2-ink hover:bg-white"
              >
                <Users className="h-5 w-5" /> Our Process
              </button>
              <button
                type="button"
                onClick={() => {
                  scrollToSection("reviews");
                  onMenuClose();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-k2-ink hover:bg-white"
              >
                <MessageCircle className="h-5 w-5" /> Reviews
              </button>
              <button
                type="button"
                onClick={() => {
                  scrollToSection("faq");
                  onMenuClose();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-k2-ink hover:bg-white"
              >
                FAQ
              </button>
              {!authLoading &&
                (isAuthenticated ? (
                  <>
                    <Link
                      href="/orders"
                      className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-k2-ink hover:bg-white"
                      onClick={onMenuClose}
                    >
                      <User className="h-5 w-5" /> My Orders
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        onMenuClose();
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-k2-saffron-hot hover:bg-k2-cream-dark"
                    >
                      <LogOut className="h-5 w-5" /> Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="mt-2 flex items-center gap-3 rounded-xl bg-k2-green px-4 py-3 font-semibold text-k2-cream"
                    onClick={onMenuClose}
                  >
                    <LogIn className="h-5 w-5" /> Sign In
                  </Link>
                ))}
            </nav>
          </div>
        </div>
      </nav>

      <style jsx>{`
        .nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -2px;
          width: 0;
          height: 2px;
          background: #f4720b;
          transition: width 0.25s;
        }
        .nav-link:hover::after {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
