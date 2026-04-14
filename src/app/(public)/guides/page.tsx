import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Compass, FlaskConical, HeartPulse, Ruler } from "lucide-react";
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
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { getGuideBacklog, getGuideChildren } from "@/lib/guides/backlog";
import { buildHubIntro, resolveGuidePrimaryCta } from "@/lib/guides/content";

const CLUSTER_ICONS = [
  HeartPulse,
  Compass,
  Ruler,
  FlaskConical,
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const entry = getGuideBacklog(locale).find((item) => item.slug === "guides");
  const alternates = buildLocaleAlternates("/guides", locale);

  return {
    title: entry?.metaTitle,
    description: entry?.pageBrief,
    openGraph: {
      title: entry?.metaTitle,
      description: entry?.pageBrief,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function GuidesHubPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix("/guides", locale);
  const entry = getGuideBacklog(locale).find((item) => item.slug === "guides");

  if (!entry) {
    return null;
  }

  const primaryCta = resolveGuidePrimaryCta(entry.primaryCtaTarget, locale);

  const clusterHubs = getGuideBacklog(locale).filter(
    (item) =>
      item.path.startsWith("/guides/") &&
      item.slug !== "guides" &&
      getGuideChildren(item.slug, locale).length > 0
  );

  return (
    <PublicPageShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <PublicHero
          eyebrow={isNl ? "Gidsenbibliotheek" : "Guide library"}
          title={entry.h1}
          description={entry.pageBrief}
          chips={
            isNl
              ? [`${clusterHubs.length} hubs`, "EN + NL parity", "Praktische vervolgstappen"]
              : [`${clusterHubs.length} hubs`, "EN + NL parity", "Practical next steps"]
          }
        />

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: isNl ? "Waar deze pagina voor is" : "What this page is for",
            title: isNl
              ? "Gebruik gidsen om sneller te prioriteren"
              : "Use guides to prioritize faster",
            description: buildHubIntro(entry, locale).join(" "),
          }}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <PublicFeatureCard
              icon={<BookOpen className="h-5 w-5" />}
              title={isNl ? "Praktische context" : "Practical context"}
              description={
                isNl
                  ? "Elke hub helpt je sneller bepalen welke fitvraag eerst aandacht verdient."
                  : "Each hub helps you decide faster which fit question deserves attention first."
              }
            />
            <PublicFeatureCard
              icon={<Compass className="h-5 w-5" />}
              title={isNl ? "Van probleem naar route" : "From problem to route"}
              description={
                isNl
                  ? "Gebruik discomfort, rijtype, geometrie of performance als ingang."
                  : "Start from discomfort, ride type, geometry, or performance."
              }
            />
            <PublicFeatureCard
              icon={<ArrowRight className="h-5 w-5" />}
              title={isNl ? "Eén duidelijke CTA" : "One clear CTA"}
              description={
                isNl
                  ? "Lees eerst, open daarna de best passende tool of flow."
                  : "Read first, then open the best matching tool or flow."
              }
            />
          </div>
        </PublicSection>

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: isNl ? "Clusters" : "Clusters",
            title: isNl ? "Verken de gidsen per onderwerp" : "Explore the guide library by topic",
            description: isNl
              ? "Elke hub is geschreven als bruikbare landingspagina, niet als dunne index."
              : "Each hub is written as a useful landing page, not a thin index.",
          }}
        >
          <div className="grid gap-6 md:grid-cols-2">
            {clusterHubs.map((hub, index) => {
              const Icon = CLUSTER_ICONS[index % CLUSTER_ICONS.length];
              const children = getGuideChildren(hub.slug, locale);

              return (
                <PublicSurfaceCard
                  key={hub.slug}
                  title={hub.pageTitle}
                  description={hub.pageBrief}
                  leading={<Icon aria-hidden="true" className="h-5 w-5" />}
                  footer={
                    <Link
                      href={withLocalePrefix(hub.path, locale)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                    >
                      {isNl ? "Open hub" : "Open hub"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  }
                >
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {children.slice(0, 3).map((child) => (
                      <Link
                        key={child.slug}
                        href={withLocalePrefix(child.path, locale)}
                        className="block outline-none hover:text-foreground focus-visible:text-foreground"
                      >
                        {child.pageTitle}
                      </Link>
                    ))}
                  </div>
                </PublicSurfaceCard>
              );
            })}
          </div>
        </PublicSection>

        <PublicCtaBand
          className="mt-12"
          eyebrow={isNl ? "Volgende stap" : "Next step"}
          title={isNl ? "Klaar om je eigen fit te starten?" : "Ready to start your own fit?"}
          description={
            isNl
              ? "Gebruik de gidsen als filter en open daarna je gratis fitflow."
              : "Use the guides as a filter, then open your free fit flow."
          }
          actions={
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix(primaryCta.href, locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="guides_home_cta"
                  ctaLabel={primaryCta.label ?? entry.primaryCtaLabel}
                />
              }
            >
              {primaryCta.label ?? entry.primaryCtaLabel}
            </Button>
          }
        />
      </div>
    </PublicPageShell>
  );
}
