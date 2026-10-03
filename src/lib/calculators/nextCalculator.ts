import type { HandoffCalculator } from "@/lib/handoff/store";

export type NextCalculator = HandoffCalculator | "fit" | "dashboard";
const required: Record<HandoffCalculator, string[]> = {
  "bike-fit": ["heightCm", "inseamCm", "flexibilityScore", "coreStabilityScore"],
  "saddle-height": ["inseamCm", "flexibilityScore"], "frame-size": ["heightCm", "inseamCm"],
  "crank-length": ["inseamCm"], "saddle-width": ["sitBoneWidthMm"], "tire-pressure": ["weightKg"],
  gearing: ["weightKg", "ftpWatts"], "power-speed": ["weightKg", "ftpWatts"],
  "climb-planner": ["weightKg", "ftpWatts"], "ftp-wkg": ["weightKg", "ftpWatts"],
  "fuel-hydration": ["sweatProfile"],
};
const next: Record<HandoffCalculator, HandoffCalculator[]> = {
  "bike-fit": ["saddle-height"], "saddle-height": ["saddle-width"],
  "frame-size": ["bike-fit"], "crank-length": ["saddle-height"], "saddle-width": ["saddle-height"],
  "tire-pressure": ["gearing"], gearing: ["climb-planner"],
  "power-speed": ["gearing", "fuel-hydration"], "climb-planner": ["gearing", "fuel-hydration"],
  "ftp-wkg": ["gearing", "fuel-hydration"], "fuel-hydration": [],
};
export const accountCalculatorPath: Record<NextCalculator, string> = {
  "bike-fit": "/tools/bike-fit", "saddle-height": "/tools/saddle-height", "frame-size": "/tools/frame-size",
  "crank-length": "/tools/crank-length", "saddle-width": "/saddle-selector", "tire-pressure": "/pressure-calculator",
  gearing: "/gearing", "power-speed": "/tools/power-speed", "climb-planner": "/tools/climb-planner",
  "ftp-wkg": "/tools/ftp-wkg", "fuel-hydration": "/tools/fuel-hydration", fit: "/fit", dashboard: "/dashboard",
};
export function chooseNextCalculator(calculator: HandoffCalculator, profile: Record<string, unknown> | null,
  advice: readonly { calculator: string; stale?: boolean }[] = []): NextCalculator {
  if (profile?.hasPain === "yes") return "fit";
  const candidates = calculator === "saddle-height" && profile?.sitBoneWidthMm
    ? ["bike-fit" as const] : next[calculator];
  const eligible = candidates.filter((candidate) => {
    const current = advice.find((item) => item.calculator === candidate);
    return !current || current.stale === true;
  });
  const completeness = (candidate: HandoffCalculator) => required[candidate]
    .filter((field) => profile?.[field] !== undefined && profile?.[field] !== null && profile?.[field] !== "").length
    / required[candidate].length;
  return [...eligible].sort((a, b) => completeness(b) - completeness(a))[0] ?? "dashboard";
}
