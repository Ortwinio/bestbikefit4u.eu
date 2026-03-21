"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Lightbulb, Info } from "lucide-react";

interface FitNotesProps {
  notes: string[];
}

export function FitNotes({ notes }: FitNotesProps) {
  if (notes.length === 0) return null;

  return (
    <Card variant="bordered">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-warning" />
          <CardTitle>Personalized Notes</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {notes.map((note, index) => (
            <li key={index} className="flex items-start gap-3">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-info" />
              <p className="text-foreground">{note}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
