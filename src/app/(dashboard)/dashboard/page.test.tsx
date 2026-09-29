import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import type { Locale } from "@/i18n/config";

const state = vi.hoisted(() => ({
  locale: "nl" as Locale,
  query: vi.fn(),
}));

vi.mock("convex/react", () => ({ useQuery: state.query }));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale: state.locale, messages: getDashboardMessages(state.locale) }),
}));
vi.mock("@/components/profile/ProfilePhotoUpload", () => ({
  ProfilePhotoUpload: ({ source }: { source?: string }) => <button data-source={source}>photo upload</button>,
}));
vi.mock("@/components/dashboard-messages", () => ({
  DashboardMessageSurface: ({ showBanners, showModal }: { showBanners: boolean; showModal: boolean }) => <div data-banners={showBanners} data-modal={showModal}>message surface</div>,
}));
vi.mock("@/hooks/useResolvedImageUrl", () => ({ useResolvedImageUrl: (source?: string) => source }));
vi.mock("@/components/reports", () => ({
  FitReportActionGroup: ({ sessionId, pagePath }: { sessionId: string; pagePath: string }) => <button data-session={sessionId} data-path={pagePath}>report actions</button>,
}));

import DashboardPage from "./page";

const profile = { heightCm: 181, inseamCm: 86, weightKg: 74, flexibilityScore: "good", coreStabilityScore: 3 };
const bike = {
  _id: "bike-1", name: "My gravel bike", bikeType: "gravel", ridingStyle: "gravel", primaryGoal: "comfort",
  advisedPressureSummary: null, pressureStateSummary: { isStale: false, hasCurrentPressure: false },
};

function setup(overrides: Record<string, unknown> = {}) {
  const values: Record<string, unknown> = {
    "profiles/queries:getMyProfile": profile,
    "users/queries:getCurrentUser": { name: "Alex", displayName: "Alex", profile_image_url: "profile-photo" },
    "bikes/queries:listSummariesByUser": [],
    "sessions/queries:getAllSessionsWithBikes": [],
    ...overrides,
  };
  state.query.mockImplementation((reference) => values[getFunctionName(reference)]);
  return renderToStaticMarkup(<DashboardPage />);
}

beforeEach(() => { state.locale = "nl"; state.query.mockReset(); });

