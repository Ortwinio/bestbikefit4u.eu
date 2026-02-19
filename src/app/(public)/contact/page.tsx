import type { Metadata } from "next";
import Link from "next/link";
import { Button, FieldLabel } from "@/components/ui";
import { Mail, MessageSquare } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { buildLocaleAlternates } from "@/i18n/metadata";

type ContactCopy = {
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  title: string;
  subtitle: string;
  emailTitle: string;
  emailSupportText: string;
  faqTitle: string;
  faqText: string;
  faqLink: string;
  responseTimes: string;
  responseItems: string[];
  formTitle: string;
  nameLabel: string;
  namePlaceholder: string;
  nameTooltip: string;
  emailLabel: string;
  emailPlaceholder: string;
  emailTooltip: string;
  messageLabel: string;
  messagePlaceholder: string;
  messageTooltip: string;
  sendButton: string;
  formNote: string;
};

const content: Record<Locale, ContactCopy> = {
  en: {
    metadata: {
      title: "Contact Us - BestBikeFit4U",
      description:
        "Get in touch with the BestBikeFit4U team. We are here to help with your bike fitting questions and support needs.",
      keywords: ["contact BestBikeFit4U", "bike fit support", "cycling help"],
    },
    title: "Contact Us",
    subtitle: "Have a question or need help? We'd love to hear from you.",
    emailTitle: "Email",
    emailSupportText: "For general questions and support:",
    faqTitle: "FAQ",
    faqText: "Check our FAQ for instant answers to common questions.",
    faqLink: "View FAQ ->",
    responseTimes: "Response Times",
    responseItems: [
      "Free plan: within 3 business days",
      "Pro plan: within 1 business day",
      "Premium plan: within 4 hours",
    ],
    formTitle: "Send a Message",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    nameTooltip:
      "Your name, so we know how to address you.",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    emailTooltip:
      "Your email address, so we can reply.",
    messageLabel: "Message",
    messagePlaceholder: "How can we help?",
    messageTooltip:
      "Describe what you need help with (bike type, measurements, goals, and any pain/injuries).",
    sendButton: "Send Message",
    formNote:
      "Contact form is for display purposes. Please email us directly at support@bestbikefit4u.eu.",
  },
  nl: {
    metadata: {
      title: "Contact - BestBikeFit4U",
      description:
        "Neem contact op met het BestBikeFit4U-team. We helpen je graag met vragen over bike fitting en support.",
      keywords: ["contact BestBikeFit4U", "bike fit support", "fiets hulp"],
    },
    title: "Contact",
    subtitle: "Heb je een vraag of hulp nodig? We horen graag van je.",
    emailTitle: "E-mail",
    emailSupportText: "Voor algemene vragen en support:",
    faqTitle: "FAQ",
    faqText: "Bekijk onze FAQ voor directe antwoorden op veelgestelde vragen.",
    faqLink: "Bekijk FAQ ->",
    responseTimes: "Responstijden",
    responseItems: [
      "Free-plan: binnen 3 werkdagen",
      "Pro-plan: binnen 1 werkdag",
      "Premium-plan: binnen 4 uur",
    ],
    formTitle: "Stuur een bericht",
    nameLabel: "Naam",
    namePlaceholder: "Jouw naam",
    nameTooltip:
      "Je naam, zodat we je netjes kunnen aanspreken.",
    emailLabel: "E-mail",
    emailPlaceholder: "jij@example.com",
    emailTooltip:
      "Je e-mailadres, zodat we kunnen reageren.",
    messageLabel: "Bericht",
    messagePlaceholder: "Waarmee kunnen we helpen?",
    messageTooltip:
      "Beschrijf kort je vraag (fietstype, metingen, doelen en eventuele klachten/blessures).",
    sendButton: "Verstuur bericht",
    formNote:
      "Het contactformulier is alleen voor demonstratie. Mail ons direct via support@bestbikefit4u.eu.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = content[locale];

  return {
    title: page.metadata.title,
    description: page.metadata.description,
    keywords: page.metadata.keywords,
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description,
      type: "website",
    },
    alternates: buildLocaleAlternates("/contact", locale),
  };
}

export default async function ContactPage() {
  const locale = await getRequestLocale();
  const page = content[locale];

  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900">{page.title}</h1>
        <p className="mt-4 text-xl text-gray-600">{page.subtitle}</p>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <Mail className="h-6 w-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">{page.emailTitle}</h2>
              </div>
              <p className="mt-2 text-gray-600">{page.emailSupportText}</p>
              <a
                href="mailto:support@bestbikefit4u.eu"
                className="mt-1 inline-block text-blue-600 hover:text-blue-700"
              >
                support@bestbikefit4u.eu
              </a>
            </div>

            <div className="rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">{page.faqTitle}</h2>
              </div>
              <p className="mt-2 text-gray-600">{page.faqText}</p>
              <Link
                href={withLocalePrefix("/faq", locale)}
                className="mt-1 inline-block text-blue-600 hover:text-blue-700"
              >
                {page.faqLink}
              </Link>
            </div>

            <div className="rounded-lg bg-gray-50 p-6">
              <h3 className="font-medium text-gray-900">{page.responseTimes}</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                {page.responseItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">{page.formTitle}</h2>
            <form className="mt-4 space-y-4">
              <div>
                <FieldLabel
                  label={page.nameLabel}
                  htmlFor="name"
                  tooltip={page.nameTooltip}
                />
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder={page.namePlaceholder}
                />
              </div>
              <div>
                <FieldLabel
                  label={page.emailLabel}
                  htmlFor="email"
                  tooltip={page.emailTooltip}
                />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder={page.emailPlaceholder}
                />
              </div>
              <div>
                <FieldLabel
                  label={page.messageLabel}
                  htmlFor="message"
                  tooltip={page.messageTooltip}
                />
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder={page.messagePlaceholder}
                />
              </div>
              <Button type="button" className="w-full">
                {page.sendButton}
              </Button>
              <p className="text-xs text-gray-500 text-center">{page.formNote}</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
