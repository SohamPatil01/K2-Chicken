import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import MotionSection from "@/components/MotionSection";
import {
  HomeContactSectionFallback,
  HomeProductCatalogFallback,
  HomePromotionsSectionFallback,
  HomeRecipeSectionFallback,
  HomeReviewsSectionFallback,
} from "@/components/ui/LoadingState";
import pool from "@/lib/db";
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/siteUrl";
import { sanitizeRecipeList, sanitizeRecipeText } from "@/lib/recipeBranding";
import { FAQ_ITEMS } from "@/lib/seo/faq";

const siteUrl = getSiteUrl();

// Lazy load heavy components for better performance
const ProductCatalog = dynamic(() => import("@/components/ProductCatalog"), {
  loading: () => <HomeProductCatalogFallback />,
  ssr: true,
});

const RecipeSection = dynamic(() => import("@/components/RecipeSection"), {
  loading: () => <HomeRecipeSectionFallback />,
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
  loading: () => <HomeContactSectionFallback />,
  ssr: false, // Client-side only for map
});

const PromotionsFlyer = dynamic(() => import("@/components/PromotionsFlyer"), {
  loading: () => <HomePromotionsSectionFallback />,
  ssr: true,
});

const ReviewsSection = dynamic(() => import("@/components/ReviewsSection"), {
  loading: () => <HomeReviewsSectionFallback />,
  ssr: true,
});

const InauguralDiscountFlyer = dynamic(
  () => import("@/components/InauguralDiscountFlyer"),
  {
    loading: () => (
      <div
        className="min-h-[72px] w-full bg-amber-50/80 animate-pulse"
        role="status"
        aria-live="polite"
        aria-label="Loading offer banner"
      />
    ),
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

// Cache homepage data to reduce mobile TTFB while keeping stock/promos fresh enough.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Fresh & Premium Chicken Delivery in Pune | K2 Chicken",
  description:
    "Order fresh, premium quality chicken online in Pune. 100% Halal, farm-fresh, chemical-free chicken delivered to your doorstep in ~90 minutes. Browse our wide selection of chicken cuts, marinated options, and ready-to-cook products. Order now!",
  keywords: [
    "chicken delivery pune",
    "fresh chicken online pune",
    "halal chicken pune",
    "raw chicken delivery",
    "K2 chicken pune",
    "K2Chicken",
    "k2chicken",
    "premium chicken delivery",
    "meat delivery app pune",
    "chicken cuts pune",
    "marinated chicken pune",
    "farm fresh chicken",
  ],
  openGraph: {
    title: "K2 Chicken | Fresh & Premium Chicken Delivery in Pune",
    description:
      "Order fresh, premium quality chicken online in Pune. 100% Halal, farm-fresh, chemical-free chicken delivered to your doorstep in ~90 minutes.",
    url: siteUrl,
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
      "Order fresh, premium quality chicken online in Pune. 100% Halal, farm-fresh, chemical-free chicken delivered to your doorstep.",
    images: ["/hero-fresh-simple.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
};

async function getHomePageData() {
  let client: import("pg").PoolClient | undefined;
  try {
    client = await pool.connect();
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
      recipes: recipesResult.rows.map((recipe: any) => ({
        ...recipe,
        description: sanitizeRecipeText(recipe.description),
        ingredients: sanitizeRecipeList(recipe.ingredients),
        instructions: sanitizeRecipeList(recipe.instructions),
      })),
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
    client?.release();
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
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/?search={search_term_string}`,
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
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
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
      <div className="bg-white min-h-screen w-full max-w-[100vw] overflow-x-hidden">
        <Hero deliveryEnabled={deliveryEnabled} freeDeliveryAbove={350} heroProducts={products.slice(0, 3)} />
        <InauguralDiscountFlyer />
        <PromotionsFlyer initialPromotions={promotions} />
        <div className="reveal-up"><TrustBar /></div>

        <div id="products" className="scroll-mt-20 reveal-up">
          <CategoryRail />
        </div>

        <MotionSection delay={0.2}>
          <ProductCatalog
            initialProducts={products}
            deliveryEnabled={deliveryEnabled}
          />
        </MotionSection>

        <MotionSection delay={0.3}>
          <HomeOffersSection promotions={promotions} />
        </MotionSection>

        <MotionSection
          delay={0.35}
          id="about"
          className="scroll-mt-[4.5rem] sm:scroll-mt-20"
        >
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
