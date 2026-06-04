import { DELIVERY_AREAS, DELIVERY_AREAS_PHRASE } from "@/lib/deliveryAreas";

/** Primary meta description used on layout + homepage. */
export const SITE_META_DESCRIPTION =
  `Order fresh, premium halal chicken online in Pune. Delivered in ~90 minutes to ${DELIVERY_AREAS_PHRASE}. 100% farm-fresh, chemical-free cuts.`;

/** Shorter variant for Open Graph / Twitter. */
export const SITE_OG_DESCRIPTION =
  `Fresh halal chicken delivery in ~90 minutes — ${DELIVERY_AREAS_PHRASE}. Order boneless, curry cut, whole chicken & more.`;

/** Local + brand keywords for Pune chicken delivery. */
export const LOCAL_SEO_KEYWORDS = [
  "K2 chicken",
  "K2Chicken",
  "k2chicken",
  "chicken delivery pune",
  "fresh chicken online pune",
  "halal chicken pune",
  "raw chicken delivery",
  "premium chicken delivery",
  "chicken delivery pimple nilakh",
  "chicken delivery baner",
  "chicken delivery aundh",
  "chicken delivery wakad",
  "meat delivery app pune",
  ...DELIVERY_AREAS.map((a) => `halal chicken ${a.toLowerCase()}`),
];

export function truncateMetaDescription(text: string, max = 155): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}
