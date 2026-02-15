"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { ListOrdered, Wrench } from "lucide-react";

interface Priority {
  priority: number;
  component: string;
  currentValue?: string;
  recommendedValue: string;
  rationale: string;
}

interface AdjustmentPrioritiesProps {
  priorities: Priority[];
}

export function AdjustmentPriorities({
  priorities,
}: AdjustmentPrioritiesProps) {
  const sortedPriorities = [...priorities].sort(
    (a, b) => a.priority - b.priority
  );

  return (
    <Card variant="bordered">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ListOrdered className="h-5 w-5 text-blue-600" />
          <CardTitle>Adjustment Steps</CardTitle>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Follow these steps in order for the best results
        </p>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {sortedPriorities.map((p, index) => (
            <li key={p.priority} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-gray-400" />
                      {p.component}
                    </h4>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {p.rationale}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold text-blue-600">
                      {p.recommendedValue}
                    </p>
                    {p.currentValue && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Current: {p.currentValue}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
