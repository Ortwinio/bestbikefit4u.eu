// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { crankLengthMessages } from "@/i18n/calculators/crankLength";
import { CrankLengthCalculatorForm } from "./CrankLengthCalculatorForm";

afterEach(cleanup);

describe("live crank length calculator", () => {
  it("uses the real discrete threshold on keyboard input and updates the SVG", () => {
    render(
      <CrankLengthCalculatorForm
        locale="nl"
        copy={crankLengthMessages.nl}
        initialInseamCm={81.9}
        initialCategory="road"
      />,
    );
    const slider = screen.getByRole("slider", { name: "Binnenbeenlengte" });
    expect(slider.getAttribute("aria-valuetext")).toBe("81,9 cm");
    expect(
      screen.getByRole("status", { name: /Aanbevolen cranklengte|Recommended crank length/ })
        .textContent,
    ).toContain("170 mm");
    const before = screen.getByTestId("crank-arm").getAttribute("x2");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider.getAttribute("aria-valuetext")).toBe("82 cm");
    expect(
      screen.getByRole("status", { name: /Aanbevolen cranklengte|Recommended crank length/ })
        .textContent,
    ).toContain("172,5 mm");
    expect(screen.getByTestId("crank-arm").getAttribute("x2")).not.toBe(before);
    fireEvent.keyDown(slider, { key: "Home" });
    expect(
      screen.getByRole("status", { name: /Aanbevolen cranklengte|Recommended crank length/ })
        .textContent,
    ).toContain("165 mm");
    fireEvent.keyDown(slider, { key: "End" });
    expect(
      screen.getByRole("status", { name: /Aanbevolen cranklengte|Recommended crank length/ })
        .textContent,
    ).toContain("177,5 mm");
  });

  it("applies the real MTB adjustment when selecting a bike and exposes pressed state", () => {
    render(
      <CrankLengthCalculatorForm
        locale="en"
        copy={crankLengthMessages.en}
        initialInseamCm={90}
        initialCategory="road"
      />,
    );
    expect(
      screen.getByRole("status", { name: /Aanbevolen cranklengte|Recommended crank length/ })
        .textContent,
    ).toContain("175 mm");
    const mtb = screen.getByRole("button", { name: "Mountain bike" });
    fireEvent.click(mtb);
    expect(mtb.getAttribute("aria-pressed")).toBe("true");
    expect(
      screen.getByRole("status", { name: /Aanbevolen cranklengte|Recommended crank length/ })
        .textContent,
    ).toContain("172.5 mm");
    expect(
      screen
        .getByRole("list", { name: "Available crank recommendations" })
        .querySelector('[aria-current="true"]')?.textContent,
    ).toContain("172.5");
    expect(screen.getByRole("link", { name: "172.5 mm" }).getAttribute("href")).toBe(
      "#crank-result",
    );
  });

  it("replaces an invalid incoming measurement with a disclosed editable example", () => {
    render(
      <CrankLengthCalculatorForm
        locale="nl"
        copy={crankLengthMessages.nl}
        initialInseamCm={120}
        initialCategory="road"
      />,
    );
    const slider = screen.getByRole("slider", { name: "Binnenbeenlengte" });
    expect(slider.getAttribute("aria-valuenow")).toBe("84");
    expect(screen.getByText(crankLengthMessages.nl.invalid)).toBeTruthy();
    expect(screen.getByRole("region", { name: "Voorbeeldstartpunt" })).toBeTruthy();
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(screen.queryByText(crankLengthMessages.nl.invalid)).toBeNull();
    expect(screen.getByRole("region", { name: "Jouw startpunt" })).toBeTruthy();
    expect(screen.queryByRole("spinbutton")).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
  });
});
