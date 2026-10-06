import type { Locale } from "@/i18n/config";
import type { ReactNode } from "react";
import { answerSectionMessages } from "@/i18n/calculators/answerSection";
import type { CalculatorAnswerContent } from "@/lib/seo/calculatorAnswers/types";

export function containsSafetyAdvice(text: string) {
  return /veilig|waarschuwing|medisch|aanhoudende|scherpe pijn|stop (?:met|bij)|safety|warning|medical|persistent|sharp pain|stop (?:riding|when)|severe|ernstige/i.test(text);
}

export function ContentDisclosure({ title, children, safety = false }: { title: ReactNode; children: ReactNode; safety?: boolean }) {
  if (safety) return <section data-usability="safety" className="my-6">{children}</section>;
  return <details data-usability="explanation" className="my-6 rounded-2xl border border-border bg-card px-6">
    <summary className="min-h-14 cursor-pointer py-4 font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-ring">{title}</summary>
    <div className="pb-6">{children}</div>
  </details>;
}

export function ShortAnswer({ text, locale }: { text: string; locale: Locale }) {
  const sentences = Array.from(new Intl.Segmenter(locale, { granularity: "sentence" }).segment(text), part => part.segment);
  return <>
    <div data-usability="short-answer"><p className="mt-3 leading-relaxed">{sentences.slice(0, 2).join("")}</p></div>
    {sentences.length > 2 && <ContentDisclosure safety={containsSafetyAdvice(sentences.slice(2).join(""))} title={locale === "nl" ? "Meer uitleg" : "Read more"}>
      <p className="leading-relaxed">{sentences.slice(2).join("")}</p>
    </ContentDisclosure>}
  </>;
}

/** Server-rendered explanations and engine examples remain readable without JavaScript. */
export function CalculatorAnswerSection({ id, locale, content }: {
  id: string; locale: Locale; content: CalculatorAnswerContent;
}) {
  const copy = answerSectionMessages[locale];
  const hasSafetyLimits = ["saddle-height", "tire-pressure", "fuel-hydration"].includes(id) || containsSafetyAdvice(content.limits);
  const tables = [
    { title: copy.input, rows: content.example.inputs },
    { title: copy.result, rows: content.example.results },
  ];
  return (
    <section aria-labelledby={`${id}-answer`} data-calculator-answer={id}
      className="mx-auto max-w-5xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border bg-card p-4 sm:p-8">
        <h2 id={`${id}-answer`} className="font-display text-2xl font-bold">{copy.answer}</h2>
        <ShortAnswer text={content.answer} locale={locale} />
      </div>
      {hasSafetyLimits && <div data-usability="safety" className="rounded-2xl border border-border p-4">
        <h3 className="font-display text-xl font-bold">{copy.limits}</h3>
        <p className="mt-3 leading-relaxed">{content.limits}</p>
      </div>}
      <ContentDisclosure title={locale === "nl" ? "Hoe rekenen we dit?" : "How do we calculate this?"}>
        <h3 className="mt-6 font-display text-xl font-bold">{copy.method}</h3>
        <p className="mt-3 leading-relaxed text-muted-foreground">{content.method}</p>
        {!hasSafetyLimits && <>
          <h3 className="mt-6 font-display text-xl font-bold">{copy.limits}</h3>
          <p className="mt-3 leading-relaxed text-muted-foreground">{content.limits}</p>
        </>}

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
      </ContentDisclosure>
    </section>
  );
}
