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
          <ListOrdered className="h-5 w-5 text-primary" />
          <CardTitle>Adjustment Steps</CardTitle>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Follow these steps in order for the best results
        </p>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {sortedPriorities.map((p, index) => (
            <li key={p.priority} className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-soft font-bold text-primary">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="flex items-center gap-2 font-medium text-foreground">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      {p.component}
                    </h4>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {p.rationale}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold text-primary">
                      {p.recommendedValue}
                    </p>
                    {p.currentValue && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
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
