/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { ProfileDirectFields, type ProfileDirectValues } from "./ProfileDirectFields";

const state = vi.hoisted(() => ({ locale: "nl" as "nl" | "en" }));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale: state.locale, messages: getDashboardMessages(state.locale) }),
}));
afterEach(cleanup);

const values: ProfileDirectValues = {
  heightCm: 178, inseamCm: 83, flexibilityScore: "average", coreStabilityScore: 3,
  painAreaSeverities: { lower_back: 2 }, experienceLevel: "intermediate",
};

describe("direct profile layout staging", () => {
  it("locks only the paid measurement while keeping self-assessments and complaints editable", () => {
    state.locale = "en";
    render(<ProfileDirectFields values={{ ...values, femurLengthCm: 43 }} onChange={vi.fn()} refinementsLocked />);
    const copy = getDashboardMessages("en");
    expect(screen.queryByRole("slider", { name: copy.profile.measurements.femurLength })).toBeNull();
    expect(screen.getByRole("slider", { name: copy.profile.measurements.height })).toBeTruthy();
    expect(screen.getByRole("slider", { name: copy.profile.sections.flexibility })).toBeTruthy();
    expect(screen.getByRole("slider", { name: copy.profile.sections.coreStability })).toBeTruthy();
    expect(screen.getByRole("slider", { name: copy.questionnaire.painAreas.areas.lower_back.label })).toBeTruthy();
  });
  it.each(["nl", "en"] as const)("shows all six editable groups without save/edit buttons in %s", (locale) => {
    state.locale = locale;
    const changed = vi.fn();
    render(<ProfileDirectFields values={values} onChange={changed} />);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(6);
    expect(screen.queryByRole("button", { name: /^(Bewerken|Opslaan|Annuleren|Edit|Save|Cancel)$/ })).toBeNull();
    expect(screen.getByRole("slider", { name: getDashboardMessages(locale).profile.measurements.height })).toBeTruthy();
    expect(changed).not.toHaveBeenCalled();
    expect(values.weightKg).toBeUndefined();
    expect(values.torsoLengthCm).toBeUndefined();
  });
  it("emits only the edited measurement, without predicting or saving other fields", () => {
    state.locale = "nl";
    const changed = vi.fn();
    render(<ProfileDirectFields values={values} onChange={changed} />);
    fireEvent.keyDown(screen.getByRole("slider", { name: "Lengte" }), { key: "ArrowRight" });
    expect(changed).toHaveBeenCalledWith("body", { heightCm: 179 });
  });
  it("keeps per-block status and invalid input messages in the layout", () => {
    state.locale = "nl";
    render(<ProfileDirectFields values={values} onChange={vi.fn()}
      errors={{ heightCm: "Controleer je lengte." }}
      status={{ body: <p role="status">Niet opgeslagen — Opnieuw proberen</p> }} />);
    expect(screen.getByText("Vul een getal van 130 tot 210 cm in.")).toBeTruthy();
    expect(screen.getByText("Niet opgeslagen — Opnieuw proberen").getAttribute("role")).toBe("status");
  });
  it("keeps measurement instructions and comfort guidance reachable in Dutch", () => {
    state.locale = "nl";
    render(<ProfileDirectFields values={values} onChange={vi.fn()} />);
    expect(screen.getByText("Sta op blote voeten tegen een muur")).toBeTruthy();
    expect(screen.getByRole("link", { name: getDashboardMessages("nl").profile.comfort.improveLink })
      .getAttribute("href")).toBe("/nl/profile/improve/comfort");
    expect(screen.getByRole("link", { name: getDashboardMessages("nl").profile.measurements.improveLink })
      .getAttribute("href")).toBe("/nl/profile/improve/body-measurements");
  });
});
