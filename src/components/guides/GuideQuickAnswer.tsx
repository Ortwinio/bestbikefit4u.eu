import type { Locale } from "@/i18n/config";
import { getGuidesMessages } from "@/i18n/marketing/guides";
import styles from "./Guides.module.css";

export function GuideQuickAnswer({ answer, locale }: {
  answer?: { keyTakeaway: string; commonMistake: string; payAttention: string } | null;
  locale: Locale;
}) {
  if (!answer || !Object.values(answer).some(Boolean)) return null;
  const copy = getGuidesMessages(locale);
  const items = [
    { title: copy.takeaway, body: answer.keyTakeaway },
    { title: copy.mistake, body: answer.commonMistake },
    { title: copy.attention, body: answer.payAttention },
  ];
  return (
    <section className={styles.quick} aria-labelledby="guide-quick-title">
      <h2 id="guide-quick-title">{copy.quick}</h2>
      <div className={styles.quickGrid}>
        {items.filter((item) => item.body).map((item) => (
          <div key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
