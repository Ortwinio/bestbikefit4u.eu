// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import nl from "@/i18n/messages/nl";
import en from "@/i18n/messages/en";
import { calculateBasicPressure } from "@/lib/pressure-engine";
import { PressureCalculatorForm, type PressureCalculatorValues } from "./PressureCalculatorForm";

afterEach(() => { cleanup(); sessionStorage.clear(); });
const basic = {
  discipline: "road",
  bodyWeightKg: 75,
  widthFrontMm: 28,
  widthRearMm: 28,
  tubeType: "tubeless",
  surface: "average_asphalt",
} as const;
function mount(defaultDiscipline?: "road" | "gravel" | "mtb") {
  return render(
    <PressureCalculatorForm
      locale="en"
      defaultDiscipline={defaultDiscipline}
      labels={en.pressure.form}
      resultLabels={en.pressure.result}
    />,
  );
}
function expectResult(input: Parameters<typeof calculateBasicPressure>[0]) {
  const expected = calculateBasicPressure(input);
  const status = screen.getByRole("status", { name: "Pressure recommendation" });
  expect(status.textContent).toContain(`${expected.frontBar.toFixed(1)} bar`);
  expect(status.textContent).toContain(`${expected.rearBar.toFixed(1)} bar`);
}
describe("public pressure calculator", () => {
  it("shows one equipment-limit message while retaining real setup warnings", () => {
    mount("mtb");
    expect(screen.getByText(/Always check the maximum pressure marked/)).toBeTruthy();
    expect(screen.queryByText(en.pressure.result.disclaimer)).toBeNull();
    expect(screen.getByText(en.pressure.result.warningMessages.mtb_tire_width_unusual)).toBeTruthy();
  });

  it("shows a disclosed example then updates the real result and meters by keyboard", () => {
    mount();
    expect(screen.getByRole("region", { name: "Example starting pressure" })).toBeTruthy();
    expectResult(basic);
    const weight = screen.getByRole("slider", { name: en.pressure.form.bodyWeightLabel });
    fireEvent.keyDown(weight, { key: "ArrowRight" });
    expectResult({ ...basic, bodyWeightKg: 76 });
    expect(screen.getByRole("region", { name: "Your starting pressure" })).toBeTruthy();
    expect(screen.getAllByRole("meter")[0].getAttribute("aria-valuenow")).toBe(
      String(calculateBasicPressure({ ...basic, bodyWeightKg: 76 }).frontBar),
    );
    fireEvent.keyDown(weight, { key: "Home" });
    expect(weight.getAttribute("aria-valuenow")).toBe("35");
    fireEvent.keyDown(weight, { key: "End" });
    expect(weight.getAttribute("aria-valuenow")).toBe("160");
  });
  it("keeps widths linked until rear input and supports explicitly relinking", () => {
    mount();
    fireEvent.keyDown(screen.getByRole("slider", { name: en.pressure.form.widthFrontLabel }), {
      key: "ArrowRight",
    });
    expectResult({ ...basic, widthFrontMm: 29, widthRearMm: 29 });
    fireEvent.keyDown(screen.getByRole("slider", { name: en.pressure.form.widthRearLabel }), {
      key: "ArrowRight",
    });
    expectResult({ ...basic, widthFrontMm: 29, widthRearMm: 30 });
    const link = screen.getByRole("button", { name: "Same width front and rear" });
    expect(link.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(link);
    expectResult({ ...basic, widthFrontMm: 29, widthRearMm: 29 });
  });
  it.each(["road", "gravel", "mtb"] as const)(
    "preserves %s route discipline without silently changing width or surface",
    (discipline) => {
      mount(discipline);
      expectResult({ ...basic, discipline });
      const max = { road: 9, gravel: 5, mtb: 3.5 }[discipline];
      expect(screen.getAllByRole("meter")[0].getAttribute("aria-valuemax")).toBe(String(max));
      for (const warning of calculateBasicPressure({ ...basic, discipline }).warnings) {
        expect(screen.getByText(en.pressure.result.warningMessages[warning])).toBeTruthy();
      }
    },
  );
  it("preserves optional bike weight and goal calculations behind accessible disclosure", () => {
    mount();
    const toggle = screen.getByRole("button", { name: "Refine bike weight and riding goal" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(screen.getByRole("slider", { name: en.pressure.form.bikeWeightLabel }), {
      key: "End",
    });
    fireEvent.click(screen.getByRole("button", { name: en.pressure.form.ridingGoalComfort }));
    expectResult({ ...basic, bikeWeightKg: 20, ridingGoal: "comfort" });
    fireEvent.click(toggle);
    expectResult({ ...basic, ridingGoal: "comfort" });
    expect(screen.queryByRole("spinbutton")).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
  });
});


it("renders Dutch pressure controls, result ARIA labels and setup warnings", () => {
  render(<PressureCalculatorForm locale="nl" defaultDiscipline="mtb"
    labels={nl.pressure.form} resultLabels={nl.pressure.result} />);
  expect(screen.getByRole("slider", { name: "Lichaamsgewicht (kg)" })).toBeTruthy();
  expect(screen.getByRole("status", { name: "Bandenspanningsadvies" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Gelijk voor en achter" })).toBeTruthy();
  expect(screen.getByText(nl.pressure.result.warningMessages.mtb_tire_width_unusual)).toBeTruthy();
  expect(screen.queryByText(/Always check|Your tires|Rider weight/)).toBeNull();
});

describe("account pressure calculator reuse", () => {
  const saved: PressureCalculatorValues = {
    ...basic, discipline: "gravel", bodyWeightKg: 83, widthFrontMm: 40, widthRearMm: 42,
    surface: "hardpack_gravel", tubeType: "inner_tube", ridingGoal: "comfort", bikeWeightKg: 11,
  };

  it("prefills the same form without saving on mount and replaces only the public account CTA", () => {
    const onValuesChange = vi.fn();
    render(<PressureCalculatorForm locale="en" accountMode initialValues={saved}
      labels={en.pressure.form} resultLabels={en.pressure.result} onValuesChange={onValuesChange}
      headerSlot={<p>Bike selector</p>} statusSlot={<p>Saved</p>} />);
    expectResult(saved);
    expect(screen.getByRole("region", { name: "Your starting pressure" })).toBeTruthy();
    expect(screen.queryByRole("region", { name: "Example starting pressure" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Save your setup" })).toBeNull();
    expect(screen.getByText("Bike selector")).toBeTruthy();
    expect(screen.getByText("Saved")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Same width front and rear" }).getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByRole("slider", { name: en.pressure.form.bikeWeightLabel }).getAttribute("aria-valuenow")).toBe("11");
    expect(onValuesChange).not.toHaveBeenCalled();
  });

  it("notifies actual input changes and flushes the latest complete snapshot on keyboard and pointer commit", () => {
    const onValuesChange = vi.fn();
    const onValuesCommit = vi.fn();
    render(<PressureCalculatorForm locale="en" accountMode initialValues={saved}
      labels={en.pressure.form} resultLabels={en.pressure.result}
      onValuesChange={onValuesChange} onValuesCommit={onValuesCommit} />);
    const weight = screen.getByRole("slider", { name: en.pressure.form.bodyWeightLabel });
    fireEvent.keyDown(weight, { key: "ArrowRight" });
    expect(onValuesChange).toHaveBeenLastCalledWith({ ...saved, bodyWeightKg: 84 });
    expect(onValuesCommit).not.toHaveBeenCalled();
    fireEvent.keyUp(weight, { key: "ArrowRight" });
    expect(onValuesCommit).toHaveBeenLastCalledWith({ ...saved, bodyWeightKg: 84 });
    const front = screen.getByRole("slider", { name: en.pressure.form.widthFrontLabel });
    fireEvent.keyDown(front, { key: "ArrowRight" });
    fireEvent.pointerUp(front);
    expect(onValuesCommit).toHaveBeenLastCalledWith({ ...saved, bodyWeightKg: 84, widthFrontMm: 41 });
    fireEvent.click(screen.getByRole("button", { name: "Same width front and rear" }));
    expect(onValuesChange).toHaveBeenLastCalledWith({ ...saved, bodyWeightKg: 84, widthFrontMm: 41, widthRearMm: 41 });
    fireEvent.keyDown(front, { key: "ArrowRight" });
    expect(onValuesChange).toHaveBeenLastCalledWith({ ...saved, bodyWeightKg: 84, widthFrontMm: 42, widthRearMm: 42 });
  });

  it("sends optional advanced values and restores public defaults on a new keyed bike", () => {
    const onValuesChange = vi.fn();
    const { rerender } = render(<PressureCalculatorForm key="bike-1" locale="en" accountMode initialValues={saved}
      labels={en.pressure.form} resultLabels={en.pressure.result} onValuesChange={onValuesChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Refine bike weight and riding goal" }));
    expect(onValuesChange).toHaveBeenLastCalledWith({ ...saved, bikeWeightKg: undefined });
    rerender(<PressureCalculatorForm key="bike-2" locale="en" accountMode
      labels={en.pressure.form} resultLabels={en.pressure.result} onValuesChange={onValuesChange} />);
    expectResult(basic);
    expect(onValuesChange).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Refine bike weight and riding goal" }));
    fireEvent.click(screen.getByRole("button", { name: en.pressure.form.ridingGoalSpeed }));
    expect(onValuesChange).toHaveBeenLastCalledWith({ ...basic, bikeWeightKg: 8, ridingGoal: "speed" });
  });
});
