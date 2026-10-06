import type { Locale } from "@/i18n/config";
import { ContentDisclosure, ShortAnswer } from "@/components/calculators/CalculatorAnswerSection";
import { getGuidesMessages } from "@/i18n/marketing/guides";
import styles from "./Guides.module.css";

export function GuideQuickAnswer({ answer, locale }: {
  answer?: { keyTakeaway: string; commonMistake: string; payAttention: string } | null;
  locale: Locale;
}) {
  if (!answer || !Object.values(answer).some(Boolean)) return null;
  const copy = getGuidesMessages(locale);
  return (
    <section className={styles.quick} aria-labelledby="guide-quick-title">
      <h2 id="guide-quick-title">{copy.quick}</h2>
      <h3>{copy.takeaway}</h3>
      <ShortAnswer text={answer.keyTakeaway} locale={locale} />
      {answer.commonMistake && <ContentDisclosure title={copy.mistake}>
        <p>{answer.commonMistake}</p>
      </ContentDisclosure>}
      {answer.payAttention && <div data-usability="safety">
        <h3>{copy.attention}</h3><p>{answer.payAttention}</p>
      </div>}
    </section>
  );
}
