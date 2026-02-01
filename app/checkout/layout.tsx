import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | K2 Chicken - Secure Online Payment",
  description:
    "Complete your order for fresh, premium chicken delivery in Bidar. Secure checkout with multiple payment options including UPI, cards, and cash on delivery. Fast 30-minute delivery available.",
  keywords: [
    "chicken delivery checkout",
    "online chicken order bidar",
    "chicken delivery payment",
    "secure checkout",
    "K2 chicken order",
  ],
  openGraph: {
    title: "Checkout | K2 Chicken",
    description:
      "Complete your order for fresh, premium chicken delivery in Bidar. Secure checkout with multiple payment options.",
    url: "https://k2-chicken.vercel.app/checkout",
    siteName: "K2 Chicken",
    type: "website",
  },
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://k2-chicken.vercel.app/checkout",
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

