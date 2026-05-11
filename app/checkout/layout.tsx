import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Checkout | K2 Chicken - Secure Online Payment",
  description:
    "Complete your order for fresh, premium chicken delivery in Pune. Secure checkout with multiple payment options including UPI, cards, and cash on delivery. Fast 30-minute delivery available.",
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
      "Complete your order for fresh, premium chicken delivery in Pune. Secure checkout with multiple payment options.",
    url: `${siteUrl}/checkout`,
    siteName: "K2 Chicken",
    type: "website",
  },
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${siteUrl}/checkout`,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

