// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import { SaddleSelectorForm } from "./SaddleSelectorForm";
import { saddleWidthMessages } from "@/i18n/calculators/saddleWidth";
import { calculatorChainMessages } from "@/i18n/account/calculatorChain";

const state = vi.hoisted(() => ({ locale: "en" as "en" | "nl", bikeId: "", loading: false,
  profile: { sitBoneWidthMm: 125, heightCm: 180, weightKg: 75, hipCircumferenceCm: 100 },
  saved: null as Record<string, unknown> | null, save: vi.fn(), apply: vi.fn(),
  bike: { _id: "bike1", name: "Road", bikeType: "road", ridingStyle: "racing", primaryGoal: "performance" },
}));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(state.bikeId ? `bikeId=${state.bikeId}` : "") }));
vi.mock("@/i18n/useDashboardMessages", () => ({ useDashboardMessages: () => ({ locale: state.locale }) }));
vi.mock("convex/react", () => ({
  useMutation: (query: Parameters<typeof getFunctionName>[0]) =>
    getFunctionName(query).includes("calculatorChain") ? state.apply : state.save,
  useQuery: (query: Parameters<typeof getFunctionName>[0], args: unknown) => {
    if (args === "skip" || state.loading) return undefined;
    const name = getFunctionName(query);
    if (name.includes("getCurrentUser")) return { _id: "user" };
    if (name.includes("getLatestSaddleWidthSession")) return state.saved;
    if (name.includes("listSaddleWidthSessions")) return [];
    if (name === "calculatorChain/queries:getContext") return { profile: state.profile, bikes: [state.bike],
      observations: [], bikeObservations: [], advice: [] };
    if (name === "bikes/queries:list") return [state.bike];
    throw new Error(`Unexpected query ${name}`);
  },
}));
beforeEach(() => {
  state.locale = "en"; state.bikeId = ""; state.loading = false; state.saved = null;
  state.profile = { sitBoneWidthMm: 125, heightCm: 180, weightKg: 75, hipCircumferenceCm: 100 };
  state.save.mockReset().mockResolvedValue("saved");
  state.apply.mockReset().mockResolvedValue({ status: "saved", fields: ["sitBoneWidthMm"] });
});
afterEach(cleanup);
function openInputs() {
  const details = document.querySelector("details");
  if (details && !details.open) fireEvent.click(screen.getByText(calculatorChainMessages[state.locale].edit));
}
function edit() {
  fireEvent.keyDown(screen.getByRole("slider", { name: saddleWidthMessages[state.locale].sitBone }), { key: "ArrowRight" });
}
describe("saddle advice rider-profile chain", () => {
  it("uses live profile measurements over an old saved session and responds to profile changes", () => {
    state.saved = { measurementMethod: "measured", sitBoneWidthMm: 132, ridingType: "gravel", postureCategory: "upright" };
    const view = render(<SaddleSelectorForm />); openInputs();
    expect(screen.getByRole("slider", { name: saddleWidthMessages.en.sitBone }).getAttribute("aria-valuenow")).toBe("125");
    state.profile = { ...state.profile, sitBoneWidthMm: 130 };
    view.rerender(<SaddleSelectorForm />); openInputs();
    expect(screen.getByRole("slider", { name: saddleWidthMessages.en.sitBone }).getAttribute("aria-valuenow")).toBe("130");
    expect(state.save).not.toHaveBeenCalled(); expect(state.apply).not.toHaveBeenCalled();
  });
  it.each(["nl", "en"] as const)("requires an explicit measurement save in %s", async (locale) => {
    state.locale = locale; render(<SaddleSelectorForm />); openInputs(); edit();
    expect(state.save).not.toHaveBeenCalled(); expect(state.apply).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: calculatorChainMessages[locale].save }));
    await waitFor(() => expect(state.apply).toHaveBeenCalledWith(expect.objectContaining({ calculator: "saddle-width",
      changes: [expect.objectContaining({ field: "sitBoneWidthMm", value: 126, expectedCurrentValue: 125, kind: "declared" })],
    })));
    expect(screen.queryByRole("link", { name: /free account/i })).toBeNull();
  });
  it("automatically stores declared profile edits without a calculation-only option", async () => {
    render(<SaddleSelectorForm />); openInputs(); edit();
    expect(screen.queryByRole("button", { name: calculatorChainMessages.en.trial })).toBeNull();
    await waitFor(() => expect(state.apply).toHaveBeenCalledWith(expect.objectContaining({
      changes: [expect.objectContaining({ field: "sitBoneWidthMm", kind: "declared" })],
    })));
  });
  it("autosaves only local riding preferences when no bike is selected", async () => {
    render(<SaddleSelectorForm />); openInputs();
    fireEvent.click(screen.getByRole("button", { name: saddleWidthMessages.en.rides.gravel }));
    await waitFor(() => expect(state.save).toHaveBeenCalledWith(expect.objectContaining({
      bikeId: undefined, expectedUserId: "user", ridingType: "gravel", sitBoneWidthMm: 125,
    })));
    expect(state.apply).not.toHaveBeenCalled();
  });
  it("shows current bike posture, and directs the next step to saddle height", () => {
    state.bikeId = "bike1"; render(<SaddleSelectorForm />); openInputs();
    expect(screen.getByRole("radio", { name: saddleWidthMessages.en.postures.aggressive })
      .getAttribute("aria-checked")).toBe("true");
    expect([...document.querySelectorAll("a")].some((link) => link.getAttribute("href")?.split("?")[0] === "/en/tools/saddle-height"))
      .toBe(true);
  });
  it("retains failed shared changes for retry while independently saving last-used inputs", async () => {
    state.apply.mockRejectedValueOnce(new Error("offline"));
    render(<SaddleSelectorForm />); openInputs(); edit();
    fireEvent.click(screen.getByRole("button", { name: calculatorChainMessages.en.save }));
    await screen.findByText(calculatorChainMessages.en.error);
    expect(screen.getByRole("slider", { name: saddleWidthMessages.en.sitBone }).getAttribute("aria-valuenow")).toBe("126");
    expect(state.save).toHaveBeenCalledWith(expect.objectContaining({ sitBoneWidthMm: 126 }));
  });
});
