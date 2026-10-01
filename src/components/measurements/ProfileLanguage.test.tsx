/* @vitest-environment jsdom */
import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import type { Locale } from "@/i18n/config";
import { profileText } from "@/i18n/account/profileLanguage";
import { flexibilityTests, coreStabilityTests, comfortLevels } from "@/lib/validations/profile";
import { MeasurementWizard } from "./MeasurementWizard";
import { StepBodyMeasurements } from "./StepBodyMeasurements";
import { StepAdvancedMeasurements } from "./StepAdvancedMeasurements";
import { StepFlexibility } from "./StepFlexibility";
import { StepCoreStability } from "./StepCoreStability";
import { StepComfort } from "./StepComfort";
import { StepRidingStyle } from "./StepRidingStyle";
import { measurementIllustrations } from "./measurementIllustrations";
import { MeasurementIllustrationCard } from "./MeasurementIllustrationCard";
import { FlexibilityScale } from "@/components/profile/FlexibilityScale";
import { CoreStabilityBar } from "@/components/profile/CoreStabilityBar";
import { ComfortLevelBar } from "@/components/profile/ComfortLevelBar";

let locale: Locale = "nl";
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale, messages: getDashboardMessages(locale) }),
}));
beforeEach(() => { locale = "nl"; });
afterEach(cleanup);

function Harness({ children }: { children: ReactNode }) {
  const methods = useForm({ defaultValues: {
    heightCm: 175, inseamCm: 82, weightKg: 67, torsoLengthCm: 65, armLengthCm: 58,
    shoulderWidthCm: 40, femurLengthCm: 43, flexibilityScore: "good", coreStabilityScore: 4,
    comfortScore: 3, painAreas: [], experienceLevel: "advanced", weeklyHours: "10-15",
    typicalRideLength: "long", positionPriority: "performance",
  } });
  return <FormProvider {...methods}>{children}<button onClick={() => {
    methods.setValue("inseamCm", 55);
    methods.setValue("weightKg", 200);
    methods.setValue("torsoLengthCm", 45);
    methods.setValue("armLengthCm", 75);
    methods.setValue("shoulderWidthCm", 55);
    methods.setValue("femurLengthCm", 60);
  }}>Afwijkende maten</button></FormProvider>;
}

describe("Dutch profile wizard copy", () => {
  it.each([
    { Step: StepBodyMeasurements, title: "Waarom we je maten nodig hebben", label: "Lengte" },
    { Step: StepAdvancedMeasurements, title: "Optioneel, maar nuttig", label: "Romplengte" },
    { Step: StepFlexibility, title: "Waarom lenigheid telt", label: "Hoe ver kun je reiken?" },
    { Step: StepCoreStability, title: "Waarom rompstabiliteit telt", label: "Hoelang houd je een plank vol met de juiste houding?" },
    { Step: StepComfort, title: "Waarom je comfort telt", label: "Hoe comfortabel zit je op je huidige fiets?" },
  ])("localizes guidance and the accessible slider name: $label", ({ Step, title, label }) => {
    const { container } = render(<Harness><Step /></Harness>);
    expect(screen.getByText(title)).toBeTruthy();
    expect(screen.getByRole("slider", { name: label })).toBeTruthy();
    expect(container.textContent).not.toMatch(/Why |How to |Your |Affects:|optional|discomfort|Very Limited|Very Low/);
  });

  it("localizes riding-style guidance without changing option values", () => {
    const { container } = render(<Harness><StepRidingStyle /></Harness>);
    expect(screen.getByText("Waarom je rijstijl telt")).toBeTruthy();
    expect(screen.getByText("Gevorderd / veel uren")).toBeTruthy();
    expect(container.textContent).not.toMatch(/Why your|How riding|Beginner \/ low|Advanced \/ high/);
  });

  it.each([
    { Step: StepBodyMeasurements, fragments: ["Je binnenbeenlengte (55 cm)", "Je gewicht (200 kg)"] },
    { Step: StepAdvancedMeasurements, fragments: ["Je romplengte (45 cm)", "Je armlengte (75 cm)", "Je schouderbreedte (55 cm)", "Je bovenbeenlengte (60 cm)"] },
  ])("localizes dynamic measurement warnings", ({ Step, fragments }) => {
    const { container } = render(<Harness><Step /></Harness>);
    fireEvent.click(screen.getByRole("button", { name: "Afwijkende maten" }));
    for (const fragment of fragments) expect(container.textContent).toContain(fragment);
    expect(container.textContent).toContain("Controleer je meting.");
    expect(container.textContent).not.toMatch(/Your |expected|longer|shorter|heavier|lighter/);
  });

  it("shows Dutch validation linked to missing required measurements", async () => {
    const onComplete = vi.fn();
    render(<MeasurementWizard onComplete={onComplete} />);
    fireEvent.click(screen.getByRole("button", { name: getDashboardMessages("nl").questionnaire.actions.next }));
    await waitFor(() => expect(screen.getByRole("slider", { name: "Lengte" }).getAttribute("aria-invalid")).toBe("true"));
    for (const [name, message] of [["Lengte", "Vul een getal van 130 tot 210 cm in."], ["Binnenbeenlengte", "Vul een getal van 55 tot 105 cm in."]]) {
      const slider = screen.getByRole("slider", { name });
      const descriptions = slider.getAttribute("aria-describedby")!.split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent).join(" ");
      expect(descriptions).toContain(message);
    }
    expect(onComplete).not.toHaveBeenCalled();
  });

  it.each(Object.entries(measurementIllustrations))("localizes the %s illustration alt and caption, preserving English", (key, illustration) => {
    const measurement = key as keyof typeof measurementIllustrations;
    const { container, rerender } = render(<MeasurementIllustrationCard measurement={measurement} />);
    expect(screen.getByRole("img").getAttribute("alt")).not.toBe(illustration.alt);
    expect(container.textContent).not.toContain(illustration.caption);
    locale = "en";
    rerender(<MeasurementIllustrationCard measurement={measurement} />);
    expect(screen.getByRole("img").getAttribute("alt")).toBe(illustration.alt);
    expect(container.textContent).toBe(illustration.caption);
  });

  it.each([
    ...flexibilityTests.map((entry) => ({ ...entry, component: <FlexibilityScale score={entry.score} /> })),
    ...coreStabilityTests.map((entry) => ({ ...entry, component: <CoreStabilityBar score={entry.score} /> })),
    ...comfortLevels.map((entry) => ({ ...entry, component: <ComfortLevelBar score={entry.score} /> })),
  ])("translates assessment $label and keeps English unchanged", ({ component, label, description }) => {
    const { container, rerender } = render(component);
    expect(container.textContent).toContain(profileText("nl", label));
    expect(container.textContent).not.toContain(label);
    expect(container.textContent).not.toContain(description);
    locale = "en";
    rerender(<div>{component}</div>);
    expect(container.textContent).toContain(label);
    expect(container.textContent).toContain(description);
  });

  it("uses Dutch assessment labels for screen-reader values", () => {
    render(<Harness><StepFlexibility /><StepCoreStability /><StepComfort /></Harness>);
    expect(screen.getByRole("slider", { name: "Hoe ver kun je reiken?" }).getAttribute("aria-valuetext")).toBe("Goed");
    expect(screen.getByRole("slider", { name: "Hoelang houd je een plank vol met de juiste houding?" }).getAttribute("aria-valuetext")).toBe("Goed");
    expect(screen.getByRole("slider", { name: "Hoe comfortabel zit je op je huidige fiets?" }).getAttribute("aria-valuetext")).toBe("Matig ongemak");
  });
});
