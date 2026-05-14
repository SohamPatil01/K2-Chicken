import type { Metadata } from "next";
import { getProductForSeo } from "@/lib/getProductForSeo";
import { absoluteUrl, getSiteUrl } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

function truncateMetaDescription(text: string, max = 155): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductForSeo(id);
  const siteUrl = getSiteUrl();

  if (!product) {
    return {
      title: "Product | K2 Chicken",
      robots: { index: false, follow: true },
    };
  }

  const title = `${product.name} | Buy Online | K2 Chicken`;
  const description = product.description
    ? truncateMetaDescription(product.description)
    : `Buy ${product.name} online — fresh halal chicken delivery in Pune from K2 Chicken.`;

  const ogImage = product.image_url
    ? absoluteUrl(product.image_url)
    : `${siteUrl}/hero-fresh-simple.png`;

  const keywords = [
    product.name,
    product.category,
    "chicken delivery Pune",
    "K2 Chicken",
    "halal chicken Pune",
  ].filter(Boolean) as string[];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/products/${id}`,
      siteName: "K2 Chicken",
      locale: "en_IN",
      images: [{ url: ogImage, width: 1200, height: 630, alt: product.name }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `${siteUrl}/products/${id}`,
    },
    robots: product.is_available
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

export default async function ProductRouteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductForSeo(id);
  const siteUrl = getSiteUrl();

  if (!product) {
    return <>{children}</>;
  }

  const imageUrl = product.image_url
    ? absoluteUrl(product.image_url)
    : `${siteUrl}/hero-fresh-simple.png`;

  const priceNum =
    typeof product.price === "number"
      ? product.price
      : parseFloat(String(product.price));

  const graph = [
    {
      "@type": "Product",
      name: product.name,
      description: product.description || undefined,
      image: imageUrl,
      sku: String(product.id),
      category: product.category || undefined,
      brand: {
        "@type": "Brand",
        name: "K2 Chicken",
      },
      offers: {
        "@type": "Offer",
        url: `${siteUrl}/products/${id}`,
        priceCurrency: "INR",
        price: Number.isFinite(priceNum) ? String(priceNum) : String(product.price),
        availability: product.is_available
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Shop",
          item: `${siteUrl}/`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: product.name,
          item: `${siteUrl}/products/${id}`,
        },
      ],
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
