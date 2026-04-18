import Skeleton from "@/app/components/ui/Skeleton";

export default function DistributorLoading() {
  return (
    <div aria-busy="true" aria-label="Loading distributor page">

      <div
        className="py-14 px-4 sm:px-8"
        style={{ background: "linear-gradient(135deg, #003b72, #00529B)", minHeight: 220 }}
      >
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-3 text-center">
          <Skeleton className="h-2.5 w-28 rounded-full opacity-40" />
          <Skeleton className="h-12 w-64 rounded-md opacity-30" />
          <Skeleton className="h-4 w-80 rounded-full opacity-20" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-10 w-72 rounded-md" />
            <Skeleton className="h-3.5 w-full rounded-full" />
            <Skeleton className="h-3.5 w-5/6 rounded-full" />
            <Skeleton className="h-12 w-40 rounded-full mt-2" />
          </div>
          <Skeleton className="w-full aspect-[4/3] rounded-md" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface-lowest rounded-md p-5 shadow-ambient-sm flex flex-col gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="h-5 w-40 rounded-xl" />
              <Skeleton className="h-3.5 w-full rounded-full" />
              <Skeleton className="h-3.5 w-4/5 rounded-full" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
