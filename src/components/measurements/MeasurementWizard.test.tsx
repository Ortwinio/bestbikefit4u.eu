/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import type { Locale } from "@/i18n/config";
import { MeasurementWizard } from "./MeasurementWizard";
import { profileWizardCopy } from "@/components/account/ProfileWizardGuide";

let locale: Locale = "en";
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale, messages: getDashboardMessages(locale) }),
}));
afterEach(cleanup);

describe("profile wizard presentation", () => {
  it.each(["nl", "en"] as const)("keeps all six steps and original submission fields in %s", async (selectedLocale) => {
    locale = selectedLocale;
    const copy = getDashboardMessages(locale);
    const wizardCopy = profileWizardCopy[locale];
    const progressName = (step: number) => `${wizardCopy.step} ${step} ${wizardCopy.of} 6`;
    const onComplete = vi.fn();
    render(<MeasurementWizard onComplete={onComplete} defaultValues={{ heightCm: 175, inseamCm: 82, flexibilityScore: "good", coreStabilityScore: 4, comfortScore: 5, painAreas: [], experienceLevel: "advanced", weeklyHours: "10-15", typicalRideLength: "long", positionPriority: "performance" }} />);
    for (let step = 1; step < 6; step++) {
      expect(screen.getByRole("progressbar", { name: progressName(step) }).getAttribute("aria-valuenow"))
        .toBe(String(Math.round(step / 6 * 100)));
      if (step === 3) {
        expect(screen.getAllByRole("progressbar")).toHaveLength(2);
        expect(screen.getByRole("progressbar", { name: copy.profile.sections.flexibility })
          .getAttribute("aria-valuenow")).toBe("80");
      }
      fireEvent.click(screen.getByRole("button", { name: copy.questionnaire.actions.next }));
      await waitFor(() => expect(screen.getByRole("progressbar", { name: progressName(step + 1) })
        .getAttribute("aria-valuenow")).toBe(String(Math.round((step + 1) / 6 * 100))));
      expect(onComplete).not.toHaveBeenCalled();
    }
    fireEvent.click(screen.getByRole("button", { name: copy.common.save }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ heightCm: 175, flexibilityScore: "good", coreStabilityScore: 4, comfortScore: 5, painAreas: [], experienceLevel: "advanced", weeklyHours: "10-15", typicalRideLength: "long", positionPriority: "performance" })));
  });

  it("does not advance past missing required measurements", async () => {
    locale = "en";
    const onComplete = vi.fn();
    render(<MeasurementWizard onComplete={onComplete} />);
    fireEvent.click(screen.getByRole("button", { name: getDashboardMessages(locale).questionnaire.actions.next }));
    await waitFor(() => expect(screen.getAllByRole("slider").some((slider) => slider.getAttribute("aria-invalid") === "true")).toBe(true));
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("17");
    expect(onComplete).not.toHaveBeenCalled();
  });
});
