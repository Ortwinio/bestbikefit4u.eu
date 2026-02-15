"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Bike } from "lucide-react";

interface FrameSize {
  brand?: string;
  size: string;
  fitScore: number;
  notes?: string;
}

interface FrameSizeRecommendationProps {
  recommendations: FrameSize[];
}

export function FrameSizeRecommendation({
  recommendations,
}: FrameSizeRecommendationProps) {
  return (
    <Card variant="bordered">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bike className="h-5 w-5 text-blue-600" />
          <CardTitle>Frame Size</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
            >
              <div>
                <p className="text-2xl font-bold text-green-800">{rec.size}</p>
                {rec.brand && (
                  <p className="text-sm text-green-600 mt-0.5">{rec.brand}</p>
                )}
                {rec.notes && (
                  <p className="text-sm text-green-700 mt-1">{rec.notes}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-green-600">Fit Score</div>
                <div className="text-2xl font-bold text-green-700">
                  {rec.fitScore}%
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Frame sizes vary by manufacturer. Use Stack and Reach values for
          precise comparison across brands.
        </p>
      </CardContent>
    </Card>
  );
}
