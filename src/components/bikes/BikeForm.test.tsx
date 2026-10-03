// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { bikeProfileFormMessages } from "@/i18n/account/bikeProfileForm";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { BikeForm } from "./BikeForm";

const state = vi.hoisted(() => ({ locale: "en" as "nl" | "en" }));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale: state.locale, messages: getDashboardMessages(state.locale) }),
}));
vi.mock("./BikeGeometryLibraryFields", () => ({ BikeGeometryLibraryFields: () => null }));
afterEach(() => { cleanup(); state.locale = "en"; });

describe("bike editing presentation", () => {
  it("keeps retained refinements unchanged when saving a free bike from another section", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<BikeForm refinementsLocked title="Edit bike" description="Bike" submitLabel="Save bike" onSubmit={onSubmit}
      initialData={{ name: "My bike", bikeType: "road", currentGeometry: { seatTubeAngle: 73, headTubeAngle: 72 },
        currentSetup: { handlebarReachMm: 510, handlebarDropMm: 45 },
        gearing: { drivetrainType: "2x", chainrings: [50, 34], cassetteTeeth: [11, 13, 28] } }} />);
    fireEvent.click(screen.getByRole("radio", { name: "Measurements" }));
    const label = getDashboardMessages("en").bikeForm.fields.geometry.seatTubeAngle.label;
    const angle = screen.getByRole("slider", { name: label });
    fireEvent.keyDown(angle, { key: "ArrowRight" });
    expect(angle.getAttribute("aria-valuenow")).toBe("73");
    expect((screen.getByRole("button", { name: `Clear measurement: ${label}` }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("radio", { name: "Notes" }));
    fireEvent.click(screen.getByRole("button", { name: "Save bike" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      currentGeometry: { seatTubeAngle: 73, headTubeAngle: 72 },
      currentSetup: { handlebarReachMm: 510, handlebarDropMm: 45 },
      gearing: { chainrings: [50, 34], cassetteTeeth: [11, 13, 28] },
    });
  });

  it("preserves saved and missing values when saving from another section", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<BikeForm title="Edit bike" description="Bike" submitLabel="Save bike" onSubmit={onSubmit}
      initialData={{ name: "My bike", bikeType: "road", currentGeometry: { stackMm: 950 },
        currentSetup: { saddleHeightMm: 740 },
        gearing: { drivetrainType: "2x", chainrings: [50, 34], cassetteTeeth: [11, 13, 28],
          wheelCircumferenceMm: 2105 } }} />);
    fireEvent.click(screen.getByRole("radio", { name: "Notes" }));
    fireEvent.click(screen.getByRole("button", { name: "Save bike" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.currentGeometry.stackMm).toBe(950);
    expect(payload.currentGeometry.reachMm).toBeUndefined();
    expect(payload.currentSetup.saddleHeightMm).toBe(740);
    expect(payload.gearing.chainrings).toEqual([50, 34]);
    expect(payload.gearing.cassetteTeeth).toEqual([11, 13, 28]);
  }, 15_000);
  it("opens the details section for a missing required name", async () => {
    const onSubmit = vi.fn();
    render(<BikeForm title="Edit bike" description="Bike" submitLabel="Save bike" onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("radio", { name: "Notes" }));
    fireEvent.click(screen.getByRole("button", { name: "Save bike" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("radio", { name: "Bike details" }).getAttribute("aria-checked")).toBe("true");
  });
});


describe("optional bike profile inputs", () => {
  it.each(["nl", "en"] as const)("keeps untouched values unknown and localizes the form in %s", async (locale) => {
    state.locale = locale;
    const save = vi.fn().mockResolvedValue(undefined);
    const copy = bikeProfileFormMessages[locale];
    render(<BikeForm title="Bike" description="Bike" submitLabel="Save" onSubmit={save}
      initialData={{name:"My bike",bikeType:"road"}} />);
    expect(screen.getByRole("button", {name:copy.lookup})).toBeTruthy();
    expect(document.getElementById("bike-geometry-library")).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", {name:locale === "nl" ? "Meetwaarden" : "Measurements"}));
    expect(screen.getByLabelText(copy.saddleModel)).toBeTruthy();
    expect(screen.getAllByText(copy.optional)[0]).toBeTruthy();
    fireEvent.click(screen.getByRole("button", {name:"Save"}));
    await waitFor(() => expect(save).toHaveBeenCalledOnce());
    const value=save.mock.calls[0][0];
    expect(value.gearing).toBeUndefined();
    for(const field of ["saddleModel","saddleWidthMm","pedalModel","cleatSystem","maxSeatpostMm","maxSpacerStackMm"])
      expect(value[field]).toBeUndefined();
    expect(value.currentSetup.spacersMm).toBeUndefined();
  });
  it("saves explicit equipment and zero spacers, then clears nested fields explicitly", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    render(<BikeForm title="Bike" description="Bike" submitLabel="Save" onAutosave={save}
      initialData={{name:"Bike",bikeType:"road",currentSetup:{spacersMm:0},saddleModel:"Old"}} />);
    fireEvent.click(screen.getByRole("radio", {name:"Measurements"}));
    fireEvent.change(screen.getByLabelText("Saddle model"), {target:{value:"New saddle"}});
    fireEvent.click(screen.getByRole("button", {name:/Clear measurement: Spacers below the stem/}));
    fireEvent.blur(screen.getByLabelText("Saddle model"));
    await waitFor(() => expect(save).toHaveBeenCalled(),{timeout:2500});
    expect(save.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({saddleModel:"New saddle",
      clearFields:expect.arrayContaining(["currentSetup.spacersMm"])}));
  });
});
