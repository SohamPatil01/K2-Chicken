import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Instrument_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import ConditionalLayout from "@/components/ConditionalLayout";
import ScrollRevealInit from "@/components/ScrollRevealInit";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getSiteUrl } from "@/lib/siteUrl";
import {
  LOCAL_SEO_KEYWORDS,
  SITE_META_DESCRIPTION,
  SITE_OG_DESCRIPTION,
} from "@/lib/seo/metadata";
import { DELIVERY_AREAS_PHRASE } from "@/lib/deliveryAreas";

const siteUrl = getSiteUrl();

const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const bodyFont = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
});

export const viewport = {
  themeColor: "#123D2B",
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
  description: SITE_META_DESCRIPTION,
  keywords: LOCAL_SEO_KEYWORDS,
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
    description: SITE_OG_DESCRIPTION,
    images: [
      {
        url: "/hero-fresh-simple.png",
        width: 1200,
        height: 630,
        alt: "K2 Chicken - Fresh halal chicken delivery in Pune",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "K2 Chicken | Fresh & Premium Chicken Delivery",
    description: SITE_OG_DESCRIPTION,
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
  "@type": ["FoodEstablishment", "LocalBusiness"],
  name: "K2 Chicken",
  alternateName: ["K2Chicken", "k2chicken", "K2 Chicken Pune"],
  image: `${siteUrl}/logo.png`,
  logo: `${siteUrl}/logo.png`,
  description: SITE_META_DESCRIPTION,
  email: "support@k2chicken.com",
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
  servesCuisine: ["Halal", "Indian"],
  paymentAccepted: "Cash, Credit Card, Debit Card, UPI",
  currenciesAccepted: "INR",
  areaServed: [
    { "@type": "Place", name: "Pimple Nilakh" },
    { "@type": "Place", name: "Baner" },
    { "@type": "Place", name: "Pancard Club" },
    { "@type": "Place", name: "Aundh" },
    { "@type": "Place", name: "Wakad" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Fresh Chicken Cuts",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Chicken Breast (Boneless)" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Chicken Curry Cut" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Whole Chicken" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Chicken Drumsticks" } },
    ],
  },
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
  sameAs: [
    "https://facebook.com/k2chicken",
    "https://instagram.com/k2chicken",
    "https://wa.me/918484978622",
  ],
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "K2 Chicken",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description:
    `Fresh, premium quality halal chicken delivery to ${DELIVERY_AREAS_PHRASE}.`,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-8484978622",
    contactType: "customer service",
    areaServed: "IN",
    availableLanguage: ["English", "Hindi"],
  },
  sameAs: [
    "https://facebook.com/k2chicken",
    "https://instagram.com/k2chicken",
    "https://wa.me/918484978622",
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
        className={`${bodyFont.className} ${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} font-body bg-k2-cream text-k2-ink antialiased`}
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
