/* @vitest-environment jsdom */

import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { quickFixMessages } from "@/i18n/calculators/quickFix";
import { SaddleHeightExperience } from "./SaddleHeightExperience";

const analytics = vi.hoisted(() => ({ trackQuickFixUsed: vi.fn(), trackInseamAdded: vi.fn() }));
vi.mock("@/lib/analytics/useSaddleReliabilityAnalytics", () => ({
  useSaddleReliabilityAnalytics: () => analytics,
}));

vi.mock("./SaddleHeightCalculatorForm", () => ({
  SaddleHeightCalculatorForm: ({ mode, onInseamAdded }: { mode: string; onInseamAdded: () => void }) => {
    const [height, setHeight] = useState("190");
    const [inseam, setInseam] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    return (
      <section aria-label="calculator" data-mode={mode}>
        <label>Height<input value={height} onChange={(event) => setHeight(event.target.value)} /></label>
        <label>Inseam<input value={inseam} onChange={(event) => setInseam(event.target.value)} /></label>
        <button type="button" aria-pressed={confirmed} onClick={() => {
          setConfirmed(true);
          onInseamAdded();
        }}>Confirm</button>
      </section>
    );
  },
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("SaddleHeightExperience", () => {
  it.each([true, false])("offers translated modes and practical steps (NL=%s)", (isNl) => {
    const copy = quickFixMessages[isNl ? "nl" : "en"];
    render(<SaddleHeightExperience isNl={isNl} />);
    expect(screen.queryByRole("heading", { name: copy.practicalTitle })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: copy.quick }));
    expect(analytics.trackQuickFixUsed).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: copy.quick }).getAttribute("aria-pressed")).toBe("true");
    const practical = screen.getByRole("region", { name: copy.practicalTitle });
    expect(within(practical).getAllByRole("listitem")).toHaveLength(4);
    for (const step of copy.steps) {
      expect(within(practical).getByRole("heading", { name: step.title })).toBeTruthy();
      expect(within(practical).getByText(step.description)).toBeTruthy();
    }
    expect(within(practical).getByText(copy.safety).closest("details")).toBeNull();
  });

  it("preserves measurements and confirmation in one mounted form across mode switches", () => {
    render(<SaddleHeightExperience isNl />);
    const originalForm = screen.getByRole("region", { name: "calculator" });
    fireEvent.change(screen.getByLabelText("Height"), { target: { value: "185" } });
    fireEvent.change(screen.getByLabelText("Inseam"), { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(analytics.trackInseamAdded).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: quickFixMessages.nl.quick }));
    expect(screen.getByRole("region", { name: "calculator" })).toBe(originalForm);
    const practical = screen.getByRole("region", { name: quickFixMessages.nl.practicalTitle });
    fireEvent.click(within(practical).getByRole("button", { name: quickFixMessages.nl.full }));
    expect(screen.getByRole("region", { name: "calculator" })).toBe(originalForm);
    expect(screen.getByRole("region", { name: "calculator" }).getAttribute("data-mode")).toBe("full");
    expect((screen.getByLabelText("Height") as HTMLInputElement).value).toBe("185");
    expect((screen.getByLabelText("Inseam") as HTMLInputElement).value).toBe("100");
    expect(screen.getByRole("button", { name: "Confirm" }).getAttribute("aria-pressed")).toBe("true");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: quickFixMessages.nl.full }));
  });

  it("allows isolated Quick Fix rendering without recording a user action", () => {
    render(<SaddleHeightExperience isNl initialMode="quick" />);
    expect(screen.getByText(quickFixMessages.nl.safety)).toBeTruthy();
    expect(analytics.trackQuickFixUsed).not.toHaveBeenCalled();
  });
});
