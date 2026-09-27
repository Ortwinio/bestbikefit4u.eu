/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { wizardSchema, type WizardFormData } from "@/lib/validations/measurementWizard";
import type { Locale } from "@/i18n/config";
import { StepRidingStyle } from "./StepRidingStyle";

let locale: Locale = "en";
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale, messages: getDashboardMessages(locale) }),
}));
afterEach(cleanup);

function Harness({ onSave }: { onSave: (data: WizardFormData) => void }) {
  const methods = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      heightCm: 175, inseamCm: 81, flexibilityScore: "average", coreStabilityScore: 3,
      comfortScore: 5, painAreas: [],
    },
  });
  return <FormProvider {...methods}><form onSubmit={methods.handleSubmit(onSave)}><StepRidingStyle /><button type="submit">Save profile</button></form></FormProvider>;
}

describe("riding style onboarding errors", () => {
  it.each([
    ["en", "Please answer all four riding-style questions before saving your profile."],
    ["nl", "Beantwoord alle vier de vragen over je rijstijl voordat je je profiel opslaat."],
  ] as const)("shows an actionable %s alert after incomplete submission", async (selectedLocale, message) => {
    locale = selectedLocale;
    const onSave = vi.fn();
    render(<Harness onSave={onSave} />);
    expect(screen.queryByRole("alert")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));
    expect(await screen.findByRole("alert")).toHaveProperty("textContent", message);
    expect(onSave).not.toHaveBeenCalled();
  });
});
