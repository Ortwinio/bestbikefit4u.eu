"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { Ruler } from "lucide-react";

interface CalculatedFit {
  recommendedStackMm: number;
  recommendedReachMm: number;
  effectiveTopTubeMm: number;
  saddleHeightMm: number;
  saddleSetbackMm: number;
  saddleHeightRange: { min: number; max: number };
  handlebarDropMm: number;
  handlebarReachMm: number;
  stemLengthMm: number;
  stemAngleRecommendation: string;
  crankLengthMm: number;
  handlebarWidthMm: number;
}

interface FitSummaryCardProps {
  fit: CalculatedFit;
  confidenceScore: number;
}

export function FitSummaryCard({ fit, confidenceScore }: FitSummaryCardProps) {
  const measurements = [
    {
      label: "Saddle Height",
      value: `${fit.saddleHeightMm}mm`,
      detail: `Range: ${fit.saddleHeightRange.min}-${fit.saddleHeightRange.max}mm`,
    },
    {
      label: "Saddle Setback",
      value: `${fit.saddleSetbackMm}mm`,
      detail: "Behind bottom bracket",
    },
    {
      label: "Handlebar Drop",
      value: `${fit.handlebarDropMm}mm`,
      detail: "Below saddle height",
    },
    {
      label: "Reach",
      value: `${fit.handlebarReachMm}mm`,
      detail: "Saddle to handlebar",
    },
    {
      label: "Stem",
      value: `${fit.stemLengthMm}mm`,
      detail: `Angle: ${fit.stemAngleRecommendation}`,
    },
    {
      label: "Crank Length",
      value: `${fit.crankLengthMm}mm`,
      detail: "Optimized for inseam",
    },
    {
      label: "Handlebar Width",
      value: `${fit.handlebarWidthMm}mm`,
      detail: "Center to center",
    },
  ];

  const confidenceTone =
    confidenceScore >= 80
      ? "bg-[color:var(--success)]/12 text-[color:var(--success)]"
      : confidenceScore >= 60
        ? "bg-[color:var(--warning)]/12 text-[color:var(--warning)]"
        : "bg-[color:var(--danger)]/12 text-[color:var(--danger)]";

  return (
    <Card variant="bordered" className="overflow-hidden">
      <CardHeader className="border-b border-[color:var(--border)] bg-[color:var(--secondary)]/25">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--secondary)] text-[color:var(--primary)]">
              <Ruler className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Your Fit Measurements</CardTitle>
              <CardDescription>
                Calculated from your questionnaire and measurement inputs.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[color:var(--card)] px-3 py-1">
            <span className="text-sm text-[color:var(--muted-foreground)]">
              Confidence
            </span>
            <span className={`text-sm font-semibold ${confidenceTone}`}>
              {confidenceScore}%
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {measurements.map((measurement) => (
            <div
              key={measurement.label}
              className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/35 p-4"
            >
              <dt className="text-sm text-[color:var(--muted-foreground)]">
                {measurement.label}
              </dt>
              <dd className="mt-1 text-xl font-semibold text-[color:var(--foreground)]">
                {measurement.value}
              </dd>
              <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                {measurement.detail}
              </p>
            </div>
          ))}
        </dl>

        <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <h4 className="mb-3 font-medium text-[color:var(--foreground)]">
            Frame Targets
          </h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-[color:var(--muted-foreground)]">
                Stack
              </p>
              <p className="text-lg font-semibold text-[color:var(--foreground)]">
                {fit.recommendedStackMm}mm
              </p>
            </div>
            <div>
              <p className="text-sm text-[color:var(--muted-foreground)]">
                Reach
              </p>
              <p className="text-lg font-semibold text-[color:var(--foreground)]">
                {fit.recommendedReachMm}mm
              </p>
            </div>
            <div>
              <p className="text-sm text-[color:var(--muted-foreground)]">
                Effective Top Tube
              </p>
              <p className="text-lg font-semibold text-[color:var(--foreground)]">
                {fit.effectiveTopTubeMm}mm
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
