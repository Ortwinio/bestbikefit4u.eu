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
  optimal: "bg-green-100 text-green-800",
  slightly_high: "bg-amber-100 text-amber-800",
  too_high: "bg-red-100 text-red-800",
  too_low: "bg-red-100 text-red-800",
  no_measurement: "bg-gray-100 text-gray-600",
};

export function PressureStatusBadge({
  currentBar,
  recommendedBar,
  labels,
}: PressureStatusBadgeProps) {
  const status = computePressureStatus(currentBar, recommendedBar);

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASSES[status]}`}
    >
      {labels[status]}
    </span>
  );
}
