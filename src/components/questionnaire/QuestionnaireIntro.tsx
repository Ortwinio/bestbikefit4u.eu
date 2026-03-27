"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { withLocalePrefix } from "@/i18n/navigation";
import {
  HOME_QUOTES_BY_LOCALE,
  HOME_QUOTES_SECTION_COPY,
  selectRandomHomeQuotes,
} from "@/content/homeQuotes";

interface QuestionnaireIntroProps {
  onStart: () => void;
}

export function QuestionnaireIntro({ onStart }: QuestionnaireIntroProps) {
  const { locale, messages } = useDashboardMessages();
  const t = messages.questionnaire.intro;
  const quoteCopy = HOME_QUOTES_SECTION_COPY[locale];

  const [quotes] = useState(() =>
    selectRandomHomeQuotes(HOME_QUOTES_BY_LOCALE[locale], 3)
  );

  return (
    <div className="space-y-6">
      {/* Text */}
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t.eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-foreground">
          {t.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t.description}
        </p>
      </div>

      {/* Illustration */}
      <div className="-mt-10 mb-2 relative h-80 overflow-hidden">
        <Image
          src="/profile-complete.png"
          alt={t.illustrationAlt}
          width={448}
          height={448}
          className="absolute left-1/2 top-1/2 h-[48rem] w-[48rem] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-md"
          priority
        />
      </div>

      {/* Quotes */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-[color:var(--foreground)]">
          {quoteCopy.title}
        </p>
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
          {quotes.map((quote, i) => (
            <div
              key={i}
              className="min-w-[14rem] max-w-[14rem] snap-start rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--muted)]/40 p-4"
            >
              <p className="text-sm italic leading-relaxed text-[color:var(--foreground)]">
                &ldquo;{quote}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Button onClick={onStart} size="lg" className="w-full">
        {t.start}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      {/* Algorithm link */}
      <div className="flex justify-center">
        <Link
          href={withLocalePrefix("/fit/how-it-works", locale)}
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
        >
          {t.algorithmLink}
          <ArrowRight className="h-3.5 w-3.5 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
