"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Pages that should have their own full-screen layout (no Header/Footer)
  const fullScreenPages: string[] = [];

  // Pages that should not have Header/Footer (admin pages have their own navigation)
  const isAdminPage = pathname?.startsWith("/admin");

  const isFullScreenPage = fullScreenPages.includes(pathname || "");

  if (isFullScreenPage || isAdminPage) {
    // For full-screen pages or admin pages, don't render the main layout components
    return <>{children}</>;
  }

  // For regular pages, render the normal layout
  return (
    <>
      <Navbar />
      <main className="flex-grow pb-24 md:pb-0 min-h-screen main-mobile-pad">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
