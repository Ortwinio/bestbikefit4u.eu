/** Active source routes from audit/route-map.md plus the new account tools, one entry per page.tsx.
 * /design-system was added later and is deliberately outside this requested inventory.
 * Paths preserve source routes (including wrong-locale variants); do not canonicalize them away.
 */
export const locales = ["nl", "en"];
export const viewports = [1440, 390];

const publicRoutes = [
  "/",
  "/pricing",
  "/how-it-works",
  "/about",
  "/faq",
  "/contact",
  "/fit-pass",
  "/case-study",
  "/calculators/bike-fit",
  "/calculators/saddle-height",
  "/calculators/frame-size",
  "/tire-pressure-calculator",
  "/bandenspanning-calculator",
  "/calculators/gearing",
  "/calculators/crank-length",
  "/calculators/saddle-width",
  "/calculators/ftp-wkg",
  "/calculators/power-speed",
  "/calculators/fuel-hydration",
  "/calculators/climb-planner",
  "/bike-fitting",
  "/bikefitting",
  "/fiets-afstellen",
  "/why-bikefit-matters",
  "/measurement-guide",
  "/pain",
  "/pain/[slug]",
  "/guides",
  "/guides/[slug]",
  "/use-cases",
  "/use-cases/[slug]",
  "/blog",
  "/blog/[slug]",
  "/science/bike-fit-methods",
  "/science/calculation-engine",
  "/science/stack-and-reach",
  "/privacy",
  "/terms",
  "/bandenspanning/racefiets",
  "/bandenspanning/gravelbike",
  "/bandenspanning/mtb",
  "/tire-pressure/[slug]",
  "/bandenspanning/[slug]"
];

const accountRoutes = [
  "/dashboard",
  "/profile",
  "/profile/score",
  "/profile/advice",
  "/profile/improve/body-measurements",
  "/profile/improve/flexibility",
  "/profile/improve/core-stability",
  "/profile/improve/comfort",
  "/bikes",
  "/bikes/new",
  "/bikes/new/manual",
  "/bikes/import/passport",
  "/bikes/[bikeId]",
  "/bikes/[bikeId]/edit",
  "/bikes/compare-fit",
  "/fit",
  "/fit/[sessionId]/questionnaire",
  "/fit/[sessionId]/results",
  "/fit/how-it-works",
  "/fit-history",
  "/pressure-calculator",
  "/gearing",
  "/saddle-selector",
  "/tools/saddle-height",
  "/tools/bike-fit",
  "/tools/frame-size",
  "/tools/crank-length",
  "/tools/power-speed",
  "/tools/climb-planner",
  "/tools/ftp-wkg",
  "/tools/fuel-hydration",

  "/shoe-cleat-fit",
  "/settings",
  "/feedback"
];

export const exampleFixtures = {
  pain: { slug: "knee-pain-cycling", source: "src/content/painPages.ts" },
  guide: { slug: "saddle-height-guide", source: "src/lib/guides/content/setup-parameters.ts" },
  blog: { slug: "visual-article-1", source: "tests/visual/marketing-batch3/runtime.jsx" },
  legacy: { slug: "back-pain-cycling", source: "src/lib/guides/redirects.ts" },
  pressureEnglish: { slug: "75kg-road-bike", source: "src/lib/seo/programmatic/tirePressure.ts" },
  pressureDutch: { slug: "75kg-racefiets", source: "src/lib/seo/programmatic/tirePressure.ts" },
  bike: { slug: "visual-bike", source: "tests/visual/account-batch1/runtime.jsx" },
  session: { slug: "visual-session", source: "tests/visual/account-batch2/runtime.jsx" },
};

