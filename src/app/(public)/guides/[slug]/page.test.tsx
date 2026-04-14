/* @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GuidePage from "./page";

let locale: "en" | "nl" = "en";
let isPreview = false;
let isAuthenticated = false;

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => <img src={src} alt={alt} {...props} />,
}));

vi.mock("next/headers", () => ({
  draftMode: () => Promise.resolve({ isEnabled: isPreview, enable: vi.fn(), disable: vi.fn() }),
}));

vi.mock("@convex-dev/auth/nextjs/server", () => ({
  isAuthenticatedNextjs: () => Promise.resolve(isAuthenticated),
}));

vi.mock("@/components/prototyper-ui/ui/button", () => ({
  Button: ({
    children,
    render,
    ...props
  }: {
    children?: React.ReactNode;
    render?: React.ReactElement;
    [key: string]: unknown;
  }) =>
    render
      ? React.cloneElement(render, props, children)
      : <button {...props}>{children}</button>,
}));

vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({
    href,
    children,
    section,
    ctaLabel,
    locale: _locale,
    pagePath: _pagePath,
    conversionKey: _conversionKey,
    ...props
  }: {
    href: string;
    children?: React.ReactNode;
    section: string;
    ctaLabel: string;
    locale?: string;
    pagePath?: string;
    conversionKey?: string;
    [key: string]: unknown;
  }) => (
    <a href={href} data-section={section} data-cta-label={ctaLabel} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/content/GuideMidPageCta", () => ({
  GuideMidPageCta: ({
    funnel,
    cluster,
    locale: activeLocale,
    slug,
  }: {
    funnel?: string;
    cluster: string;
    locale: "en" | "nl";
    slug: string;
  }) => {
    const isNl = activeLocale === "nl";
    const isHubCluster = cluster === "Ride Types";
    const description = isHubCluster
      ? isNl
        ? "Je rijstijl bepaalt je fitprioriteiten. Gebruik de gratis fit om dat te vertalen naar concrete cijfers en keuzes."
        : "Your riding style shapes your fit priorities. Use the free fit to translate that into concrete numbers."
      : isNl
        ? "Je begrijpt nu waarom dit symptoom ontstaat. Gebruik de gratis fit om te controleren of jouw maten in de juiste range zitten."
        : "You now understand why this symptom happens. Use the free fit to check whether your numbers are in the right range.";
    const label = isAuthenticated
      ? isNl
        ? "Open je fitdashboard"
        : "Open your fit dashboard"
      : "Start Free Fit";
    const href = isAuthenticated
      ? `/${activeLocale}/dashboard`
      : `/${activeLocale}/login?from=guide&slug=${slug}`;

    return (
      <section>
        <h2>
          {isNl
            ? "Zet deze gids om in je eigen fit"
            : "Turn this guide into your own fit setup"}
        </h2>
        <p>{description}</p>
        <a href={href} data-section="guide_mid_page_cta" data-funnel={funnel}>
          {label}
        </a>
      </section>
    );
  },
}));

vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: () => null,
}));

vi.mock("@/i18n/request", () => ({
  getRequestLocale: () => Promise.resolve(locale),
}));

vi.mock("@/i18n/metadata", () => ({
  buildLocaleAlternates: (path: string, currentLocale: string) => ({
    canonical: `https://bestbikefit4u.eu/${currentLocale}${path}`,
  }),
}));

vi.mock("@/lib/seo/jsonLd", () => ({
  buildArticleSchema: () => ({}),
  buildBreadcrumbListSchema: () => ({}),
  buildFaqPageSchema: () => ({}),
}));

vi.mock("@/lib/guides/content", () => ({
  buildHubIntro: () => ["Hub intro copy"],
  getGuideContent: (slug: string) =>
    slug === "fallback-guide"
      ? {
          en: {
            heroIntro: "Fallback hero intro",
            ctaDescription: "Fallback CTA description",
          },
          nl: {
            heroIntro: "Fallback hero intro nl",
            ctaDescription: "Fallback CTA description nl",
          },
        }
      : undefined,
  getGuideLinkLabel: (href: string, activeLocale: string) =>
    `${activeLocale}:${href.replace(/^\/(en|nl)/, "")}`,
  getGuidePageData: (slug: string, activeLocale: string) =>
    Promise.resolve(makeGuidePageData(slug, activeLocale as "en" | "nl")),
  listPublishedGuideRecords: () => Promise.resolve([]),
  relatedLinkDescription: (activeLocale: string) =>
    activeLocale === "nl"
      ? "Open de volgende relevante pagina."
      : "Open the next relevant page.",
}));

function makeGuidePageData(slug: string, activeLocale: "en" | "nl") {
  const isNl = activeLocale === "nl";

  if (slug === "ride-types") {
    return {
      source: "db",
      dbGuide: {
        canonicalUrl: undefined,
        metaDescription: { en: "Ride types desc", nl: "Ride types desc nl" },
        ogTitle: undefined,
        ogDescription: undefined,
        ogImageUrl: undefined,
        ogImageAlt: undefined,
        robotsIndex: true,
        heroImagePublicPath: "/guides/media/009--guides--ride-types-hero.png",
        featuredImageAlt: { en: "Ride types hero", nl: "Ride types hero nl" },
        libraryBody: {
          en: "Hub markdown",
          nl: "Hub markdown nl",
        },
        seoHints: { funnel: "TOFU" },
      },
      entry: {
        cluster: "Ride Types",
        path: "/guides/ride-types",
        slug: "ride-types",
        pageTitle: isNl ? "Rijstijlen" : "Ride types",
        metaTitle: isNl ? "Rijstijlen" : "Ride types",
        h1: isNl ? "Rijstijlen" : "Ride types",
        pageBrief: isNl ? "Vind de juiste discipline." : "Find the right discipline.",
        primaryCtaLabel: "Start Free Fit",
        primaryCtaTarget: "/login",
        internalLinkTargets: ["/guides/endurance-bike-fit-guide"],
        order: 1,
        notes: "",
        status: "published",
      },
      childPages: [
        {
          cluster: "Ride Types",
          path: "/guides/endurance-bike-fit-guide",
          slug: "endurance-bike-fit-guide",
          pageTitle: isNl ? "Endurance gids" : "Endurance guide",
          metaTitle: "",
          h1: "",
          pageBrief: isNl ? "Lange ritten." : "Long rides.",
          primaryCtaLabel: "",
          primaryCtaTarget: "",
          internalLinkTargets: [],
          order: 2,
          notes: "",
          status: "published",
        },
      ],
      isHub: true,
      faqs: [],
      leafSections: [],
      quickAnswer: {
        keyTakeaway: "",
        commonMistake: "",
        payAttention: "",
      },
      hubQuickAnswer: {
        keyTakeaway: "Hub key takeaway",
        commonMistake: "Hub common mistake",
        payAttention: "Hub pay attention",
      },
    };
  }

  if (slug === "nutrition-and-hydration") {
    return {
      source: "db",
      dbGuide: {
        canonicalUrl: undefined,
        metaDescription: { en: "Nutrition desc", nl: "Nutrition desc nl" },
        ogTitle: undefined,
        ogDescription: undefined,
        ogImageUrl: undefined,
        ogImageAlt: undefined,
        robotsIndex: true,
        heroImagePublicPath: "/guides/media/nutrition.png",
        featuredImageAlt: { en: "Nutrition hero", nl: "Nutrition hero nl" },
        libraryBody: {
          en: `Intro\n\n## Quick answer\n\n**Key takeaway:** Fuel first.\n\n**Most common mistake:** Guessing.\n\n**Who should pay extra attention:** riders fading late.\n\n## Core\n\nNutrition body.\n\n## FAQ\n\n### Is this about fit?\n\nNo.`,
          nl: `Intro\n\n## Quick answer\n\n**Key takeaway:** Voeding eerst.\n\n**Most common mistake:** Gissen.\n\n**Who should pay extra attention:** rijders die laat wegvallen.\n\n## Core\n\nVoedingsbody.\n\n## FAQ\n\n### Gaat dit over fit?\n\nNee.`,
        },
        seoHints: { funnel: "TOFU" },
      },
      entry: {
        cluster: "Nutrition & Hydration",
        path: "/guides/nutrition-and-hydration",
        slug: "nutrition-and-hydration",
        pageTitle: "Nutrition",
        metaTitle: "Nutrition",
        h1: isNl ? "Voeding" : "Nutrition",
        pageBrief: isNl ? "Voeding context." : "Nutrition context.",
        primaryCtaLabel: "Start Free Fit",
        primaryCtaTarget: "/login",
        internalLinkTargets: ["/guides/cycling-fueling-basics"],
        order: 1,
        notes: "",
        status: "published",
      },
      childPages: [],
      isHub: false,
      faqs: [],
      leafSections: [],
      quickAnswer: {
        keyTakeaway: "",
        commonMistake: "",
        payAttention: "",
      },
      hubQuickAnswer: {
        keyTakeaway: "",
        commonMistake: "",
        payAttention: "",
      },
    };
  }

  if (slug === "fallback-guide") {
    return {
      source: "fallback",
      dbGuide: null,
      entry: {
        cluster: "Setup Parameters",
        path: "/guides/fallback-guide",
        slug: "fallback-guide",
        pageTitle: "Fallback guide",
        metaTitle: "Fallback guide",
        h1: isNl ? "Fallback gids" : "Fallback guide",
        pageBrief: isNl ? "Fallback kort." : "Fallback brief.",
        primaryCtaLabel: "Start Free Fit",
        primaryCtaTarget: "/login",
        internalLinkTargets: ["/guides/saddle-height-guide"],
        order: 1,
        notes: "",
        status: "published",
      },
      childPages: [],
      isHub: false,
      faqs: [
        {
          q: isNl ? "Fallback vraag?" : "Fallback question?",
          a: isNl ? "Fallback antwoord." : "Fallback answer.",
        },
      ],
      leafSections: [
        {
          title: isNl ? "Fallback sectie" : "Fallback section",
          type: "prose" as const,
          items: [isNl ? "Fallback inhoud." : "Fallback content."],
        },
      ],
      quickAnswer: {
        keyTakeaway: isNl ? "Fallback inzicht" : "Fallback takeaway",
        commonMistake: isNl ? "Fallback fout" : "Fallback mistake",
        payAttention: isNl ? "Fallback let op" : "Fallback pay attention",
      },
      hubQuickAnswer: {
        keyTakeaway: "",
        commonMistake: "",
        payAttention: "",
      },
    };
  }

  const markdownEn = `Knee pain intro.

## Quick answer

**Key takeaway:** most fit-related knee pain comes from overload.

**Most common mistake:** changing several things at once.

**Who should pay extra attention:**
- riders with one-sided pain
- riders who changed cleats

## Symptom matrix

| Pain pattern | What to check first |
|---|---|
| Front of knee | Saddle height |

### Saddle too low

This often increases front-of-knee load with **heavy gears**.

- check saddle height
- test one change

See [bike fit methods](/en/science/bike-fit-methods).

## FAQ

### Can bike fit cause knee pain?

Yes, especially when load and position interact.

[Start Free Fit](/en/login)`;
  const markdownNl = `Kniepijn intro.

## Quick answer

**Key takeaway:** kniepijn komt vaak door overbelasting.

**Most common mistake:** meerdere dingen tegelijk aanpassen.

**Who should pay extra attention:**
- rijders met eenzijdige pijn
- rijders met nieuwe cleats

## Symptoommatrix

| Pijnpatroon | Eerst checken |
|---|---|
| Voorkant knie | Zadelhoogte |

### Zadel te laag

Dit verhoogt vaak de belasting met **zware versnellingen**.

- check zadelhoogte
- test één wijziging

Zie [bike fit methods](/nl/science/bike-fit-methods).

## FAQ

### Kan bike fit kniepijn veroorzaken?

Ja, vooral wanneer belasting en positie samenkomen.

[Start Free Fit](/nl/login)`;

  return {
    source: "db",
    dbGuide: {
      canonicalUrl: undefined,
      metaDescription: { en: "Knee pain desc", nl: "Kniepijn desc" },
      ogTitle: undefined,
      ogDescription: undefined,
      ogImageUrl: undefined,
      ogImageAlt: undefined,
      robotsIndex: true,
      heroImagePublicPath: "/guides/media/003--guides--bike-fitting-for-knee-pain-hero.png",
      featuredImageAlt: { en: "Knee pain hero", nl: "Kniepijn hero" },
      libraryBody: { en: markdownEn, nl: markdownNl },
      seoHints: { funnel: "MOFU" },
    },
    entry: {
      cluster: "Pain & Discomfort",
      path: "/guides/bike-fitting-for-knee-pain",
      slug: "bike-fitting-for-knee-pain",
      pageTitle: "Bike fitting for knee pain",
      metaTitle: "Bike fitting for knee pain",
      h1: isNl
        ? "Bike Fit voor kniepijn: oorzaken en eerste aanpassingen"
        : "Bike Fit for Knee Pain: Causes and First Adjustments",
      pageBrief: isNl
        ? "Legt de belangrijkste fittriggers voor kniepijn uit."
        : "Explains the main fit triggers for knee pain.",
      primaryCtaLabel: "Start Free Fit",
      primaryCtaTarget: "/login",
      internalLinkTargets: [
        "/guides/saddle-height-guide",
        "/science/bike-fit-methods",
      ],
      order: 1,
      notes: "",
      status: "published",
    },
    childPages: [],
    isHub: false,
    faqs: [],
    leafSections: [],
    quickAnswer: {
      keyTakeaway: "",
      commonMistake: "",
      payAttention: "",
    },
    hubQuickAnswer: {
      keyTakeaway: "",
      commonMistake: "",
      payAttention: "",
    },
  };
}

beforeEach(() => {
  locale = "en";
  isPreview = false;
  isAuthenticated = false;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("guide page template redesign", () => {
  it("renders hero, extracted quick answer, markdown body, faq accordion, related links, and all cta zones for a db guide", async () => {
    const ui = await GuidePage({
      params: Promise.resolve({ slug: "bike-fitting-for-knee-pain" }),
      searchParams: Promise.resolve({}),
    });
    render(ui);

    expect(screen.getByAltText("Knee pain hero")).toBeTruthy();
    expect(screen.getByText("Key takeaway")).toBeTruthy();
    expect(screen.getByText(/most fit-related knee pain comes from overload/i)).toBeTruthy();
    expect(screen.getByText("Symptom matrix")).toBeTruthy();
    expect(screen.getByText("Saddle too low")).toBeTruthy();
    expect(screen.getByText("heavy gears")).toBeTruthy();
    expect(screen.getByText("Front of knee")).toBeTruthy();
    expect(screen.getByText("Saddle height")).toBeTruthy();
    expect(screen.getByRole("link", { name: "bike fit methods" }).getAttribute("href")).toBe(
      "/en/science/bike-fit-methods"
    );

    expect(screen.getByText("While you read")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /open calculator/i }).getAttribute("data-section")
    ).toBe("guide_soft_tool_cta");
    expect(screen.getByText("Turn this guide into your own fit setup")).toBeTruthy();
    const startFreeFitLinks = screen.getAllByRole("link", { name: "Start Free Fit" });
    expect(startFreeFitLinks[0]?.getAttribute("data-section")).toBe("guide_mid_page_cta");
    expect(startFreeFitLinks.at(-1)?.getAttribute("href")).toContain(
      "/en/login?from=guide&slug=bike-fitting-for-knee-pain"
    );
    expect(startFreeFitLinks.at(-1)?.getAttribute("data-section")).toBe(
      "guide_closing_cta"
    );

    expect(screen.getByText("Can bike fit cause knee pain?")).toBeTruthy();
    expect(screen.queryByText(/load and position interact/i)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /can bike fit cause knee pain/i }));
    expect(screen.getByText(/load and position interact/i)).toBeTruthy();

    expect(screen.getByText("en:/guides/saddle-height-guide")).toBeTruthy();
  });

  it("renders zone a on saddle-height-like guides but not on hubs or nutrition guides, and uses funnel-aware hub copy", async () => {
    let ui = await GuidePage({
      params: Promise.resolve({ slug: "ride-types" }),
      searchParams: Promise.resolve({}),
    });
    const { rerender } = render(ui);

    expect(screen.queryByText("While you read")).toBeNull();
    expect(screen.getByText(/your riding style shapes your fit priorities/i)).toBeTruthy();

    ui = await GuidePage({
      params: Promise.resolve({ slug: "nutrition-and-hydration" }),
      searchParams: Promise.resolve({}),
    });
    rerender(ui);
    expect(screen.queryByText("While you read")).toBeNull();

    ui = await GuidePage({
      params: Promise.resolve({ slug: "bike-fitting-for-knee-pain" }),
      searchParams: Promise.resolve({}),
    });
    rerender(ui);
    expect(screen.getByText("While you read")).toBeTruthy();
  });

  it("renders dutch content and keeps fallback typescript guides working", async () => {
    locale = "nl";

    let ui = await GuidePage({
      params: Promise.resolve({ slug: "bike-fitting-for-knee-pain" }),
      searchParams: Promise.resolve({}),
    });
    const { rerender } = render(ui);

    expect(screen.getByText("Gids")).toBeTruthy();
    expect(screen.getByText(/bike fit voor kniepijn/i)).toBeTruthy();
    expect(screen.getByText("Kniepijn intro.")).toBeTruthy();

    ui = await GuidePage({
      params: Promise.resolve({ slug: "fallback-guide" }),
      searchParams: Promise.resolve({}),
    });
    rerender(ui);

    expect(screen.getByText("Fallback gids")).toBeTruthy();
    expect(screen.getByText("Fallback inhoud.")).toBeTruthy();
    expect(screen.getByText("Fallback vraag?")).toBeTruthy();
    expect(screen.getByText("Fallback CTA description nl")).toBeTruthy();
  });
});
