// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { HANDOFF_KEY, readHandoff, writeHandoffEntry, type HandoffEntry } from "@/lib/handoff/store";
import { getWelcomeCopy } from "@/i18n/account/welcome";
import type { Context, ImportArgs } from "./handoff";
import WelcomeClient from "./WelcomeClient";

const runtime = vi.hoisted(() => ({ auth: { isAuthenticated: true, isLoading: false }, locale: "en" as "en" | "nl", context: { profile: null, observations: [] } as Context | undefined, save: vi.fn(), replace: vi.fn(), query: vi.fn() }));
const pricing = vi.hoisted(() => ({ enforced: false, fullProfile: true, isLoading: false, access: undefined }));
vi.mock("@/hooks/useProfileAccess", () => ({ useProfileAccess: () => pricing }));
vi.mock("convex/react", () => ({ useConvexAuth: () => runtime.auth, useQuery: (...args: unknown[]) => { runtime.query(...args); return runtime.context; }, useMutation: () => runtime.save }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: runtime.replace }) }));
vi.mock("@/i18n/useDashboardMessages", () => ({ useDashboardMessages: () => ({ locale: runtime.locale }) }));
vi.mock("@/components/branding/BrandLogo", () => ({ BrandLogo: () => <span>BikeFitBoost</span> }));

const entry = (overrides: Partial<HandoffEntry> = {}): HandoffEntry => ({ field: "inseamCm", value: 83, unit: "cm", calculator: "saddle-height", method: "measured", touchedAt: Date.now() - 1000, ...overrides });
const submit = () => fireEvent.click(screen.getByRole("button", { name: getWelcomeCopy(runtime.locale).confirm }));
const profile = (inseamCm: number): Context => ({ profile: { inseamCm } as NonNullable<Context["profile"]>, observations: [] });

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  runtime.auth = { isAuthenticated: true, isLoading: false };
  runtime.locale = "en";
  pricing.enforced = false; pricing.fullProfile = true; pricing.isLoading = false;
  runtime.context = { profile: null, observations: [] };
  runtime.save.mockResolvedValue({ status: "imported", importedFields: ["inseamCm"], conflicts: [], profileId: null, bikeId: null });
});
afterEach(cleanup);

