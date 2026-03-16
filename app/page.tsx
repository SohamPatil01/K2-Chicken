import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import MotionSection from "@/components/MotionSection";
import pool from "@/lib/db";
import type { Metadata } from "next";

// Lazy load heavy components for better performance
const ProductCatalog = dynamic(() => import("@/components/ProductCatalog"), {
  loading: () => (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div>
    </div>
  ),
  ssr: true,
});

const RecipeSection = dynamic(() => import("@/components/RecipeSection"), {
  loading: () => (
    <div className="min-h-[300px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-200 border-t-orange-500"></div>
    </div>
  ),
  ssr: true,
});

const WhyChooseUs = dynamic(() => import("@/components/WhyChooseUs"), {
  ssr: true,
});

const CategoryRail = dynamic(() => import("@/components/CategoryRail"), {
  ssr: true,
});

const AboutSection = dynamic(() => import("@/components/AboutSection"), {
  ssr: true,
});

const ContactSection = dynamic(() => import("@/components/ContactSection"), {
  ssr: false, // Client-side only for map
});

const PromotionsFlyer = dynamic(() => import("@/components/PromotionsFlyer"), {
  loading: () => <div className="min-h-[200px]"></div>,
  ssr: true,
});

const ReviewsSection = dynamic(() => import("@/components/ReviewsSection"), {
  loading: () => <div className="min-h-[300px]"></div>,
  ssr: true,
});

const InauguralDiscountFlyer = dynamic(
  () => import("@/components/InauguralDiscountFlyer"),
  {
    ssr: false, // Client-side only component
  }
);

const FAQSection = dynamic(() => import("@/components/FAQSection"), {
  ssr: true,
});

const HomeOffersSection = dynamic(
  () => import("@/components/HomeOffersSection"),
  { ssr: true }
);

// Cache column existence check (only check once, reuse result)
let hasOriginalPriceColumn: boolean | null = null;

