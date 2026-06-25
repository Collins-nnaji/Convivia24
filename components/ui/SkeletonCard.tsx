export default function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-ink/8 bg-surface-elevated ${className}`}>
      <div className="aspect-[16/10] skeleton-shimmer" />
      <div className="p-5 space-y-3">
        <div className="h-6 w-3/4 rounded-lg skeleton-shimmer" />
        <div className="h-4 w-1/2 rounded-lg skeleton-shimmer" />
        <div className="h-4 w-full rounded-lg skeleton-shimmer" />
      </div>
    </div>
  );
}
