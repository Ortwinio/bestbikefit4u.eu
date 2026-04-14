import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@convex-dev/auth/nextjs/server", () => ({
  convexAuthNextjsToken: vi.fn(async () => undefined),
}));
vi.mock("convex/nextjs", () => ({
  fetchQuery: vi.fn(),
}));
import type { GuideBacklogEntry } from "./backlog";
import {
  buildFaqs,
  buildHubQuickAnswer,
  buildLeafSections,
  buildQuickAnswer,
} from "./content";
import { GUIDE_CONTENT, getGuideContent } from "./guide-content";

function makeEntry(overrides: Partial<GuideBacklogEntry>): GuideBacklogEntry {
  return {
    order: 1,
    cluster: "Pain & Discomfort",
    status: "Existing",
    path: "/guides/example",
    slug: "example",
    pageTitle: "Example guide",
    metaTitle: "Example guide | BestBikeFit4U",
    h1: "Example guide",
    pageBrief: "Example guide brief.",
    primaryCtaLabel: "Open calculator",
    primaryCtaTarget: "/calculators/bike-fit",
    internalLinkTargets: ["/faq", "/about", "/guides/example-2"],
    notes: "",
    ...overrides,
  };
}

describe("guide content integration", () => {
  it("uses real guide content when a slug exists in GUIDE_CONTENT", () => {
    const entry = makeEntry({
      slug: "bike-fitting-for-knee-pain",
      cluster: "Pain & Discomfort",
    });

    const sections = buildLeafSections(entry, "en");
    const faqs = buildFaqs(entry, "en");

    expect(sections[0].title).toBe("Intro");
    expect(sections[0].items[0]).toContain("Knee pain on the bike");
    expect(faqs[0].q).toContain("Anterior vs posterior knee pain");
  });

  it("uses topic-specific quick answers for leaf guides", () => {
    const entry = makeEntry({
      slug: "saddle-height-guide",
      cluster: "Setup Parameters",
      pageTitle: "Saddle Height Guide",
      pageBrief: "Covers saddle height logic; measurement method; validation; and signs of over- or under-setting.",
    });

    const quickAnswer = buildQuickAnswer(entry, "en");

    expect(quickAnswer.keyTakeaway).toContain("Saddle height");
    expect(quickAnswer.commonMistake).toContain("inseam formula");
    expect(quickAnswer.payAttention).toContain("hips");
  });

  it("falls back to the template when no authored content exists", () => {
    const entry = makeEntry({
      slug: "unwritten-guide",
      pageTitle: "Unwritten guide",
    });

    const sections = buildLeafSections(entry, "en");
    const faqs = buildFaqs(entry, "en");

    expect(sections[1].title).toBe("Common problems or rider symptoms");
    expect(sections[0].items[0]).toContain("Example guide brief.");
    expect(faqs.length).toBeGreaterThan(0);
  });

  it("keeps nutrition and power FAQs free of bike-fit pain boilerplate", () => {
    const nutritionEntry = makeEntry({
      slug: "cycling-fueling-basics",
      cluster: "Nutrition & Hydration",
      primaryCtaTarget: "/calculators/fuel-hydration",
    });
    const powerEntry = makeEntry({
      slug: "ftp-explained",
      cluster: "Power / FTP",
      primaryCtaTarget: "/calculators/ftp-wkg",
    });

    const nutritionFaqs = buildFaqs(nutritionEntry, "en");
    const powerFaqs = buildFaqs(powerEntry, "en");

    const combinedAnswers = [...nutritionFaqs, ...powerFaqs]
      .map((item) => `${item.q} ${item.a}`)
      .join(" ");

    expect(combinedAnswers).not.toMatch(/purely a fit problem/i);
    expect(combinedAnswers).not.toMatch(/bike[- ]fit pain/i);
  });

  it("exposes authored content for all cluster modules through the shared registry", () => {
    expect(Object.keys(GUIDE_CONTENT).length).toBeGreaterThanOrEqual(39);
    expect(getGuideContent("road-bike-fit-guide")?.nl.sections.length).toBeGreaterThan(0);
    expect(getGuideContent("frame-size-guide")?.en.faqs.length).toBeGreaterThan(0);
    expect(getGuideContent("when-online-bike-fit-has-limits")?.en.intro.length).toBeGreaterThan(
      0
    );
  });

  it("builds hub quick answers for cluster landing pages too", () => {
    const entry = makeEntry({
      slug: "setup-parameters",
      cluster: "Setup Parameters",
      pageTitle: "Setup parameters hub",
      pageBrief: "Choose the setup topic that best matches the number you want to change.",
      primaryCtaTarget: "/calculators/bike-fit",
    });

    const quickAnswer = buildHubQuickAnswer(entry, "en", 6);

    expect(quickAnswer.keyTakeaway).toContain("which number you want to change");
    expect(quickAnswer.commonMistake).toContain("one setup number");
    expect(quickAnswer.payAttention).toContain("millimeter");
  });
});
