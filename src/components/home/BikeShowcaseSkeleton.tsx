export function BikeShowcaseSkeleton() {
  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-hidden pb-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="min-w-[18rem] snap-start shrink-0 rounded-xl overflow-hidden border border-border lg:min-w-[22rem]"
          aria-hidden="true"
        >
          <div className="aspect-video w-full animate-pulse bg-muted" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
