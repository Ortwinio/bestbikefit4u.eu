// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { BikeNumberField, BikeCassetteField, BikeFrameSizeField } from "./BikeFormControls";

vi.mock("@/i18n/useDashboardMessages", () => ({ useDashboardMessages: () => ({ locale: "en" }) }));
afterEach(cleanup);

describe("bike measurement controls", () => {
  it("does not turn an unknown measurement into a saved default on render", () => {
    const change = vi.fn();
    render(<BikeNumberField label="Stack" value={null} min={200} max={900} onChange={change} />);
    expect(change).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Add measurement: Stack" }));
    expect(change).toHaveBeenCalledWith(200);
  });
  it("keeps legacy out-of-range values and allows clearing them", () => {
    const change = vi.fn();
    render(<BikeNumberField label="Stack" value={950} min={200} max={900} onChange={change} />);
    expect(screen.getByRole("slider").getAttribute("aria-valuenow")).toBe("950");
    expect(change).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Clear measurement: Stack" }));
    expect(change).toHaveBeenCalledWith(null);
  });
  it("removes only the selected cassette sprocket", () => {
    const change = vi.fn();
    render(<BikeCassetteField label="Cassette" value="11, 13, 28" onChange={change} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove sprocket 2" }));
    expect(change).toHaveBeenCalledWith("11, 28");
  });
});

it("preserves a named manufacturer frame size until the rider enters a numerical measurement", () => {
  const change = vi.fn();
  render(<BikeFrameSizeField label="Frame size" value="M/L" onChange={change} />);
  expect(screen.getByText("Frame size: M/L")).toBeTruthy();
  expect(change).not.toHaveBeenCalled();
  expect(document.querySelector('input[type="number"], input[type="text"]')).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Add measurement: Frame size" }));
  expect(change).toHaveBeenCalledWith("35");
});
