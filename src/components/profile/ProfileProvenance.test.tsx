// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { Doc } from "../../../convex/_generated/dataModel";
import { ProfileProvenance } from "./ProfileProvenance";
import type { ProvenanceContext, ProvenanceObservation } from "./ProfileProvenanceModel";
import { formatProfileBirthDate } from "@/i18n/account/profileProvenance";
import { getFunctionName } from "convex/server";

const state = vi.hoisted(() => ({ context: undefined as ProvenanceContext | undefined, save: vi.fn(), weight: vi.fn(), edit: vi.fn() }));
vi.mock("convex/react", () => ({ useQuery: (reference: Parameters<typeof getFunctionName>[0]) => getFunctionName(reference) === "emails/preferences:get" ? null : state.context, useMutation: () => state.save }));
const profile = { _id: "profile", heightCm: 178, inseamCm: 83, weightKg: 74, positionPriority: "balanced", painAreas: ["lower_back"] } as Doc<"profiles">;
const observation = (changes: Partial<ProvenanceObservation> = {}): ProvenanceObservation => ({ field: "inseamCm", value: 83, unit: "cm", kind: "measured", method: "single_measurement", source: "profile_edit", recordedAt: Date.UTC(2026, 8, 28), status: "current", ...changes });
const mount = (locale: "en" | "nl" = "en") => render(<ProfileProvenance profile={profile} locale={locale} onWeightSaved={state.weight} onEditDetails={state.edit} />);
async function chooseMethod(name = "I measured this") {
  fireEvent.click(screen.getByRole("combobox", { name: "How was this value determined?" }));
  const option = await screen.findByRole("option", { name });
  fireEvent.pointerDown(option, { pointerType: "mouse" });
  fireEvent.click(option);
}
async function editInseam() {
  fireEvent.click(screen.getByRole("button", { name: "Change: Inseam" }));
  fireEvent.change(screen.getByRole("slider", { name: "Inseam (cm)" }), { target: { value: "84" } });
  await chooseMethod();
  fireEvent.click(screen.getByRole("button", { name: "Save detail" }));
}
beforeEach(() => {
  vi.clearAllMocks();
  state.context = { profile, observations: [observation()] };
  state.save.mockResolvedValue({ status: "saved", field: "inseamCm" });
});
afterEach(cleanup);

