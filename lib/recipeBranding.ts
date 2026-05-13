const legacySupplier = `${"Bara"}${"mati"}\\s+${"Agro"}`;

const legacyChickenPattern = new RegExp(`${legacySupplier}\\s+Chicken`, "gi");
const legacyLowerChickenPattern = new RegExp(
  `${"Bara"}${"mati"}\\s+${"agro"}\\s+chicken`,
  "gi"
);
const legacySupplierPattern = new RegExp(legacySupplier, "gi");

export function sanitizeRecipeText(text: string | null | undefined): string {
  if (!text) return "";

  return text
    .replace(legacyChickenPattern, "K2 Chicken")
    .replace(legacyLowerChickenPattern, "fresh K2 Chicken")
    .replace(legacySupplierPattern, "K2 Chicken");
}

export function sanitizeRecipeList(items: string[] | null | undefined): string[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => sanitizeRecipeText(item));
}
