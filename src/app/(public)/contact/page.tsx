import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";
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
  directContactTitle: string;
  directContactBody: string;
  directContactCta: string;
  directContactHint: string;
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
    directContactTitle: "Send us an email directly",
    directContactBody:
      "For now, the fastest support route is direct email. Include your bike type, goal, and where you are stuck so we can help quickly.",
    directContactCta: "Open email app",
    directContactHint: "Address: support@bestbikefit4u.eu",
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
    directContactTitle: "Mail ons direct",
    directContactBody:
      "Op dit moment helpen we je het snelst via directe e-mail. Vermeld je fietstype, doel en waar je vastloopt voor sneller antwoord.",
    directContactCta: "Open e-mailapp",
    directContactHint: "Adres: support@bestbikefit4u.eu",
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
            <h2 className="text-lg font-semibold text-gray-900">
              {page.directContactTitle}
            </h2>
            <p className="mt-3 text-gray-600">{page.directContactBody}</p>
            <a
              href="mailto:support@bestbikefit4u.eu"
              className="mt-4 inline-block"
            >
              <Button>{page.directContactCta}</Button>
            </a>
            <p className="mt-3 text-xs text-gray-500">{page.directContactHint}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
