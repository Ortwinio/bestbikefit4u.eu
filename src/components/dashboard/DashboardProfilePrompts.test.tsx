// @vitest-environment jsdom
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { getFunctionName } from "convex/server";
import { DashboardProfilePrompts, type PromptQuestion, type PromptView } from "./DashboardProfilePrompts";

const state = vi.hoisted(() => ({ view: undefined as PromptView | undefined, open: vi.fn(), answer: vi.fn(), skip: vi.fn(), dismiss: vi.fn() }));
vi.mock("convex/react", () => ({
  useQuery: () => state.view,
  useMutation: (reference: Parameters<typeof getFunctionName>[0]) => ({
    "profiles/mutations:openPromptCard": state.open,
    "profiles/mutations:answerProfilePrompt": state.answer,
    "profiles/mutations:skipProfilePrompt": state.skip,
    "profiles/mutations:dismissPromptCard": state.dismiss,
  })[getFunctionName(reference)],
}));
const question = (changes: Partial<PromptQuestion> = {}): PromptQuestion => ({ key: "rider:armLengthCm", field: "armLengthCm", value: null, unit: "cm", kind: "measured", range: [30, 90], effects: ["bike-fit"], gain: 6.8, completenessGain: 8, effort: "measure", stale: false, status: "pending", ...changes });
const view = (questions = [question()]): PromptView => ({ cardId: "card-1", shownAt: Date.now(), hiddenUntil: null, questions });
const mount = (locale: "nl" | "en" = "en") => render(<DashboardProfilePrompts locale={locale} />);
async function choose(label: string, option: string) {
  fireEvent.click(screen.getByRole("combobox", { name: label }));
  const item = await screen.findByRole("option", { name: option });
  fireEvent.pointerDown(item, { pointerType: "mouse" });
  fireEvent.click(item);
}
async function fillArm() {
  fireEvent.change(screen.getByRole("spinbutton", { name: "Arm length (cm)" }), { target: { value: "61" } });
  await choose("How was this value determined?", "I measured this");
  fireEvent.click(screen.getByRole("button", { name: "Save detail" }));
}
beforeEach(() => {
  vi.resetAllMocks();
  state.view = view();
  state.open.mockResolvedValue(view());
  state.answer.mockResolvedValue({ status: "saved", field: "armLengthCm" });
  state.skip.mockResolvedValue(null);
  state.dismiss.mockResolvedValue(null);
});
afterEach(cleanup);

