/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useQuery } from "convex/react";
import { SaddleSelectorForm } from "./SaddleSelectorForm";
import { toolsSaddleMessages } from "@/i18n/account/toolsSaddle";
import { calculateSaddleWidth } from "@/lib/saddle-width-engine";

// Full form DOM tests can run alongside the production build in batch gates.
vi.setConfig({ testTimeout: 20_000 });

let locale: "en" | "nl" = "en";
let bikeIdParam: string | null = null;
let profile: Record<string, unknown> | null | undefined;
let history: unknown[] | undefined;
const bikes = [
  { _id: "bike_a", name: "Endurance Road", bikeType: "road", ridingStyle: "fitness", primaryGoal: "comfort" },
  { _id: "bike_b", name: "Race Road", bikeType: "road", ridingStyle: "racing", primaryGoal: "performance" },
];
let bikeList: typeof bikes | undefined;
const saveSession = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: (key: string) => (key === "bikeId" ? bikeIdParam : null) }),
}));
vi.mock("convex/react", () => ({ useMutation: () => saveSession, useQuery: vi.fn() }));
vi.mock("@/i18n/useDashboardMessages", () => ({ useDashboardMessages: () => ({ locale }) }));

beforeEach(() => {
  locale = "en";
  bikeIdParam = null;
  profile = { _id: "profile", sitBoneWidthMm: 125, heightCm: 180, weightKg: 75, hipCircumferenceCm: 100 };
  bikeList = bikes;
  history = [];
  saveSession.mockReset().mockResolvedValue("saved");
  vi.mocked(useQuery).mockImplementation(((_query: unknown, args: unknown) => {
    if (args === undefined) return profile;
    if (args === "skip") return undefined;
    if (args && typeof args === "object" && "bikeId" in args) {
      return bikes.find((bike) => bike._id === args.bikeId) ?? null;
    }
    if (args && typeof args === "object" && "limit" in args) return history;
    return bikeList;
  }) as never);
});
afterEach(cleanup);