describe("dashboard home presentation", () => {
  it.each(["nl", "en"] as const)("localizes questionnaire values in the %s garage without changing saved enums", (locale) => {
    state.locale = locale;
    const responses = { experience_level: "intermediate", weekly_hours: "3-6", typical_ride_length: "medium", position_priority: "balanced", road_riding_type: "group", has_pain: "yes", pain_areas: ["lower_back"] };
    const original = structuredClone(responses);
    const html = setup({
      "bikes/queries:listSummariesByUser": [bike],
      "sessions/queries:getAllSessionsWithBikes": [{ bike, session: { _id: "fit" }, recommendation: { calculatedFit: { saddleHeightMm: 750 } }, responses }],
    });
    const dutch = ["Enige ervaring", "3–6 uur/week", "Gemiddeld (30–80 km)", "Gebalanceerd", "Groepsritten", "Onderrug"];
    const english = ["Intermediate", "3–6 hrs/week", "Medium (30–80 km)", "Balanced", "Group rides", "Lower back"];
    for (const label of locale === "nl" ? dutch : english) expect(html).toContain(label);
    if (locale === "nl") for (const label of english) expect(html).not.toContain(label);
    expect(responses).toEqual(original);
  });

  it.each(["profiles/queries:getMyProfile", "users/queries:getCurrentUser", "bikes/queries:listSummariesByUser", "sessions/queries:getAllSessionsWithBikes"])("waits for %s without showing empty data", (query) => {
    const html = setup({ [query]: undefined });
    expect(html).toContain(getDashboardMessages("nl").layout.loading);
    expect(html).not.toContain("Alex");
    expect(html).not.toContain(getDashboardMessages("nl").dashboardHome.noBikeTitle);
  });

  it.each(["nl", "en"] as const)("keeps %s identity, measurements, localized scores and routes", (locale) => {
    state.locale = locale;
    const html = setup();
    const messages = getDashboardMessages(locale);
    expect(html).toContain("Alex");
    expect(html).toContain('data-source="profile-photo"');
    expect(html).toContain('data-banners="false" data-modal="false"');
    expect(html).toContain("181");
    expect(html).toContain("86");
    expect(html).toContain("74");
    expect(html).toContain(locale === "nl" ? "Goed" : "Good");
    expect(html).toContain(locale === "nl" ? "Gemiddeld" : "Average");
    expect(html).toContain('aria-valuenow="3"');
    expect(html).toContain(messages.dashboardHome.noBikeTitle);
    for (const route of ["profile", "fit", "bikes", "bikes/new"]) expect(html).toContain(`href="/${locale}/${route}"`);
    expect(html).not.toMatch(/Voorbeeldgegevens|Ontwerpstaat|Canyon|Lisa/);
    expect(state.query).toHaveBeenCalledTimes(4);
  });

  it("preserves missing profile and missing weight as distinct states", () => {
    const messages = getDashboardMessages("nl");
    const missingProfile = setup({ "profiles/queries:getMyProfile": null });
    expect(missingProfile).toContain(messages.home.profileWarning.title);
    expect(missingProfile).not.toContain('role="meter"');
    const missingWeight = setup({ "profiles/queries:getMyProfile": { ...profile, weightKg: undefined } });
    expect(missingWeight).toContain(messages.dashboardHome.weightMissing);
    expect(missingWeight).toContain('role="meter"');
  });

  it("keeps bike-specific next actions when no recommendation exists", () => {
    const html = setup({ "bikes/queries:listSummariesByUser": [bike] });
    expect(html).toContain(bike.name);
    expect(html).toContain('href="/nl/bikes/bike-1"');
    expect(html).toContain('href="/nl/fit?bikeId=bike-1"');
    expect(html).toContain(getDashboardMessages("nl").bikeGarage.noFitYet);
    expect(html).not.toContain("report actions");
  });

  it("offers bike-specific pressure calculation when a fit has no pressure advice", () => {
    const html = setup({
      "bikes/queries:listSummariesByUser": [bike],
      "sessions/queries:getAllSessionsWithBikes": [{ bike, session: { _id: "fit" }, recommendation: { calculatedFit: { saddleHeightMm: 750 } }, responses: {} }],
    });
    expect(html).toContain(getDashboardMessages("nl").pressure.overview.noCalculation);
    expect(html).toContain('href="/nl/pressure-calculator?bikeId=bike-1"');
    expect(html).not.toContain(getDashboardMessages("nl").dashboardHome.pressureStale);
  });

  it.each([
    ["very_limited", 1, "Zeer beperkt", "Zeer laag"],
    ["limited", 2, "Beperkt", "Laag"],
    ["average", 3, "Gemiddeld", "Gemiddeld"],
    ["good", 4, "Goed", "Goed"],
    ["excellent", 5, "Uitstekend", "Uitstekend"],
  ])("renders saved %s profile indicators", (flexibilityScore, coreStabilityScore, flexibilityLabel, coreLabel) => {
    const html = setup({ "profiles/queries:getMyProfile": { ...profile, flexibilityScore, coreStabilityScore } });
    expect(html).toContain(flexibilityLabel as string);
    expect(html).toContain(coreLabel as string);
    expect(html).toContain(`aria-valuenow="${coreStabilityScore}"`);
  });

  it("retains latest recommendation, reports, climbing and stale pressure data", () => {
    const recommendation = {
      calculatedFit: { saddleHeightMm: 751, handlebarDropMm: 56.4, handlebarReachMm: 529.7 },
      climbingCalculatedFit: { saddleHeightMm: 748, handlebarDropMm: 42, handlebarReachMm: 525 },
    };
    const html = setup({
      "bikes/queries:listSummariesByUser": [{ ...bike, advisedPressureSummary: { recommendedFrontBar: 3.2, recommendedRearBar: 3.5, currentFrontBar: 3.4, currentRearBar: 3.7 }, pressureStateSummary: { isStale: true } }],
      "sessions/queries:getAllSessionsWithBikes": [
        { bike, session: { _id: "without-advice" }, recommendation: null },
        { bike, session: { _id: "latest" }, recommendation, responses: {} },
        { bike, session: { _id: "older" }, recommendation: { calculatedFit: { saddleHeightMm: 799 } }, responses: {} },
      ],
    });
    expect(html).toContain('data-session="latest" data-path="/nl/dashboard"');
    expect(html).not.toContain('data-session="older"');
    for (const value of ["751", "748", "530", "3.2", "3.5", "3.4", "3.7"]) expect(html).toContain(value);
    expect(html).toContain(getDashboardMessages("nl").dashboardHome.pressureStale);
    expect(html).toContain(getDashboardMessages("nl").bikeGarage.climbingProfileIncluded);
    expect(html).toContain("bikeId=bike-1");
  });
});
