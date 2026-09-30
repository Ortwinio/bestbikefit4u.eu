import type { Metadata } from "next";
import { Languages, Mail } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { getSupportResponseItems } from "@/config/commercial";
import type { Locale } from "@/i18n/config";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { contactPresentation } from "@/i18n/marketing/contact";
import styles from "./contact.module.css";

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
        "For now, the fastest support route is direct email. " +
        "Include your bike type, goal, and where you are stuck so we can help quickly.",
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
      "Op dit moment helpen we je het snelst via directe e-mail. " +
      "Vermeld je fietstype, doel en waar je vastloopt voor sneller antwoord.",
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
  const presentation = contactPresentation[locale];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero} aria-labelledby="contact-title">
          <div>
            <p className={styles.eyebrow}>{page.title} · {presentation.eyebrow}</p>
            <h1 id="contact-title">{presentation.title}<br />{presentation.titleEnd}</h1>
            <p className={styles.intro}>{page.subtitle}</p>
            <span className={styles.chip}>
              <Languages size={20} aria-hidden="true" />
              {presentation.languages}
            </span>
          </div>
          <section className={styles.email} aria-labelledby="contact-email">
            <div className={styles.icon}><Mail size={28} aria-hidden="true" /></div>
            <p className={styles.eyebrow}>{presentation.directEyebrow}</p>
            <h2 id="contact-email">{page.directContactTitle}</h2>
            <p>{page.emailSupportText}</p>
            <a href="mailto:support@bestbikefit4u.eu" className={styles.address}>
              support@bestbikefit<span className={styles.mono}>4</span>u.eu
            </a>
            <Button
              className={styles.action}
              role="link"
              render={
                <TrackedCtaLink
                  href="mailto:support@bestbikefit4u.eu"
                  locale={locale}
                  pagePath={pagePath}
                  section="contact_email_cta"
                  ctaLabel={page.directContactCta}
                />
              }
            >
              {page.directContactCta}
            </Button>
          </section>
        </section>

        <section aria-labelledby="contact-context">
          <p className={styles.eyebrow}>{presentation.contextEyebrow}</p>
          <h2 id="contact-context">{presentation.contextTitle}</h2>
          <p>{page.directContactBody}</p>
          <ol className={styles.steps}>
            {presentation.steps.map((step, index) => (
              <li className={styles.card} key={step.title}>
                <span className={styles.step} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className={styles.bottom}>
          <section className={styles.response} aria-labelledby="contact-response">
            <p className={styles.eyebrow}>{page.responseTimes}</p>
            <h2 id="contact-response">{presentation.responseTitle}</h2>
            <ul className={styles.times}>
              {page.responseItems.map((item) => (
                <li key={item}>
                  {item.split(/(\d+)/).map((part, index) => (
                    /\d/.test(part) ? <span className={styles.mono} key={index}>{part}</span> : part
                  ))}
                </li>
              ))}
            </ul>
          </section>
          <section className={styles.faq} aria-labelledby="contact-faq">
            <p className={styles.eyebrow}>{presentation.faqEyebrow}</p>
            <h2 id="contact-faq">{presentation.faqTitle}</h2>
            <p>{page.faqText}</p>
            <Button
              className={styles.action}
              role="link"
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/faq", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="contact_faq_link"
                  ctaLabel={page.faqLink}
                />
              }
            >
              {page.faqLink}
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
