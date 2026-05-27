/**
 * Maps footer product names to their DB IDs for direct /products/{id} links.
 * IDs correspond to the seeded products in lib/db.ts.
 */
export const FOOTER_PRODUCT_LINKS: { id: number; label: string }[] = [
  { id: 1, label: "Chicken Breast (Boneless)" },
  { id: 2, label: "Chicken Curry Cut" },
  { id: 3, label: "Chicken Drumsticks" },
  { id: 4, label: "Chicken Mince / Keema" },
  { id: 8, label: "Whole Chicken" },
  { id: 6, label: "Liver & Gizzard" },
];
