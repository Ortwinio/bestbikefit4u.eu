import type { Metadata } from "next";
import { ClipboardList, MessageSquareQuote, Sparkles, Users } from "lucide-react";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { CaseStudyIllustration } from "@/components/content/PublicPageIllustrations";
import { CaseStudyRecruitmentForm } from "@/components/public/CaseStudyRecruitmentForm";
import {
  PublicFeatureCard,
  PublicHero,
  PublicPageShell,
  PublicSection,
  PublicSurfaceCard,
} from "@/components/public";
import { Button } from "@/components/prototyper-ui/ui/button";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const alternates = buildLocaleAlternates("/case-study", locale);
  return {
    title:
      locale === "nl"
        ? "Case-study deelname | BestBikeFit4U"
        : "Case study recruitment | BestBikeFit4U",
    description:
      locale === "nl"
        ? "Deel je fietsgerelateerde pijn- of comfortprobleem en help ons echte rider case studies opbouwen."
        : "Share your fit-related pain or comfort challenge and help us build real rider case studies.",
    openGraph: {
      title:
        locale === "nl"
          ? "Case-study deelname | BestBikeFit4U"
          : "Case study recruitment | BestBikeFit4U",
      description:
        locale === "nl"
          ? "Deel je fietsgerelateerde pijn- of comfortprobleem en help ons echte rider case studies opbouwen."
          : "Share your fit-related pain or comfort challenge and help us build real rider case studies.",
      type: "website",
      url: alternates.canonical,
    },
    alternates,
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
    <PublicPageShell>
      <TrackMarketingEventOnView
        eventType="case_study_recruitment_view"
        locale={locale}
        pagePath={withLocalePrefix("/case-study", locale)}
        section={pain ?? "general"}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <PublicHero
          eyebrow={isNl ? "Rijders gezocht" : "Rider recruitment"}
          title={
            isNl
              ? "Help ons echte case studies opbouwen"
              : "Help us build real rider case studies"
          }
          description={
            isNl
              ? "We zoeken rijders met terugkerende klachten of duidelijke fit-uitdagingen. Deel je situatie en we nemen contact op als jouw case past bij een nieuwe publicatie of validatieronde."
              : "We are recruiting riders with recurring pain or clear fit challenges. Share your situation and we will reach out if your case fits a new publication or validation round."
          }
          chips={
            isNl
              ? ["Pijn en comfortcases", "NL en EN beschikbaar", "Vrijblijvende aanmelding"]
              : ["Pain and comfort cases", "Available in Dutch and English", "No-obligation submission"]
          }
          actions={
            <>
              <Button
                variant="outline"
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/pain", locale)}
                    locale={locale}
                    pagePath={sourcePath}
                    section="case_study_header_pain_cta"
                    ctaLabel={isNl ? "Bekijk pijnpagina's" : "Browse pain pages"}
                  />
                }
              >
                {isNl ? "Bekijk pijnpagina's" : "Browse pain pages"}
              </Button>
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/pricing", locale)}
                    locale={locale}
                    pagePath={sourcePath}
                    section="case_study_header_pricing_cta"
                    ctaLabel={isNl ? "Bekijk prijzen" : "View pricing"}
                  />
                }
              >
                {isNl ? "Bekijk prijzen" : "View pricing"}
              </Button>
            </>
          }
          illustration={<CaseStudyIllustration locale={locale} />}
        />

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: isNl ? "Waarom deze pagina bestaat" : "Why this page exists",
            title: isNl
              ? "Sterkere rider proof vraagt echte context"
              : "Stronger rider proof needs real context",
            description: isNl
              ? "We gebruiken inzendingen om patronen, startsituaties en bruikbare follow-up vragen beter te begrijpen. Dat maakt toekomstige publicaties en validatie sterker."
              : "We use submissions to understand patterns, starting points, and better follow-up questions. That improves future publications and validation work.",
          }}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <PublicFeatureCard
              icon={<MessageSquareQuote className="h-5 w-5" />}
              title={isNl ? "Echte probleemtaal" : "Real rider language"}
              description={
                isNl
                  ? "We leren hoe rijders hun klacht of uitdaging echt beschrijven."
                  : "We learn how riders actually describe their pain or fit challenge."
              }
            />
            <PublicFeatureCard
              icon={<ClipboardList className="h-5 w-5" />}
              title={isNl ? "Bruikbare structuur" : "Usable structure"}
              description={
                isNl
                  ? "We brengen context, fiets, doel en eerdere tweaks samen."
                  : "We connect context, bike, goal, and previous tweaks in one place."
              }
            />
            <PublicFeatureCard
              icon={<Users className="h-5 w-5" />}
              title={isNl ? "Betere validatie" : "Better validation"}
              description={
                isNl
                  ? "Zo bouwen we publicaties die dichter bij echte rider cases blijven."
                  : "That keeps future public content closer to real rider cases."
              }
            />
          </div>
        </PublicSection>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
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

          <div className="space-y-4">
            <PublicSurfaceCard
              title={isNl ? "Wat helpt ons het meest?" : "What helps us most?"}
              description={
                isNl
                  ? "Hoe concreter je startsituatie, hoe beter we kunnen beoordelen of je case bruikbaar is voor follow-up."
                  : "The more concrete your starting point, the better we can assess whether your case is useful for follow-up."
              }
              leading={<ClipboardList className="h-5 w-5" />}
            >
              <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
                <li>{isNl ? "Wanneer de klacht optreedt: direct, na 60 minuten, alleen op klimmen, enzovoort." : "When the issue shows up: immediately, after 60 minutes, only on climbs, and so on."}</li>
                <li>{isNl ? "Welke fiets en discipline je gebruikt." : "Which bike and discipline you are riding."}</li>
                <li>{isNl ? "Welke aanpassingen je al hebt geprobeerd." : "Which adjustments you have already tried."}</li>
                <li>{isNl ? "Of je openstaat voor follow-up vragen." : "Whether you are open to follow-up questions."}</li>
              </ul>
            </PublicSurfaceCard>

            <PublicSurfaceCard
              title={isNl ? "Wat deelnemers terugkrijgen" : "What participants get back"}
              description={
                isNl
                  ? "We beloven geen directe fitoplossing, maar wel een sterkere structuur voor zinvolle follow-up."
                  : "We are not promising an instant fit fix, but we are building a stronger structure for meaningful follow-up."
              }
              leading={<Users className="h-5 w-5" />}
            >
              <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
                <li>{isNl ? "Een duidelijkere structuur om je startsituatie en verbeteringen vast te leggen." : "A clearer structure for capturing your starting point and improvements."}</li>
                <li>{isNl ? "Een route naar bruikbare follow-up vragen in plaats van losse feedback." : "A path toward usable follow-up questions instead of scattered feedback."}</li>
                <li>{isNl ? "De kans om mee te helpen aan sterkere rider proof voor toekomstige rijders." : "A chance to help build stronger rider proof for future cyclists."}</li>
              </ul>
            </PublicSurfaceCard>

            <PublicSurfaceCard
              title={isNl ? "Eerst meer context nodig?" : "Need more context first?"}
              description={
                isNl
                  ? "Bekijk eerst onze gidsen en pijnpagina's als je je situatie scherper wilt beschrijven voordat je je case instuurt."
                  : "Browse the guides and pain pages first if you want to describe your situation more clearly before submitting your case."
              }
              leading={<Sparkles className="h-5 w-5" />}
            >
              <Button
                variant="outline"
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/guides", locale)}
                    locale={locale}
                    pagePath={sourcePath}
                    section="case_study_sidebar_guides_cta"
                    ctaLabel={isNl ? "Bekijk gidsen" : "Browse guides"}
                  />
                }
              >
                {isNl ? "Bekijk gidsen" : "Browse guides"}
              </Button>
            </PublicSurfaceCard>
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
