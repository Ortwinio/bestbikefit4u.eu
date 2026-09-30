/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProfileAssessmentSlider, ProfileChoiceQuestion } from "./ProfileChoiceQuestion";
import { ProfileWizardGuide } from "./ProfileWizardGuide";

afterEach(cleanup);

describe("profile presentation controls", () => {
  it("keeps unanswered riding choices unset and returns the original key", () => {
    const onChange = vi.fn();
    render(<ProfileChoiceQuestion label="Riding time" value={null} options={[{ key: "0-3", label: "0–3 uur" }, { key: "15+", label: "15+ uur" }]} onChange={onChange} />);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getAllByRole("button").every((button) => button.getAttribute("aria-pressed") === "false")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "15+ uur" }));
    expect(onChange).toHaveBeenCalledWith("15+");
  });

  it("maps assessment keyboard changes back to the schema key", () => {
    const onChange = vi.fn();
    render(<ProfileAssessmentSlider label="Flexibility" value="limited" options={[{ key: "limited", label: "Limited" }, { key: "average", label: "Average" }]} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith("average");
  });

  it.each(["nl", "en"] as const)("links the %s guide to the corresponding live route", (locale) => {
    render(<ProfileWizardGuide step={4} locale={locale} />);
    expect(screen.getByRole("link").getAttribute("href")).toBe(`/${locale}/profile/improve/core-stability`);
    expect(screen.getByRole("heading", { level: 3, name: locale === "nl" ? "Rompstabiliteit" : "Core stability" })).toBeTruthy();
  });
});
