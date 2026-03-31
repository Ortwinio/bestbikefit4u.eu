import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  Gauge,
  HeartPulse,
  Mountain,
  Sparkles,
} from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { GUIDES, getGuideClusterLabel, getGuideCopy } from "./data";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const alternates = buildLocaleAlternates("/guides", locale);

  return {
    title: isNl
      ? "Bikefitting gidsen voor klachten en disciplines | BestBikeFit4U"
      : "Bike Fitting Guides for Pain and Disciplines | BestBikeFit4U",
    description: isNl
      ? "Bekijk praktische bikefitting-gidsen voor kniepijn, rugklachten, racefiets, gravel, MTB en triathlon."
      : "Explore practical bike fitting guides for knee pain, back pain, road, gravel, MTB, and triathlon setups.",
    keywords: isNl
      ? [
          "bikefitting gids",
          "bikefitting kniepijn",
          "racefiets fit",
          "gravel bikefitting",
        ]
      : [
          "bike fitting guides",
          "bike fitting knee pain",
          "road bike fit",
          "gravel bike fit",
        ],
    openGraph: {
      title: isNl
        ? "Bikefitting gidsen voor klachten en disciplines"
        : "Bike Fitting Guides for Pain and Disciplines",
      description: isNl
        ? "Praktische gidsen voor betere comfort, controle en prestaties op de fiets."
        : "Practical guides to improve comfort, control, and performance on the bike.",
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

function ClusterCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="dashboard-card-surface border-[color:var(--border)] bg-[color:var(--card)]">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--primary-soft)] p-3 text-[color:var(--primary)]">
            {icon}
          </div>
          <div>
            <h3 className="text-base font-semibold text-[color:var(--foreground)]">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-[color:var(--muted-foreground)]">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function GuidesHubPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix("/guides", locale);

  const painGuides = GUIDES.filter((guide) => guide.cluster === "pain");
  const disciplineGuides = GUIDES.filter((guide) => guide.cluster === "discipline");

  return (
    <div className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
          <Card className="dashboard-card-surface overflow-hidden border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_92%,var(--primary)_8%)]">
            <CardContent className="p-8 sm:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)]">
                <BookOpen className="h-3.5 w-3.5" />
                {isNl ? "Praktische gidsen" : "Practical guides"}
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-5xl">
                {isNl ? "Bikefitting gidsen" : "Bike Fitting Guides"}
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-[color:var(--muted-foreground)]">
                {isNl
                  ? "Gebruik deze gidsen om sneller de juiste afstellingen te kiezen voor jouw klachten of discipline."
                  : "Use these guides to choose better setup priorities for your pain points or cycling discipline."}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
                    {isNl ? "Klachten" : "Pain"}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-[color:var(--foreground)]">
                    {painGuides.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
                    {isNl ? "Disciplines" : "Disciplines"}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-[color:var(--foreground)]">
                    {disciplineGuides.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
                    {isNl ? "Uitkomst" : "Outcome"}
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-[color:var(--foreground)]">
                    {isNl ? "Sneller kiezen wat eerst aangepast moet worden." : "Faster priority decisions before you start changing hardware."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card-surface overflow-hidden border-[color:var(--border)] bg-[linear-gradient(160deg,color-mix(in_oklch,var(--primary)_12%,var(--card)_88%),color-mix(in_oklch,var(--warning)_10%,var(--card)_90%))]">
            <CardContent className="flex h-full flex-col justify-between p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)]">
                  {isNl ? "Zo gebruik je deze hub" : "How to use this hub"}
                </p>
                <div className="mt-5 space-y-4">
                  <div className="flex items-start gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)]/80 p-4">
                    <HeartPulse className="mt-0.5 h-5 w-5 text-[color:var(--warning)]" />
                    <div>
                      <p className="font-semibold text-[color:var(--foreground)]">
                        {isNl ? "Start bij je klacht" : "Start with your pain point"}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[color:var(--muted-foreground)]">
                        {isNl ? "Gebruik pijn-gidsen om snel te zien welke afstellingen meestal het meeste verschil maken." : "Use pain guides to identify which setup changes usually matter first."}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)]/80 p-4">
                    <Mountain className="mt-0.5 h-5 w-5 text-[color:var(--primary)]" />
                    <div>
                      <p className="font-semibold text-[color:var(--foreground)]">
                        {isNl ? "Of kies je discipline" : "Or choose your discipline"}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[color:var(--muted-foreground)]">
                        {isNl ? "Vergelijk race, gravel, MTB en triathlon vanuit houding, controle en prestatiedoel." : "Compare road, gravel, MTB, and triathlon through posture, control, and performance goals."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--background)]/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[color:var(--primary-soft)] p-2 text-[color:var(--primary)]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-[color:var(--foreground)]">
                    {isNl ? "Elke gids eindigt met een directe stap richting calculator of volledige fitflow." : "Every guide ends with a direct next step into the calculator or full fit flow."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <ClusterCard
            icon={<HeartPulse className="h-5 w-5" />}
            title={isNl ? "Pijn eerst oplossen" : "Solve discomfort first"}
            description={
              isNl
                ? "Snelle referentie voor knie-, rug-, nek- en handklachten."
                : "Fast references for knee, back, neck, and hand discomfort."
            }
          />
          <ClusterCard
            icon={<Gauge className="h-5 w-5" />}
            title={isNl ? "Prioriteiten per discipline" : "Priorities by discipline"}
            description={
              isNl
                ? "Krijg context voor race, gravel, MTB en triathlon zonder tekstmuren."
                : "Get road, gravel, MTB, and triathlon context without reading through dense text walls."
            }
          />
          <ClusterCard
            icon={<ArrowRight className="h-5 w-5" />}
            title={isNl ? "Van gids naar actie" : "From guide to action"}
            description={
              isNl
                ? "Gebruik gidsen als filter en ga daarna door naar je calculator of volledige fit."
                : "Use guides as a filter, then move into the calculator or full fit flow."
            }
          />
        </section>

        <section className="mt-14">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)]">
                {isNl ? "Cluster 01" : "Cluster 01"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--foreground)]">
                {getGuideClusterLabel("pain", locale)}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)]">
                {isNl
                  ? "Gebruik deze gidsen als snelle triage voor klachten die je op de fiets blijft voelen."
                  : "Use these guides as fast triage when recurring discomfort keeps showing up on the bike."}
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {painGuides.map((guide) => {
              const copy = getGuideCopy(guide, locale);
              return (
                <article
                  key={guide.slug}
                  className="group rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-2xl bg-[color:var(--warning)]/14 p-3 text-[color:var(--warning)]">
                      <HeartPulse className="h-5 w-5" />
                    </div>
                    <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--secondary)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
                      {isNl ? "Klachtgids" : "Pain guide"}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-[color:var(--foreground)]">
                    {copy.cardTitle}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">
                    {copy.cardDescription}
                  </p>
                  <Link
                    href={withLocalePrefix(`/guides/${guide.slug}`, locale)}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--primary)]"
                  >
                    {isNl ? "Lees gids" : "Read guide"}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-14">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)]">
                {isNl ? "Cluster 02" : "Cluster 02"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--foreground)]">
                {getGuideClusterLabel("discipline", locale)}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)]">
                {isNl
                  ? "Vergelijk discipline-specifieke posities, belasting en praktische afstelkeuzes."
                  : "Compare discipline-specific positions, loading patterns, and setup tradeoffs."}
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {disciplineGuides.map((guide) => {
              const copy = getGuideCopy(guide, locale);
              return (
                <article
                  key={guide.slug}
                  className="group rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-2xl bg-[color:var(--primary-soft)] p-3 text-[color:var(--primary)]">
                      <Mountain className="h-5 w-5" />
                    </div>
                    <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--secondary)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
                      {isNl ? "Discipline" : "Discipline"}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-[color:var(--foreground)]">
                    {copy.cardTitle}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">
                    {copy.cardDescription}
                  </p>
                  <Link
                    href={withLocalePrefix(`/guides/${guide.slug}`, locale)}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--primary)]"
                  >
                    {isNl ? "Lees gids" : "Read guide"}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-14 rounded-[2rem] bg-[linear-gradient(160deg,color-mix(in_oklch,var(--primary)_92%,black_8%),color-mix(in_oklch,var(--primary)_72%,var(--warning)_28%))] p-8 text-center shadow-sm sm:p-10">
          <h2 className="text-2xl font-bold text-[color:var(--primary-foreground)] sm:text-3xl">
            {isNl ? "Klaar voor je volgende fitstap?" : "Ready for your next fit step?"}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[color:var(--primary-foreground)]/84 sm:text-base">
            {isNl
              ? "Start gratis en bekijk afstelbegeleiding die past bij jouw lichaam, doelen en rijstijl."
              : "Start free and review setup guidance matched to your body, goals, and riding style."}
          </p>
          <Button
            render={
              <TrackedCtaLink
                href={withLocalePrefix("/login", locale)}
                locale={locale}
                pagePath={pagePath}
                section="hub_final_cta"
                ctaLabel={isNl ? "Start gratis fit" : "Start Free Fit"}
              />
            }
            size="lg"
            className="mt-6 bg-[color:var(--background)] text-[color:var(--primary)] hover:bg-[color:var(--muted)]"
          >
            {isNl ? "Start gratis fit" : "Start Free Fit"}
          </Button>
        </section>
      </div>
    </div>
  );
}
