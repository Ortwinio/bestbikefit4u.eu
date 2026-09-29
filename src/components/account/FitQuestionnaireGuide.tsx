import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { DashboardMessages } from "@/i18n/dashboardMessages";
import { withLocalePrefix } from "@/i18n/navigation";
import { formatFitQuestionnaireNumber, getFitQuestionnaireCopy } from "@/i18n/account/fitQuestionnaire";
import type { QuestionDefinition } from "@/components/questionnaire/types";
import { getLocalizedQuestion } from "@/components/questionnaire/localization";

export function FitQuestionnaireGuide({ questions, currentIndex, locale, messages }: {
  questions: QuestionDefinition[];
  currentIndex: number;
  locale: Locale;
  messages: DashboardMessages;
}) {
  const copy = getFitQuestionnaireCopy(locale);
  return (
    <aside className="min-w-0 rounded-[28px] bg-[var(--bbf-petrol-zacht)] p-6 text-[var(--bbf-inkt)]" aria-label={copy.session}>
      <p className="text-sm font-bold uppercase tracking-widest text-primary">{copy.session}</p>
      <h2 className="mt-3 font-display text-2xl font-bold">{copy.guidanceTitle}</h2>
      <p className="mt-3 leading-relaxed">{copy.guidance}</p>
      <ol className="my-6 space-y-4 border-t border-[var(--bbf-rand)] pt-6">
        {questions.map((question, index) => (
          <li key={question.questionId} aria-current={index === currentIndex ? "step" : undefined} className={`flex items-center gap-3 text-sm ${index === currentIndex ? "font-bold" : ""}`}>
            <span className={`flex size-8 shrink-0 items-center justify-center rounded-full font-mono ${index === currentIndex ? "bg-[var(--bbf-lime)]" : "bg-white"}`}>{formatFitQuestionnaireNumber(index + 1, locale)}</span>
            <span>{copy.topics[question.questionId] ?? getLocalizedQuestion(question, messages).questionText}</span>
          </li>
        ))}
      </ol>
      <p className="text-sm text-muted-foreground">{copy.measurements}</p>
      <Link href={withLocalePrefix("/profile", locale)} className="inline-flex min-h-11 items-center rounded-lg font-semibold text-primary focus-visible:focus-ring">{copy.profile}</Link>
    </aside>
  );
}