function concretePath(sourceRoute, blogSlug) {
  const replacements = {
    "/pain/[slug]": exampleFixtures.pain.slug,
    "/guides/[slug]": exampleFixtures.guide.slug,
    "/blog/[slug]": blogSlug || exampleFixtures.blog.slug,
    "/use-cases/[slug]": exampleFixtures.legacy.slug,
    "/tire-pressure/[slug]": exampleFixtures.pressureEnglish.slug,
    "/bandenspanning/[slug]": exampleFixtures.pressureDutch.slug,
  };
  return sourceRoute
    .replace("[slug]", replacements[sourceRoute] || "[slug]")
    .replace("[bikeId]", exampleFixtures.bike.slug)
    .replace("[sessionId]", exampleFixtures.session.slug);
}

function expectedResponse(sourceRoute, locale) {
  if (sourceRoute === "/bike-fitting" && locale === "nl") return { status: 308, redirectTo: "/nl/bikefitting" };
  if (sourceRoute === "/bikefitting" && locale === "en") return { status: 308, redirectTo: "/en/bike-fitting" };
  if (sourceRoute === "/use-cases") return { status: 307, redirectTo: `/${locale}/guides` };
  if (sourceRoute === "/use-cases/[slug]") {
    return { status: 307, redirectTo: `/${locale}/guides/bike-fitting-for-lower-back-pain` };
  }
  if (sourceRoute === "/tire-pressure-calculator" && locale === "nl") {
    return { status: 308, redirectTo: "/nl/bandenspanning-calculator" };
  }
  if (sourceRoute === "/bandenspanning-calculator" && locale === "en") {
    return { status: 308, redirectTo: "/en/tire-pressure-calculator" };
  }
  return { status: 200 };
}

/** Supply a published CMS blog slug when available; otherwise use the established visual fixture. */
export function resolveRoutes({ blogSlug } = {}) {
  return [
    ...publicRoutes.map((sourceRoute) => ({ sourceRoute, kind: "public", group: "(public)" })),
    { sourceRoute: "/login", kind: "auth", group: "(auth)" },
    ...accountRoutes.map((sourceRoute) => ({ sourceRoute, kind: "account", group: "(dashboard)" })),
    { sourceRoute: "/welcome", kind: "account", group: "" },
    { sourceRoute: "/app", kind: "installation", group: "" },
  ].map(({ sourceRoute, kind, group }) => {
    const concrete = concretePath(sourceRoute, blogSlug);
    const needsBlogFixture = sourceRoute === "/blog/[slug]" && !blogSlug;
    const isPressureArticle = ["/tire-pressure/[slug]", "/bandenspanning/[slug]"].includes(sourceRoute);
    return {
      id: sourceRoute === "/" ? "home" : sourceRoute.slice(1).replaceAll("/", "-"),
      sourceRoute,
      sourceFile: `src/app/${group}${sourceRoute === "/" ? "" : sourceRoute}/page.tsx`
        .replace("app//", "app/"),
      kind,
      paths: Object.fromEntries(locales.map((locale) => [locale, `/${locale}${concrete === "/" ? "" : concrete}`])),
      expected: Object.fromEntries(locales.map((locale) => [locale, expectedResponse(sourceRoute, locale)])),
      ...(kind === "account" ? { fixture: "account" } : {}),
      ...(needsBlogFixture ? { fixture: "blog" } : {}),
      ...(isPressureArticle ? {
        notes: "Source route forces its content language even under the opposite locale prefix; check without waiver.",
      } : {}),
    };
  });
}

export const routes = resolveRoutes();

/** Read only the app's public sitemap; never use credentials or mutate CMS content. */
export async function discoverBlogSlug(baseURL, previewFetch = fetch) {
  const response = await previewFetch(new URL("/sitemap-blog.xml", baseURL), { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Blog sitemap returned HTTP ${response.status}`);
  const xml = await response.text();
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const pathname = new URL(match[1].replaceAll("&amp;", "&")).pathname;
    const slug = pathname.match(/^\/(?:en|nl)\/blog\/([^/]+)\/?$/)?.[1];
    if (slug) return decodeURIComponent(slug);
  }
  return null;
}
