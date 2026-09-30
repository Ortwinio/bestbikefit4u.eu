/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import type { Locale } from "@/i18n/config";
import { ExperienceLevelSelector } from "./ExperienceLevelSelector";
import { WeeklyHoursSelector } from "./WeeklyHoursSelector";
import { RideDistanceSelector } from "./RideDistanceSelector";
import { PainAreasSelector } from "./PainAreasSelector";
import { PainDiscomfortSelector } from "./PainDiscomfortSelector";

let locale: Locale = "en";
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale, messages: getDashboardMessages(locale) }),
}));
afterEach(cleanup);

describe.each(["nl", "en"] as const)("%s questionnaire selector accessibility", (language) => {
  it.each(["experience", "hours", "distance"] as const)("labels every %s dot and keeps a fixed 44px target with original values", (kind) => {
    locale = language;
    const copy = getDashboardMessages(locale).questionnaire;
    const onChange = vi.fn();
    const cases = {
      experience: {
        element: <ExperienceLevelSelector value="intermediate" onChange={onChange} />,
        options: copy.experienceLevel.levels,
        selected: "intermediate",
      },
      hours: {
        element: <WeeklyHoursSelector value="3-6" onChange={onChange} />,
        options: copy.weeklyHours.options,
        selected: "3-6",
      },
      distance: {
        element: <RideDistanceSelector value="medium" onChange={onChange} />,
        options: copy.rideDistance.options,
        selected: "medium",
      },
    };
    const fixture = cases[kind];
    render(fixture.element);
    expect(screen.getAllByRole("radio")).toHaveLength(Object.keys(fixture.options).length);
    for (const [value, option] of Object.entries(fixture.options)) {
      const button = screen.getByRole("radio", { name: option.label });
      expect(button.classList.contains("size-11")).toBe(true);
      expect(button.classList.contains("shrink-0")).toBe(true);
      expect(button.getAttribute("aria-checked")).toBe(String(value === fixture.selected));
      expect(button.querySelector('[aria-hidden="true"]')).not.toBeNull();
      fireEvent.click(button);
      expect(onChange).toHaveBeenLastCalledWith(value);
    }
  });

  it("keeps pain selections on named full-card controls rather than decorative icons", () => {
    locale = language;
    const copy = getDashboardMessages(locale).questionnaire;
    const onChange = vi.fn();
    const { unmount } = render(<PainDiscomfortSelector value="no" onChange={onChange} />);
    for (const [value, option] of Object.entries(copy.painDiscomfort.options)) {
      const button = screen.getByRole("radio", { name: (name) => name.replace(/\s/g, "") === `${option.label}${option.subtitle}`.replace(/\s/g, "") });
      expect(button.classList.contains("py-5")).toBe(true);
      fireEvent.click(button);
      expect(onChange).toHaveBeenLastCalledWith(value);
    }
    unmount();
    render(<PainAreasSelector value={["neck"]} onChange={onChange} />);
    for (const [value, option] of Object.entries(copy.painAreas.areas)) {
      const button = screen.getByRole("checkbox", { name: (name) => name.replace(/\s/g, "") === `${option.label}${option.subtitle}`.replace(/\s/g, "") });
      expect(button.classList.contains("py-5")).toBe(true);
      fireEvent.click(button);
      expect(onChange).toHaveBeenLastCalledWith(value === "neck" ? [] : ["neck", value]);
    }
  });
});
