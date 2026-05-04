import type { Metadata } from "next";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { PublicCtaBand, PublicHero, PublicPageShell } from "@/components/public";
import { getSubscriptionTermsCopy } from "@/config/commercial";
import type { Locale } from "@/i18n/config";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";

type TermsSection = {
  title: string;
  body?: string;
  bullets?: string[];
  warningTitle?: string;
  warningBody?: string;
};

type TermsCopy = {
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  title: string;
  lastUpdatedLabel: string;
  lastUpdatedDate: string;
  sections: TermsSection[];
};

function getContent(locale: Locale): TermsCopy {
  if (locale === "en") {
    return {
      metadata: {
        title: "Terms of Service - BestBikeFit4U",
        description: "Read the terms and conditions for using BestBikeFit4U.",
        keywords: ["terms of service", "terms and conditions", "BestBikeFit4U terms"],
      },
      title: "Terms of Service",
      lastUpdatedLabel: "Last updated",
      lastUpdatedDate: "February 15, 2026",
      sections: [
        {
          title: "1. Acceptance of Terms",
          body: "By accessing or using BestBikeFit4U, you agree to these Terms of Service.",
        },
        {
          title: "2. Description of Service",
          body: "BestBikeFit4U provides algorithm-based bike fitting recommendations based on user measurements and preferences.",
        },
        {
          title: "3. Important Disclaimer",
          warningTitle: "BestBikeFit4U is not a substitute for an in-person professional bike fit.",
          warningBody:
            "Recommendations depend on the quality of your measurements. Riders with injuries, chronic pain, or significant asymmetry should consult a qualified fitter or medical professional.",
        },
        {
          title: "4. User Accounts",
          bullets: [
            "You must provide a valid email address.",
            "You are responsible for your account security.",
            "Do not share accounts.",
            "We may suspend accounts that violate these terms.",
          ],
        },
        {
          title: "5. Acceptable Use",
          bullets: [
            "Do not use the service for unlawful purposes.",
            "Do not attempt unauthorized access.",
            "Do not scrape or automate without consent.",
            "Do not disrupt service integrity or performance.",
          ],
        },
        {
          title: "6. Subscription Plans",
          body: getSubscriptionTermsCopy(locale),
        },
        {
          title: "7. Limitation of Liability",
          body: "To the maximum extent permitted by law, BestBikeFit4U is not liable for indirect or consequential damages arising from use of the service. You are responsible for implementing fit changes gradually and safely.",
        },
        {
          title: "8. Intellectual Property",
          body: "Service content, design, and algorithms are protected intellectual property.",
        },
        {
          title: "9. Changes to Terms",
          body: "We may update these terms. Continued use after updates means you accept the revised terms.",
        },
        {
          title: "10. Contact",
          body: "For questions about these terms, contact support@bestbikefit4u.eu.",
        },
      ],
    };
  }

  return {
    metadata: {
      title: "Gebruiksvoorwaarden - BestBikeFit4U",
      description: "Lees de voorwaarden voor het gebruik van BestBikeFit4U.",
      keywords: ["gebruiksvoorwaarden", "voorwaarden", "BestBikeFit4U terms"],
    },
    title: "Gebruiksvoorwaarden",
    lastUpdatedLabel: "Laatst bijgewerkt",
    lastUpdatedDate: "15 februari 2026",
    sections: [
      {
        title: "1. Acceptatie van voorwaarden",
        body: "Door BestBikeFit4U te gebruiken ga je akkoord met deze gebruiksvoorwaarden.",
      },
      {
        title: "2. Beschrijving van de dienst",
        body: "BestBikeFit4U biedt algoritme-gedreven bike fitting aanbevelingen op basis van jouw metingen en voorkeuren.",
      },
      {
        title: "3. Belangrijke disclaimer",
        warningTitle: "BestBikeFit4U vervangt geen professionele fysieke bike fitting.",
        warningBody:
          "Aanbevelingen hangen af van de nauwkeurigheid van je metingen. Bij blessures, chronische pijn of duidelijke asymmetrie raden we professionele begeleiding aan.",
      },
      {
        title: "4. Gebruikersaccounts",
        bullets: [
          "Je moet een geldig e-mailadres gebruiken.",
          "Je bent verantwoordelijk voor de beveiliging van je account.",
          "Het delen van accounts is niet toegestaan.",
          "We kunnen accounts blokkeren bij overtreding van deze voorwaarden.",
        ],
      },
      {
        title: "5. Toegestaan gebruik",
        bullets: [
          "Gebruik de dienst niet voor onwettige doeleinden.",
          "Probeer geen ongeautoriseerde toegang te krijgen.",
          "Automatisering/scraping zonder toestemming is niet toegestaan.",
          "Verstoor de dienst niet.",
        ],
      },
      {
        title: "6. Abonnementsplannen",
        body: getSubscriptionTermsCopy(locale),
      },
      {
        title: "7. Beperking van aansprakelijkheid",
        body: "Voor zover wettelijk toegestaan is BestBikeFit4U niet aansprakelijk voor indirecte of gevolgschade. Je blijft zelf verantwoordelijk voor het veilig doorvoeren van aanpassingen.",
      },
      {
        title: "8. Intellectueel eigendom",
        body: "Inhoud, ontwerp en algoritmes van de dienst zijn beschermd intellectueel eigendom.",
      },
      {
        title: "9. Wijzigingen van voorwaarden",
        body: "We kunnen deze voorwaarden aanpassen. Door de dienst te blijven gebruiken, ga je akkoord met de nieuwe versie.",
      },
      {
        title: "10. Contact",
        body: "Voor vragen over deze voorwaarden: support@bestbikefit4u.eu.",
      },
    ],
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
    alternates: buildLocaleAlternates("/terms", locale),
  };
}

