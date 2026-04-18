import Skeleton from "@/app/components/ui/Skeleton";

export default function AboutLoading() {
  return (
    <div aria-busy="true" aria-label="Loading about page">

      {/* Hero */}
      <div
        className="py-14 px-4 sm:px-8"
        style={{ background: "linear-gradient(135deg, #003b72, #00529B)", minHeight: 380 }}
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 flex flex-col gap-4">
            <Skeleton className="h-2.5 w-40 rounded-full opacity-40" />
            <Skeleton className="h-14 w-full rounded-md opacity-30" />
            <Skeleton className="h-14 w-3/4 rounded-md opacity-30" />
            <Skeleton className="h-4 w-full rounded-full opacity-20" />
            <Skeleton className="h-4 w-2/3 rounded-full opacity-20" />
            <div className="flex gap-3 mt-2">
              <Skeleton className="h-12 w-36 rounded-full opacity-30" />
              <Skeleton className="h-12 w-36 rounded-full opacity-20" />
            </div>
          </div>
          <div className="flex-1 w-full max-w-sm">
            <Skeleton className="w-full aspect-square rounded-md opacity-25" />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-surface-low py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-12 w-20 rounded-md" />
              <Skeleton className="h-3.5 w-28 rounded-full" />
              <Skeleton className="h-3 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Story */}
      <div className="bg-surface-lowest max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="flex flex-col gap-4 pl-6 border-l-4 border-brand-secondary">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="h-10 w-60 rounded-md" />
            <Skeleton className="h-10 w-48 rounded-md" />
            <div className="flex flex-col gap-3 mt-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-full rounded-full" />
                  <Skeleton className="h-3.5 w-5/6 rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <Skeleton className="w-full aspect-[4/3] rounded-md" />
        </div>
      </div>

      {/* Capability cards */}
      <div className="bg-bg-page max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="mb-10 flex flex-col gap-3">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="h-10 w-72 rounded-md" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface-lowest rounded-md p-5 shadow-ambient-sm flex flex-col gap-3">
              <Skeleton className="h-5 w-40 rounded-xl" />
              <div className="flex flex-col gap-2">
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="h-3 w-full rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
