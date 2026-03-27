"use client";

import {
  Zap,
  Heart,
  ShieldCheck,
  User,
  SlidersHorizontal,
  ArrowRight,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

const GAIN_ICONS: LucideIcon[] = [
  Zap,
  Heart,
  ShieldCheck,
  User,
  SlidersHorizontal,
];

interface QuestionnaireIntroProps {
  onStart: () => void;
}

export function QuestionnaireIntro({ onStart }: QuestionnaireIntroProps) {
  const { messages } = useDashboardMessages();
  const t = messages.questionnaire.intro;

  return (
    <div className="space-y-6">

      {/* Two-column layout: content + illustration */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">

        {/* Left: text content */}
        <div className="flex-1 space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{t.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t.description}
            </p>
          </div>

          {/* Gains list */}
          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">{t.gainTitle}</p>
            <ul className="space-y-3">
              {t.gains.map((gain, i) => {
                const Icon = GAIN_ICONS[i] ?? CheckCircle2;
                return (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {gain.label}
                      </span>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {gain.detail}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Right: illustration placeholder */}
        <div className="flex w-full shrink-0 items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-border bg-muted md:w-52 md:self-stretch">
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary/60" />
            </div>
            <p className="text-xs text-muted-foreground">{t.illustrationAlt}</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Button onClick={onStart} className="w-full">
        {t.start}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