describe("profile provenance", () => {
  it("shows matching actual provenance and dates, and never labels unknown values measured", () => {
    state.context!.observations.push(observation({ field: "armLengthCm", value: 62, kind: "derived", method: "legacy_height_formula", source: "legacy_migration" }));
    state.context!.profile = { ...profile, armLengthCm: 62 };
    mount();
    const rows = screen.getByRole("region", { name: "All your details" });
    expect(within(rows).getByText("Measured")).toBeTruthy();
    expect(within(rows).getByText("Calculated")).toBeTruthy();
    expect(within(rows).getByText("Derived from body height")).toBeTruthy();
    expect(within(rows).getAllByText("Recorded 28 Sept 2026").length).toBeGreaterThan(0);
    expect(within(rows).getAllByText("Unknown provenance").length).toBeGreaterThan(0);
    expect(state.save).not.toHaveBeenCalled();
  });
  it("ignores superseded, bike and mismatching observations", () => {
    state.context!.observations = [observation({ status: "superseded" }), observation({ value: 82 }), observation({ bikeId: "bike" as Doc<"bikes">["_id"] })];
    mount();
    expect(within(screen.getByRole("region", { name: "All your details" })).queryByText("Measured")).toBeNull();
  });
  it("filters groups without changing the total score", () => {
    mount();
    const initial = screen.getAllByRole("meter").map(meter => meter.getAttribute("aria-valuenow"));
    fireEvent.click(screen.getByRole("button", { name: /^Performance/ }));
    expect(screen.queryByRole("button", { name: "Change: Inseam" })).toBeNull();
    expect(screen.getByRole("button", { name: "Change: Weight" })).toBeTruthy();
    expect(screen.getAllByRole("meter").map(meter => meter.getAttribute("aria-valuenow"))).toEqual(initial);
  });
  it("saves one explicit measurement with expected current value, never repeat evidence", async () => {
    mount();
    await editInseam();
    await screen.findByText("Detail and provenance saved.");
    expect(state.save).toHaveBeenCalledWith({ field: "inseamCm", value: 84, kind: "measured", method: "single_measurement", expectedCurrentValue: 83 });
  });
  it("starts missing measurements blank, preselects the logical method and sends null expected value", async () => {
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Add detail: Torso length" }));
    const input = screen.getByRole("slider", { name: "Torso length (cm)" }) as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(screen.getByRole("combobox", { name: "How was this value determined?" }).textContent).toContain("I measured this");
    fireEvent.click(screen.getByRole("button", { name: "Add measurement: Torso length (cm)" }));
    expect(state.save).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "58" } });
    await chooseMethod();
    fireEvent.click(screen.getByRole("button", { name: "Save detail" }));
    await waitFor(() => expect(state.save).toHaveBeenCalledWith(expect.objectContaining({ field: "torsoLengthCm", expectedCurrentValue: null, value: 58 })));
  });
  it.each(["Keep profile value", "Measure again"])("%s discards a conflicting draft without a second write", async choice => {
    state.save.mockResolvedValueOnce({ status: "conflict", field: "inseamCm", currentValue: 85, incomingValue: 84 });
    mount(); await editInseam();
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: choice }));
    expect(state.save).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("slider", { name: "Inseam (cm)" })).toBeNull();
  });
  it("retries an accepted conflict against the returned current value", async () => {
    state.save.mockResolvedValueOnce({ status: "conflict", field: "inseamCm", currentValue: 85, incomingValue: 84 });
    mount(); await editInseam(); await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "Use new value" }));
    await waitFor(() => expect(state.save).toHaveBeenLastCalledWith(expect.objectContaining({ value: 84, expectedCurrentValue: 85 })));
  });
  it("keeps edits on error and supports retry", async () => {
    state.save.mockRejectedValueOnce(new Error("private backend details"));
    mount(); await editInseam(); await screen.findByRole("alert");
    expect((screen.getByRole("slider", { name: "Inseam (cm)" }) as HTMLInputElement).value).toBe("84");
    expect(screen.queryByText("private backend details")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Save detail" }));
    await waitFor(() => expect(state.save).toHaveBeenCalledTimes(2));
  });
  it("routes compound comfort editing to the existing autosave controls", () => {
    mount();
    expect(screen.getByText("Lower back")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Change: Discomfort areas" }));
    expect(state.edit).toHaveBeenCalledOnce();
    expect(state.save).not.toHaveBeenCalled();
  });
  it("handles provenance loading and nullable profile without fake values", () => {
    state.context = undefined;
    const view = mount();
    expect(screen.getByRole("status").textContent).toBe("Loading provenance…");
    expect(screen.queryByRole("meter")).toBeNull();
    state.context = { profile: null, observations: [] };
    view.rerender(<ProfileProvenance profile={profile} locale="en" onWeightSaved={state.weight} onEditDetails={state.edit} />);
    expect(screen.queryByText("Loading provenance…")).toBeNull();
    expect(screen.getByText("83 cm")).toBeTruthy();
  });
  it("renders bilingual legend with declared reliability at 60%", () => {
    mount("nl");
    expect(screen.getByText("Jouw antwoord; telt voor 60% betrouwbaarheid.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Privacy-instellingen" }).getAttribute("href")).toBe("/nl/settings");
  });
  it.each(["single_measurement", "ftp_test", "twentyMinute", "known"])("localizes known NL protocol %s without exposing keys", method => {
    state.context!.profile = { ...profile, ftpMethod: method, sweatProfile: "high", kneePainTiming: "after_ride" };
    mount("nl");
    const rows = screen.getByRole("region", { name: "Al je gegevens" });
    expect(rows.textContent).not.toContain(method);
    expect(within(rows).getByText("Veel")).toBeTruthy();
    expect(within(rows).getByText("Na de rit")).toBeTruthy();
  });
  it("edits hip measurements within the existing saddle-width engine bounds", () => {
    state.context!.profile = { ...profile, hipCircumferenceCm: 90 };
    mount();
    expect(screen.getByText("Hip circumference")).toBeTruthy();
    expect(screen.getByText("90 cm")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Change: Hip circumference" }));
    const input = screen.getByLabelText("Hip circumference (cm)", { selector: "input" }) as HTMLInputElement;
    expect(input.min).toBe("70");
    expect(input.max).toBe("160");
  });
  it("uses array provenance only when it structurally matches current profile values", () => {
    state.context!.profile = { ...profile, hasPain: "yes" };
    state.context!.observations = [observation({ field: "painAreas", value: ["lower_back"], unit: "none", kind: "derived" })];
    mount();
    expect(within(screen.getByRole("region", { name: "All your details" })).getByText("Calculated")).toBeTruthy();
    expect(screen.getByRole("meter", { name: "Your rider profile: Reliable" }).getAttribute("aria-valuenow")).toBe("34");
  });
  it("offers optional demographics with visible reasons and no inferred defaults", () => {
    state.context!.profile = { ...profile, age: 36 };
    mount("nl");
    expect(screen.getByText(/Optioneel: geslacht/)).toBeTruthy();
    expect(screen.getByText(/Optioneel: je geboortedatum/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Vul aan: Geboortedatum" }));
    const input = screen.getByLabelText("Geboortedatum", { selector: "input" }) as HTMLInputElement;
    expect(input.type).toBe("date");
    expect(input.value).toBe("");
    expect(state.save).not.toHaveBeenCalled();
    expect(screen.queryByText(/Geboortedatum \(date\)/)).toBeNull();
  });
  it("saves a birth date as declared without overwriting legacy age", async () => {
    state.context!.profile = { ...profile, age: 36 };
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Add detail: Date of birth" }));
    fireEvent.change(screen.getByLabelText("Date of birth", { selector: "input" }), { target: { value: "1990-02-14" } });
    await chooseMethod("This is my answer");
    fireEvent.click(screen.getByRole("button", { name: "Save detail" }));
    await waitFor(() => expect(state.save).toHaveBeenCalledExactlyOnceWith({ field: "birthDate", value: "1990-02-14", kind: "declared", method: "self_report", expectedCurrentValue: null }));
  });
  it.each(["2100-01-01", "2025-01-01", "1900-01-01", "2023-02-29"])("does not save invalid or unsupported birth date %s", async value => {
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Add detail: Date of birth" }));
    const input = screen.getByLabelText("Date of birth", { selector: "input" });
    fireEvent.change(input, { target: { value } });
    await chooseMethod("This is my answer");
    fireEvent.submit(input.closest("form")!);
    expect(state.save).not.toHaveBeenCalled();
  });
  it("saves an explicit decline without inferring sex or changing the score", async () => {
    const rendered = mount();
    const scores = screen.getAllByRole("meter").map(meter => meter.getAttribute("aria-valuenow"));
    fireEvent.click(screen.getByRole("button", { name: "Add detail: Sex" }));
    expect(screen.getByRole("combobox", { name: "Sex" }).textContent).toContain("Choose an option");
    fireEvent.click(screen.getByRole("combobox", { name: "Sex" }));
    const option = await screen.findByRole("option", { name: "Prefer not to say" });
    fireEvent.pointerDown(option, { pointerType: "mouse" }); fireEvent.click(option);
    await chooseMethod("This is my answer");
    fireEvent.click(screen.getByRole("button", { name: "Save detail" }));
    await waitFor(() => expect(state.save).toHaveBeenCalledWith({ field: "sex", value: "prefer_not_to_say", kind: "declared", method: "self_report", expectedCurrentValue: null }));
    state.context!.profile = { ...profile, sex: "prefer_not_to_say", birthDate: "1990-02-14" };
    rendered.rerender(<ProfileProvenance profile={profile} locale="en" onWeightSaved={state.weight} onEditDetails={state.edit} />);
    expect(screen.getAllByRole("meter").map(meter => meter.getAttribute("aria-valuenow"))).toEqual(scores);
    expect(screen.getByText("14 February 1990")).toBeTruthy();
  });
  it("localizes birth dates in UTC and explains demographic conflicts visibly", async () => {
    expect(formatProfileBirthDate("1990-02-14", "nl")).toBe("14 februari 1990");
    expect(formatProfileBirthDate("1990-02-14", "en")).toBe("14 February 1990");
    expect(formatProfileBirthDate("2023-02-29", "nl")).toBeNull();
    state.save.mockResolvedValue({ status: "conflict", field: "birthDate", currentValue: "1991-02-14", incomingValue: "1990-02-14" });
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Add detail: Date of birth" }));
    fireEvent.change(screen.getByLabelText("Date of birth", { selector: "input" }), { target: { value: "1990-02-14" } });
    await chooseMethod("This is my answer");
    fireEvent.click(screen.getByRole("button", { name: "Save detail" }));
    const conflict = await screen.findByRole("alert");
    expect(within(conflict).getByText(/Optional: your date of birth/)).toBeTruthy();
    expect(within(conflict).getByText("14 February 1991")).toBeTruthy();
  });
});
