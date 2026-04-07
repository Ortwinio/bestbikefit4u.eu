import type { Metadata } from "next";
import { Languages, Mail, MessageSquare, ShieldCheck } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import {
  PublicCtaBand,
  PublicFeatureCard,
  PublicHero,
  PublicPageShell,
  PublicSection,
  PublicSurfaceCard,
} from "@/components/public";
import { getSupportResponseItems } from "@/config/commercial";
import type { Locale } from "@/i18n/config";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";

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
      faqLink: "View FAQ",
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
    faqLink: "Bekijk FAQ",
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
  const alternates = buildLocaleAlternates("/contact", locale);

  return {
    title: page.metadata.title,
    description: page.metadata.description,
    keywords: page.metadata.keywords,
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function ContactPage() {
  const locale = await getRequestLocale();
  const page = getContent(locale);
  const pagePath = withLocalePrefix("/contact", locale);
  const trustPoints =
    locale === "nl"
      ? [
          {
            title: "Directe supportroute",
            description:
              "Je ziet meteen welke contactroute het snelst werkt, zonder verborgen formulierstappen.",
            icon: <Mail className="h-5 w-5" />,
          },
          {
            title: "Duidelijke verwachtingen",
            description:
              "We tonen responstijden en vragen om de informatie die nodig is om sneller en nauwkeuriger te helpen.",
            icon: <ShieldCheck className="h-5 w-5" />,
          },
          {
            title: "NL en EN beschikbaar",
            description:
              "Contact, FAQ en vervolgstappen blijven bruikbaar in zowel Nederlands als Engels.",
            icon: <Languages className="h-5 w-5" />,
          },
        ]
      : [
          {
            title: "Direct support route",
            description:
              "You immediately see the fastest contact path, without hidden form steps.",
            icon: <Mail className="h-5 w-5" />,
          },
          {
            title: "Clear expectations",
            description:
              "We show response times and ask for the context that helps us respond faster and more accurately.",
            icon: <ShieldCheck className="h-5 w-5" />,
          },
          {
            title: "Available in Dutch and English",
            description:
              "Contact, FAQ, and next steps stay usable in both Dutch and English.",
            icon: <Languages className="h-5 w-5" />,
          },
        ];

  return (
    <PublicPageShell className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--secondary)_32%,var(--background)_68%)_100%)] text-foreground">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <PublicHero
          eyebrow={locale === "nl" ? "We helpen je verder" : "We can help"}
          title={page.title}
          description={page.subtitle}
          chips={
            locale === "nl"
              ? ["NL en EN beschikbaar", "Directe e-mailroute", "Heldere responstijden"]
              : ["Available in Dutch and English", "Direct email route", "Clear response times"]
          }
        />

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: locale === "nl" ? "Waarom dit betrouwbaar voelt" : "Why this feels trustworthy",
            title:
              locale === "nl"
                ? "Contact zonder omwegen"
                : "Contact without unnecessary friction",
            description:
              locale === "nl"
                ? "De contactpagina maakt duidelijk hoe je ons bereikt, wat je kunt verwachten en hoe je sneller een bruikbaar antwoord krijgt."
                : "The contact page makes it clear how to reach us, what to expect, and how to get a more useful answer faster.",
          }}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {trustPoints.map((point) => (
              <PublicFeatureCard
                key={point.title}
                icon={point.icon}
                title={point.title}
                description={point.description}
              />
            ))}
          </div>
        </PublicSection>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <PublicSurfaceCard
              title={page.emailTitle}
              description={page.emailSupportText}
              leading={<Mail className="h-5 w-5" />}
            >
              <a
                href="mailto:support@bestbikefit4u.eu"
                className="inline-block text-primary hover:text-primary-dark"
              >
                support@bestbikefit4u.eu
              </a>
            </PublicSurfaceCard>

            <PublicSurfaceCard
              title={page.faqTitle}
              description={page.faqText}
              leading={<MessageSquare className="h-5 w-5" />}
            >
              <TrackedCtaLink
                href={withLocalePrefix("/faq", locale)}
                locale={locale}
                pagePath={pagePath}
                section="contact_faq_link"
                ctaLabel={page.faqLink}
                className="inline-block text-primary hover:text-primary-dark"
              >
                {page.faqLink}
              </TrackedCtaLink>
            </PublicSurfaceCard>

            <PublicSurfaceCard title={page.responseTimes}>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {page.responseItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </PublicSurfaceCard>
          </div>

          <PublicCtaBand
            eyebrow={locale === "nl" ? "Direct contact opnemen" : "Direct contact"}
            title={page.directContactTitle}
            description={page.directContactBody}
            actions={
              <Button
                render={
                  <TrackedCtaLink
                    href="mailto:support@bestbikefit4u.eu"
                    locale={locale}
                    pagePath={pagePath}
                    section="contact_email_cta"
                    ctaLabel={page.directContactCta}
                  />
                }
                variant="outline"
              >
                {page.directContactCta}
              </Button>
            }
            aside={page.directContactHint}
          />
        </div>
      </div>
    </PublicPageShell>
  );
}
