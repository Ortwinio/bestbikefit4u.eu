import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { PublicCtaBand } from "@/components/public";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";

type GuideMidPageCtaProps = {
  funnel?: string;
  cluster: string;
  locale: Locale;
  pagePath: string;
  slug: string;
};

function resolveMidPageDescription(cluster: string, locale: Locale) {
  const normalized = cluster.toLowerCase();

  if (locale === "nl") {
    if (normalized.includes("pain & discomfort")) {
      return "Je begrijpt nu waarom dit symptoom ontstaat. Gebruik de gratis fit om te controleren of jouw maten in de juiste range zitten.";
    }
    if (normalized.includes("ride types")) {
      return "Je rijstijl bepaalt je fitprioriteiten. Gebruik de gratis fit om dat te vertalen naar concrete cijfers en keuzes.";
    }
    if (normalized.includes("setup parameters")) {
      return "Parameters krijgen pas betekenis wanneer ze gekoppeld zijn aan jouw lichaam. Start je fit voor richtwaarden die bij jou passen.";
    }
    if (normalized.includes("shoe") || normalized.includes("cleat")) {
      return "Schoen- en cleatsetup grijpen in op de rest van je fit. De dashboardflow helpt je dat stap voor stap te controleren.";
    }

    return "Gebruik de gratis fit om deze richtlijnen te koppelen aan jouw lichaam, fiets en volgende logische aanpassing.";
  }

  if (normalized.includes("pain & discomfort")) {
    return "You now understand why this symptom happens. Use the free fit to check whether your numbers are in the right range.";
  }
  if (normalized.includes("ride types")) {
    return "Your riding style shapes your fit priorities. Use the free fit to translate that into concrete numbers.";
  }
  if (normalized.includes("setup parameters")) {
    return "Parameters only make sense when they are connected to your anatomy. Start your fit to get numbers that belong to you.";
  }
  if (normalized.includes("shoe") || normalized.includes("cleat")) {
    return "Shoe and cleat setup interact with every other fit variable. The dashboard flow helps you check them in a guided order.";
  }

  return "Use the free fit to connect these guidelines to your body, your bike, and the next change that actually matters.";
}

export async function GuideMidPageCta({
  funnel,
  cluster,
  locale,
  pagePath,
  slug,
}: GuideMidPageCtaProps) {
  const isNl = locale === "nl";
  const isAuthenticated = await isAuthenticatedNextjs();
  const href = isAuthenticated
    ? withLocalePrefix("/dashboard", locale)
    : withLocalePrefix(`/login?from=guide&slug=${encodeURIComponent(slug)}`, locale);
  const ctaLabel = isAuthenticated
    ? isNl
      ? "Open je fitdashboard"
      : "Open your fit dashboard"
    : "Start Free Fit";
  const showValueBullets = (funnel ?? "MOFU").toUpperCase() !== "TOFU";

  return (
    <PublicCtaBand
      eyebrow={isNl ? "Volgende stap" : "Next step"}
      title={
        isNl
          ? "Zet deze gids om in je eigen fit"
          : "Turn this guide into your own fit setup"
      }
      description={resolveMidPageDescription(cluster, locale)}
      actions={
        <Button
          render={
            <TrackedCtaLink
              href={href}
              locale={locale}
              pagePath={pagePath}
              section="guide_mid_page_cta"
              ctaLabel={ctaLabel}
            />
          }
        >
          {ctaLabel}
        </Button>
      }
      aside={
        showValueBullets ? (
          <div className="space-y-2">
            <p className="font-semibold text-foreground">
              {isNl ? "Wat je krijgt met een gratis account:" : "What you get with a free account:"}
            </p>
            <ul className="space-y-1">
              {[
                isNl ? "Je persoonlijke fitmetingen opgeslagen" : "Your personal fit measurements stored",
                isNl ? "Richtwaarden voor zadelhoogte, reach en framemaat" : "Saddle height, reach, and frame-size starting points",
                isNl ? "Gekoppeld aan je fiets voor praktische vervolgstappen" : "Connected to your bike for practical next steps",
                isNl ? "Gratis. Geen creditcard. Klaar in ongeveer 10 minuten." : "Free. No credit card. Takes about 10 minutes.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            {isNl ? "Werk vanuit gemeten context" : "Work from measured context"}
            <ChevronRight className="h-4 w-4" />
          </span>
        )
      }
    />
  );
}
