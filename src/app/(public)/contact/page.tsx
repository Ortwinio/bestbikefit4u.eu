import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";
import { Mail, MessageSquare } from "lucide-react";
import { getSupportResponseItems } from "@/config/commercial";
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

const panelClass =
  "rounded-[1.75rem] border border-border/70 bg-card/95 p-6 shadow-sm sm:p-8";

function getContent(locale: Locale): ContactCopy {
  if (locale === "en") {
    return {
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
    responseItems: getSupportResponseItems(locale),
    directContactTitle: "Send us an email directly",
    directContactBody:
      "For now, the fastest support route is direct email. Include your bike type, goal, and where you are stuck so we can help quickly.",
    directContactCta: "Open email app",
    directContactHint: "Address: support@bestbikefit4u.eu",
    };
  }

  return {
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
    responseItems: getSupportResponseItems(locale),
    directContactTitle: "Mail ons direct",
    directContactBody:
      "Op dit moment helpen we je het snelst via directe e-mail. Vermeld je fietstype, doel en waar je vastloopt voor sneller antwoord.",
    directContactCta: "Open e-mailapp",
    directContactHint: "Adres: support@bestbikefit4u.eu",
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = getContent(locale);

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
  const page = getContent(locale);

  return (
    <div className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--secondary)_32%,var(--background)_68%)_100%)] py-16 text-foreground">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <section className="rounded-[2.25rem] border border-border/70 bg-card/95 px-6 py-10 shadow-sm sm:px-10 sm:py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
            {locale === "nl" ? "We helpen je verder" : "We can help"}
          </p>
          <h1 className="mt-4 text-4xl font-bold text-foreground sm:text-5xl">{page.title}</h1>
          <p className="mt-4 text-xl text-muted-foreground">{page.subtitle}</p>
        </section>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className={panelClass}>
              <div className="flex items-center gap-3">
                <Mail className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">{page.emailTitle}</h2>
              </div>
              <p className="mt-2 text-muted-foreground">{page.emailSupportText}</p>
              <a
                href="mailto:support@bestbikefit4u.eu"
                className="mt-1 inline-block text-primary hover:text-primary-dark"
              >
                support@bestbikefit4u.eu
              </a>
            </div>

            <div className={panelClass}>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">{page.faqTitle}</h2>
              </div>
              <p className="mt-2 text-muted-foreground">{page.faqText}</p>
              <Link
                href={withLocalePrefix("/faq", locale)}
                className="mt-1 inline-block text-primary hover:text-primary-dark"
              >
                {page.faqLink}
              </Link>
            </div>

            <div className="rounded-[1.75rem] border border-border/70 bg-muted/55 p-6 shadow-sm">
              <h3 className="font-medium text-foreground">{page.responseTimes}</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {page.responseItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-[2rem] bg-primary px-6 py-8 shadow-lg sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-foreground/70">
              {locale === "nl" ? "Direct contact" : "Direct contact"}
            </p>
            <h2 className="mt-3 text-lg font-semibold text-primary-foreground">
              {page.directContactTitle}
            </h2>
            <p className="mt-3 text-primary-foreground/80">{page.directContactBody}</p>
            <a
              href="mailto:support@bestbikefit4u.eu"
              className="mt-4 inline-block"
            >
              <Button className="bg-background text-primary hover:bg-muted">{page.directContactCta}</Button>
            </a>
            <p className="mt-3 text-xs text-primary-foreground/70">{page.directContactHint}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
