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
          <Bike className="h-5 w-5 text-primary" />
          <CardTitle>Frame Size</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-success/20 bg-success/10 p-4"
            >
              <div>
                <p className="text-2xl font-bold text-success">{rec.size}</p>
                {rec.brand && (
                  <p className="mt-0.5 text-sm text-success/80">{rec.brand}</p>
                )}
                {rec.notes && (
                  <p className="mt-1 text-sm text-success/90">{rec.notes}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-success/80">Fit Score</div>
                <div className="text-2xl font-bold text-success">
                  {rec.fitScore}%
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Frame sizes vary by manufacturer. Use Stack and Reach values for
          precise comparison across brands.
        </p>
      </CardContent>
    </Card>
  );
}
