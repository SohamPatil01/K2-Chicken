/**
 * Fallback images for recipes when image_url is not set in the database.
 * Sourced from Unsplash (free to use under Unsplash License).
 * Format: w=800 for consistent card sizing.
 */
const W = "w=800";
const base = "https://images.unsplash.com";

export const RECIPE_IMAGES: Record<string, string> = {
  "Chicken Tikka Masala": `${base}/photo-1772730064970-a7b2735c93b9?${W}&q=80`,
  "Butter Chicken": `${base}/photo-1772730064970-a7b2735c93b9?${W}&q=80`,
  "Chicken Curry (Desi Style)": `${base}/photo-1742599361539-f096753d1100?${W}&q=80`,
  "Chicken Biryani": `${base}/photo-1559528896-c5310744cce8?${W}&q=80`,
  "Chicken 65": `${base}/photo-1757445060056-6d6aeec73de4?${W}&q=80`,
  "Chicken Chettinad": `${base}/photo-1742599361539-f096753d1100?${W}&q=80`,
  "Chicken Korma": `${base}/photo-1742599361539-f096753d1100?${W}&q=80`,
  "Tandoori Chicken": `${base}/photo-1772730064970-a7b2735c93b9?${W}&q=80`,
  "Chicken Kolhapuri": `${base}/photo-1742599361539-f096753d1100?${W}&q=80`,
  "Pepper Chicken": `${base}/photo-1742599361539-f096753d1100?${W}&q=80`,
};

export function getRecipeImageUrl(title: string, dbImageUrl?: string | null): string {
  if (dbImageUrl?.trim()) return dbImageUrl;
  return RECIPE_IMAGES[title] ?? "";
}
