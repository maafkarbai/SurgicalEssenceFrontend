import Skeleton from "@/app/components/ui/Skeleton";

export default function PressReleasesLoading() {
  return (
    <div aria-busy="true" aria-label="Loading press releases">

      {/* Header */}
      <div
        className="py-14 px-4 sm:px-8"
        style={{ background: "linear-gradient(135deg, #003b72, #00529B)", minHeight: 200 }}
      >
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-3 text-center">
          <Skeleton className="h-2.5 w-24 rounded-full opacity-40" />
          <Skeleton className="h-12 w-56 rounded-md opacity-30" />
          <Skeleton className="h-4 w-72 rounded-full opacity-20" />
        </div>
      </div>

      {/* Article grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="relative">
                <Skeleton className="h-52 w-full rounded-md" />
                <Skeleton className="absolute bottom-3 left-3 h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4 rounded-xl" />
              <Skeleton className="h-3 w-32 rounded-full" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
