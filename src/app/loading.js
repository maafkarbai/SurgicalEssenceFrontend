import Skeleton from "@/app/components/ui/Skeleton";

// Root loading.js — shown while the homepage (or any unmatched route) loads.
export default function HomeLoading() {
  return (
    <div aria-busy="true" aria-label="Loading page content">

      {/* ── Hero skeleton ── */}
      <div
        className="relative overflow-hidden py-14 px-4 sm:px-8"
        style={{ background: "linear-gradient(135deg, #003b72, #00529B)", minHeight: 420 }}
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
          {/* Left copy */}
          <div className="flex-1 flex flex-col gap-4 max-w-lg">
            <Skeleton className="h-3 w-40 rounded-full opacity-40" />
            <Skeleton className="h-12 w-full rounded-md opacity-30" />
            <Skeleton className="h-12 w-4/5 rounded-md opacity-30" />
            <Skeleton className="h-4 w-full rounded-full opacity-20" />
            <Skeleton className="h-4 w-2/3 rounded-full opacity-20" />
            <div className="flex gap-3 mt-2">
              <Skeleton className="h-11 w-36 rounded-full opacity-30" />
              <Skeleton className="h-11 w-32 rounded-full opacity-20" />
            </div>
          </div>
          {/* Right form */}
          <div className="lg:flex-1">
            <div className="bg-white/10 rounded-lg p-6 flex flex-col gap-4">
              <Skeleton className="h-4 w-32 rounded-full opacity-30" />
              <Skeleton className="h-10 w-full rounded-xl opacity-25" />
              <Skeleton className="h-10 w-full rounded-xl opacity-25" />
              <Skeleton className="h-10 w-full rounded-xl opacity-25" />
              <Skeleton className="h-11 w-full rounded-full opacity-30" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust bar skeleton ── */}
      <div className="bg-surface-low py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-8 items-center justify-between">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-7 h-7 rounded-full" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-28 rounded-full" />
                <Skeleton className="h-2.5 w-20 rounded-full" />
              </div>
            </div>
          ))}
          <Skeleton className="h-16 w-48 rounded-xl" />
        </div>
      </div>

      {/* ── Catalog cards skeleton ── */}
      <div className="bg-bg-surface px-4 sm:px-8 py-12">
        <div className="max-w-screen-2xl mx-auto">
          <div className="text-center mb-8 flex flex-col items-center gap-3">
            <Skeleton className="h-3 w-28 rounded-full" />
            <Skeleton className="h-10 w-64 rounded-md" />
          </div>
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

      {/* ── Why Choose Us skeleton ── */}
      <div className="bg-surface-lowest px-4 sm:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 flex flex-col gap-3">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-10 w-72 rounded-md" />
            <Skeleton className="h-10 w-56 rounded-md" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-surface-low rounded-lg p-7 flex flex-col gap-4">
                <Skeleton className="w-11 h-11 rounded-xl" />
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-5 w-40 rounded-xl" />
                <Skeleton className="h-3.5 w-full rounded-full" />
                <Skeleton className="h-3.5 w-4/5 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
