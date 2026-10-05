// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { accountReliabilityMessages } from "@/i18n/account/reliability";
import { KneeMeasurementForm } from "./KneeMeasurementForm";

afterEach(cleanup);
describe.each(["nl", "en"] as const)("knee form %s", (locale) => {
  const copy = accountReliabilityMessages[locale];
  it("refreshes untouched profile height and preserves an edited height", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { rerender } = render(<KneeMeasurementForm copy={copy} onSave={onSave} />);
    rerender(<KneeMeasurementForm copy={copy} currentSaddleHeightMm={787} onSave={onSave} />);
    expect((screen.getByLabelText(copy.current) as HTMLInputElement).value).toBe("787");
    expect(screen.getByText(copy.fromProfile)).toBeTruthy();
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(copy.current), { target: { value: "780" } });
    rerender(<KneeMeasurementForm copy={copy} currentSaddleHeightMm={790} onSave={onSave} />);
    expect((screen.getByLabelText(copy.current) as HTMLInputElement).value).toBe("780");
    expect(screen.queryByText(copy.fromProfile)).toBeNull();
    fireEvent.change(screen.getByLabelText(copy.angleInput), { target: { value: "31" } });
    fireEvent.click(screen.getByRole("button", { name: copy.saveAngle }));
    await waitFor(() => expect(onSave).toHaveBeenCalledExactlyOnceWith(31, 780));
  });
  it("never saves a default or hydration as a photo measurement", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<KneeMeasurementForm copy={copy} currentSaddleHeightMm={787} onSave={onSave} />);
    expect(onSave).not.toHaveBeenCalled();
    expect((screen.getByLabelText(copy.angleInput) as HTMLInputElement).value).toBe("");
    fireEvent.change(screen.getByLabelText(copy.angleInput), { target: { value: "31" } });
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: copy.saveAngle }));
    await waitFor(() => expect(onSave).toHaveBeenCalledExactlyOnceWith(31, 787));
  });
  it("rejects the internal knee angle instead of silently interpreting it", () => {
    const onSave = vi.fn();
    render(<KneeMeasurementForm copy={copy} currentSaddleHeightMm={787} onSave={onSave} />);
    fireEvent.change(screen.getByLabelText(copy.angleInput), { target: { value: "149" } });
    fireEvent.submit(screen.getByRole("button", { name: copy.saveAngle }).closest("form")!);
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toBe(copy.angleInvalid);
  });
});
