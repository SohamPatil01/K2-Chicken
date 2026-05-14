import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmation | K2 Chicken",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderConfirmationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
