import { getFunctionName } from "convex/server";

export const locale = window.location.pathname.startsWith("/en/") ? "en" : "nl";
const query = new URLSearchParams(window.location.search);
const translate = (nl, en) => ({ nl, en });
const posts = Array.from({ length: 11 }, (_, index) => ({
  slug: `visual-article-${index + 1}`,
  title: translate(`Je fietspositie bekijken ${index + 1}`, `Review your riding position ${index + 1}`),
  body: translate("## Begin bij je huidige afstelling\n\nNoteer je huidige afstelling voordat je iets verandert.\n\n## Bekijk wat je voelt\n\nBeschrijf wanneer je ongemak ervaart.\n\n### Neem de tijd\n\nVerander niet alles tegelijk.\n\n## Kies je volgende stap\n\nGebruik de meetgids om je maten te controleren.", "## Start with your current setup\n\nRecord your current setup before making a change.\n\n## Notice how you feel\n\nDescribe when you feel discomfort.\n\n### Take your time\n\nAvoid changing everything at once.\n\n## Choose your next step\n\nUse the measurement guide to check your measurements."),
  excerpt: translate("Praktische aandachtspunten om je huidige fietspositie te bekijken.", "Practical points to help you review your current riding position."),
  category: index % 2 ? "comfort" : "bikefit",
  featuredImageUrl: "/illustrations/01-racefiets.webp",
  featuredImageAlt: translate("Pentekening van een racefiets", "Line illustration of a road bike"),
  authorName: "Visual fixture",
  publishedAt: 1780000000000,
  updatedAt: 1780000000000,
  metaTitle: translate("Testartikel", "Test article"),
  metaDescription: translate("Alleen voor visuele tests.", "Visual tests only."),
  tableOfContents: true,
  relatedPostSlugs: ["visual-article-2"],
  relatedGuidePaths: ["/guides/saddle-height-guide"],
}));

export async function fetchQuery(reference, args) {
  const name = getFunctionName(reference);
  if (name.endsWith(":getPublishedPost")) return posts.find((post) => post.slug === args.slug) ?? null;
  if (name.endsWith(":listPublishedPosts")) return posts;
  if (name.endsWith(":listPublishedSlugs")) return posts;
  throw new Error(`Unexpected fixture query: ${name}`);
}
export const getRequestLocale = async () => locale;
export const getGuideBacklog = () => [{ path: "/guides/saddle-height-guide", pageTitle: locale === "nl" ? "Zadelhoogte gids" : "Saddle height guide", pageBrief: "" }];
export const usePathname = () => window.location.pathname;
export const useSearchParams = () => query;
export const useRouter = () => ({ push: (href) => window.location.assign(href), replace: (href) => window.location.replace(href) });
export const useConvexAuth = () => ({ isLoading: false, isAuthenticated: false });
export const useAuthActions = () => ({ signOut: async () => {} });
export const useMutation = () => async () => {};
export const useQuery = () => null;
export const notFound = () => { throw new Error("Fixture page not found"); };
export const captureException = () => {};
export function JsonLd({ schema }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
