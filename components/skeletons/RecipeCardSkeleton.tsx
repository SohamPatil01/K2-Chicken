export default function RecipeCardSkeleton() {
  return (
    <div className="bg-white rounded-card shadow-soft overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-[16/10] bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-4/5" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="flex gap-4 pt-2">
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  );
}
