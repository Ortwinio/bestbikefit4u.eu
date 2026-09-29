// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { BikeForm } from "./BikeForm";

vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale: "en", messages: getDashboardMessages("en") }),
}));
vi.mock("./BikeGeometryLibraryFields", () => ({ BikeGeometryLibraryFields: () => null }));
afterEach(cleanup);

describe("bike editing presentation", () => {
  it("preserves saved and missing values when saving from another section", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<BikeForm title="Edit bike" description="Bike" submitLabel="Save bike" onSubmit={onSubmit}
      initialData={{ name: "My bike", bikeType: "road", currentGeometry: { stackMm: 950 },
        currentSetup: { saddleHeightMm: 740 },
        gearing: { drivetrainType: "2x", chainrings: [50, 34], cassetteTeeth: [11, 13, 28],
          wheelCircumferenceMm: 2105 } }} />);
    fireEvent.click(screen.getByRole("radio", { name: "Notes" }));
    fireEvent.click(screen.getByRole("button", { name: "Save bike" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.currentGeometry.stackMm).toBe(950);
    expect(payload.currentGeometry.reachMm).toBeUndefined();
    expect(payload.currentSetup.saddleHeightMm).toBe(740);
    expect(payload.gearing.chainrings).toEqual([50, 34]);
    expect(payload.gearing.cassetteTeeth).toEqual([11, 13, 28]);
  }, 15_000);
  it("opens the details section for a missing required name", async () => {
    const onSubmit = vi.fn();
    render(<BikeForm title="Edit bike" description="Bike" submitLabel="Save bike" onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("radio", { name: "Notes" }));
    fireEvent.click(screen.getByRole("button", { name: "Save bike" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("radio", { name: "Bike details" }).getAttribute("aria-checked")).toBe("true");
  });
});
