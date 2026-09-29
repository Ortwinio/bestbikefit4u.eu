"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { withLocalePrefix } from "@/i18n/navigation";
import { formatFitQuestionnaireNumber, getFitQuestionnaireCopy } from "@/i18n/account/fitQuestionnaire";

interface QuestionnaireIntroProps {
  onStart: () => void;
}

export function QuestionnaireIntro({ onStart }: QuestionnaireIntroProps) {
  const { locale } = useDashboardMessages();
  const copy = getFitQuestionnaireCopy(locale);

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-5">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">{copy.introEyebrow}</p>
        <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{copy.introTitle}</h2>
        <p className="text-lg leading-relaxed text-muted-foreground">{copy.introDescription}</p>
        <Button onClick={onStart} size="lg" className="min-h-12 max-w-full whitespace-normal">
          {copy.introStart}<ArrowRight className="size-4" aria-hidden="true" />
        </Button>
        <Link href={withLocalePrefix("/fit/how-it-works", locale)} className="flex min-h-11 items-center rounded-lg font-semibold text-primary focus-visible:focus-ring">{copy.method}</Link>
      </div>
      <section className="min-w-0 rounded-3xl bg-[var(--bbf-lime)] p-6 text-[var(--bbf-inkt)] sm:p-8">
        <h3 className="font-display text-2xl font-bold">{copy.introStepsTitle}</h3>
        <ol className="mt-5 divide-y divide-[var(--bbf-inkt)]/15">
          {copy.introSteps.map((step, index) => (
            <li key={step} className="flex items-center gap-3 py-4">
              <span className="font-mono">{formatFitQuestionnaireNumber(index + 1, locale).padStart(2, "0")}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
