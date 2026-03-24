export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-700/50 rounded ${className}`} />;
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass p-8 rounded-[40px] border border-white/5 space-y-6 animate-pulse">
      <div className="flex justify-between items-start">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <div className="flex gap-2">
          <Skeleton className="w-10 h-10 rounded-2xl" />
          <Skeleton className="w-10 h-10 rounded-2xl" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-8 w-40 rounded" />
      </div>
      <div className="pt-6 border-t border-white/5 space-y-2">
        <Skeleton className="h-3 w-28 rounded" />
        <Skeleton className="h-10 w-36 rounded" />
      </div>
    </div>
  );
}
