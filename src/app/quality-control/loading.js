import Skeleton from "@/app/components/ui/Skeleton";

export default function QualityControlLoading() {
  return (
    <div aria-busy="true" aria-label="Loading quality control page">

      <div
        className="py-14 px-4 sm:px-8"
        style={{ background: "linear-gradient(135deg, #003b72, #00529B)", minHeight: 220 }}
      >
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-3 text-center">
          <Skeleton className="h-2.5 w-32 rounded-full opacity-40" />
          <Skeleton className="h-12 w-72 rounded-md opacity-30" />
          <Skeleton className="h-4 w-80 rounded-full opacity-20" />
          <Skeleton className="h-4 w-64 rounded-full opacity-15" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 flex flex-col gap-12">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface-lowest rounded-lg p-8 shadow-ambient-sm flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="h-6 w-48 rounded-xl" />
            </div>
            <Skeleton className="h-3.5 w-full rounded-full" />
            <Skeleton className="h-3.5 w-5/6 rounded-full" />
            <div className="grid sm:grid-cols-2 gap-4 mt-2">
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="h-12 w-full rounded-md" />
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
