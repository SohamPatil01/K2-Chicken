export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-card shadow-soft overflow-hidden border border-gray-100 animate-pulse flex flex-col h-full">
      <div className="aspect-[4/3] w-full bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded-button w-16" />
          <div className="h-8 bg-gray-200 rounded-button w-16" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-gray-200 rounded w-20" />
          <div className="h-9 bg-gray-200 rounded-button w-20" />
        </div>
      </div>
    </div>
  );
}
