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
    <Card variant="bordered" className="border-orange-200">
      <CardHeader className="bg-orange-50">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-5 w-5 text-orange-600" />
          <CardTitle className="text-orange-900">
            Pain Point Solutions
          </CardTitle>
        </div>
        <p className="text-sm text-orange-700 mt-1">
          Based on the discomfort areas you mentioned
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="p-4 bg-white border border-orange-100 rounded-lg"
            >
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                {areaLabels[solution.painArea] || solution.painArea}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{solution.cause}</p>
              <div className="mt-3 flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-800">{solution.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
