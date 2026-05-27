/**
 * Fallback images for products that have no image_url in the database.
 * All images are served from /public/images/ to avoid external CDN dependencies.
 * Matched by lowercased product name keywords, most-specific first.
 */
const KEYWORD_IMAGE_MAP: [string[], string][] = [
  [["tikka"], "/images/Chicken-Breast-Boneless.jpg"],
  [["peri"], "/images/Chicken-Breast-Boneless.jpg"],
  [["tandoori"], "/images/Chicken-Breast-Boneless.jpg"],
  [["biryani"], "/images/Chicken-Curry-Cut.jpg"],
  [["butterflied", "fillet"], "/images/Chicken-Breast-Boneless.jpg"],
  [["soup", "bone", "carcass"], "/images/Whole-Chicken-5.jpg"],
  [["gizzard"], "/images/Chicken-Liver.jpg"],
  [["liver"], "/images/Chicken-Liver.jpg"],
  [["mince", "keema", "kheema"], "/images/Chicken-Kheema.jpg"],
  [["wing"], "/images/Chicken-Wings.jpg"],
  [["leg quarter", "leg"], "/images/Chicken-Legs.jpg"],
  [["drumstick"], "/images/Chicken-Drumstick.jpg"],
  [["thigh"], "/images/Chicken-Legs.jpg"],
  [["breast"], "/images/Chicken-Breast-Boneless.jpg"],
  [["curry cut", "curry"], "/images/Chicken-Curry-Cut.jpg"],
  [["whole", "full bird", "dressed"], "/images/Whole-Chicken-5.jpg"],
];

/** Returns a fallback image path for a product based on its name. */
export function getProductFallbackImage(productName: string): string {
  const lower = productName.toLowerCase();
  for (const [keywords, url] of KEYWORD_IMAGE_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) return url;
  }
  return "/images/Whole-Chicken-5.jpg";
}
