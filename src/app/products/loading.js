import Skeleton from "@/app/components/ui/Skeleton";

export default function ProductsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading products">

      {/* Header */}
      <div
        className="py-10 px-4 sm:px-8"
        style={{ background: "linear-gradient(135deg, #003b72, #00529B)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-2.5 w-24 rounded-full opacity-40" />
            <Skeleton className="h-9 w-52 rounded-md opacity-30" />
            <Skeleton className="h-3.5 w-80 rounded-full opacity-25" />
          </div>
          <div className="flex gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Skeleton className="h-7 w-10 rounded-lg opacity-30" />
                <Skeleton className="h-2.5 w-16 rounded-full opacity-20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">

        {/* Tab bar */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className={`h-9 rounded-full ${i === 0 ? "w-32" : "w-24"}`} />
          ))}
        </div>

        {/* Results label */}
        <Skeleton className="h-3.5 w-40 rounded-full mb-5" />

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-surface-lowest rounded-md overflow-hidden shadow-ambient-sm">
              <Skeleton className="h-36 w-full rounded-none" />
              <div className="p-4 flex flex-col gap-3">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-3/4 rounded-xl" />
                <Skeleton className="h-3.5 w-full rounded-full" />
                <Skeleton className="h-3.5 w-2/3 rounded-full" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-3 w-20 rounded-full" />
                  <Skeleton className="h-3.5 w-24 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
