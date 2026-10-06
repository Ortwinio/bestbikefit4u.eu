/* @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PublicBodyReliabilityCalculator } from "./PublicBodyReliabilityCalculator";
import { PublicSaddleHeightCalculator } from "@/app/(public)/calculators/saddle-height/PublicSaddleHeightCalculator";
import { measurementChoiceMessages } from "@/i18n/calculators/measurementChoice";
import { saddleReliabilityMessages } from "@/i18n/calculators/saddleReliability";
import { reliabilityBodyMessages } from "@/i18n/calculators/reliabilityBody";
import { readHandoff, writeHandoffEntry } from "@/lib/handoff/store";
import { CalculatorDataContext } from "@/lib/calculatorData/context";

afterEach(() => { cleanup(); sessionStorage.clear(); localStorage.clear(); });

describe.each(["nl", "en"] as const)("%s inseam measurement choice", locale => {
  const copy = measurementChoiceMessages[locale];
  const inseamLabel = locale === "nl" ? "Binnenbeenlengte" : "Inseam";
  describe.each(["saddle", "bike-fit"] as const)("%s", calculator => {
    function form() {
      return render(calculator === "saddle" ? <PublicSaddleHeightCalculator isNl={locale === "nl"} />
        : <PublicBodyReliabilityCalculator calculator="bike-fit" locale={locale} />);
    }
    function choice() {
      return within(screen.getByRole("radiogroup", { name: copy.label }));
    }
    function result(container: HTMLElement) {
      return container.querySelector(calculator === "saddle" ? "#saddle-result" : '[data-reliability-result="saddleHeight"]')!;
    }

    it("preselects a method without fabricating or storing a measurement", () => {
      const { container } = form();
      expect(choice().getByRole("radio", { name: copy.measured }).getAttribute("aria-checked")).toBe("true");
      expect(screen.getByRole("radiogroup", { name: copy.label }).getAttribute("data-usability")).toBe("measurement-kind");
      const before = result(container).textContent;
      fireEvent.click(choice().getByRole("radio", { name: copy.estimated }));
      expect(choice().getByRole("radio", { name: copy.estimated }).getAttribute("aria-checked")).toBe("true");
      expect(readHandoff().entries).toEqual([]);
      expect(result(container).textContent).toBe(before);
      expect(screen.getByRole("slider", { name: inseamLabel }).getAttribute("aria-valuenow")).toBe("89");
    });

    it("uses the selected kind for slider edits and widens uncertainty for estimates", () => {
      const { container } = form();
      fireEvent.keyDown(screen.getByRole("slider", { name: inseamLabel }), { key: "ArrowRight" });
      expect(result(container).textContent).toMatch(/±\s*23/);
      fireEvent.click(choice().getByRole("radio", { name: copy.estimated }));
      expect(result(container).textContent).toMatch(/±\s*49/);
      expect(readHandoff().entries.find(entry => entry.field === "inseamCm")?.method).toBe("estimated");
      fireEvent.keyDown(screen.getByRole("slider", { name: inseamLabel }), { key: "ArrowLeft" });
      expect(readHandoff().entries.find(entry => entry.field === "inseamCm")?.method).toBe("estimated");
      expect(result(container).textContent).toMatch(/±\s*49/);
    });

    it.each(["measured", "estimated", "declared"] as const)("matches reused %s provenance without changing it", method => {
      writeHandoffEntry({ field: "inseamCm", value: 89, unit: "cm", calculator: "frame-size",
        method, touchedAt: Date.now() });
      const before = readHandoff();
      form();
      expect(choice().getByRole("radio", { name: method === "measured" ? copy.measured : copy.estimated })
        .getAttribute("aria-checked")).toBe("true");
      expect(readHandoff()).toEqual(before);
    });

    it("does not turn an estimate into a measurement when confirming plausibility", () => {
      const { container } = form();
      fireEvent.click(choice().getByRole("radio", { name: copy.estimated }));
      const slider = screen.getByRole("slider", { name: inseamLabel });
      for (let step = 0; step < 12; step += 1) fireEvent.keyDown(slider, { key: "ArrowRight" });
      fireEvent.click(screen.getByRole("button", { name: calculator === "saddle"
        ? saddleReliabilityMessages[locale].confirm : reliabilityBodyMessages[locale].confirmCheck }));
      expect(readHandoff().entries.find(entry => entry.field === "inseamCm")?.method).toBe("estimated");
      expect(result(container).textContent).toMatch(/±\s*52/);
      expect(choice().getByRole("radio", { name: copy.estimated }).getAttribute("aria-checked")).toBe("true");
    });

    it("discards repeated measurement metadata after explicit method changes", () => {
      writeHandoffEntry({ field: "inseamCm", value: 89, unit: "cm", calculator: "frame-size",
        method: "measured", kind: "measured", repeatCount: 3, withinTolerance: true,
        measurementMethod: "book", touchedAt: Date.now() });
      const { container } = form();
      expect(result(container).textContent).toMatch(/±\s*18/);
      fireEvent.click(choice().getByRole("radio", { name: copy.estimated }));
      fireEvent.click(choice().getByRole("radio", { name: copy.measured }));
      const entry = readHandoff().entries.find(item => item.field === "inseamCm");
      expect(entry?.method).toBe("measured");
      expect(entry?.repeatCount).toBeUndefined();
      expect(entry?.withinTolerance).toBeUndefined();
      expect(entry?.measurementMethod).toBeUndefined();
      expect(result(container).textContent).toMatch(/±\s*23/);
    });

    it("preserves profile provenance on load and sends only the explicitly chosen kind", () => {
      const save = vi.fn();
      render(<CalculatorDataContext.Provider value={{ source: "profile", ready: true, identity: "rider",
        entries: [{ field: "inseamCm", value: 89, unit: "cm", calculator: "frame-size", method: "measured",
          kind: "estimated", repeatCount: 3, withinTolerance: true, touchedAt: Date.now() }], save, remove: vi.fn() }}>
        {calculator === "saddle" ? <PublicSaddleHeightCalculator isNl={locale === "nl"} />
          : <PublicBodyReliabilityCalculator calculator="bike-fit" locale={locale} />}
      </CalculatorDataContext.Provider>);
      expect(choice().getByRole("radio", { name: copy.estimated }).getAttribute("aria-checked")).toBe("true");
      expect(save).not.toHaveBeenCalled();
      fireEvent.click(choice().getByRole("radio", { name: copy.measured }));
      expect(save).toHaveBeenCalledWith(expect.objectContaining({ field: "inseamCm", value: 89, method: "measured" }), undefined);
      expect(save.mock.calls.at(-1)?.[0].repeatCount).toBeUndefined();
      expect(save.mock.calls.at(-1)?.[0].withinTolerance).toBeUndefined();
      expect(readHandoff().entries).toEqual([]);
    });

    it("allows keyboard selection without storing a missing inseam", async () => {
      form();
      const measured = choice().getByRole("radio", { name: copy.measured });
      act(() => measured.focus());
      fireEvent.keyDown(measured, { key: "ArrowRight" });
      await waitFor(() => expect(choice().getByRole("radio", { name: copy.estimated }).getAttribute("aria-checked")).toBe("true"));
      expect(readHandoff().entries).toEqual([]);
    });
  });
});
