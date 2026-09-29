/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FrameSizeCalculatorForm } from "./FrameSizeCalculatorForm";
import { runFrameSizeCalculation } from "@/lib/public-calculators/fitAdapters";
import { frameSizeMessages } from "@/i18n/calculators/frameSize";

afterEach(cleanup);

describe("FrameSizeCalculatorForm", () => {
  it.each(["en", "nl"] as const)("renders localized example state and confirms measurements in %s", (locale) => {
    const copy = frameSizeMessages[locale];
    render(<FrameSizeCalculatorForm locale={locale} />);
    expect(screen.getByRole("heading", { level: 1, name: copy.title })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: copy.nextTitle }).className).toContain("text-[var(--bbf-wit)]");
    expect(screen.getByText(copy.example)).toBeTruthy();
    expect(screen.queryByRole("spinbutton")).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: copy.confirmHeight }));
    expect(screen.getByText(copy.example)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: copy.confirmInseam }));
    expect(screen.queryByText(copy.example)).toBeNull();
    expect(screen.getByText(copy.confirmed)).toBeTruthy();
    expect(screen.getByRole("region", { name: copy.shortlist })).toBeTruthy();
    expect(screen.getByRole("link", {name: copy.startFit}).getAttribute("href")).toBe(`/${locale}/calculators/bike-fit`);
  });

  it("updates actual height-driven bands by keyboard across engine domains", () => {
    render(<FrameSizeCalculatorForm locale="en" />);
    const height = screen.getByRole("slider", {name:"Height"});
    expect(height.getAttribute("min")).toBe("130");
    expect(height.getAttribute("max")).toBe("210");
    const scale = () => screen.getByRole("list", {name:"Frame size bands"});
    for (const [key, expectedHeight] of [["Home",130],["ArrowRight",131],["End",210]] as const) {
      fireEvent.keyDown(height, {key});
      const actual = runFrameSizeCalculation({heightCm:expectedHeight,inseamCm:84,category:"road"}).estimatedFrameSize.replaceAll("-","–").replace(" cm","");
      expect(scale().querySelector('[aria-current="true"]')?.textContent).toContain(actual);
      expect(height.getAttribute("aria-valuetext")).toBe(`${expectedHeight} cm`);
    }
    fireEvent.keyDown(height,{key:"ArrowRight"});
    expect(height.getAttribute("aria-valuenow")).toBe("210");
    fireEvent.click(screen.getByRole("button", {name:/MTB/}));
    expect(scale().querySelector('[aria-current="true"]')?.textContent).toContain("XL–XXL");
    expect(within(scale()).getAllByRole("listitem")).toHaveLength(5);
    fireEvent.click(screen.getByRole("button", {name:/Gravel/}));
    expect(within(scale()).getAllByRole("listitem")).toHaveLength(6);
  });

  it("changes saddle estimate and live proportion graphic without making inseam a frame-sizing input", () => {
    render(<FrameSizeCalculatorForm locale="nl" />);
    const inseam = screen.getByRole("slider", {name:"Binnenbeenlengte"});
    const scale = screen.getByRole("list", {name:"Framemaatschalen"});
    const before = scale.querySelector('[aria-current="true"]')?.textContent;
    fireEvent.keyDown(inseam,{key:"ArrowRight"});
    expect(inseam.getAttribute("aria-valuetext")).toBe("84,5 cm");
    const estimate = runFrameSizeCalculation({heightCm:180,inseamCm:84.5,category:"road"});
    expect(screen.getByText(String(estimate.estimatedSaddleHeight))).toBeTruthy();
    expect(scale.querySelector('[aria-current="true"]')?.textContent).toBe(before);
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("0,469");
    fireEvent.keyDown(inseam,{key:"Home"});
    expect(inseam.getAttribute("aria-valuenow")).toBe("55");
    expect(screen.getByText("Deze verhouding tussen lengte en binnenbeenlengte is ongebruikelijk. Controleer je meting nog eens.")).toBeTruthy();
    fireEvent.keyDown(inseam,{key:"End"});
    expect(inseam.getAttribute("aria-valuenow")).toBe("105");
  });
});
