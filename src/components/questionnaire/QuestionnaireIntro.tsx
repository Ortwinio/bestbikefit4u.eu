"use client";

import Image from "next/image";
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
    <div className="space-y-5">

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br from-primary to-primary/75 px-6 pt-7 pb-0 md:px-8 md:pt-8">

        {/* Cyclist image — anchored to bottom-right */}
        <div className="absolute right-0 bottom-0 w-44 md:w-56">
          <Image
            src="/cyclist.png"
            alt={t.illustrationAlt}
            width={448}
            height={448}
            className="w-full"
            priority
          />
        </div>

        {/* Text — left side, padded away from image */}
        <div className="relative z-10 max-w-[65%] pb-7 md:pb-8">
          <h2 className="text-2xl font-bold leading-tight text-primary-foreground">
            {t.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-primary-foreground/80">
            {t.description}
          </p>
        </div>
      </div>

      {/* Gains grid */}
      <div>
        <p className="mb-3 text-sm font-semibold text-foreground">{t.gainTitle}</p>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {t.gains.map((gain, i) => {
            const Icon = GAIN_ICONS[i] ?? CheckCircle2;
            return (
              <li
                key={i}
                className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-border bg-card p-3"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="text-sm font-medium text-foreground">
                    {gain.label}
                  </span>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {gain.detail}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* CTA */}
      <Button onClick={onStart} className="w-full">
        {t.start}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
