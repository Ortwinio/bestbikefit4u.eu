/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import { autosaveMessages } from "@/i18n/account/autosave";
import { useQuery } from "convex/react";
import { SaddleSelectorForm } from "./SaddleSelectorForm";
import { toolsSaddleMessages } from "@/i18n/account/toolsSaddle";
import { saddleWidthMessages } from "@/i18n/calculators/saddleWidth";

let locale: "en" | "nl" = "en";
let bikeIdParam: string | null = null;
let profile: Record<string, unknown> | null | undefined;
let saved: Record<string, unknown> | null;
let history: unknown[];
const bikes = [
  { _id: "bike_a", name: "Endurance Road", bikeType: "road", ridingStyle: "fitness", primaryGoal: "comfort" },
  { _id: "bike_b", name: "Race Road", bikeType: "road", ridingStyle: "racing", primaryGoal: "performance" },
];
const saveSession = vi.fn();
const savePublicSession = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: () => bikeIdParam }),
}));
vi.mock("convex/react", () => ({
  useMutation: (query: Parameters<typeof getFunctionName>[0]) =>
    getFunctionName(query).includes("createPublic") ? savePublicSession : saveSession,
  useQuery: vi.fn(),
}));
vi.mock("@/i18n/useDashboardMessages", () => ({ useDashboardMessages: () => ({ locale }) }));

beforeEach(() => {
  locale = "en";
  bikeIdParam = null;
  profile = { _id: "profile", sitBoneWidthMm: 125, heightCm: 180, weightKg: 75, hipCircumferenceCm: 100 };
  history = [];
  saved = null;
  saveSession.mockReset().mockResolvedValue("saved");
  savePublicSession.mockReset().mockResolvedValue("public");
  vi.mocked(useQuery).mockImplementation(((query: Parameters<typeof getFunctionName>[0], args: unknown) => {
    if (args === "skip") return undefined;
    const name = getFunctionName(query);
    if (name.includes("getCurrentUser")) return { _id: "user" };
    if (name.includes("getLatestSaddleWidthSession")) return saved;
    if (name.includes("getMyProfile")) return profile;
    if (name.includes("listSaddleWidthSessions")) return history;
    return bikes;
  }) as never);
});
afterEach(cleanup);