describe("SaddleSelectorForm", () => {
  it.each(["en", "nl"] as const)(
    "renders a live localized engine result in %s without linking a bike",
    async (language) => {
      locale = language;
      const copy = toolsSaddleMessages[language];
      render(<SaddleSelectorForm />);
      expect(screen.getByRole("button", { name: copy.noBike }).getAttribute("aria-pressed")).toBe("true");
      const hero = await screen.findByRole("region", { name: copy.result });
      expect(within(hero).getByText("147")).toBeTruthy();
      expect(screen.queryByRole("spinbutton")).toBeNull();
      expect(screen.queryByRole("combobox")).toBeNull();
      fireEvent.keyDown(screen.getByRole("slider", { name: copy.sitBone }), { key: "ArrowRight" });
      expect(within(hero).getByText("148")).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: copy.save }));
      await waitFor(() => expect(saveSession).toHaveBeenCalledTimes(1));
      expect(saveSession).toHaveBeenCalledWith(
        expect.objectContaining({
          bikeId: undefined,
          measurementMethod: "measured",
          sitBoneWidthMm: 126,
          recommendedWidthMm: 148,
        }),
      );
      expect(saveSession.mock.calls[0][0]).not.toHaveProperty("heightCm");
      expect(await screen.findByText(copy.saved)).toBeTruthy();
      fireEvent.keyDown(screen.getByRole("slider", { name: copy.sitBone }), { key: "ArrowRight" });
      expect(screen.queryByText(copy.saved)).toBeNull();
    },
  );

  it("hydrates bike query defaults and allows an explicitly unlinked result afterward", async () => {
    bikeIdParam = "bike_b";
    render(<SaddleSelectorForm />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Road race" }).getAttribute("aria-pressed")).toBe("true"),
    );
    expect(screen.getByRole("button", { name: "Aggressive" }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Save this recommendation" }));
    await waitFor(() =>
      expect(saveSession).toHaveBeenCalledWith(
        expect.objectContaining({
          bikeId: "bike_b",
          ridingType: "road_race",
          postureCategory: "aggressive",
        }),
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Without a linked bike" }));
    expect(screen.getByRole("button", { name: "Without a linked bike" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
  });

  it("uses real current-saddle and symptom refinements, translating warnings", async () => {
    locale = "nl";
    const copy = toolsSaddleMessages.nl;
    render(<SaddleSelectorForm />);
    fireEvent.click(screen.getByRole("button", { name: copy.showCurrent }));
    fireEvent.click(screen.getByRole("button", { name: `${copy.useValue}: ${copy.currentWidth}` }));
    fireEvent.click(screen.getByRole("button", { name: copy.tilts.nose_down }));
    fireEvent.click(screen.getByRole("button", { name: copy.showSymptoms }));
    fireEvent.click(screen.getByRole("button", { name: copy.symptoms.numbness }));
    fireEvent.click(screen.getByRole("button", { name: copy.symptoms.handPressure }));
    expect(screen.getByText(copy.warnings.numbness_tilt_likely)).toBeTruthy();
    expect(screen.getByText(copy.warnings.hand_pressure_not_width)).toBeTruthy();
    const expected = calculateSaddleWidth({
      inputMethod: "measured",
      sitBoneWidthMm: 125,
      ridingType: "endurance_road",
      postureCategory: "balanced",
      currentSaddleWidthMm: 145,
      symptoms: {
        numbness: true,
        handPressure: true,
        sisBonePain: false,
        chafing: false,
        slidingForward: false,
        instability: false,
        lowerBackPressure: false,
        asymmetry: false,
      },
    });
    expect(
      within(screen.getByRole("region", { name: copy.result })).getByText(
        String(expected.finalRecommendedWidthMm),
      ),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: copy.save }));
    await waitFor(() =>
      expect(saveSession).toHaveBeenCalledWith(
        expect.objectContaining({
          currentSaddleWidthMm: 145,
          currentSaddleTilt: "nose_down",
          symptoms: ["numbness", "handPressure"],
          recommendedWidthMm: expected.finalRecommendedWidthMm,
        }),
      ),
    );
  });

  it("keeps missing measurements genuinely missing until each example is confirmed", async () => {
    profile = null;
    bikeList = [];
    render(<SaddleSelectorForm />);
    expect(screen.getByText(toolsSaddleMessages.en.missing)).toBeTruthy();
    expect(screen.getByText(toolsSaddleMessages.en.historyEmpty)).toBeTruthy();
    expect(screen.getByText(toolsSaddleMessages.en.noBikes)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Save this recommendation" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Confirm value: Height" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm value: Body weight" }));
    expect(screen.queryByRole("region", { name: "Your starting width" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Confirm value: Hip circumference" }));
    expect(await screen.findByRole("region", { name: "Your starting width" })).toBeTruthy();
    expect(screen.getByText("Lower confidence")).toBeTruthy();
  });

  it("renders loading state instead of an example recommendation", () => {
    profile = undefined;
    render(<SaddleSelectorForm />);
    expect(screen.getByText(toolsSaddleMessages.en.loading)).toBeTruthy();
    expect(screen.queryByRole("slider")).toBeNull();
  });

  it("handles save rejection and renders real history", async () => {
    history = [
      {
        _id: "session",
        createdAt: 1700000000000,
        widthRangeMinMm: 142,
        widthRangeMaxMm: 152,
        saddleFamily: "endurance_allroad",
      },
    ];
    saveSession.mockRejectedValue(new Error("Unavailable"));
    render(<SaddleSelectorForm />);
    expect(screen.getAllByText(/142–152 mm/).length).toBeGreaterThan(0);
    fireEvent.click(await screen.findByRole("button", { name: "Save this recommendation" }));
    expect(await screen.findByRole("alert")).toHaveProperty("textContent", toolsSaddleMessages.en.error);
    expect(screen.queryByText(toolsSaddleMessages.en.saved)).toBeNull();
  });
});
