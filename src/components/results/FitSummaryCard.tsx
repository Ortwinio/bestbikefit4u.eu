"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
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

  return (
    <Card variant="bordered">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-blue-600" />
            <CardTitle>Your Fit Measurements</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Confidence:</span>
            <span
              className={`text-sm font-semibold ${
                confidenceScore >= 80
                  ? "text-green-600"
                  : confidenceScore >= 60
                    ? "text-yellow-600"
                    : "text-orange-600"
              }`}
            >
              {confidenceScore}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {measurements.map((m) => (
            <div
              key={m.label}
              className="p-4 bg-gray-50 rounded-lg"
            >
              <p className="text-sm text-gray-500">{m.label}</p>
              <p className="text-xl font-bold text-gray-900">{m.value}</p>
              <p className="text-xs text-gray-400 mt-1">{m.detail}</p>
            </div>
          ))}
        </div>

        {/* Frame targets */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">Frame Targets</h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-blue-700">Stack</p>
              <p className="text-lg font-semibold text-blue-900">
                {fit.recommendedStackMm}mm
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Reach</p>
              <p className="text-lg font-semibold text-blue-900">
                {fit.recommendedReachMm}mm
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Effective Top Tube</p>
              <p className="text-lg font-semibold text-blue-900">
                {fit.effectiveTopTubeMm}mm
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