async function checkOriginalPriceColumn(client: any): Promise<boolean> {
  if (hasOriginalPriceColumn !== null) {
    return hasOriginalPriceColumn;
  }
  try {
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'original_price'
    `);
    hasOriginalPriceColumn = columnCheck.rows.length > 0;
    return hasOriginalPriceColumn;
  } catch {
    hasOriginalPriceColumn = false;
    return false;
  }
}

// Fetch data directly from database for better performance
// Revalidate every 10 seconds to balance freshness and performance
export const revalidate = 10; // Cache for 10 seconds

export const metadata: Metadata = {
  title: "Fresh & Premium Chicken Delivery in Bidar | K2 Chicken",
  description:
    "Order fresh, premium quality chicken online in Bidar. 100% Halal, farm-fresh, chemical-free chicken delivered to your doorstep in 30 minutes. Browse our wide selection of chicken cuts, marinated options, and ready-to-cook products. Order now!",
  keywords: [
    "chicken delivery bidar",
    "fresh chicken online bidar",
    "halal chicken bidar",
    "raw chicken delivery",
    "K2 chicken bidar",
    "premium chicken delivery",
    "meat delivery app bidar",
    "chicken cuts bidar",
    "marinated chicken bidar",
    "farm fresh chicken",
  ],
  openGraph: {
    title: "K2 Chicken | Fresh & Premium Chicken Delivery in Bidar",
    description:
      "Order fresh, premium quality chicken online in Bidar. 100% Halal, farm-fresh, chemical-free chicken delivered to your doorstep in 30 minutes.",
    url: "https://k2-chicken.vercel.app",
    siteName: "K2 Chicken",
    images: [
      {
        url: "/hero-fresh-simple.png",
        width: 1200,
        height: 630,
        alt: "K2 Chicken - Fresh & Premium Quality Chicken Delivery",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "K2 Chicken | Fresh & Premium Chicken Delivery",
    description:
      "Order fresh, premium quality chicken online in Bidar. 100% Halal, farm-fresh, chemical-free chicken delivered to your doorstep.",
    images: ["/hero-fresh-simple.png"],
  },
  alternates: {
    canonical: "https://k2-chicken.vercel.app",
  },
};

async function getHomePageData() {
  const client = await pool.connect();
  try {
    // Check column existence once
    const hasOriginalPrice = await checkOriginalPriceColumn(client);

    // Fetch all data in parallel
    const [productsResult, recipesResult, promotionsResult, reviewsResult] =
      await Promise.all([
        client.query(`
        SELECT id, name, description, price, ${
          hasOriginalPrice
            ? "COALESCE(original_price, price) as original_price"
            : "price as original_price"
        }, image_url, category, is_available,
               COALESCE(stock_quantity, 100) as stock_quantity,
               COALESCE(low_stock_threshold, 10) as low_stock_threshold,
               COALESCE(in_stock, true) as in_stock
        FROM products 
        WHERE is_available = true 
        ORDER BY category, name
      `),
        client.query(`
        SELECT id, title, description, ingredients, instructions, image_url, prep_time, cook_time, servings
        FROM recipes 
        ORDER BY created_at DESC
        LIMIT 3
      `),
        client.query(`
        SELECT * FROM promotions
        WHERE is_active = true AND (end_date IS NULL OR end_date >= CURRENT_DATE)
        ORDER BY display_order ASC, created_at DESC
      `),
        client.query(`
        SELECT id, user_name, rating, comment, created_at
        FROM reviews
        WHERE is_approved = true
        ORDER BY is_featured DESC, display_order ASC, created_at DESC
        LIMIT 6
      `),
      ]);

    // Get weight options for products
    const productIds = productsResult.rows.map((p) => p.id);
    let weightOptions: any[] = [];
    if (productIds.length > 0) {
      try {
        const weightResult = await client.query(
          `
          SELECT * FROM product_weight_options 
          WHERE product_id = ANY($1::int[])
          ORDER BY product_id, weight
        `,
          [productIds]
        );
        weightOptions = weightResult.rows;
      } catch (error) {
        // Table might not exist yet, use empty array
        console.error("Error fetching weight options:", error);
        weightOptions = [];
      }
    }

    // Attach weight options to products
    const products = productsResult.rows.map((product) => ({
      ...product,
      weightOptions: weightOptions.filter((wo) => wo.product_id === product.id),
    }));

    // Fetch delivery status
    let deliveryEnabled = true;
    try {
      const deliveryStatusResult = await client.query(
        "SELECT value FROM settings WHERE key = $1",
        ["delivery_enabled"]
      );
      if (deliveryStatusResult.rows.length > 0) {
        deliveryEnabled =
          deliveryStatusResult.rows[0].value === "true" ||
          deliveryStatusResult.rows[0].value === true;
      }
    } catch (error) {
      console.error("Error fetching delivery status:", error);
      // Default to enabled on error
    }

    return {
      products,
      recipes: recipesResult.rows,
      promotions: promotionsResult.rows,
      reviews: reviewsResult.rows,
      deliveryEnabled,
    };
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);
    // Log the error but don't crash the page
    return {
      products: [],
      recipes: [],
      promotions: [],
      reviews: [],
      deliveryEnabled: true,
    };
  } finally {
    client.release();
  }
}

export default async function Home() {
  // Fetch data server-side
  const { products, recipes, promotions, reviews, deliveryEnabled } =
    await getHomePageData();

  // Generate structured data for homepage
  const homepageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "K2 Chicken",
    url: "https://k2-chicken.vercel.app",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://k2-chicken.vercel.app/?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const itemListStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products
      .slice(0, 10)
      .map((product: any, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: product.image_url,
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "INR",
            availability: product.is_available
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
        },
      })),
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How fast is the delivery?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We offer fast delivery in 30-45 minutes for orders in Bidar. Our delivery team ensures your fresh chicken reaches you quickly and safely.",
        },
      },
      {
        "@type": "Question",
        name: "Is the chicken halal?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, all our chicken is 100% Halal certified. We follow strict halal guidelines in sourcing and preparation.",
        },
      },
      {
        "@type": "Question",
        name: "What is the minimum order for free delivery?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Free delivery is available for orders above ₹350 within our delivery radius. Orders below ₹350 may incur a delivery charge.",
        },
      },
      {
        "@type": "Question",
        name: "What payment methods do you accept?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We accept multiple payment methods including UPI, credit cards, debit cards, and cash on delivery for your convenience.",
        },
      },
      {
        "@type": "Question",
        name: "Is the chicken fresh?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we guarantee 100% fresh, farm-fresh chicken. All our products are sourced daily and delivered fresh to your doorstep. We do not use any chemicals or preservatives.",
        },
      },
      {
        "@type": "Question",
        name: "What are your operating hours?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We are open from 8:00 AM to 8:00 PM, Monday through Sunday. You can place orders anytime during these hours.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homepageStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <div className="bg-gray-50 min-h-screen">
        <InauguralDiscountFlyer />
        <PromotionsFlyer initialPromotions={promotions} />
        <Hero deliveryEnabled={deliveryEnabled} freeDeliveryAbove={500} />

        <CategoryRail />

        <MotionSection delay={0.2} id="products">
          <ProductCatalog
            initialProducts={products}
            deliveryEnabled={deliveryEnabled}
          />
        </MotionSection>

        <MotionSection delay={0.3}>
          <HomeOffersSection promotions={promotions} />
        </MotionSection>

        <MotionSection delay={0.35}>
          <WhyChooseUs />
        </MotionSection>

        <MotionSection delay={0.4}>
          <ReviewsSection initialReviews={reviews} />
        </MotionSection>

        <MotionSection delay={0.5}>
          <RecipeSection initialRecipes={recipes} />
        </MotionSection>

        <MotionSection delay={0.7}>
          <FAQSection />
        </MotionSection>

        <MotionSection delay={0.8}>
          <ContactSection />
        </MotionSection>
      </div>
    </>
  );
}