describe("welcome handoff review", () => {
  it("scores the real handoff with authoritative free/paid access and leaves OFF unchanged", () => {
    runtime.context = { profile: { inseamCm: 83, femurLengthCm: 47 } as NonNullable<Context["profile"]>, observations: [] };
    const view = render(<WelcomeClient />);
    expect(screen.getAllByRole("meter")[0].getAttribute("aria-valuenow")).toBe("23");
    pricing.enforced = true; pricing.fullProfile = false;
    view.rerender(<WelcomeClient />);
    expect(screen.getAllByRole("meter")[0].getAttribute("aria-valuenow")).toBe("17");
    expect(screen.getAllByRole("meter")[0].getAttribute("aria-valuetext")).toContain("up to 80 percent");
    pricing.fullProfile = true;
    view.rerender(<WelcomeClient />);
    expect(screen.getAllByRole("meter")[0].getAttribute("aria-valuenow")).toBe("22");
    expect(runtime.save).not.toHaveBeenCalled();
  });

  it("gates unauthenticated access without importing or clearing", async () => {
    writeHandoffEntry(entry());
    runtime.auth.isAuthenticated = false;
    render(<WelcomeClient />);
    await waitFor(() => expect(runtime.replace).toHaveBeenCalledWith("/en/login?handoff=1"));
    expect(runtime.query).toHaveBeenCalledWith(expect.anything(), "skip");
    expect(runtime.save).not.toHaveBeenCalled();
    expect(readHandoff().entries).toHaveLength(1);
  });

  it("passes exact C records and clears only after successful confirmation", async () => {
    const record = entry();
    writeHandoffEntry(record);
    let resolveSave!: (value: unknown) => void;
    runtime.save.mockImplementation(() => new Promise(resolve => { resolveSave = resolve; }));
    render(<WelcomeClient />);
    submit();
    expect(runtime.save).toHaveBeenCalledWith({ records: [record] });
    expect(readHandoff().entries).toHaveLength(1);
    expect(runtime.replace).not.toHaveBeenCalled();
    resolveSave({ status: "imported", importedFields: ["inseamCm"], conflicts: [], profileId: null, bikeId: null });
    await waitFor(() => expect(runtime.replace).toHaveBeenCalledWith("/en/dashboard"));
    expect(sessionStorage.getItem(HANDOFF_KEY)).toBeNull();
  });

  it("retains session data and permits retry after an error", async () => {
    writeHandoffEntry(entry());
    runtime.save.mockRejectedValueOnce(new Error("backend failure"));
    render(<WelcomeClient />);
    submit();
    await screen.findByRole("alert");
    expect(readHandoff().entries).toHaveLength(1);
    expect(runtime.replace).not.toHaveBeenCalled();
    submit();
    await waitFor(() => expect(runtime.replace).toHaveBeenCalled());
    expect(runtime.save).toHaveBeenCalledTimes(2);
  });

  it.each(["profile", "today", "remeasure"] as const)("requires explicit %s conflict resolution with expected current value", async choice => {
    writeHandoffEntry(entry());
    runtime.context = profile(84);
    render(<WelcomeClient />);
    submit();
    expect(runtime.save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: getWelcomeCopy("en")[choice] }));
    submit();
    await waitFor(() => expect(runtime.save).toHaveBeenCalledWith(expect.objectContaining({ resolutions: [{ field: "inseamCm", choice, expectedCurrentValue: 84 }] })));
  });

  it("requires a fresh choice if the server returns a concurrent conflict", async () => {
    writeHandoffEntry(entry());
    runtime.context = profile(84);
    runtime.save.mockResolvedValueOnce({ status: "conflicts", importedFields: [], conflicts: [{ field: "inseamCm", currentValue: 85, incomingValue: 83, unit: "cm" }], profileId: null, bikeId: null });
    render(<WelcomeClient />);
    fireEvent.click(screen.getByRole("button", { name: "From today" }));
    submit();
    await screen.findByText("85 cm");
    expect(readHandoff().entries).toHaveLength(1);
    submit();
    expect(runtime.save).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "From today" }));
    submit();
    await waitFor(() => expect(runtime.save).toHaveBeenLastCalledWith(expect.objectContaining({ resolutions: [{ field: "inseamCm", choice: "today", expectedCurrentValue: 85 }] })));
  });

  it("cancels without calling the backend and clears the handoff", () => {
    writeHandoffEntry(entry());
    render(<WelcomeClient />);
    fireEvent.click(screen.getByRole("button", { name: "Bring nothing, start empty" }));
    expect(runtime.save).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(HANDOFF_KEY)).toBeNull();
    expect(runtime.replace).toHaveBeenCalledWith("/en/dashboard");
  });

  it("adjusts numeric records and omits selected fields", async () => {
    writeHandoffEntry(entry());
    writeHandoffEntry(entry({ field: "heightCm", value: 179 }));
    render(<WelcomeClient />);
    fireEvent.click(screen.getByRole("button", { name: "Adjust: Inseam" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Inseam" }), { target: { value: "82.5" } });
    fireEvent.click(screen.getByRole("button", { name: "Omit: Body height" }));
    submit();
    await waitFor(() => expect(runtime.save).toHaveBeenCalled());
    const args: ImportArgs = runtime.save.mock.calls[0][0];
    expect(args.records).toHaveLength(1);
    expect(args.records[0]).toMatchObject({ field: "inseamCm", value: 82.5, method: "measured" });
  });

  it("adds flexibility only after explicit keep", async () => {
    writeHandoffEntry(entry());
    render(<WelcomeClient />);
    fireEvent.click(screen.getByRole("button", { name: "Keep" }));
    submit();
    await waitFor(() => expect(runtime.save).toHaveBeenCalled());
    expect(runtime.save.mock.calls[0][0].records).toEqual(expect.arrayContaining([expect.objectContaining({ field: "flexibilityScore", value: 3, method: "estimated" })]));
  });

  it("does not submit the slider default or an unconfirmed slider change", async () => {
    writeHandoffEntry(entry());
    render(<WelcomeClient />);
    fireEvent.click(screen.getByRole("button", { name: "Keep" }));
    fireEvent.keyDown(screen.getByRole("slider", { name: "Flexibility" }), { key: "ArrowRight" });
    submit();
    await waitFor(() => expect(runtime.save).toHaveBeenCalled());
    expect(runtime.save.mock.calls[0][0].records.some((record: HandoffEntry) => record.field === "flexibilityScore")).toBe(false);
  });

  it("does not ask again for flexibility already in the profile", () => {
    runtime.context = { profile: { flexibilityScore: "good" } as NonNullable<Context["profile"]>, observations: [] };
    render(<WelcomeClient />);
    expect(screen.queryByText("First question")).toBeNull();
  });

  it("requires a genuine bike name and explicit saddle measurement point", async () => {
    writeHandoffEntry(entry({ field: "bikeCategory", value: "road", unit: "none", method: "declared" }));
    writeHandoffEntry(entry({ field: "currentSaddleHeightMm", value: 740, unit: "mm", method: "bike" }));
    render(<WelcomeClient />);
    fireEvent.click(screen.getByRole("button", { name: "Later" }));
    expect(screen.getByRole("textbox", { name: "Your bike’s name" }).getAttribute("maxlength")).toBe("100");
    fireEvent.change(screen.getByRole("textbox", { name: "Your bike’s name" }), { target: { value: "Weekend bike" } });
    submit();
    expect(runtime.save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("combobox", { name: "Saddle height measurement point" }));
    fireEvent.click(await screen.findByRole("option", { name: "Bottom bracket centre to saddle top" }));
    expect(screen.getByRole("meter", { name: "Bike profile · Weekend bike: Complete" }).getAttribute("aria-valuenow")).toBe("15");
    expect(screen.getByRole("meter", { name: "Rider profile: Complete" }).getAttribute("aria-valuenow")).toBe("0");
    submit();
    await waitFor(() => expect(runtime.save).toHaveBeenCalledWith(expect.objectContaining({ bike: { name: "Weekend bike", bikeType: "road", saddleHeightMeasurePoint: "bb_center_to_saddle_top" } })));
  });

  it("offers enum adjustment and renders NL copy without board sample names", () => {
    runtime.locale = "nl";
    writeHandoffEntry(entry({ field: "ridingGoal", value: "balanced", unit: "none", method: "declared" }));
    render(<WelcomeClient />);
    fireEvent.click(screen.getByRole("button", { name: "Pas aan: Standaard rijdoel" }));
    expect(screen.getByRole("combobox", { name: "Standaard rijdoel" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Dit nemen we mee" })).toBeTruthy();
    expect(within(screen.getByRole("main")).queryByText(/Sanne|Ontwerpstaat|Canyon/)).toBeNull();
  });

  it("submits an adjusted enum and leaves bike records out when the toggle is off", async () => {
    writeHandoffEntry(entry({ field: "ridingGoal", value: "balanced", unit: "none", method: "declared" }));
    writeHandoffEntry(entry({ field: "bikeCategory", value: "road", unit: "none", method: "declared" }));
    render(<WelcomeClient />);
    fireEvent.click(screen.getByRole("button", { name: "Adjust: Default riding goal" }));
    fireEvent.click(screen.getByRole("combobox", { name: "Default riding goal" }));
    const comfortOption = await screen.findByRole("option", { name: "Comfort" });
    fireEvent.pointerDown(comfortOption, { pointerType: "mouse" });
    fireEvent.click(comfortOption);
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Default riding goal" }).textContent).toContain("Comfort"));
    submit();
    await waitFor(() => expect(runtime.save).toHaveBeenCalled());
    const args: ImportArgs = runtime.save.mock.calls[0][0];
    expect(args.bike).toBeUndefined();
    expect(args.records).toEqual([expect.objectContaining({ field: "ridingGoal", value: "comfort" })]);
  });

  it("shows a usable empty state for corrupt session data", async () => {
    sessionStorage.setItem(HANDOFF_KEY, "invalid-json");
    render(<WelcomeClient />);
    expect(screen.getByText(getWelcomeCopy("en").empty)).toBeTruthy();
    submit();
    await waitFor(() => expect(runtime.save).toHaveBeenCalledWith({ records: [] }));
    expect(sessionStorage.getItem(HANDOFF_KEY)).toBeNull();
  });
});
