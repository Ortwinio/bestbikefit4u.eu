/* @vitest-environment jsdom */
import { Suspense } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import type { Locale } from "@/i18n/config";

const fixture = vi.hoisted(() => ({
  locale: "nl" as Locale,
  detail: undefined as Record<string, unknown> | null | undefined,
  panel: vi.fn(), mutate: vi.fn(), log: vi.fn(),
}));
vi.mock("convex/react", () => ({ useQuery: () => fixture.detail, useMutation: () => fixture.mutate }));
vi.mock("@/i18n/useDashboardMessages", () => ({ useDashboardMessages: () => ({
  locale: fixture.locale, messages: getDashboardMessages(fixture.locale),
}) }));
vi.mock("@/components/ui", async (original) => ({
  ...await original<typeof import("@/components/ui")>(), useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({ useMarketingEventLogger: () => fixture.log }));
vi.mock("@/components/bikes/BikeProfilePanel", () => ({ BikeProfilePanel: (props: unknown) => {
  fixture.panel(props); return <section aria-label="Live bike profile" />;
} }));
vi.mock("@/components/bikes/DeleteBikeAction", () => ({ DeleteBikeAction: () => null }));
vi.mock("@/components/bikes/BikeFitPreview", () => ({ BikeFitPreview: () => null }));
vi.mock("@/components/bikes/BikeDescriptionEditor", () => ({ BikeDescriptionEditor: () => null }));
vi.mock("@/components/bikes/BikeFitHistorySection", () => ({ BikeFitHistorySection: () => <p>Fit history preserved</p> }));
vi.mock("@/components/bikes/BikeSettingsEditor", () => ({ BikeSettingsEditor: () => <p>Bike settings preserved</p> }));
vi.mock("@/components/bikes/BikePhotoGallery", () => ({ BikePhotoGallery: () => null }));
vi.mock("@/components/bikes/BikeWheelsetManager", () => ({ BikeWheelsetManager: () => null }));
vi.mock("@/components/features/pressure/BikePressureSection", () => ({ BikePressureSection: () => null }));
vi.mock("./BikeGearingCard", () => ({ BikeGearingCard: () => null }));
vi.mock("./GeometryLinkCard", () => ({ GeometryLinkCard: ({ editHref }: { editHref: string }) =>
  <a href={editHref}>Geometry library</a> }));
vi.mock("./SignedInFitFollowUpCard", () => ({ SignedInFitFollowUpCard: () => null }));

import BikeDetailPage from "./page";
import { bikeProfileMessages } from "@/i18n/account/bikeProfile";
async function show() {
  const params = Promise.resolve({ bikeId: "bike1" });
  await act(async () => {
    render(<Suspense fallback="Loading"><BikeDetailPage params={params} /></Suspense>);
  });
}
beforeEach(() => {
  vi.clearAllMocks(); fixture.locale = "nl"; fixture.mutate.mockResolvedValue(null);
  fixture.detail = {
    bike: { _id: "bike1", name: "My own bike", bikeType: "road", ridingStyle: "sportive",
      primaryGoal: "balanced", bikePassportId: "passport1" },
    bikeProfiles: [{ _id: "default", name: "Default", isDefault: true, profileType: "endurance" },
      { _id: "climbing", name: "Climbing", profileType: "climbing" }],
    geometryLinkState: "unlinked", linkedGeometry: null, activeWheelset: null, activeTireSetup: null,
    latestRecommendation: null, photos: [], wheelsets: [], profileScore: { completeness: 15, reliability: 9 },
    bikeObservations: [],
  };
});
afterEach(cleanup);
describe("bike profile page integration", () => {
  it.each(["nl", "en"] as const)("mounts the owned bike context and keeps the existing %s tools accessible", async locale => {
    fixture.locale = locale; await show();
    await screen.findByRole("heading", { name: "My own bike", level: 1 });
    expect(fixture.panel).toHaveBeenLastCalledWith(expect.objectContaining({
      bikeId: "bike1", locale, detail: fixture.detail,
    }));
    const extras = screen.getByText(bikeProfileMessages[locale].detailExtrasLabel).closest("details")!;
    expect(extras.open).toBe(false);
    fireEvent.click(screen.getByText(bikeProfileMessages[locale].detailExtrasLabel));
    expect(extras.open).toBe(true);
    expect(screen.getByText("Bike settings preserved")).toBeTruthy();
    expect(screen.getByText("Fit history preserved")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Geometry library" }).getAttribute("href"))
      .toBe(`/${locale}/bikes/bike1/edit#bike-geometry-library`);
    expect(screen.getByRole("link", { name: bikeProfileMessages[locale].bikesLink }).getAttribute("aria-current"))
      .toBe("page");
    expect(fixture.mutate).not.toHaveBeenCalled();
  });
  it("does not mount measurement UI for a missing bike", async () => {
    fixture.detail = null; await show();
    await screen.findByText(getDashboardMessages("nl").bikeForm.edit.notFound.title);
    expect(fixture.panel).not.toHaveBeenCalled();
  });
});
