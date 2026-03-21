import type { PressureStatus } from "./shared";

export function computePressureStatus(
  currentBar: number | undefined,
  recommendedBar: number
): PressureStatus {
  if (currentBar === undefined) {
    return "no_measurement";
  }

  const delta = currentBar - recommendedBar;
  if (delta >= -0.2 && delta <= 0.2) {
    return "optimal";
  }
  if (delta > 0.2 && delta <= 0.5) {
    return "slightly_high";
  }
  if (delta > 0.5) {
    return "too_high";
  }
  if (delta < -0.3) {
    return "too_low";
  }

  return "optimal";
}

interface PressureStatusBadgeProps {
  currentBar?: number;
  recommendedBar: number;
  labels: Record<PressureStatus, string>;
}

const STATUS_CLASSES: Record<PressureStatus, string> = {
  optimal:
    "border border-[color:color-mix(in_oklch,var(--success)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--card)_88%,var(--success)_12%)] text-[color:var(--success-foreground)]",
  slightly_high:
    "border border-[color:color-mix(in_oklch,var(--warning)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--card)_88%,var(--warning)_12%)] text-[color:var(--warning-foreground)]",
  too_high:
    "border border-[color:color-mix(in_oklch,var(--danger)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--card)_88%,var(--danger)_12%)] text-[color:var(--danger)]",
  too_low:
    "border border-[color:color-mix(in_oklch,var(--danger)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--card)_88%,var(--danger)_12%)] text-[color:var(--danger)]",
  no_measurement:
    "border border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]",
};

export function PressureStatusBadge({
  currentBar,
  recommendedBar,
  labels,
}: PressureStatusBadgeProps) {
  const status = computePressureStatus(currentBar, recommendedBar);

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-none ${STATUS_CLASSES[status]}`}
    >
      {labels[status]}
    </span>
  );
}
