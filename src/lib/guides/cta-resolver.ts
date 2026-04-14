import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";

export type GuideSoftTool = {
  label: string;
  href: string;
} | null;

export type GuideCtaZoneCopy = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

function normalizeCluster(cluster: string) {
  return cluster.trim().toLowerCase();
}

function buildGuideLoginHref(slug: string, locale: Locale) {
  return withLocalePrefix(`/login?from=guide&slug=${encodeURIComponent(slug)}`, locale);
}

export function resolveSoftCtaTool(
  cluster: string,
  slug: string,
  locale: Locale
): GuideSoftTool {
  const labels = {
    saddleHeight: locale === "nl" ? "zadelhoogte calculator" : "saddle height calculator",
    saddleWidth: locale === "nl" ? "zadelbreedte calculator" : "saddle width calculator",
    bikeFit: locale === "nl" ? "bike fit calculator" : "bike fit calculator",
    frameSize: locale === "nl" ? "framemaat calculator" : "frame size calculator",
  };

  if (slug === "saddle-height-guide") {
    return {
      label: labels.saddleHeight,
      href: withLocalePrefix("/calculators/saddle-height", locale),
    };
  }

  if (slug.startsWith("saddle-width-")) {
    return {
      label: labels.saddleWidth,
      href: withLocalePrefix("/calculators/saddle-width", locale),
    };
  }

  if (slug === "reach-and-stem-guide" || slug === "crank-length-guide") {
    return {
      label: labels.bikeFit,
      href: withLocalePrefix("/calculators/bike-fit", locale),
    };
  }

  if (slug.includes("frame-size") || slug.includes("bike-size")) {
    return {
      label: labels.frameSize,
      href: withLocalePrefix("/calculators/frame-size", locale),
    };
  }

  const normalizedCluster = normalizeCluster(cluster);
  if (
    normalizedCluster.includes("pain & discomfort") ||
    normalizedCluster.includes("ride types")
  ) {
    return {
      label: labels.bikeFit,
      href: withLocalePrefix("/calculators/bike-fit", locale),
    };
  }

  return null;
}

export function resolveClosingCtaCopy(
  funnel: "TOFU" | "MOFU" | "BOFU" | string,
  cluster: string,
  locale: Locale,
  slug = "guides"
): GuideCtaZoneCopy {
  const normalizedFunnel = funnel.toUpperCase();
  const clusterLower = normalizeCluster(cluster);

  if (locale === "nl") {
    if (normalizedFunnel === "TOFU") {
      return {
        title: "Start met een gratis fit voor je iets groots verandert",
        description: clusterLower.includes("ride")
          ? "Je rijstijl bepaalt wat belangrijk is. Start een gratis fit om die context te vertalen naar concrete setupkeuzes."
          : "Gebruik de gratis fit om je positie eerst te begrijpen voordat je onderdelen of houding verandert.",
        ctaLabel: "Start Free Fit",
        ctaHref: buildGuideLoginHref(slug, locale),
      };
    }

    if (normalizedFunnel === "BOFU") {
      return {
        title: "Pas dit toe op je eigen fiets en maten",
        description:
          "Voer je metingen in en verbind deze principes aan jouw fiets, zodat je werkt vanuit een volledig fitbeeld in plaats van losse regels.",
        ctaLabel: "Start Free Fit",
        ctaHref: buildGuideLoginHref(slug, locale),
      };
    }

    return {
      title: "Controleer je persoonlijke setup gratis",
      description:
        "Je begrijpt nu waarom dit probleem ontstaat. Gebruik de gratis fit om te controleren of jouw cijfers en contactpunten in de juiste range zitten.",
      ctaLabel: "Start Free Fit",
      ctaHref: buildGuideLoginHref(slug, locale),
    };
  }

  if (normalizedFunnel === "TOFU") {
    return {
      title: "Start with a free fit before you change anything major",
      description: clusterLower.includes("ride")
        ? "Your riding style changes what matters most. Start a free fit to turn that context into concrete setup priorities."
        : "Use the free fit to understand your position before you start changing hardware or posture.",
      ctaLabel: "Start Free Fit",
      ctaHref: buildGuideLoginHref(slug, locale),
    };
  }

  if (normalizedFunnel === "BOFU") {
    return {
      title: "Apply this to your own bike and numbers",
      description:
        "Enter your measurements, connect them to your bike, and turn these principles into a complete fit picture instead of isolated rules.",
      ctaLabel: "Start Free Fit",
      ctaHref: buildGuideLoginHref(slug, locale),
    };
  }

  return {
    title: "Get your personal setup checked for free",
    description:
      "You now understand why this happens. Use the free fit to check whether your numbers and contact points are in the right range.",
    ctaLabel: "Start Free Fit",
    ctaHref: buildGuideLoginHref(slug, locale),
  };
}
