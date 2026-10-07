import type { PaidProductId } from "../../../shared/pricing/products";
import { heading, paragraph, renderLayout, valueRows } from "../layout";
import type { EmailLocale, RenderedEmail } from "./index";

const messages = {
  nl: {
    subject: "Persoonlijke bikefit betaald",
    intro: "Een rijder heeft een persoonlijke bikefit betaald. Hieronder staan de contactgegevens en de aankoop.",
    name: "Naam", email: "E-mail", product: "Product", paid: "Betaling bevestigd op",
    unnamed: "Niet opgegeven",
    annual_personal: "Jaarabonnement met persoonlijke bikefit",
    personal_fit_standalone: "Persoonlijke bikefit-afspraak",
    footer: "Je ontvangt dit bericht als contactpersoon voor persoonlijke bikefit-afspraken.",
  },
  en: {
    subject: "Personal bike fit paid",
    intro: "A rider has paid for a personal bike fit. Their contact and purchase details are below.",
    name: "Name", email: "Email", product: "Product", paid: "Payment confirmed on",
    unnamed: "Not provided",
    annual_personal: "Annual subscription with personal bike fit",
    personal_fit_standalone: "Personal bike fit appointment",
    footer: "You receive this message as the contact for personal bike fit appointments.",
  },
} as const;

export function renderFitterNotification(data: {
  riderName: string; riderEmail: string; productId: PaidProductId; paidAt: number;
}, locale: EmailLocale): RenderedEmail {
  if (data.productId !== "annual_personal" && data.productId !== "personal_fit_standalone") {
    throw new Error("INVALID_APPOINTMENT_PRODUCT");
  }
  const copy = messages[locale];
  const values = [
    { label: copy.name, value: data.riderName || copy.unnamed },
    { label: copy.email, value: data.riderEmail },
    { label: copy.product, value: copy[data.productId] },
    { label: copy.paid, value: new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", {
      day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
    }).format(data.paidAt) },
  ];
  return {
    subject: copy.subject, preheader: copy.intro,
    html: renderLayout({
      locale, subject: copy.subject, preheader: copy.intro, footerReason: copy.footer,
      content: heading(copy.subject) + paragraph(copy.intro) + valueRows(values),
    }),
    text: [copy.subject, copy.intro, ...values.map(value => `${value.label}: ${value.value}`), copy.footer].join("\n\n"),
  };
}
