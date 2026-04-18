import Skeleton from "@/app/components/ui/Skeleton";

export default function CatalogLoading() {
  return (
    <div aria-busy="true" aria-label="Loading catalog">

      <div
        className="py-14 px-4 sm:px-8"
        style={{ background: "linear-gradient(135deg, #003b72, #00529B)", minHeight: 200 }}
      >
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-3 text-center">
          <Skeleton className="h-2.5 w-24 rounded-full opacity-40" />
          <Skeleton className="h-12 w-64 rounded-md opacity-30" />
          <Skeleton className="h-4 w-80 rounded-full opacity-20" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface-lowest rounded-lg overflow-hidden shadow-ambient-sm">
              <Skeleton className="h-64 w-full rounded-none" />
              <div className="p-5 flex flex-col gap-3">
                <Skeleton className="h-5 w-3/4 rounded-xl" />
                <Skeleton className="h-3.5 w-full rounded-full" />
                <div className="flex gap-2 mt-1">
                  <Skeleton className="h-9 flex-1 rounded-full" />
                  <Skeleton className="h-9 flex-1 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
