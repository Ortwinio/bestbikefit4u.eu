"use client";

import { useState } from "react";
import { SegmentedControl, SegmentedControlItem } from "@/components/ui";
import { AdminSectionCard } from "@/components/admin/layout/AdminUi";

export type TrendInterval = "daily" | "weekly" | "monthly";

type TrendPoint = {
  bucketStart: number;
  label: string;
  users: number;
  logins: number;
  bikes: number;
};

type TrendSeries = Record<TrendInterval, TrendPoint[]>;

type TrendMetric = "users" | "logins" | "bikes";

const metricConfig: Record<
  TrendMetric,
  { title: string; description: string; stroke: string; fill: string }
> = {
  users: {
    title: "Users over time",
    description: "New accounts created in each bucket.",
    stroke: "var(--chart-1, oklch(0.62 0.18 250))",
    fill: "color-mix(in oklch, var(--chart-1, oklch(0.62 0.18 250)) 16%, transparent)",
  },
  logins: {
    title: "Logins over time",
    description: "Recorded last-login timestamps grouped into the selected buckets.",
    stroke: "var(--chart-2, oklch(0.72 0.16 160))",
    fill: "color-mix(in oklch, var(--chart-2, oklch(0.72 0.16 160)) 16%, transparent)",
  },
  bikes: {
    title: "Bikes over time",
    description: "New bikes added in each bucket.",
    stroke: "var(--chart-3, oklch(0.68 0.19 45))",
    fill: "color-mix(in oklch, var(--chart-3, oklch(0.68 0.19 45)) 16%, transparent)",
  },
};

function getMetricValue(point: TrendPoint, metric: TrendMetric) {
  return point[metric];
}

function buildChartPath(values: number[]) {
  const max = Math.max(...values, 1);
  const lastIndex = Math.max(values.length - 1, 1);

  const coordinates = values.map((value, index) => {
    const x = (index / lastIndex) * 100;
    const y = 56 - (value / max) * 48;
    return { x, y };
  });

  const line = coordinates.map(({ x, y }) => `${x},${y}`).join(" ");
  const area = `M 0 56 L ${coordinates.map(({ x, y }) => `${x} ${y}`).join(" L ")} L 100 56 Z`;

  return { line, area, max };
}

function OverviewMetricChart({
  title,
  description,
  metric,
  data,
  stroke,
  fill,
}: {
  title: string;
  description: string;
  metric: TrendMetric;
  data: TrendPoint[];
  stroke: string;
  fill: string;
}) {
  const values = data.map((point) => getMetricValue(point, metric));
  const total = values.reduce((sum, value) => sum + value, 0);
  const latest = values.at(-1) ?? 0;
  const max = Math.max(...values, 0);
  const { line, area } = buildChartPath(values);
  const firstLabel = data[0]?.label ?? "—";
  const midLabel = data[Math.floor(data.length / 2)]?.label ?? "—";
  const lastLabel = data[data.length - 1]?.label ?? "—";

  return (
    <div className="space-y-4 rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_88%,var(--background)_12%)] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[color:var(--foreground)]">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-[color:var(--muted-foreground)]">{description}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-[color:var(--foreground)]">{total}</div>
          <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">total</div>
        </div>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[color:color-mix(in_oklch,var(--border)_82%,transparent)] bg-[color:color-mix(in_oklch,var(--secondary)_60%,var(--background)_40%)] p-3">
        <svg viewBox="0 0 100 56" className="h-40 w-full overflow-visible" preserveAspectRatio="none" aria-hidden="true">
          <path d={area} fill={fill} />
          <polyline
            fill="none"
            points={line}
            stroke={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="mt-3 flex items-center justify-between text-xs text-[color:var(--muted-foreground)]">
          <span>{firstLabel}</span>
          <span>{midLabel}</span>
          <span>{lastLabel}</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2">
          <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Latest</div>
          <div className="mt-1 text-lg font-semibold text-[color:var(--foreground)]">{latest}</div>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2">
          <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Peak</div>
          <div className="mt-1 text-lg font-semibold text-[color:var(--foreground)]">{max}</div>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2">
          <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Buckets</div>
          <div className="mt-1 text-lg font-semibold text-[color:var(--foreground)]">{data.length}</div>
        </div>
      </div>
    </div>
  );
}

export function OverviewTrendCharts({ series }: { series: TrendSeries }) {
  const [interval, setInterval] = useState<TrendInterval>("weekly");
  const selectedSeries = series[interval];

  return (
    <AdminSectionCard
      title="Growth and activity"
      description="Live account, login, and bike creation trends from Convex."
      actions={
        <SegmentedControl
          aria-label="Overview chart interval"
          size="sm"
          value={interval}
          onValueChange={(value) => setInterval(value as TrendInterval)}
        >
          <SegmentedControlItem value="daily">Daily</SegmentedControlItem>
          <SegmentedControlItem value="weekly">Weekly</SegmentedControlItem>
          <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
        </SegmentedControl>
      }
    >
      <div className="grid gap-4 xl:grid-cols-3">
        {(Object.entries(metricConfig) as Array<[TrendMetric, (typeof metricConfig)[TrendMetric]]>).map(
          ([metric, config]) => (
            <OverviewMetricChart
              key={metric}
              title={config.title}
              description={config.description}
              metric={metric}
              data={selectedSeries}
              stroke={config.stroke}
              fill={config.fill}
            />
          )
        )}
      </div>
    </AdminSectionCard>
  );
}
