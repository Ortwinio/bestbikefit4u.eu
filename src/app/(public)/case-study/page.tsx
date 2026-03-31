import type { Metadata } from "next";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { CaseStudyRecruitmentForm } from "@/components/public/CaseStudyRecruitmentForm";
import { Button } from "@/components/ui";
import Link from "next/link";
import { getRequestLocale } from "@/i18n/request";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title:
      locale === "nl"
        ? "Case-study deelname | BestBikeFit4U"
        : "Case study recruitment | BestBikeFit4U",
    description:
      locale === "nl"
        ? "Deel je fietsgerelateerde pijn- of comfortprobleem en help ons echte rider case studies opbouwen."
        : "Share your fit-related pain or comfort challenge and help us build real rider case studies.",
    alternates: buildLocaleAlternates("/case-study", locale),
  };
}

export default async function CaseStudyPage({
  searchParams,
}: {
  searchParams: Promise<{ pain?: string }>;
}) {
  const locale = await getRequestLocale();
  const { pain } = await searchParams;
  const sourcePath = withLocalePrefix(`/case-study${pain ? `?pain=${pain}` : ""}`, locale);
  const isNl = locale === "nl";

  return (
    <div className="py-16">
      <TrackMarketingEventOnView
        eventType="case_study_recruitment_view"
        locale={locale}
        pagePath={withLocalePrefix("/case-study", locale)}
        section={pain ?? "general"}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-border/70 bg-card/95 px-6 py-10 shadow-sm sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            {isNl ? "Rider recruitment" : "Rider recruitment"}
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-foreground sm:text-5xl">
            {isNl
              ? "Help ons echte case studies opbouwen"
              : "Help us build real rider case studies"}
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            {isNl
              ? "We zoeken rijders met terugkerende klachten of duidelijke fit-uitdagingen. Deel je situatie en we nemen contact op als jouw case past bij een nieuwe publicatie of validatieronde."
              : "We are recruiting riders with recurring pain or clear fit challenges. Share your situation and we will reach out if your case fits a new publication or validation round."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" render={<Link href={withLocalePrefix("/pain", locale)} />}>
              {isNl ? "Bekijk pijnpagina's" : "Browse pain pages"}
            </Button>
            <Button variant="outline" render={<Link href={withLocalePrefix("/pricing", locale)} />}>
              {isNl ? "Bekijk prijzen" : "View pricing"}
            </Button>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <CaseStudyRecruitmentForm
            locale={locale}
            sourcePath={sourcePath}
            painSlug={pain}
            copy={{
              nameLabel: isNl ? "Naam" : "Name",
              emailLabel: isNl ? "E-mailadres" : "Email address",
              ridingGoalLabel: isNl ? "Rijdoel of context" : "Riding goal or context",
              painSummaryLabel: isNl ? "Beschrijf je klacht of uitdaging" : "Describe your pain or fit challenge",
              consentLabel: isNl
                ? "Ik geef toestemming om mijn inzending te gebruiken om contact op te nemen over een case study of validatieronde."
                : "I consent to BestBikeFit4U using this submission to contact me about a case study or validation round.",
              submitLabel: isNl ? "Verstuur case-study interesse" : "Submit case-study interest",
              success: isNl
                ? "Bedankt. We hebben je case-study interesse ontvangen."
                : "Thank you. We received your case-study interest.",
              helpText: isNl
                ? "Bijvoorbeeld: gran fondo, triathlon, woon-werk, revalidatie"
                : "For example: gran fondo, triathlon, commuting, return from injury",
            }}
          />

          <div className="rounded-[2rem] border border-border/70 bg-primary-soft p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold text-foreground">
              {isNl ? "Wat helpt ons het meest?" : "What helps us most?"}
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-muted-foreground">
              <li>{isNl ? "Wanneer de klacht optreedt: direct, na 60 minuten, alleen op klimmen, enzovoort." : "When the issue shows up: immediately, after 60 minutes, only on climbs, and so on."}</li>
              <li>{isNl ? "Welke fiets en discipline je gebruikt." : "Which bike and discipline you are riding."}</li>
              <li>{isNl ? "Welke aanpassingen je al hebt geprobeerd." : "Which adjustments you have already tried."}</li>
              <li>{isNl ? "Of je openstaat voor follow-up vragen." : "Whether you are open to follow-up questions."}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
