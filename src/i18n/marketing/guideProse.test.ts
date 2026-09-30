import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@convex-dev/auth/nextjs/server", () => ({
  convexAuthNextjsToken: vi.fn(async () => undefined),
}));
vi.mock("convex/nextjs", () => ({ fetchQuery: vi.fn() }));

import { GUIDE_CONTENT, getGuideContent } from "@/lib/guides/guide-content";
import { getGuideQuickAnswer } from "@/lib/guides/quick-answers";
import { buildHubIntro, buildHubQuickAnswer, buildLeafSections } from "@/lib/guides/content";
import type { GuideBacklogEntry } from "@/lib/guides/backlog";
import { getDutchGuideTitle } from "./guideTitles";

const fallbackEntry: GuideBacklogEntry = {
  order: 1,
  cluster: "Example",
  status: "Existing",
  path: "/guides/test",
  slug: "test",
  pageTitle: "Een passende fietshouding",
  metaTitle: "Een passende fietshouding",
  h1: "Een passende fietshouding",
  pageBrief: "Kies een passende afstelling.",
  primaryCtaLabel: "Start je bikefit",
  primaryCtaTarget: "/calculators/bike-fit",
  internalLinkTargets: ["/guides/saddle-height-guide"],
  notes: "",
};

describe("Dutch guide prose", () => {
  it("uses the Dutch title in generated calls to action across all guide families", () => {
    const slugs = [
      "bike-fit-for-foot-pain-hot-foot-and-numb-toes",
      "bike-fit-for-tall-riders",
      "indoor-trainer-bike-fit-guide",
      "saddle-height-guide",
      "foot-measurement-guide-for-cyclists",
    ];
    for (const slug of slugs) {
      const content = getGuideContent(slug);
      expect(content, slug).toBeDefined();
      expect(content?.nl.ctaDescription).toContain(getDutchGuideTitle(slug));
      expect(content?.nl.ctaDescription).not.toMatch(/\bguide\b|\bfit flow\b/i);
    }
  });

  it("never falls back to English slug text in Dutch generated FAQs", () => {
    for (const content of Object.values(GUIDE_CONTENT)) {
      expect(JSON.stringify(content.nl.faqs.slice(-2))).not.toMatch(
        /\bguide\b|\bbike fitting for\b|\bbike fit for\b/i,
      );
    }
  });

  it("keeps the English saddle-height CTA unchanged", () => {
    expect(getGuideContent("saddle-height-guide")?.en.ctaDescription).toBe(
      "Use the saddle height guide to get a starting reference for saddle height before you make your next change.",
    );
  });

  it("uses Dutch words for power and indoor support in quick answers", () => {
    expect(getGuideQuickAnswer("power-to-speed-guide", "nl")?.keyTakeaway).toContain("vermogen en snelheid");
    expect(getGuideQuickAnswer("indoor-trainer-bike-fit-guide", "nl")?.keyTakeaway).toContain("ondersteuning");
    expect(getGuideQuickAnswer("indoor-trainer-bike-fit-guide", "en")?.keyTakeaway).toContain("support");
  });

  it("keeps fallback hub and leaf sentences in Dutch", () => {
    const intro = buildHubIntro(fallbackEntry, "nl");
    const quick = buildHubQuickAnswer(fallbackEntry, "nl", 4);
    const sections = buildLeafSections(fallbackEntry, "nl");
    expect(intro[1]).toContain("open de gids die past bij jouw vraag");
    expect(quick.commonMistake).toContain("klachten, rijtype, afstelling");
    expect(quick.payAttention).toContain("4 gidsen");
    expect(JSON.stringify(sections)).toContain("Ondersteuning, belasting");
    expect(JSON.stringify({ intro, quick, sections })).not.toMatch(
      /child-pagina|\bdiscomfort\b|\blimiter\b|\bsupport\b|\bsetup\b/i,
    );
  });

  it("translates the remaining mixed sentences found by the browser review", () => {
    const beginners = getGuideContent("bike-fit-for-beginners-and-returning-riders")?.nl;
    const insoles = getGuideContent("insoles-arch-support-and-footbeds-guide")?.nl;
    const climb = getGuideContent("climb-time-and-event-pacing-guide")?.nl;
    const handlebars = getGuideContent("handlebar-width-and-hood-position-guide")?.nl;

    expect(beginners?.intro[0]).toContain("Begin of hervat je het fietsen?");
    expect(JSON.stringify(beginners?.sections)).toContain("binnen en buiten fietsen");
    expect(insoles?.intro[0]).toContain("ondersteunen je voetboog");
    expect(JSON.stringify(insoles?.sections)).toContain("Vervang je inlegzool alleen");
    expect(climb?.intro[0]).toContain("Verdeel je inspanning");
    expect(JSON.stringify(handlebars?.sections)).toContain("hefboomwerking en controle");
    expect(JSON.stringify(insoles)).not.toMatch(/\bupgrade\b|\bsupport\b|\baftermarket\b|\bcustom\b/i);
    expect(getGuideQuickAnswer("road-vs-endurance-vs-race-geometry", "nl")?.keyTakeaway).toContain(
      "Geometrie voor lange ritten en wedstrijden",
    );
  });
});
