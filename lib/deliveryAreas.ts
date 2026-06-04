/** Customer-facing delivery localities (exclusive service area). */
export const DELIVERY_AREAS = [
  "Pimple Nilakh",
  "Baner",
  "Pancard Club",
  "Aundh",
  "Wakad",
] as const;

export type DeliveryArea = (typeof DELIVERY_AREAS)[number];

/** Comma-separated list for inline copy. */
export const DELIVERY_AREAS_LIST = DELIVERY_AREAS.join(", ");

/** Natural-language list with Oxford comma. */
export const DELIVERY_AREAS_PHRASE =
  "Pimple Nilakh, Baner, Pancard Club, Aundh, and Wakad";

/** Short label for navbar / compact UI. */
export const DELIVERY_AREAS_COMPACT =
  "Pimple Nilakh · Baner · Pancard Club · Aundh · Wakad";
