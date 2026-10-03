"use client";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { groupPerformanceEvent } from "@/lib/analytics/performanceTemplates";

export function TemplateSpeedInsights() {
  return <SpeedInsights beforeSend={groupPerformanceEvent} />;
}
