import type { Locale } from "@/i18n/config";
import { answerSectionMessages } from "@/i18n/calculators/answerSection";
import type { CalculatorAnswerContent } from "@/lib/seo/calculatorAnswers/types";

/** Server-rendered explanations and engine examples remain readable without JavaScript. */
export function CalculatorAnswerSection({ id, locale, content }: {
  id: string; locale: Locale; content: CalculatorAnswerContent;
}) {
  const copy = answerSectionMessages[locale];
  const tables = [
    { title: copy.input, rows: content.example.inputs },
    { title: copy.result, rows: content.example.results },
  ];
  return (
    <section aria-labelledby={`${id}-answer`} data-calculator-answer={id}
      className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 id={`${id}-answer`} className="font-display text-2xl font-bold">{copy.answer}</h2>
        <p className="mt-3 leading-relaxed">{content.answer}</p>
        <h3 className="mt-6 font-display text-xl font-bold">{copy.method}</h3>
        <p className="mt-3 leading-relaxed text-muted-foreground">{content.method}</p>
        <h3 className="mt-6 font-display text-xl font-bold">{copy.limits}</h3>
        <p className="mt-3 leading-relaxed text-muted-foreground">{content.limits}</p>
      </div>
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h3 className="font-display text-xl font-bold">{copy.example}</h3>
        <p className="mt-3 text-muted-foreground">{copy.exampleNote}</p>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          {tables.map(({ title, rows }) => (
            <div key={title}>
              <h4 className="font-semibold">{title}</h4>
              <dl className="mt-3 divide-y divide-border">
                {rows.map(row => (
                  <div key={row.label} className="flex flex-wrap justify-between gap-2 py-3">
                    <dt className="text-muted-foreground">{row.label}</dt>
                    <dd className="font-mono">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-display text-xl font-bold">{copy.mistakes}</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
          {content.mistakes.map(mistake => <li key={mistake}>{mistake}</li>)}
        </ul>
      </div>
    </section>
  );
}
