/**
 * Skeleton — shimmer placeholder block.
 * Matches "The Clinical Sanctuary" surface palette.
 *
 * Usage:
 *   <Skeleton className="h-6 w-48" />
 *   <Skeleton className="h-48 w-full rounded-lg" />
 */
export default function Skeleton({ className = "" }) {
  return (
    <div
      className={`skeleton ${className}`}
      aria-hidden="true"
    />
  );
}