describe("dashboard profile prompts", () => {
  it("loads without writes while query is loading, then reserves one server card under strict mode", async () => {
    state.view = undefined;
    const rendered = render(<StrictMode><DashboardProfilePrompts locale="en" /></StrictMode>);
    expect(screen.getByRole("status").textContent).toContain("Loading");
    expect(state.open).not.toHaveBeenCalled();
    state.view = { cardId: null, shownAt: null, hiddenUntil: null, questions: [] };
    rendered.rerender(<StrictMode><DashboardProfilePrompts locale="en" /></StrictMode>);
    await screen.findByRole("article", { name: "Arm length" });
    expect(state.open).toHaveBeenCalledExactlyOnceWith({});
  });
  it("retries a failed open without inventing a card", async () => {
    state.view = { cardId: null, shownAt: null, hiddenUntil: null, questions: [] };
    state.open.mockRejectedValueOnce(new Error("offline"));
    mount();
    await screen.findByRole("alert");
    expect(screen.queryByRole("spinbutton")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await screen.findByRole("spinbutton");
    expect(state.open).toHaveBeenCalledTimes(2);
  });
  it("has no default numeric answer and requires an explicit method before saving", async () => {
    mount();
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("");
    expect(screen.getByText(/bony shoulder tip.*middle finger tip/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Save detail" }));
    expect(state.answer).not.toHaveBeenCalled();
    await fillArm();
    await waitFor(() => expect(state.answer).toHaveBeenCalledExactlyOnceWith({ cardId: "card-1", key: "rider:armLengthCm", value: 61, expectedCurrentValue: null, method: "single_measurement" }));
    expect(screen.getByRole("status").textContent).toContain("Future calculations");
    expect(screen.queryByText(/low.*medium/)).toBeNull();
  });
  it("retains drafts on save errors and retries explicitly", async () => {
    state.answer.mockRejectedValueOnce(new Error("offline"));
    mount();
    await fillArm();
    await screen.findByRole("alert");
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("61");
    fireEvent.click(screen.getByRole("button", { name: "Save detail" }));
    await screen.findByRole("status");
    expect(state.answer).toHaveBeenCalledTimes(2);
  });
  it("confirms actual stale values, not default numbers", async () => {
    state.view = view([question({ field: "weightKg", key: "rider:weightKg", value: 74, unit: "kg", range: [30, 200], stale: true, effects: ["tire-pressure"] })]);
    mount();
    expect(screen.getByText(/Is this value still correct/).textContent).toContain("74");
    expect(state.answer).not.toHaveBeenCalled();
    await choose("How was this value determined?", "I measured this");
    fireEvent.click(screen.getByRole("button", { name: "Confirm this value" }));
    await waitFor(() => expect(state.answer).toHaveBeenCalledWith(expect.objectContaining({ value: 74, expectedCurrentValue: 74 })));
  });
  it.each(["Keep profile value", "Measure again"])("%s discards a conflicting draft without a second write", async label => {
    state.answer.mockResolvedValue({ status: "conflict", field: "armLengthCm", currentValue: 63, incomingValue: 61 });
    mount();
    await fillArm();
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: label }));
    expect(state.answer).toHaveBeenCalledTimes(1);
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("");
    expect(screen.queryByRole("alert")).toBeNull();
  });
  it("retries a conflict only with the returned current value", async () => {
    state.answer.mockResolvedValueOnce({ status: "conflict", field: "armLengthCm", currentValue: 63, incomingValue: 61 });
    mount();
    await fillArm();
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "Use my entry" }));
    await waitFor(() => expect(state.answer).toHaveBeenLastCalledWith(expect.objectContaining({ expectedCurrentValue: 63, value: 61 })));
  });
  it("skips exactly the server slot and never adds a replacement", async () => {
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    await screen.findByRole("status");
    expect(state.skip).toHaveBeenCalledExactlyOnceWith({ cardId: "card-1", key: "rider:armLengthCm" });
    expect(screen.queryByRole("spinbutton")).toBeNull();
    expect(state.open).not.toHaveBeenCalled();
  });
  it("uses the server hidden date after dismissal and keeps the profile link", async () => {
    const rendered = mount();
    fireEvent.click(screen.getByRole("button", { name: "Not now" }));
    await waitFor(() => expect(state.dismiss).toHaveBeenCalledExactlyOnceWith({ cardId: "card-1" }));
    state.view = { ...view(), hiddenUntil: Date.now() + 7 * 86400000 };
    rendered.rerender(<DashboardProfilePrompts locale="en" />);
    expect(screen.getByText(/The question card is hidden until/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Go to My profile" }).getAttribute("href")).toBe("/en/profile");
    expect(screen.queryByRole("spinbutton")).toBeNull();
    expect(state.open).not.toHaveBeenCalled();
  });
  it("requires a saddle measurement point explicitly", async () => {
    state.view = view([question({ key: "bike:saddle", bikeId: "bike-1", bikeName: "My own bike", field: "currentSetup.saddleHeightMm", unit: "mm", range: [400, 1100] })]);
    mount();
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "740" } });
    await choose("How was this value determined?", "I measured this");
    fireEvent.click(screen.getByRole("button", { name: "Save detail" }));
    expect(state.answer).not.toHaveBeenCalled();
    await choose("Saddle height measurement point", "Bottom bracket centre to saddle top");
    fireEvent.click(screen.getByRole("button", { name: "Save detail" }));
    await waitFor(() => expect(state.answer).toHaveBeenCalledWith(expect.objectContaining({ value: 740, measurePoint: "bb_center_to_saddle_top" })));
  });
  it("labels test FTP as calculated and saves resulting FTP without conversion", async () => {
    state.view = view([question({ field: "ftpWatts", unit: "W", range: [30, 700] })]);
    mount("nl");
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "235" } });
    await choose("Hoe is deze waarde bepaald?", "FTP-resultaat van een 20-minutentest (berekend)");
    fireEvent.click(screen.getByRole("button", { name: "Bewaar gegeven" }));
    await waitFor(() => expect(state.answer).toHaveBeenCalledWith(expect.objectContaining({ value: 235, method: "ftp_test" })));
  });
  it("uses localized actual gains and server-selected fields with at most two slots", () => {
    state.view = view([question(), question({ key: "rider:ftp", field: "ftpWatts", unit: "W", effects: ["gearing"] }), question({ key: "extra" })]);
    mount("nl");
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(within(screen.getByRole("article", { name: "Armlengte" })).getByText(/6,8/)).toBeTruthy();
    expect(screen.queryByText("bike-fit")).toBeNull();
  });
  it("offers an unknown FTP path without saving defaults or removing skip", async () => {
    state.view = view([question({ field: "ftpWatts", unit: "W", range: [30, 700] })]);
    mount("nl");
    await choose("Hoe is deze waarde bepaald?", "Weet ik niet");
    expect(screen.getByRole("link", { name: "Open de FTP-calculator" }).getAttribute("href")).toBe("/nl/tools/ftp-wkg");
    expect(screen.queryByRole("spinbutton")).toBeNull();
    expect(screen.queryByRole("button", { name: "Bewaar gegeven" })).toBeNull();
    expect(screen.getByRole("button", { name: "Sla over" })).toBeTruthy();
    expect(state.answer).not.toHaveBeenCalled();
  });
  it("hides zero completeness gains and all potential badges once answered", () => {
    state.view = view([question({ completenessGain: 0 })]);
    const rendered = mount();
    expect(screen.queryByText(/completeness points/)).toBeNull();
    expect(screen.getByText(/up to \+6.8/)).toBeTruthy();
    state.view = view([question({ status: "answered", gain: 0, completenessGain: 0 })]);
    rendered.rerender(<DashboardProfilePrompts locale="en" />);
    expect(screen.queryByText(/reliability points/)).toBeNull();
    expect(screen.getByRole("status").textContent).toContain("Future calculations");
  });
  it("shows no card if the server has no eligible questions", async () => {
    state.view = { cardId: null, shownAt: null, hiddenUntil: null, questions: [] };
    state.open.mockResolvedValue(state.view);
    mount();
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
    expect(screen.queryByRole("region")).toBeNull();
    expect(state.open).toHaveBeenCalledTimes(1);
  });
  it("drops newly ineligible pending questions without opening replacements", () => {
    const rendered = mount();
    state.view = view([]);
    rendered.rerender(<DashboardProfilePrompts locale="en" />);
    expect(screen.queryByRole("article")).toBeNull();
    expect(state.open).not.toHaveBeenCalled();
  });
  it.each(["dismiss", "skip"] as const)("keeps the question and permits retry when %s fails", async action => {
    state[action].mockRejectedValueOnce(new Error("offline"));
    mount();
    fireEvent.click(screen.getByRole("button", { name: action === "dismiss" ? "Not now" : "Skip" }));
    await screen.findByRole("alert");
    expect(screen.getByRole("spinbutton")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: action === "dismiss" ? "Not now" : "Skip" }));
    await waitFor(() => expect(state[action]).toHaveBeenCalledTimes(2));
    expect(state.answer).not.toHaveBeenCalled();
  });
  it("does not save an enum default and sends the explicitly selected answer", async () => {
    state.view = view([question({ field: "bikeType", bikeId: "bike-1", kind: "declared", range: undefined, options: ["road", "gravel"], unit: "none" })]);
    mount("nl");
    expect(screen.getByRole("combobox", { name: "Fietstype" }).textContent).toContain("Kies een optie");
    await choose("Fietstype", "Gravelbike");
    await choose("Hoe is deze waarde bepaald?", "Dit is mijn antwoord");
    fireEvent.click(screen.getByRole("button", { name: "Bewaar gegeven" }));
    await waitFor(() => expect(state.answer).toHaveBeenCalledWith(expect.objectContaining({ value: "gravel", method: "self_report", expectedCurrentValue: null })));
  });
  it("explains optional demographic prompts without fake effects or zero gains", () => {
    state.view = view([question({ field: "birthDate", kind: "declared", range: undefined, unit: "date", effects: [], gain: 0, completenessGain: 0 })]);
    mount("nl");
    expect(screen.getByText(/Optioneel: je geboortedatum/)).toBeTruthy();
    expect(screen.queryByText(/\+0/)).toBeNull();
    expect(screen.queryByText(/Helpt bij/)).toBeNull();
    expect(screen.queryByText(/je persoonlijke advies/)).toBeNull();
    const input = screen.getByLabelText("Geboortedatum", { selector: "input" }) as HTMLInputElement;
    expect(input.type).toBe("date");
    expect(input.value).toBe("");
    expect(state.answer).not.toHaveBeenCalled();
  });
  it.each(["2100-01-01", "2025-01-01", "1900-01-01", "2023-02-29"])("rejects invalid prompt birth date %s without writing", async value => {
    state.view = view([question({ field: "birthDate", kind: "declared", range: undefined, unit: "date", effects: [], gain: 0, completenessGain: 0 })]);
    mount();
    const input = screen.getByLabelText("Date of birth", { selector: "input" });
    fireEvent.change(input, { target: { value } });
    await choose("How was this value determined?", "This is my answer");
    fireEvent.submit(input.closest("form")!);
    expect(state.answer).not.toHaveBeenCalled();
  });
  it("saves canonical birth date with no score claim and localized conflict values", async () => {
    state.view = view([question({ field: "birthDate", kind: "declared", range: undefined, unit: "date", effects: [], gain: 0, completenessGain: 0 })]);
    state.answer.mockResolvedValueOnce({ status: "conflict", field: "birthDate", currentValue: "1991-02-14", incomingValue: "1990-02-14" });
    mount();
    fireEvent.change(screen.getByLabelText("Date of birth", { selector: "input" }), { target: { value: "1990-02-14" } });
    await choose("How was this value determined?", "This is my answer");
    fireEvent.click(screen.getByRole("button", { name: "Save detail" }));
    expect((await screen.findByRole("alert")).textContent).toContain("14 February 1991");
    fireEvent.click(screen.getByRole("button", { name: "Use my entry" }));
    await waitFor(() => expect(state.answer).toHaveBeenLastCalledWith(expect.objectContaining({ value: "1990-02-14", method: "self_report", expectedCurrentValue: "1991-02-14" })));
    expect(screen.getByRole("status").textContent).toContain("does not change your profile score");
    expect(screen.getByRole("status").textContent).not.toContain("Future calculations");
  });
  it("respects prefer-not-to-say and never promises a sex-dependent estimate", async () => {
    state.view = view([question({ field: "sex", kind: "declared", range: undefined, options: ["female", "male", "prefer_not_to_say"], unit: "none", effects: [], gain: 0, completenessGain: 0 })]);
    mount();
    await choose("Sex", "Prefer not to say");
    await choose("How was this value determined?", "This is my answer");
    fireEvent.click(screen.getByRole("button", { name: "Save detail" }));
    await waitFor(() => expect(state.answer).toHaveBeenCalledWith(expect.objectContaining({ value: "prefer_not_to_say", method: "self_report" })));
    expect(screen.getByRole("status").textContent).toContain("do not guess your sex");
  });
});
