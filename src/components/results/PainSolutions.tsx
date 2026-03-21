"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { HeartPulse, AlertTriangle, CheckCircle } from "lucide-react";

interface PainSolution {
  painArea: string;
  cause: string;
  solution: string;
}

interface PainSolutionsProps {
  solutions: PainSolution[];
}

const areaLabels: Record<string, string> = {
  lower_back: "Lower Back",
  neck: "Neck",
  shoulders: "Shoulders",
  hands: "Hands/Wrists",
  knees: "Knees",
  feet: "Feet",
  sit_bones: "Sit Bones",
};

export function PainSolutions({ solutions }: PainSolutionsProps) {
  if (!solutions || solutions.length === 0) return null;

  return (
    <Card
      variant="bordered"
      className="border-[color:color-mix(in_oklch,var(--warning)_30%,var(--border))]"
    >
      <CardHeader className="bg-[color:color-mix(in_oklch,var(--warning)_12%,var(--card)_88%)]">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-5 w-5 text-warning" />
          <CardTitle className="text-warning-foreground">Pain Point Solutions</CardTitle>
        </div>
        <p className="mt-1 text-sm text-warning">
          Based on the discomfort areas you mentioned
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-card p-4"
            >
              <h4 className="flex items-center gap-2 font-semibold text-foreground">
                <AlertTriangle className="h-4 w-4 text-warning" />
                {areaLabels[solution.painArea] || solution.painArea}
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">{solution.cause}</p>
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-success/10 p-3">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                <p className="text-sm text-success">{solution.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
