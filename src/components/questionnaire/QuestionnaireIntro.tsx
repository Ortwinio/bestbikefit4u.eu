"use client";

import { Heart, Zap, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

interface QuestionnaireIntroProps {
  onStart: () => void;
}

export function QuestionnaireIntro({ onStart }: QuestionnaireIntroProps) {
  const { messages } = useDashboardMessages();
  const t = messages.questionnaire.intro;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">{t.title}</h2>

        <p className="text-sm text-muted-foreground">{t.body1}</p>
        <p className="text-sm text-muted-foreground">{t.body2}</p>

        <p className="text-sm text-muted-foreground">{t.body3}</p>

        <div className="grid grid-cols-3 gap-3 pt-1">
          <div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-card p-4 text-center">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-foreground">{t.comfort}</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-card p-4 text-center">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-foreground">{t.efficiency}</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-card p-4 text-center">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-foreground">{t.performance}</span>
          </div>
        </div>
      </div>

      <Button onClick={onStart} className="w-full">
        {t.start}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
