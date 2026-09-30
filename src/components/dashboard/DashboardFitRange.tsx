import { toPercentBucket } from "@/lib/uiPercent";

export function DashboardFitRange({ target, range }: { target: string; range: string | null }) {
  const bounds = range?.match(/^(-?\d+(?:\.\d+)?) mm - (-?\d+(?:\.\d+)?) mm$/);
  if (!bounds) return null;
  const minimum = Number(bounds[1]);
  const maximum = Number(bounds[2]);
  const value = Number.parseFloat(target);
  const width = maximum - minimum;
  if (!Number.isFinite(value) || !Number.isFinite(width) || width <= 0) return null;
  const percent = Math.max(0, Math.min(100, 25 + (value - minimum) / width * 50));

  return <div aria-hidden="true" className="relative mx-1 mt-3 h-4">
    <div className="absolute inset-x-0 top-1 h-2 rounded-full border border-border bg-muted" />
    <div className="absolute left-1/4 top-1 h-2 w-1/2 rounded-full bg-accent" />
    <span className="csp-fill-left absolute top-0 h-4 w-1 -translate-x-1/2 rounded-full bg-foreground"
      data-left-pct={toPercentBucket(percent)} />
  </div>;
}
