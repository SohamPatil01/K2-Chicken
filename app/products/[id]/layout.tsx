import type { Metadata } from "next";
import { getProductForSeo } from "@/lib/getProductForSeo";
import { absoluteUrl, getSiteUrl } from "@/lib/siteUrl";
import { LOCAL_SEO_KEYWORDS, truncateMetaDescription } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

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
      title: "Product Not Found",
      robots: { index: false, follow: true },
    };
  }

  const pageTitle = `${product.name} | Buy Online`;
  const socialTitle = `${pageTitle} | K2 Chicken`;
  const description = product.description
    ? truncateMetaDescription(product.description)
    : `Buy ${product.name} online — fresh halal chicken delivery in Pimple Nilakh, Baner, Pancard Club, Aundh, and Wakad from K2 Chicken.`;

  const ogImage = product.image_url
    ? absoluteUrl(product.image_url)
    : `${siteUrl}/hero-fresh-simple.png`;

  const keywords = [
    product.name,
    product.category,
    "K2 Chicken",
    ...LOCAL_SEO_KEYWORDS.slice(0, 8),
  ].filter(Boolean) as string[];

  return {
    title: pageTitle,
    description,
    keywords,
    openGraph: {
      title: socialTitle,
      description,
      url: `${siteUrl}/products/${id}`,
      siteName: "K2 Chicken",
      locale: "en_IN",
      images: [{ url: ogImage, width: 1200, height: 630, alt: product.name }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
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
