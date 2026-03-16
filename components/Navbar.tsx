"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import NavbarView from "./NavbarView";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useCart();
  const { isAuthenticated, logout, loading: authLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  const scrollToSection = (sectionId: string) => {
    if (pathname !== "/") {
      router.push("/#" + sectionId);
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : (pathname && pathname.startsWith(path)) || false;

  const bannerClass = scrolled
    ? "bg-white/98 backdrop-blur-xl shadow-card border-b border-gray-200/50"
    : "bg-white/95 backdrop-blur-lg shadow-soft border-b border-gray-100/50";

  return (
    <NavbarView
      bannerClass={bannerClass}
      isMenuOpen={isMenuOpen}
      isActive={isActive}
      scrollToSection={scrollToSection}
      onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
      onMenuClose={() => setIsMenuOpen(false)}
      handleLogout={handleLogout}
      authLoading={authLoading}
      isAuthenticated={!!isAuthenticated}
      totalItems={totalItems}
      mounted={mounted}
    />
  );
}
