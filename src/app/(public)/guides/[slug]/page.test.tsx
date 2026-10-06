/* @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GuidePage, { generateMetadata, generateStaticParams } from "./page";
import { getGuidePageData, listPublishedGuideRecords } from "@/lib/guides/content";
import { buildArticleSchema, buildBreadcrumbListSchema, buildFaqPageSchema } from "@/lib/seo/jsonLd";
import { getGuideLeafEntries } from "@/lib/guides/backlog";

let locale: "en" | "nl" = "en";
let isPreview = false;
let isAuthenticated = false;
let useRegisteredGuides = false;

// Keep legacy CMS/fallback coverage independent of which slugs have been rewritten.
// The separate registered-route cases below use the real resolver and renderer.
vi.mock("@/lib/guides/rewrites", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/guides/rewrites")>();
  return {
    ...actual,
    resolveGuideRewrite: (...args: Parameters<typeof actual.resolveGuideRewrite>) =>
      useRegisteredGuides ? actual.resolveGuideRewrite(...args) : undefined,
  };
});

vi.mock("../../blog/data", () => ({
  listPublishedBlogPostsForGuidePath: () => Promise.resolve([]),
}));

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
  }) => (
    // Native image is intentional: this test double isolates guide rendering from Next's image optimizer.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
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
    nativeButton: _nativeButton,
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
    canonical: `https://bikefitboost.com/${currentLocale}${path}`,
  }),
}));

vi.mock("@/lib/seo/jsonLd", () => ({
  buildArticleSchema: vi.fn(() => ({})),
  buildPersonSchema: vi.fn((locale: string) => ({ "@type": "Person", name: "Ortwin Verreck",
    url: `https://bikefitboost.com/${locale}/authors/ortwin-verreck` })),
  buildBreadcrumbListSchema: vi.fn(() => ({})),
  buildFaqPageSchema: vi.fn(() => ({})),
}));

vi.mock("../data", () => ({
  getLegacyGuideSeoKeywords: (slug: string, activeLocale: "en" | "nl") => {
    if (slug === "bike-fitting-for-knee-pain") {
      return activeLocale === "nl"
        ? ["bikefitting kniepijn", "kniepijn fietsen afstelling"]
        : ["bike fitting for knee pain", "knee pain cycling fit"];
    }

    if (slug === "fallback-guide") {
      return activeLocale === "nl"
        ? ["fallback gids", "fallback zoekwoord"]
        : ["fallback guide", "fallback keyword"];
    }

    return undefined;
  },
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
  getGuidePageData: vi.fn((slug: string, activeLocale: string) =>
    Promise.resolve(makeGuidePageData(slug, activeLocale as "en" | "nl"))),
  listPublishedGuideRecords: vi.fn(() => Promise.resolve([])),
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
  vi.clearAllMocks();
  locale = "en";
  isPreview = false;
  isAuthenticated = false;
  useRegisteredGuides = false;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("guide page template redesign", () => {
  it.each(["en", "nl"] as const)("keeps CMS hub content, child destinations and working sidebar anchors in %s", async (activeLocale) => {
    locale = activeLocale;
    const { container } = render(await GuidePage({ params: Promise.resolve({ slug: "ride-types" }) }));
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByText(activeLocale === "nl" ? "Hub markdown nl" : "Hub markdown")).toBeTruthy();
    expect(screen.getByText("Hub key takeaway")).toBeTruthy();
    expect(screen.getByRole("link", { name: /^(Open gids|Open guide)$/ }).getAttribute("href")).toBe(`/${activeLocale}/guides/endurance-bike-fit-guide`);
    const navigation = screen.getByRole("navigation", { name: activeLocale === "nl" ? "In deze gids" : "In this guide" });
    for (const link of navigation.querySelectorAll("a")) {
      expect(container.querySelector(link.getAttribute("href")!)).toBeTruthy();
    }
    expect(navigation.querySelector('a[href="#guide-faq"]')).toBeNull();
  });

  it("passes draft IDs only in preview and preserves the exit URL and authenticated CTA", async () => {
    const props = { params: Promise.resolve({ slug: "fallback-guide" }), searchParams: Promise.resolve({ draftId: ["draft-123", "ignored"] }) };
    await GuidePage(props);
    expect(getGuidePageData).toHaveBeenLastCalledWith("fallback-guide", "en", undefined);
    isPreview = true;
    isAuthenticated = true;
    render(await GuidePage(props));
    expect(getGuidePageData).toHaveBeenLastCalledWith("fallback-guide", "en", "draft-123");
    expect(screen.getByRole("link", { name: "Exit preview" }).getAttribute("href")).toBe("/api/preview-exit?slug=fallback-guide&locale=en");
    expect(document.querySelector('[data-section="guide_closing_cta"]')?.getAttribute("href")).toBe("/en/dashboard");
    expect(document.querySelector('[data-section="guide_closing_all_guides"]')?.getAttribute("href")).toBe("/en/guides");
  });

  it.each([
    ["hub CMS", "ride-types", true],
    ["hub fallback", "ride-types", false],
    ["article CMS", "bike-fitting-for-knee-pain", true],
    ["article fallback", "fallback-guide", false],
  ] as const)("renders every sidebar target and existing FAQ content for %s", async (_label, slug, usesCms) => {
    const data = makeGuidePageData(slug, "en");
    data.faqs = [{ q: "Existing fallback question?", a: "Existing fallback answer." }];
    if (usesCms && data.dbGuide) {
      data.dbGuide.libraryBody.en = "Existing CMS body.\n\n## FAQ\n\n### Existing CMS question?\n\nExisting CMS answer.";
    } else {
      data.dbGuide = null;
    }
    vi.mocked(getGuidePageData).mockResolvedValueOnce(data as Awaited<ReturnType<typeof getGuidePageData>>);
    const { container } = render(await GuidePage({ params: Promise.resolve({ slug }) }));
    const navigation = screen.getByRole("navigation", { name: "In this guide" });
    expect(navigation.querySelector('a[href="#guide-faq"]')).toBeTruthy();
    for (const link of navigation.querySelectorAll("a")) {
      expect(container.querySelector(link.getAttribute("href")!)).toBeTruthy();
    }
    const question = usesCms ? "Existing CMS question?" : "Existing fallback question?";
    const answer = usesCms ? "Existing CMS answer." : "Existing fallback answer.";
    const disclosure = screen.getByText(question).closest("details")!;
    expect(disclosure.open).toBe(false);
    expect(disclosure.textContent).toContain(answer);
    fireEvent.click(disclosure.querySelector("summary")!);
    expect(disclosure.open).toBe(true);
    expect(screen.getByText(answer)).toBeTruthy();
  });

  it("preserves schema inputs, localized canonicals, social images and FAQ data", async () => {
    locale = "nl";
    const props = { params: Promise.resolve({ slug: "bike-fitting-for-knee-pain" }) };
    const metadata = await generateMetadata(props);
    expect(metadata.alternates?.canonical).toBe("https://bikefitboost.com/nl/guides/bike-fitting-for-knee-pain");
    expect(metadata.openGraph).toMatchObject({
      type: "article",
      url: metadata.alternates?.canonical,
      images: [{ url: "https://bikefitboost.com/og/guides/media/003--guides--bike-fitting-for-knee-pain-hero.jpg", alt: "Kniepijn hero", width: 1200, height: 630 }],
    });
    render(await GuidePage(props));
    expect(buildArticleSchema).toHaveBeenCalledWith(expect.objectContaining({ inLanguage: "nl", description: "Kniepijn desc", url: metadata.alternates?.canonical }));
    expect(buildFaqPageSchema).toHaveBeenCalledWith([{ q: "Kan bike fit kniepijn veroorzaken?", a: "Ja, vooral wanneer belasting en positie samenkomen.\n\n[Start Free Fit](/nl/login)" }]);
    expect(buildBreadcrumbListSchema).toHaveBeenCalledWith([
      { name: "Home", item: "https://bikefitboost.com/nl" },
      { name: "Gidsen", item: "https://bikefitboost.com/nl/guides" },
      { name: "Bike Fit voor kniepijn: oorzaken en eerste aanpassingen", item: metadata.alternates?.canonical },
    ]);
  });

  it("remaps a persisted legacy guide JSON-LD image", async () => {
    locale = "nl";
    const slug = "bike-fitting-for-knee-pain";
    const data = makeGuidePageData(slug, locale);
    vi.mocked(getGuidePageData).mockResolvedValueOnce({ ...data,
      dbGuide: { ...data.dbGuide, heroImagePublicPath: undefined, ogImageUrl: "https://bestbikefit4u.eu/og/example.jpg" },
    } as unknown as Awaited<ReturnType<typeof getGuidePageData>>);
    render(await GuidePage({ params: Promise.resolve({ slug }) }));
    expect(buildArticleSchema).toHaveBeenCalledWith(expect.objectContaining({
      image: "https://bikefitboost.com/og/example.jpg",
    }));
  });

  it("remaps a persisted legacy guide canonical without modifying CMS data", async () => {
    locale = "nl";
    const slug = "bike-fitting-for-knee-pain";
    const data = makeGuidePageData(slug, locale);
    const canonicalUrl = `https://www.bestbikefit4u.eu/nl/guides/${slug}`;
    vi.mocked(getGuidePageData).mockResolvedValueOnce({ ...data,
      dbGuide: { ...data.dbGuide, canonicalUrl },
    } as unknown as Awaited<ReturnType<typeof getGuidePageData>>);
    const metadata = await generateMetadata({ params: Promise.resolve({ slug }) });
    expect(metadata.alternates?.canonical).toBe(`https://bikefitboost.com/nl/guides/${slug}`);
    expect(metadata.openGraph).toMatchObject({ url: metadata.alternates?.canonical });
  });

  it("preserves static fallback routes and merges published CMS slugs without duplicates", async () => {
    const fallback = getGuideLeafEntries("en");
    vi.mocked(listPublishedGuideRecords).mockResolvedValueOnce([
      { slug: fallback[0].slug }, { slug: "cms-only-guide" },
    ] as Awaited<ReturnType<typeof listPublishedGuideRecords>>);
    const params = await generateStaticParams();
    expect(params).toContainEqual({ slug: "cms-only-guide" });
    expect(params.filter((item) => item.slug === fallback[0].slug)).toHaveLength(1);
    expect(params).toHaveLength(fallback.length + 1);
  });

  it("adds keywords metadata from the fallback guide seo source without changing description precedence", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "bike-fitting-for-knee-pain" }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata.title).toBe("Bike fitting for knee pain");
    expect(metadata.description).toBe("Knee pain desc");
    expect(metadata.keywords).toEqual([
      "bike fitting for knee pain",
      "knee pain cycling fit",
    ]);
  });

  it("renders hero, extracted quick answer, markdown body, faq accordion, related links, and all cta zones for a db guide", async () => {
    const ui = await GuidePage({
      params: Promise.resolve({ slug: "bike-fitting-for-knee-pain" }),
      searchParams: Promise.resolve({}),
    });
    render(ui);

    expect(screen.getByAltText("Knee pain hero")).toBeTruthy();
    expect(screen.getByText("Key takeaway")).toBeTruthy();
    expect(screen.getByText(/most fit-related knee pain comes from overload/i)).toBeTruthy();
    expect(screen.getAllByText("Symptom matrix").length).toBeGreaterThan(0);
    expect(screen.getByText("Saddle too low")).toBeTruthy();
    expect(screen.getByText("heavy gears")).toBeTruthy();
    expect(screen.getByText("Front of knee")).toBeTruthy();
    expect(screen.getByText("Saddle height")).toBeTruthy();
    expect(screen.getByRole("link", { name: "bike fit methods", hidden: true }).getAttribute("href")).toBe(
      "/en/science/bike-fit-methods"
    );

    expect(screen.getByText("While you read")).toBeTruthy();
    expect(
      screen.getAllByRole("link").find(link => link.getAttribute("data-section") === "guide_soft_tool_cta")
        ?.getAttribute("data-section")
    ).toBe("guide_soft_tool_cta");
    expect(document.querySelector('[data-section="guide_mid_page_cta"]')).toBeNull();
    const startFreeFitLinks = screen.getAllByRole("link", { name: "Start Free Fit" });
    expect(startFreeFitLinks.filter(link => link.getAttribute("data-section") === "guide_closing_cta")).toHaveLength(1);
    expect(document.querySelector('[data-section="guide_mid_page_cta"]')).toBeNull();
    expect(startFreeFitLinks.at(-1)?.getAttribute("href")).toContain(
      "/en/login?from=guide&slug=bike-fitting-for-knee-pain"
    );
    expect(startFreeFitLinks.at(-1)?.getAttribute("data-section")).toBe(
      "guide_closing_cta"
    );

    expect(screen.getByText("Can bike fit cause knee pain?")).toBeTruthy();
    expect(screen.getByText(/load and position interact/i).closest("details")?.open).toBe(false);
    fireEvent.click(screen.getByText("Can bike fit cause knee pain?").closest("summary")!);
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
    expect(document.querySelector('[data-section="guide_mid_page_cta"]')).toBeNull();

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
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /bike fit voor kniepijn/i,
      })
    ).toBeTruthy();
    expect(screen.getByText("Kniepijn intro.")).toBeTruthy();

    ui = await GuidePage({
      params: Promise.resolve({ slug: "fallback-guide" }),
      searchParams: Promise.resolve({}),
    });
    rerender(ui);

    expect(screen.getByRole("heading", { level: 1, name: "Fallback gids" })).toBeTruthy();
    expect(screen.getByText("Fallback inhoud.")).toBeTruthy();
    expect(screen.getByText("Fallback vraag?")).toBeTruthy();
    expect(screen.getByText("Fallback CTA description nl")).toBeTruthy();
  });
});


describe("registered rewrite routes", () => {
  it.each([
    ["nl", "ride-types"], ["en", "ride-types"],
    ["nl", "bike-fitting-for-knee-pain"], ["en", "bike-fitting-for-knee-pain"],
  ] as const)("renders the full rewritten %s/%s article instead of legacy CMS copy", async (activeLocale, slug) => {
    useRegisteredGuides = true;
    locale = activeLocale;
    const { getGuideRewrite } = await import("@/lib/guides/rewrites");
    const guide = getGuideRewrite(slug)!;
    const article = guide[activeLocale];
    const props = { params: Promise.resolve({ slug }) };
    const metadata = await generateMetadata(props);
    expect(metadata.title).toEqual({ absolute: article.metaTitle });
    expect(metadata.description).toBe(article.metaDescription);
    expect(metadata.alternates?.canonical).toBe(`https://bikefitboost.com/${locale}/guides/${slug}`);
    const { container } = render(await GuidePage(props));
    expect(container.querySelector('[data-guide-source="code-rewrite"]')).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1, name: article.title })).toBeTruthy();
    for (const sentence of new Intl.Segmenter(locale, { granularity: "sentence" }).segment(article.quickAnswer)) {
      expect(container.textContent).toContain(sentence.segment.trim());
    }
    expect(screen.getByAltText(article.alt).getAttribute("src"))
      .toBe(`/illustrations/guides/${guide.illustration}.webp`);
    expect(container.querySelector('time')?.getAttribute('datetime')).toBe(guide.updatedAt);
    expect(container.querySelectorAll('#guide-content h2')).toHaveLength(5);
    expect(screen.getByRole("link", { name: article.ctaLabel }).getAttribute("href"))
      .toBe(`/${locale}${article.ctaTarget}`);
    expect(buildArticleSchema).toHaveBeenCalledWith(expect.objectContaining({
      headline: article.title, description: article.metaDescription, inLanguage: locale,
    }));
    expect(buildFaqPageSchema).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ q: expect.any(String), a: expect.any(String) }),
    ]));
    expect(screen.queryByText("Hub markdown")).toBeNull();
    expect(screen.queryByText("Knee pain intro.")).toBeNull();
  });
});


describe("guide attribution on legacy templates", () => {
  it.each(["en", "nl"] as const)("shows the author on hub and leaf pages in %s without a fabricated date", async language => {
    locale = language;
    for (const slug of ["ride-types", "bike-fitting-for-knee-pain"]) {
      const { container, unmount } = render(await GuidePage({ params: Promise.resolve({ slug }) }));
      const attribution = container.querySelector("[data-guide-attribution]");
      expect(attribution?.textContent).toContain("Ortwin Verreck");
      expect(attribution?.textContent).toContain(language === "nl" ? "Auteur" : "Author");
      expect(attribution?.querySelector("a")?.getAttribute("href"))
        .toBe(`/${language}/authors/ortwin-verreck`);
      expect(attribution?.querySelector("time")).toBeNull();
      expect(attribution?.textContent).toContain(language === "nl"
        ? "Bijwerkdatum niet beschikbaar." : "Update date unavailable.");
      unmount();
    }
  });
  it("uses the recorded CMS update date in attribution and Article schema", async () => {
    const data = makeGuidePageData("bike-fitting-for-knee-pain", "en");
    Object.assign(data!.dbGuide!, { lastUpdatedAt: Date.parse("2026-09-29T18:45:00Z") });
    vi.mocked(getGuidePageData).mockResolvedValueOnce(data as Awaited<ReturnType<typeof getGuidePageData>>);
    const { container } = render(await GuidePage({ params: Promise.resolve({ slug: "bike-fitting-for-knee-pain" }) }));
    expect(container.querySelector("[data-guide-attribution] time")?.getAttribute("datetime")).toBe("2026-09-29");
    expect(buildArticleSchema).toHaveBeenCalledWith(expect.objectContaining({ dateModified: "2026-09-29",
      author: expect.objectContaining({ name: "Ortwin Verreck" }) }));
  });
});
