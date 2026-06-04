import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Checkout - Secure Online Payment",
  description:
    "Complete your order for fresh chicken delivery in Pimple Nilakh, Baner, Pancard Club, Aundh, and Wakad. Secure checkout with UPI, cards, and cash on delivery. Delivery in ~90 minutes.",
  keywords: [
    "chicken delivery checkout",
    "online chicken order pune",
    "chicken delivery payment",
    "secure checkout",
    "K2 chicken order",
  ],
  openGraph: {
    title: "Checkout | K2 Chicken",
    description:
      "Complete your order for fresh chicken delivery in Pimple Nilakh, Baner, Pancard Club, Aundh, and Wakad. Secure checkout with multiple payment options. Delivery in ~90 minutes.",
    url: `${siteUrl}/checkout`,
    siteName: "K2 Chicken",
    type: "website",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

