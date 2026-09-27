/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { wizardSchema, type WizardFormData } from "@/lib/validations/measurementWizard";
import { StepComfort } from "./StepComfort";

vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale: "en", messages: getDashboardMessages("en") }),
}));
afterEach(cleanup);

function Harness({ onSave }: { onSave: (data: WizardFormData) => void }) {
  const methods = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      heightCm: 175, inseamCm: 81, flexibilityScore: "average", coreStabilityScore: 3,
      comfortScore: 5, painAreas: [], experienceLevel: "intermediate", weeklyHours: "3-6",
      typicalRideLength: "medium", positionPriority: "balanced",
    },
  });
  return <FormProvider {...methods}><form onSubmit={methods.handleSubmit(onSave)}><StepComfort /><button type="submit">Save profile</button></form></FormProvider>;
}

describe("comfort onboarding", () => {
  it("requires a selected location for discomfort and submits the actual rider selection", async () => {
    const onSave = vi.fn();
    render(<Harness onSave={onSave} />);
    expect(screen.queryByRole("checkbox", { name: "Lower back" })).toBeNull();
    fireEvent.click(screen.getByText("Moderate discomfort"));
    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));
    expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Select one or more areas above.");
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("checkbox", { name: "Lower back" }));
    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ comfortScore: 3, painAreas: ["lower_back"] }), expect.anything()));
  });
});
