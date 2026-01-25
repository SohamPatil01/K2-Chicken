import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import ConditionalLayout from "@/components/ConditionalLayout";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
});

export const viewport = {
  themeColor: "#F97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://k2-chicken.vercel.app"),
  title: {
    default: "K2 Chicken | Fresh & Premium Chicken Delivery in Bidar",
    template: "%s | K2 Chicken",
  },
  description:
    "Order fresh, premium quality chicken online in Bidar. 100% Halal, farm-fresh, chemical-free chicken delivered to your doorstep in 30 minutes. Order now!",
  keywords: [
    "chicken delivery bidar",
    "fresh chicken online",
    "halal chicken bidar",
    "raw chicken delivery",
    "K2 chicken",
    "premium chicken",
    "meat delivery app",
  ],
  authors: [{ name: "K2 Chicken Team" }],
  creator: "K2 Chicken",
  publisher: "K2 Chicken",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://k2-chicken.vercel.app",
    siteName: "K2 Chicken",
    title: "K2 Chicken | Fresh & Premium Chicken Delivery",
    description:
      "Order fresh, premium quality chicken online in Bidar. 100% Halal, farm-fresh, chemical-free chicken delivered to your doorstep in 30 minutes.",
    images: [
      {
        url: "/hero-fresh-simple.png",
        width: 1200,
        height: 630,
        alt: "K2 Chicken - Fresh & Premium Quality",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "K2 Chicken | Fresh & Premium Chicken Delivery",
    description:
      "Order fresh, premium quality chicken online in Bidar. 100% Halal, farm-fresh, chemical-free chicken delivered to your doorstep in 30 minutes.",
    images: ["/hero-fresh-simple.png"],
    creator: "@k2chicken",
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  manifest: "/manifest.json",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "K2 Chicken",
  image: "https://k2-chicken.vercel.app/logo.png",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-8484978622",
    contactType: "customer service",
    areaServed: "IN",
    availableLanguage: "en",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Main Road",
    addressLocality: "Bidar",
    addressRegion: "Karnataka",
    postalCode: "585401",
    addressCountry: "IN",
  },
  url: "https://k2-chicken.vercel.app",
  telephone: "+918484978622",
  priceRange: "₹₹",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "08:00",
      closes: "22:00",
    },
  ],
  sameAs: [
    "https://facebook.com/k2chicken",
    "https://instagram.com/k2chicken",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} ${poppins.variable}`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <ConditionalLayout>{children}</ConditionalLayout>
            </div>
          </CartProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
