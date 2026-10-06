import type { Locale } from "@/i18n/config";
import { PRODUCTS } from "../../../shared/pricing/products";

export type PaidBoundaryKind = "second-bike" | "profile-score" | "step-plan" | "compare" | "report" | "history";
const copy = {
  nl: {
    paid: "Betaald", single: "Losse meting", annual: "Jaarabonnement", perYear: "per jaar",
    action: "Bekijk wat betaald oplevert", singleAction: "Ontgrendel mijn stappenplan",
    boundaries: {
      "second-bike": { title: "Ook je tweede fiets goed afstellen", body: "Bewaar meer fietsen met een jaarabonnement." },
      "profile-score": { title: "Van 80% naar een vollediger profiel", body: "Verfijnde metingen maken je advies persoonlijker met een losse meting of jaarabonnement." },
      "step-plan": { title: "Jouw stappenplan voor deze fiets", body: "Krijg de volgorde van aanpassen en een controleplan met een losse meting." },
      compare: { title: "Je fietsafstellingen bewaren", body: "Bewaar de afstelling van meerdere fietsen met een jaarabonnement." },
      report: { title: "In je volledige rapport", body: "Krijg je stappenplan en controleplan bij je kernwaarden met een losse meting." },
      history: { title: "Je volledige rapporten terugzien", body: "Lees de volledige adviezen voor al je fietsen met een jaarabonnement." },
    },
    steps: ["Volgorde van aanpassen", "Controle na je aanpassing", "Je afstelling bewaren"],
  },
  en: {
    paid: "Paid", single: "Single fit", annual: "Annual plan", perYear: "per year",
    action: "See what paid access adds", singleAction: "Unlock my adjustment plan",
    boundaries: {
      "second-bike": { title: "Fit your second bike too", body: "Save more bikes with an annual plan." },
      "profile-score": { title: "From 80% to a fuller profile", body: "Refined measurements personalise your advice with a single fit or annual plan." },
      "step-plan": { title: "Your adjustment plan for this bike", body: "Get the adjustment order and a validation plan with a single fit." },
      compare: { title: "Save your bike setups", body: "Save the setup of multiple bikes with an annual plan." },
      report: { title: "In your full report", body: "Add an adjustment plan and validation plan to your core values with a single fit." },
      history: { title: "Revisit your full reports", body: "Read the full advice for all your bikes with an annual plan." },
    },
    steps: ["Adjustment order", "Check after your adjustment", "Save your setup"],
  },
} as const;
export function getUsabilityPaidCopy(locale: Locale) { return copy[locale]; }
export function paidPrice(locale: Locale, product: "single" | "annual") {
  return new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-IE", {
    style: "currency", currency: "EUR",
  }).format(PRODUCTS[product].priceCents / 100);
}
