// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { accountReliabilityMessages } from "@/i18n/account/reliability";
import { InseamMeasurements } from "./InseamMeasurements";
import { KneePhotoInstructions } from "./KneePhotoInstructions";

afterEach(cleanup);

describe.each(["nl", "en"] as const)("account measurements %s", (locale) => {
  const copy = accountReliabilityMessages[locale];
  const setup = (onSave = vi.fn().mockResolvedValue(undefined)) => {
    render(<InseamMeasurements heightCm={190} measurements={[{ valueCm: 89, recordedAt: 1791158400000 }]} withinTolerance locale={locale} copy={copy} onSave={onSave} />);
    return onSave;
  };
  it("does not turn profile hydration or typing into a saved measurement", async () => {
    const onSave = setup();
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: `Add measurement: ${copy.newMeasurement}` }));
    fireEvent.change(screen.getByRole("slider", { name: copy.newMeasurement }), { target: { value: "89.1" } });
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: copy.saveMeasurement }));
    await waitFor(() => expect(onSave).toHaveBeenCalledExactlyOnceWith(89.1, false));
    expect(await screen.findByText(copy.saved)).toBeTruthy();
  });
  it("requires an explicit confirmation for a plausible but unusual value", async () => {
    const onSave = setup();
    fireEvent.click(screen.getByRole("button", { name: `Add measurement: ${copy.newMeasurement}` }));
    fireEvent.change(screen.getByRole("slider", { name: copy.newMeasurement }), { target: { value: "95" } });
    fireEvent.click(screen.getByRole("button", { name: copy.saveMeasurement }));
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: copy.confirm }));
    await waitFor(() => expect(onSave).toHaveBeenCalledExactlyOnceWith(95, true));
  });
  it("keeps failed input and allows a deliberate retry", async () => {
    const onSave = setup(vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined));
    const input = screen.getByRole("slider", { name: copy.newMeasurement }) as HTMLInputElement;
    fireEvent.click(screen.getByRole("button", { name: `Add measurement: ${copy.newMeasurement}` }));
    fireEvent.change(input, { target: { value: "89" } });
    fireEvent.click(screen.getByRole("button", { name: copy.saveMeasurement }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(input.value).toBe("89");
    fireEvent.click(screen.getByRole("button", { name: copy.saveMeasurement }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(2));
  });
  it("renders a labelled photo diagram and instructions without an upload control", () => {
    render(<KneePhotoInstructions copy={copy} />);
    expect(screen.getByRole("img", { name: copy.photoCaption })).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(document.querySelector('input[type="file"]')).toBeNull();
  });
});

it("preselects measured without saving, and routes an explicit estimate only to the estimate writer", async () => {
  const copy = accountReliabilityMessages.en;
  const onSave = vi.fn();
  const onSaveEstimate = vi.fn().mockResolvedValue(undefined);
  render(<InseamMeasurements heightCm={190} measurements={[]} withinTolerance={false}
    locale="en" copy={copy} onSave={onSave} onSaveEstimate={onSaveEstimate} />);
  const method = screen.getByRole("combobox", { name: "How did you determine this?" });
  expect(method.textContent).toContain("Measured");
  expect(onSave).not.toHaveBeenCalled();
  fireEvent.click(method);
  const option = await screen.findByRole("option", { name: "Estimated" });
  fireEvent.pointerDown(option, { pointerType: "mouse" });
  fireEvent.click(option);
  fireEvent.click(screen.getByRole("button", { name: `Add measurement: ${copy.newMeasurement}` }));
  fireEvent.change(screen.getByRole("slider", { name: copy.newMeasurement }), { target: { value: "89" } });
  fireEvent.click(screen.getByRole("button", { name: copy.saveMeasurement }));
  await waitFor(() => expect(onSaveEstimate).toHaveBeenCalledWith(89, false));
  expect(onSave).not.toHaveBeenCalled();
});