export default async function TermsPage() {
  const locale = await getRequestLocale();
  const page = getContent(locale);
  const pagePath = withLocalePrefix("/terms", locale);

  return (
    <PublicPageShell>
      <PublicHero
        eyebrow="BestBikeFit4U"
        title={page.title}
        description={page.metadata.description}
      />

      <div className="mt-8 max-w-4xl">
        <p className="text-sm text-muted-foreground">
          {page.lastUpdatedLabel}: {page.lastUpdatedDate}
        </p>

        <div className="prose prose-sm mt-8 max-w-none text-[color:var(--muted-foreground)] prose-headings:text-[color:var(--foreground)] prose-strong:text-[color:var(--foreground)]">
          {page.sections.map((section) => (
            <section key={section.title} className="mt-8 first:mt-0">
              <h2 className="text-2xl font-semibold text-foreground">{section.title}</h2>

              {section.warningTitle ? (
                <div className="mt-4 rounded-lg border-l-4 border-warning bg-warning/10 p-4">
                  <p className="font-medium text-warning-foreground">{section.warningTitle}</p>
                  {section.warningBody ? <p className="mt-2 text-warning-foreground/90">{section.warningBody}</p> : null}
                </div>
              ) : null}

              {section.body ? <p className="mt-4">{section.body}</p> : null}

              {section.bullets ? (
                <ul className="mt-4 list-disc space-y-2 pl-6">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </div>

      <PublicCtaBand
        className="mt-12"
        title={locale === "nl" ? "Terug naar de homepage" : "Back to the homepage"}
        description={
          locale === "nl"
            ? "Ga terug naar de homepage zodra je klaar bent met de gebruiksvoorwaarden."
            : "Return to the homepage when you are done reviewing the terms."
        }
        actions={
          <Button
            render={
              <TrackedCtaLink
                href={withLocalePrefix("/", locale)}
                locale={locale}
                pagePath={pagePath}
                section="terms_footer_cta"
                ctaLabel={locale === "nl" ? "Terug naar de homepage" : "Back to the homepage"}
              />
            }
          >
            {locale === "nl" ? "Terug naar de homepage" : "Back to the homepage"}
          </Button>
        }
      />
    </PublicPageShell>
  );
}