describe("SaddleSelectorForm shared account mode", () => {
  it("refreshes the match score for an existing saddle without changing the shared basic recommendation", async () => {
    saved = {
      measurementMethod: "measured", sitBoneWidthMm: 125, ridingType: "endurance_road",
      postureCategory: "balanced", currentSaddleWidthMm: 150, widthMatchScore: 20,
    };
    render(<SaddleSelectorForm />);
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });
    fireEvent.keyUp(screen.getByRole("slider"), { key: "ArrowRight" });
    await waitFor(() => expect(saveSession).toHaveBeenCalled());
    expect(saveSession.mock.calls[0][0]).toMatchObject({
      sitBoneWidthMm: 126, recommendedWidthMm: 148, widthMatchScore: 90,
    });
  });
  it.each(["en", "nl"] as const)("renders the public form in %s with account autosave only", async (language) => {
    locale = language;
    const copy = saddleWidthMessages[language];
    render(<SaddleSelectorForm />);
    expect(screen.getByRole("heading", { level: 1, name: copy.title })).toBeTruthy();
    expect(screen.queryByText(copy.example)).toBeNull();
    expect(screen.queryByRole("link", { name: copy.account })).toBeNull();
    expect(screen.getByRole("region", { name: copy.result })).toBeTruthy();
    expect(saveSession).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole("slider", { name: copy.sitBone }), { key: "ArrowRight" });
    await waitFor(() => expect(saveSession).toHaveBeenCalledTimes(1));
    expect(saveSession).toHaveBeenCalledWith(expect.objectContaining({
      bikeId: undefined, expectedUserId: "user", measurementMethod: "measured", sitBoneWidthMm: 126, recommendedWidthMm: 148,
    }));
    expect(saveSession.mock.calls[0][0]).not.toHaveProperty("heightCm");
    expect(savePublicSession).not.toHaveBeenCalled();
    expect(await screen.findByText(new RegExp(autosaveMessages[language].saved))).toBeTruthy();
    expect(screen.getByRole("link", { name: language === "nl" ? "Mijn profiel" : "My profile" })).toBeTruthy();
  });

  it("prefills bike data, flushes edits to that bike, and permits unbound calculation", async () => {
    bikeIdParam = "bike_b";
    render(<SaddleSelectorForm />);
    expect(screen.getByRole("button", { name: saddleWidthMessages.en.rides.road_race }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("radio", { name: saddleWidthMessages.en.postures.aggressive }).getAttribute("aria-checked")).toBe("true");
    fireEvent.keyDown(screen.getByRole("slider", { name: saddleWidthMessages.en.sitBone }), { key: "ArrowRight" });
    fireEvent.click(screen.getByRole("button", { name: toolsSaddleMessages.en.noBike }));
    await waitFor(() => expect(saveSession).toHaveBeenCalledWith(expect.objectContaining({
      bikeId: "bike_b", sitBoneWidthMm: 126, ridingType: "road_race", postureCategory: "aggressive",
    })));
    expect(screen.getByRole("button", { name: toolsSaddleMessages.en.noBike }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("slider", { name: saddleWidthMessages.en.sitBone }).getAttribute("aria-valuenow")).toBe("125");
  });

  it("restores saved values before profile and bike defaults after remount", () => {
    saved = { measurementMethod: "measured", sitBoneWidthMm: 132, ridingType: "gravel", postureCategory: "upright" };
    const view = render(<SaddleSelectorForm />);
    expect(screen.getByRole("slider", { name: saddleWidthMessages.en.sitBone }).getAttribute("aria-valuenow")).toBe("132");
    expect(screen.queryByRole("link", { name: "My profile" })).toBeNull();
    view.unmount();
    render(<SaddleSelectorForm />);
    expect(screen.getByRole("slider", { name: saddleWidthMessages.en.sitBone }).getAttribute("aria-valuenow")).toBe("132");
    expect(saveSession).not.toHaveBeenCalled();
    expect(profile?.sitBoneWidthMm).toBe(125);
  });

  it("keeps the active bike and values when flushing before a bike switch fails", async () => {
    bikeIdParam = "bike_b";
    saveSession.mockRejectedValueOnce(new Error("Unavailable"));
    render(<SaddleSelectorForm />);
    fireEvent.keyDown(screen.getByRole("slider", { name: saddleWidthMessages.en.sitBone }), { key: "ArrowRight" });
    fireEvent.click(screen.getByRole("button", { name: toolsSaddleMessages.en.noBike }));
    expect(await screen.findByText(autosaveMessages.en.error)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Race Road" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("slider", { name: saddleWidthMessages.en.sitBone }).getAttribute("aria-valuenow")).toBe("126");
    fireEvent.click(screen.getByRole("button", { name: autosaveMessages.en.retry }));
    await waitFor(() => expect(saveSession).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByRole("button", { name: toolsSaddleMessages.en.noBike }));
    await waitFor(() => expect(screen.getByRole("button", {
      name: toolsSaddleMessages.en.noBike,
    }).getAttribute("aria-pressed")).toBe("true"));
  });

  it("uses public defaults without a profile and waits for unresolved queries", () => {
    profile = undefined;
    const view = render(<SaddleSelectorForm />);
    expect(screen.getByText(toolsSaddleMessages.en.loading)).toBeTruthy();
    expect(screen.queryByRole("slider")).toBeNull();
    profile = null;
    view.rerender(<SaddleSelectorForm />);
    expect(screen.getByRole("slider", { name: saddleWidthMessages.en.sitBone }).getAttribute("aria-valuenow")).toBe("125");
    expect(saveSession).not.toHaveBeenCalled();
  });

  it("keeps values after errors, retries and retains history", async () => {
    locale = "nl";
    history = [{ _id: "session", createdAt: 1700000000000, widthRangeMinMm: 142,
      widthRangeMaxMm: 152, saddleFamily: "endurance_allroad" }];
    saveSession.mockRejectedValueOnce(new Error("Unavailable"));
    render(<SaddleSelectorForm />);
    expect(screen.getByRole("heading", { name: toolsSaddleMessages.nl.history })).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("slider", { name: saddleWidthMessages.nl.sitBone }), { key: "ArrowRight" });
    expect(await screen.findByText(autosaveMessages.nl.error)).toBeTruthy();
    expect(screen.getByRole("slider", { name: saddleWidthMessages.nl.sitBone }).getAttribute("aria-valuenow")).toBe("126");
    fireEvent.click(screen.getByRole("button", { name: autosaveMessages.nl.retry }));
    await waitFor(() => expect(saveSession).toHaveBeenCalledTimes(2));
    expect(await screen.findByText(new RegExp(autosaveMessages.nl.saved))).toBeTruthy();
  });

  it("ignores an unowned URL bike before making the ownership-checked query", () => {
    bikeIdParam = "unowned";
    render(<SaddleSelectorForm />);
    const latestCall = vi.mocked(useQuery).mock.calls.find(([query]) =>
      getFunctionName(query).includes("getLatestSaddleWidthSession"));
    expect(latestCall?.[1]).toEqual({ bikeId: undefined });
  });
});
