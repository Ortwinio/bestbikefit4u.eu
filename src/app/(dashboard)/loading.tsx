export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-32 rounded bg-muted" />
        <div className="h-10 w-36 rounded bg-muted" />
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-6">
            <div className="mb-2 h-8 w-16 rounded bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-6 h-6 w-48 rounded bg-muted" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between border-b border-border py-4">
              <div className="flex items-center gap-4">
                <div className="h-5 w-5 rounded-full bg-muted" />
                <div>
                  <div className="mb-1 h-5 w-32 rounded bg-muted" />
                  <div className="h-4 w-48 rounded bg-muted" />
                </div>
              </div>
              <div className="h-8 w-24 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
