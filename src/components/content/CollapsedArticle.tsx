import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { ContentDisclosure, containsSafetyAdvice } from "@/components/calculators/CalculatorAnswerSection";

export function CollapsedArticle({ content, locale, render }: {
  content: string;
  locale: Locale;
  render: (markdown: string, precedingContent: string) => ReactNode;
}) {
  const sections = content.split(/(?=^##\s)/m).filter(section => section.trim());
  return <>{sections.map((section, index) => {
    const precedingContent = sections.slice(0, index).join("");
    const heading = section.match(/^##\s+(.+)/)?.[1];
    if (heading && containsSafetyAdvice(heading)) return <section key={index} data-usability="safety">{render(section, precedingContent)}</section>;
    const blocks = section.split(/\n\s*\n/);
    const safety = blocks.filter(containsSafetyAdvice);
    const explanation = blocks.filter(block => !containsSafetyAdvice(block)).join("\n\n");
    return <div key={index}>
      {explanation.trim() && <ContentDisclosure title={heading ?? (locale === "nl" ? "Meer uitleg" : "Read more")}>
        {render(explanation, precedingContent)}
      </ContentDisclosure>}
      {safety.length > 0 && <section data-usability="safety">{render(safety.join("\n\n"), precedingContent + explanation)}</section>}
    </div>;
  })}</>;
}
