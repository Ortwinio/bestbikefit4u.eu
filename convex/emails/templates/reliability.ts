import { BRAND } from "../../lib/brand";
import { reliabilityEmailCopy } from "../i18n/reliability";
import { benefits, hero, paragraph, primaryButton, renderLayout } from "../layout";
import type { EmailLocale, PersonalData, PreferenceLinks, RenderedEmail } from "./index";

export interface KneeAngleEvaluationData extends PersonalData, PreferenceLinks {
  angleDegrees: number; targetSaddleHeightMm: number; actionUrl: string;
}
export function renderKneeAngleEvaluation(data: KneeAngleEvaluationData, locale: EmailLocale): RenderedEmail {
  const copy = reliabilityEmailCopy[locale];
  const format = new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-GB", { maximumFractionDigits: 1 });
  const greeting = data.firstName ? `${copy.greeting} ${data.firstName},` : `${copy.greeting},`;
  const values = `${copy.angle}: ${format.format(data.angleDegrees)}°. `
    + `${copy.height}: ${format.format(data.targetSaddleHeightMm)} mm.`;
  const content = hero({ eyebrow: copy.eyebrow, heading: copy.subject })
    + paragraph(greeting) + paragraph(copy.intro) + paragraph(values)
    + benefits(copy.questions.map(text => ({ text }))) + paragraph(copy.next) + paragraph(copy.warning)
    + primaryButton(data.actionUrl, copy.button);
  return { subject: copy.subject, preheader: copy.preheader,
    html: renderLayout({ locale, subject: copy.subject, preheader: copy.preheader, content,
      footerReason: copy.footer, unsubscribeUrl: data.unsubscribeUrl, preferencesUrl: data.preferencesUrl }),
    text: [greeting, copy.intro, values, ...copy.questions, copy.next, copy.warning,
      `${copy.button}: ${data.actionUrl}`, copy.footer, data.preferencesUrl, data.unsubscribeUrl, BRAND.host].join("\n\n") };
}
