import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { getFitQuestionnaireCopy } from "@/i18n/account/fitQuestionnaire";

export function FitQuestionnaireHeader({ locale }: { locale: Locale }) {
  const copy = getFitQuestionnaireCopy(locale);
  return (
    <header className="space-y-4">
      <Link href={withLocalePrefix("/fit", locale)} className="inline-flex min-h-11 items-center gap-2 rounded-lg font-semibold text-primary focus-visible:focus-ring">
        <ArrowLeft className="size-5" aria-hidden="true" />{copy.back}
      </Link>
      <p className="text-sm font-bold uppercase tracking-widest text-primary">{copy.eyebrow}</p>
      <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{copy.title}</h1>
      <p className="text-lg text-muted-foreground">{copy.description}</p>
    </header>
  );
}
