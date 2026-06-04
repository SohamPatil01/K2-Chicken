import { getProductFallbackImage } from "@/lib/productImageFallbacks";
import { absoluteUrl, getSiteUrl } from "@/lib/siteUrl";

export interface ProductForJsonLd {
  id: number;
  name: string;
  description?: string | null;
  price: number | string;
  image_url?: string | null;
  is_available?: boolean;
}

/** Builds homepage ItemList JSON-LD with absolute URLs for Google rich results. */
export function buildProductItemListJsonLd(products: ProductForJsonLd[], limit = 10) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Fresh Chicken Cuts",
    itemListElement: products.slice(0, limit).map((product, index) => {
      const image = product.image_url
        ? absoluteUrl(product.image_url)
        : absoluteUrl(getProductFallbackImage(product.name));
      const price =
        typeof product.price === "number"
          ? product.price
          : parseFloat(String(product.price));
      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.name,
          description: product.description || undefined,
          image,
          url: `${siteUrl}/products/${product.id}`,
          offers: {
            "@type": "Offer",
            url: `${siteUrl}/products/${product.id}`,
            price: Number.isFinite(price) ? String(price) : String(product.price),
            priceCurrency: "INR",
            availability: product.is_available
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
        },
      };
    }),
  };
}
