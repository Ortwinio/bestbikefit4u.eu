import { heading, paragraph, primaryButton, renderLayout } from "../layout";
import type { EmailLocale, RenderedEmail } from "./index";

export function renderTransitionReminder(data: { redeemBy: number; actionUrl: string }, locale: EmailLocale): RenderedEmail {
  const date = new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(data.redeemBy);
  const subject = locale === "nl" ? "Je gratis overgangsmeting is nog beschikbaar" : "Your free transition measurement is still available";
  const body = locale === "nl" ? `Je hebt je gratis overgangsmeting nog niet gebruikt. Je kunt deze tot ${date} activeren voor één fiets.` : `You have not used your free transition measurement yet. You can activate it for one bike until ${date}.`;
  const button = locale === "nl" ? "Bekijk je meting" : "View your measurement";
  const footer = locale === "nl" ? "Je ontvangt deze servicemail omdat er een ongebruikte overgangsmeting bij je account hoort." : "You receive this service email because your account has an unused transition measurement.";
  return { subject, preheader: body, text: `${subject}\n\n${body}\n\n${button}: ${data.actionUrl}\n\n${footer}`, html: renderLayout({ locale, subject, preheader: body, content: heading(subject) + paragraph(body) + primaryButton(data.actionUrl, button), footerReason: footer }) };
}
