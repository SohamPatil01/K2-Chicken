import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Shopping Cart | K2 Chicken - Your Fresh Chicken Order",
  description:
    "Review your cart items before checkout. Add more fresh chicken products, adjust quantities, and proceed to secure checkout for fast delivery in Pune.",
  keywords: [
    "chicken cart",
    "shopping cart",
    "chicken order pune",
    "cart items",
    "K2 chicken cart",
  ],
  openGraph: {
    title: "Shopping Cart | K2 Chicken",
    description:
      "Review your cart items before checkout. Add more fresh chicken products and proceed to secure checkout.",
    url: `${siteUrl}/cart`,
    siteName: "K2 Chicken",
    type: "website",
  },
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${siteUrl}/cart`,
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

