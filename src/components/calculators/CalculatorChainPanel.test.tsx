// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CalculatorChainLayout, CalculatorChainPanel, CalculatorNextStep } from "./CalculatorChainPanel";
import { ConfiguratorLayout } from "@/components/ui/ConfiguratorLayout";
import type { ChainPanelController } from "./useCalculatorChain";
import { calculatorChainMessages } from "@/i18n/account/calculatorChain";

afterEach(cleanup);
function controller(patch: Partial<ChainPanelController> = {}): ChainPanelController {
  return { formKey: "test", pendingChanges: [], trialChanges: [], savedChanges: [],
    usedInputs: [{ field: "inseamCm", source: "profile", value: 81, unit: "cm", kind: "measured",
      recordedAt: Date.UTC(2026, 8, 28) }], saveToProfile: vi.fn(), useForThisCalculation: vi.fn(),
    discardChanges: vi.fn(), setChangeKind: vi.fn(), status: "idle", error: null, conflicts: [], trial: false,
    canAutosave: true, autoSaveProfile: false, ...patch };
}
const context = { profile: { inseamCm: 81, hasPain: "no" }, bikes: [], observations: [], bikeObservations: [] };
describe("account calculator chain panels", () => {
  it.each(["nl", "en"] as const)("offers explicit measured replacement but no calculation-only exemption in %s", (locale) => {
    render(<CalculatorChainPanel calculator="saddle-height" locale={locale} context={context}
      chain={controller({ autoSaveProfile: true, pendingChanges: [{ field: "inseamCm", source: "profile",
        value: 82, expectedCurrentValue: 81, kind: "declared" }] })} />);
    expect(screen.queryByRole("button", { name: calculatorChainMessages[locale].trial })).toBeNull();
    expect(screen.getByRole("button", { name: calculatorChainMessages[locale].save })).toBeTruthy();
  });
  it.each(["nl", "en"] as const)("shows real used values, source and date in %s", (locale) => {
    render(<CalculatorChainPanel calculator="saddle-height" locale={locale} chain={controller()} context={context} />);
    expect(screen.getByRole("heading", { name: calculatorChainMessages[locale].used })).toBeTruthy();
    expect(screen.getByText("81 cm")).toBeTruthy();
    expect(screen.getByText(calculatorChainMessages[locale].profile)).toBeTruthy();
    expect(screen.getByText(/2026/)).toBeTruthy();
    expect(screen.getByRole("meter")).toBeTruthy();
  });
  it("localizes bike input enum values in Dutch", () => {
    render(<CalculatorChainPanel calculator="tire-pressure" locale="nl" context={context}
      chain={controller({ usedInputs: [
        { field: "tires.tubeType", source: "bike", value: "inner_tube" },
        { field: "primaryGoal", source: "bike", value: "aerodynamics" },
      ] })} />);
    expect(screen.getByText("Binnenband")).toBeTruthy();
    expect(screen.getByText("Aerodynamisch")).toBeTruthy();
  });
  it("requires an explicit choice and reports save failures without clearing the input", () => {
    const chain = controller({ pendingChanges: [{ field: "inseamCm", source: "profile", value: 82,
      expectedCurrentValue: 81, kind: "declared" }], status: "error", canAutosave: false });
    render(<CalculatorChainPanel calculator="saddle-height" locale="nl" chain={chain} context={context} />);
    expect(chain.saveToProfile).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toBe(calculatorChainMessages.nl.error);
    fireEvent.click(screen.getByRole("button", { name: calculatorChainMessages.nl.trial }));
    expect(chain.useForThisCalculation).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: calculatorChainMessages.nl.save }));
    expect(chain.saveToProfile).toHaveBeenCalledOnce();
  });
  it("requires a saddle measurement point before saving measured height", () => {
    render(<CalculatorChainPanel calculator="saddle-height" locale="en" context={context}
      chain={controller({ pendingChanges: [{ field: "currentSetup.saddleHeightMm", source: "bike", value: 730,
        expectedCurrentValue: 728, kind: "measured" }] })} />);
    expect((screen.getByRole("button", { name: calculatorChainMessages.en.save }) as HTMLButtonElement).disabled).toBe(true);
  });
  it("shows changed fields only after save and exactly one next step", () => {
    const chain = controller({ status: "saved", savedChanges: [{ field: "inseamCm", source: "profile", value: 82,
      expectedCurrentValue: 81, kind: "measured" }] });
    render(<CalculatorChainLayout calculator="saddle-height" locale="nl" chain={chain} context={context}>
      <ConfiguratorLayout eyebrow="test" title="test" inputs={<p>Editable inputs</p>} results={<p>Visible result</p>} />
    </CalculatorChainLayout>);
    expect(screen.getByRole("status").textContent).toContain(calculatorChainMessages.nl.updated);
    expect(screen.getByText("Visible result")).toBeTruthy();
    expect(screen.getAllByRole("link", { name: calculatorChainMessages.nl.nextAction })).toHaveLength(1);
    expect(screen.getByRole("link", { name: calculatorChainMessages.nl.nextAction }).getAttribute("href"))
      .toBe("/nl/saddle-selector");
  });
  it("prioritizes the fit flow for reported discomfort without including measurements in the link", () => {
    render(<CalculatorNextStep calculator="frame-size" locale="en" chain={controller()}
      context={{ ...context, profile: { inseamCm: 81, hasPain: "yes" } }} />);
    expect(screen.getByRole("link").getAttribute("href")).toBe("/en/fit");
    expect(screen.getByText(calculatorChainMessages.en.painReason)).toBeTruthy();
  });
});
