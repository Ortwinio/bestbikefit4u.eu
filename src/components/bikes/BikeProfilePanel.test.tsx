/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "../../../convex/_generated/dataModel";
import { scoreBike } from "../../../shared/profileScore";
import { bikeProfileMessages } from "@/i18n/account/bikeProfile";
import { BikeProfilePanel, type BikeProfileDetail } from "./BikeProfilePanel";

const update = vi.hoisted(() => vi.fn());
vi.mock("convex/react", () => ({ useMutation: () => update }));
// Native controls isolate the panel's explicit-save contract; real controls are covered by the browser capture.
vi.mock("@/components/ui", () => ({
  Button: ({ variant: _variant, size: _size, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>
    & { variant?: string; size?: string }) => <button {...props} />,
  Input: ({ label, tooltip: _tooltip, tooltipLabel: _tooltipLabel, ...props }: InputHTMLAttributes<HTMLInputElement>
    & { label: string; tooltip?: string; tooltipLabel?: string }) => <label>{label}<input {...props} /></label>,
  Select: ({ label, options, tooltip: _tooltip, tooltipLabel: _tooltipLabel, ...props }: SelectHTMLAttributes<HTMLSelectElement>
    & { label: string; options: { value: string; label: string }[]; tooltip?: string; tooltipLabel?: string }) =>
    <label>{label}<select {...props}>{options.map(option =>
      <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>,
}));
vi.mock("@/components/profile/ProfileStrengthRings", () => ({
  ProfileStrengthRings: ({ score }: { score: { completeness: number } }) => <span>{score.completeness}%</span>,
}));
const bikeId = "bike1" as Id<"bikes">;
function detail(): BikeProfileDetail {
  const bike = { _id: bikeId, name: "My bike", bikeType: "road", year: 2022,
    currentSetup: { saddleHeightMm: 725 }, gearing: { cassetteTeeth: [11, 13, 15, 28] } };
  return { bike, profileScore: scoreBike({ bike }, Date.now()), bikeObservations: [{
    field: "currentSetup.saddleHeightMm", value: 725, kind: "measured", source: "profile_edit", recordedAt: 1,
  }], riderProfile: { inseamCm: 83 }, adjustmentRoom: { status: "unknown" },
  } as unknown as BikeProfileDetail;
}
beforeEach(() => { update.mockReset(); update.mockResolvedValue({ status: "saved" }); });
afterEach(cleanup);

describe("bike profile explicit changes", () => {
  it.each(["nl", "en"] as const)("renders factual %s rows and links without saving", locale => {
    const copy = bikeProfileMessages[locale];
    render(<BikeProfilePanel bikeId={bikeId} locale={locale} detail={detail()} />);
    expect(screen.getByText(copy.lookup).closest("a")?.getAttribute("href"))
      .toBe(`/${locale}/bikes/bike1/edit#bike-geometry-library`);
    expect(screen.getByText("2022")).toBeTruthy();
    expect(screen.getByText("11–28")).toBeTruthy();
    expect(screen.getByText(copy.referenceUnknown)).toBeTruthy();
    expect(screen.getByText(copy.roomUnknown)).toBeTruthy();
    expect(screen.getByText("83 cm")).toBeTruthy();
    const editLinks = screen.getAllByRole("link", { name: new RegExp(`^${copy.edit}:`) });
    expect(editLinks.length).toBeGreaterThan(0);
    for (const link of editLinks) {
      expect(link.classList.contains("min-w-11")).toBe(true);
      expect(link.classList.contains("min-h-11")).toBe(true);
    }
    expect(update).not.toHaveBeenCalled();
  });
  it.each(["nl", "en"] as const)("keeps imported provenance distinct from a personal measurement in %s", locale => {
    const value = detail()!;
    value.bikeObservations[0] = { ...value.bikeObservations[0], kind: "estimated", method: "passport_import" };
    render(<BikeProfilePanel bikeId={bikeId} locale={locale} detail={value} />);
    expect(screen.getByText(new RegExp(bikeProfileMessages[locale].importSources.passport_import))).toBeTruthy();
    expect(screen.getByText(bikeProfileMessages[locale].kinds.estimated)).toBeTruthy();
    expect(screen.queryByText(bikeProfileMessages[locale].kinds.measured)).toBeNull();
  });
  it("does not initialize a missing value or save on open/cancel; saves only the explicit change", async () => {
    render(<BikeProfilePanel bikeId={bikeId} locale="nl" detail={detail()} />);
    fireEvent.click(screen.getByRole("button", { name: "Meet nu: Zadelterugstand" }));
    const input = screen.getByLabelText("Zadelterugstand (mm)");
    expect((input as HTMLInputElement).value).toBe("");
    fireEvent.click(screen.getByRole("button", { name: "Annuleer" }));
    expect(update).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Meet nu: Zadelterugstand" }));
    fireEvent.change(screen.getByLabelText("Zadelterugstand (mm)"), { target: { value: "52" } });
    fireEvent.click(screen.getByRole("button", { name: "Bewaar bij deze fiets" }));
    await waitFor(() => expect(update).toHaveBeenCalledWith({ bikeId, changes: [{
      field: "currentSetup.saddleSetbackMm", value: 52, kind: "declared", expectedCurrentValue: null,
    }] }));
    await screen.findByRole("status");
  });
  it("requires an explicit measurement date and reference point and preserves conflicted edits", async () => {
    update.mockResolvedValue({ status: "conflict" });
    render(<BikeProfilePanel bikeId={bikeId} locale="nl" detail={detail()} />);
    fireEvent.click(screen.getByRole("button", { name: "Meet nu: Zadelterugstand" }));
    fireEvent.change(screen.getByLabelText("Zadelterugstand (mm)"), { target: { value: "52" } });
    fireEvent.change(screen.getByLabelText("Hoe bepaald?"), { target: { value: "measured" } });
    fireEvent.click(screen.getByRole("button", { name: "Bewaar bij deze fiets" }));
    expect(update).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Datum van bepaling"), { target: { value: "2026-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "Bewaar bij deze fiets" }));
    expect(update).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Meetpunt"), { target: { value: "saddle_nose_behind_bb" } });
    fireEvent.click(screen.getByRole("button", { name: "Bewaar bij deze fiets" }));
    await screen.findByText(bikeProfileMessages.nl.conflict);
    expect((screen.getByLabelText("Zadelterugstand (mm)") as HTMLInputElement).value).toBe("52");
    expect(update.mock.calls[0][0].changes[0]).toMatchObject({ kind: "measured",
      measurePoint: "saddle_nose_behind_bb", measuredAt: new Date("2026-01-01T00:00:00").getTime() });
    expect(screen.queryByText(bikeProfileMessages.nl.saved)).toBeNull();
  });
});
