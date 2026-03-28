import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowRight, Compass, Gauge, HeartPulse, type LucideIcon } from "lucide-react";
import { Button, Card, CardContent, type ButtonProps } from "@/components/ui";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { USE_CASES, getUseCaseCopy } from "./data";

function linkButtonProps(href: string): ButtonProps {
  return {
    render: <Link href={href} />,
    nativeButton: false,
  } as ButtonProps;
}

function getUseCaseIcon(slug: string): LucideIcon {
  if (slug.includes("pain") || slug.includes("back")) return HeartPulse;
  if (slug.includes("endurance") || slug.includes("performance")) return Gauge;
  if (slug.includes("triathlon") || slug.includes("gravel")) return Compass;
  return Activity;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";

  return {
    title: isNl
      ? "Bikefit use cases voor klachten en rijstijlen | BestBikeFit4U"
      : "Bike Fit Use Cases for Pain Points and Riding Styles | BestBikeFit4U",
    description: isNl
      ? "Bekijk use cases voor bikefit bij duurritten, rugklachten, triathlon, gravel, MTB en meer."
      : "Explore bike-fit use cases for endurance riding, back pain, triathlon, gravel, MTB, and more.",
    keywords: isNl
      ? ["bikefit use cases", "rugklachten fietsen", "triathlon bikefit"]
      : ["bike fit use cases", "cycling back pain", "triathlon bike fit"],
    alternates: buildLocaleAlternates("/use-cases", locale),
  };
}

export default async function UseCasesIndexPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix("/use-cases", locale);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
          <Card className="dashboard-card-surface border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_92%,var(--primary)_8%)]">
            <CardContent className="p-8 sm:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)]">
                <Compass className="h-3.5 w-3.5" />
                {isNl ? "Scenario-bibliotheek" : "Scenario library"}
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-5xl">
                {isNl ? "Bikefit use cases" : "Bike Fit Use Cases"}
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-[color:var(--muted-foreground)]">
                {isNl
                  ? "Gebruik deze scenario-pagina's om sneller te bepalen welke fit-aanpassingen en calculators voor jouw situatie relevant zijn."
                  : "Use these scenario pages to identify which fit priorities and calculators matter most for your riding situation."}
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
                    {isNl ? "Use cases" : "Use cases"}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-[color:var(--foreground)]">{USE_CASES.length}</p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
                    {isNl ? "Gebruik" : "Best use"}
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-[color:var(--foreground)]">
                    {isNl ? "Kies eerst de situatie die het meest lijkt op jouw ritten." : "Start with the scenario that feels closest to your actual riding."}
                  </p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
                    {isNl ? "Volgende stap" : "Next step"}
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-[color:var(--foreground)]">
                    {isNl ? "Ga daarna door naar calculator of volledige fit." : "Then move into the calculator or complete fit workflow."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card-surface overflow-hidden border-[color:var(--border)] bg-[linear-gradient(160deg,color-mix(in_oklch,var(--primary)_12%,var(--card)_88%),color-mix(in_oklch,var(--warning)_10%,var(--card)_90%))]">
            <CardContent className="flex h-full flex-col justify-between p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)]">
                  {isNl ? "Hoe te lezen" : "How to read these pages"}
                </p>
                <div className="mt-5 space-y-3">
                  {[
                    {
                      icon: Activity,
                      title: isNl ? "Herken de situatie" : "Recognize the situation",
                      body: isNl ? "Elke pagina vertaalt een concreet rijprobleem naar fitkeuzes." : "Each page translates a concrete riding scenario into fit priorities.",
                    },
                    {
                      icon: Gauge,
                      title: isNl ? "Filter op prioriteit" : "Filter by priority",
                      body: isNl ? "Zo zie je sneller of houding, comfort of prestaties voorrang hebben." : "See faster whether posture, comfort, or performance should lead the next step.",
                    },
                    {
                      icon: ArrowRight,
                      title: isNl ? "Ga door naar berekening" : "Move into calculation",
                      body: isNl ? "Gebruik de use case als context, niet als eindpunt." : "Use the scenario as context, not as the final answer.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)]/80 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <item.icon className="mt-0.5 h-5 w-5 text-[color:var(--primary)]" />
                        <div>
                          <p className="font-semibold text-[color:var(--foreground)]">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-[color:var(--muted-foreground)]">{item.body}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {USE_CASES.map((item) => {
            const copy = getUseCaseCopy(item, locale);
            const Icon = getUseCaseIcon(item.slug);

            return (
              <article
                key={item.slug}
                className="group rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl bg-[color:var(--primary-soft)] p-3 text-[color:var(--primary)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--secondary)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                    {isNl ? "Scenario" : "Scenario"}
                  </span>
                </div>
                <h2 className="mt-5 text-xl font-semibold text-[color:var(--foreground)]">{copy.cardTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">{copy.cardDescription}</p>
                <Link
                  href={withLocalePrefix(`/use-cases/${item.slug}`, locale)}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--primary)]"
                >
                  {isNl ? "Bekijk use case" : "View use case"}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </article>
            );
          })}
        </div>

        <section className="mt-14 rounded-[2rem] bg-[linear-gradient(160deg,color-mix(in_oklch,var(--primary)_92%,black_8%),color-mix(in_oklch,var(--primary)_72%,var(--warning)_28%))] p-8 text-center shadow-sm sm:p-10">
          <h2 className="text-2xl font-bold text-[color:var(--primary-foreground)] sm:text-3xl">
            {isNl ? "Wil je je eigen fit laten berekenen?" : "Ready to calculate your own fit?"}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[color:var(--primary-foreground)]/84 sm:text-base">
            {isNl
              ? "Start met de gratis bike fit calculator en ga daarna verder in het dashboard."
              : "Start with the free bike-fit calculator and continue in the dashboard when you need more detail."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              className="bg-[color:var(--background)] text-[color:var(--primary)] hover:bg-[color:var(--muted)]"
              {...linkButtonProps(withLocalePrefix("/calculators/bike-fit", locale))}
            >
              {isNl ? "Open bike fit calculator" : "Open Bike Fit Calculator"}
            </Button>
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/login", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="use_cases_cta"
                  ctaLabel={isNl ? "Start gratis fit" : "Start Free Fit"}
                />
              }
              variant="outline"
              className="border-[color:var(--primary-foreground)] bg-transparent text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary-foreground)]/10"
            >
              {isNl ? "Start gratis fit" : "Start Free Fit"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
