// @vitest-environment jsdom
import { cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { accountReliabilityMessages } from "@/i18n/account/reliability";
import { AccountKneeView } from "./AccountKneeView";
import { AccountSaddleView } from "./AccountSaddleView";
import { accountSaddleFixture, kneeResultFixture } from "./visualFixtures";
import { SaddleSettings } from "./SaddleSettings";
import { useMeasurementRequest } from "./useMeasurementRequest";
import templateStyles from "../ReliabilityCalculatorTemplate.module.css";

afterEach(cleanup);
describe.each(["nl", "en"] as const)("paired account views %s", (locale) => {
  const copy = accountReliabilityMessages[locale];
  it("renders three saddle input cards with single headings and an unframed result", () => {
    const savedAt = 1791158400000;
    const { container } = render(<AccountSaddleView {...accountSaddleFixture(locale)} settingsUpdatedAt={savedAt} />);
    for (const heading of [copy.measurements, copy.bikeGoal, copy.assessments, copy.advice, copy.teaser]) {
      expect(screen.getAllByRole("heading", { name: heading })).toHaveLength(1);
    }
    expect(screen.getByText(`${copy.updated}: ${new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(savedAt)}`).closest('[data-slot="card"]')?.querySelector("h2")?.textContent).toBe(copy.bikeGoal);
    expect(screen.getAllByText(copy.assessmentHelp, { selector: "p" })).toHaveLength(1);
    expect(container.querySelectorAll('[data-slot="card"]')).toHaveLength(5);
    expect(container.querySelectorAll('[data-slot="card"] [data-slot="card"]')).toHaveLength(0);
    expect(container.querySelectorAll("[data-reliability-step]")).toHaveLength(0);
    expect(Array.from(container.querySelectorAll("section, details")).some((element) => element.classList.contains(templateStyles.card))).toBe(false);
    expect(screen.getByRole("region", { name: copy.saddle }).classList.contains(templateStyles.column)).toBe(true);
  });
  it("keeps unknown scores unset and the unknown settings date visible", () => {
    render(<AccountSaddleView {...accountSaddleFixture(locale)} settings={{}} />);
    expect(screen.getByText(copy.unknownDate)).toBeTruthy();
    for (const field of [copy.flexibility, copy.core]) {
      expect(screen.getByRole("slider", { name: `${field} (1–5)` }).getAttribute("aria-valuetext")).toBe(copy.scoreUnknown);
    }
  });
  it("renders knee photo, instructions and form cards without template card wrappers", () => {
    const { container } = render(<AccountKneeView locale={locale} canUseKneeAngle hasMeasurements currentSaddleHeightMm={787} saved={kneeResultFixture()} onSave={vi.fn()} />);
    expect(screen.getAllByRole("heading", { name: copy.instructions })).toHaveLength(1);
    expect(screen.getAllByLabelText(copy.angleInput)).toHaveLength(1);
    expect(screen.queryByRole("heading", { name: copy.angleInput })).toBeNull();
    expect(container.querySelectorAll("figcaption")).toHaveLength(1);
    expect(container.querySelectorAll('[data-slot="card"]')).toHaveLength(6);
    expect(container.querySelectorAll('[data-slot="card"] [data-slot="card"]')).toHaveLength(0);
    expect(container.querySelectorAll("[data-reliability-step]")).toHaveLength(0);
    expect(Array.from(container.querySelectorAll("section, details")).some((element) => element.classList.contains(templateStyles.card))).toBe(false);
    expect(screen.getByRole("region", { name: copy.knee }).classList.contains(templateStyles.column)).toBe(true);
    expect(container.querySelectorAll("[data-reliability-next-step]")).toHaveLength(1);
  });
  it("uses the knee card as the next step without a duplicate prompt or signup panel", () => {
    render(<AccountSaddleView {...accountSaddleFixture(locale)} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(copy.saddle);
    expect(document.querySelectorAll("[data-reliability-next-step]")).toHaveLength(0);
    expect(screen.getAllByText(copy.kneeLink)).toHaveLength(1);
    expect(screen.queryByText(/no account needed|zonder account/)).toBeNull();
    expect(document.querySelector('a[href*="login"]')).toBeNull();
  });
  it("hides mutation controls and results when the server denies access", () => {
    render(<AccountKneeView locale={locale} canUseKneeAngle={false} hasMeasurements saved={kneeResultFixture()} onSave={vi.fn()} />);
    expect(screen.queryByRole("button", { name: copy.saveAngle })).toBeNull();
    expect(screen.queryByText("31°")).toBeNull();
    expect(screen.getByRole("link", { name: copy.pricing })).toBeTruthy();
    expect(screen.getByText(copy.safety)).toBeTruthy();
  });
  it("allows signed-in open access regardless of a paid product", () => {
    render(<AccountKneeView locale={locale} canUseKneeAngle hasMeasurements onSave={vi.fn()} />);
    expect(screen.getByRole("button", { name: copy.saveAngle })).toBeTruthy();
    expect(screen.getByText(copy.noAngle)).toBeTruthy();
  });
  it("shows the missing profile state without creating sample measurements", () => {
    render(<AccountKneeView locale={locale} canUseKneeAngle hasMeasurements={false} onSave={vi.fn()} />);
    expect(screen.getByRole("link", { name: copy.profile })).toBeTruthy();
    expect(screen.queryByRole("button", { name: copy.saveAngle })).toBeNull();
  });
  it("saves only the explicitly changed preference", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<SaddleSettings initial={{ bikeType: "road" }} copy={copy} onSave={onSave} supportsClimbing />);
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: copy.gravel }));
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: copy.save }));
    await waitFor(() => expect(onSave).toHaveBeenCalledExactlyOnceWith({ bikeType: "gravel" }));
  });
  it("exposes named 1–5 sliders with localized values and keyboard controls", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<SaddleSettings initial={{ flexibility: 2, core: 3 }} copy={copy} onSave={onSave} />);
    const flexibility = screen.getByRole("slider", { name: `${copy.flexibility} (1–5)` });
    const core = screen.getByRole("slider", { name: `${copy.core} (1–5)` });
    for (const slider of [flexibility, core]) {
      expect(slider.getAttribute("min")).toBe("1");
      expect(slider.getAttribute("max")).toBe("5");
      expect(slider.getAttribute("step")).toBe("1");
    }
    expect(flexibility.getAttribute("aria-valuetext")).toBe(`2/5 · ${copy.flexibilityLevels[1]}`);
    expect(core.getAttribute("aria-valuetext")).toBe("3/5 · Plank 40-60 s");
    fireEvent.keyDown(flexibility, { key: "ArrowRight" });
    expect(flexibility.getAttribute("aria-valuetext")).toBe(`3/5 · ${copy.flexibilityLevels[2]}`);
    fireEvent.keyDown(flexibility, { key: "Home" });
    expect(flexibility.getAttribute("aria-valuetext")).toBe(`1/5 · ${copy.flexibilityLevels[0]}`);
    fireEvent.keyDown(core, { key: "End" });
    expect(core.getAttribute("aria-valuetext")).toBe("5/5 · Plank > 90 s");
    fireEvent.click(screen.getByRole("button", { name: copy.save }));
    await waitFor(() => expect(onSave).toHaveBeenCalledExactlyOnceWith({ flexibility: 1, core: 5 }));
  });
  it.each([[89], [89, 90, 91]])("keeps the repeat-measurement next step for %j", (...values) => {
    render(<AccountSaddleView {...accountSaddleFixture(locale, values)} />);
    expect(screen.getByText(copy.repeatNext)).toBeTruthy();
    expect(screen.queryByRole("heading", { name: copy.teaser })).toBeNull();
  });
  it("keeps the bike-and-goal next step when it differs", () => {
    render(<AccountSaddleView {...accountSaddleFixture(locale)} settings={{}} />);
    expect(screen.getByText(copy.chooseNext)).toBeTruthy();
    expect(document.querySelectorAll("[data-reliability-next-step]")).toHaveLength(1);
  });
});

it("reuses an id on network retries but not for another intentional measurement", () => {
  const { result } = renderHook(useMeasurementRequest);
  const first = result.current.requestId({ valueCm: 89 });
  expect(result.current.requestId({ valueCm: 89 })).toBe(first);
  expect(result.current.requestId({ valueCm: 90 })).not.toBe(first);
  result.current.complete();
  expect(result.current.requestId({ valueCm: 89 })).not.toBe(first);
});
