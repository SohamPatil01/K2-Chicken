import type { Metadata } from "next";
import { Inter, Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import ConditionalLayout from "@/components/ConditionalLayout";
import ScrollRevealInit from "@/components/ScrollRevealInit";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getSiteUrl } from "@/lib/siteUrl";

const siteUrl = getSiteUrl();

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

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
});

export const viewport = {
  themeColor: "#F97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

// Tab favicon: app/icon.png (Next.js file convention). Apple shortcut uses /logo.png below.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "K2 Chicken | Fresh & Premium Chicken Delivery in Pune",
    template: "%s | K2 Chicken",
  },
  description:
    "Order fresh, premium quality chicken online in Pune. 100% Halal, farm-fresh, chemical-free chicken delivered to your doorstep in 30 minutes. Order now!",
  keywords: [
    "chicken delivery pune",
    "fresh chicken online pune",
    "halal chicken pune",
    "raw chicken delivery",
    "K2 chicken",
    "K2Chicken",
    "k2chicken",
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
    url: siteUrl,
    siteName: "K2 Chicken",
    title: "K2 Chicken | Fresh & Premium Chicken Delivery",
    description:
      "Order fresh, premium quality chicken online in Pune. 100% Halal, farm-fresh, chemical-free chicken delivered to your doorstep in 30 minutes.",
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
      "Order fresh, premium quality chicken online in Pune. 100% Halal, farm-fresh, chemical-free chicken delivered to your doorstep in 30 minutes.",
    images: ["/hero-fresh-simple.png"],
    creator: "@k2chicken",
  },
  icons: {
    apple: [{ url: "/logo.png", type: "image/png", sizes: "180x180" }],
    shortcut: "/logo.png",
  },
  manifest: "/manifest.json",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "K2 Chicken",
  alternateName: ["K2Chicken", "k2chicken", "K2 Chicken Pune"],
  image: `${siteUrl}/logo.png`,
  logo: `${siteUrl}/logo.png`,
  description:
    "Fresh, premium quality chicken delivery in Pune. 100% Halal, farm-fresh, chemical-free chicken delivered to your doorstep in 30 minutes.",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-8484978622",
    contactType: "customer service",
    areaServed: "IN",
    availableLanguage: ["en", "hi"],
    hoursAvailable: {
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
      closes: "20:00",
    },
  },
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "Shop No. 4, 24K Avenue, New DP Rd, Kolte Patil, Vishal Nagar, Pimple Nilakh, Pimpri-Chinchwad",
    addressLocality: "Pune",
    addressRegion: "Maharashtra",
    postalCode: "411027",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "18.6292",
    longitude: "73.7995",
  },
  url: siteUrl,
  telephone: "+918484978622",
  priceRange: "₹₹",
  servesCuisine: "Indian",
  paymentAccepted: "Cash, Credit Card, Debit Card, UPI",
  currenciesAccepted: "INR",
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
      closes: "20:00",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "150",
    bestRating: "5",
    worstRating: "1",
  },
  sameAs: ["https://facebook.com/k2chicken", "https://instagram.com/k2chicken"],
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "K2 Chicken",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description:
    "Fresh, premium quality halal chicken delivery in Pune and Pimpri-Chinchwad.",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-8484978622",
    contactType: "customer service",
    areaServed: "IN",
    availableLanguage: ["English", "Hindi"],
  },
  sameAs: ["https://facebook.com/k2chicken", "https://instagram.com/k2chicken"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} ${poppins.variable} ${playfair.variable}`}
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
        <ScrollRevealInit />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </body>
    </html>
  );
}
