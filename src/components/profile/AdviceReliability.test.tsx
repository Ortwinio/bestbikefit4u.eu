/* @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, expect, it } from "vitest";
import { scoreAdviceReliability } from "../../../shared/profileScore";
import { AdviceReliability } from "./AdviceReliability";

afterEach(cleanup);
const score = scoreAdviceReliability({ profile: { inseamCm: 81 }, riderFields: ["inseamCm", "heightCm"], bikeFields: [] }, 1);

it.each(["nl", "en"] as const)("renders accessible advice-specific evidence and missing inputs in %s", locale => {
  render(<AdviceReliability locale={locale} score={score} />);
  expect(screen.getByRole("meter").getAttribute("aria-valuenow")).toBe("57");
  expect(screen.getByRole("meter").getAttribute("aria-valuetext")).toBe(locale === "nl" ? "57 van 100" : "57 out of 100");
  expect(screen.getByText(locale === "nl" ? /1 gegeven ontbreekt/ : /1 input is missing/)).toBeTruthy();
  expect(screen.getByText(locale === "nl" ? /Alleen de gegevens/ : /Only the inputs/)).toBeTruthy();
});

it("supports a calculator-specific reason and reduced-motion-safe updates", () => {
  const view = render(<AdviceReliability locale="nl" score={score} reason="Je binnenbeen is eenmaal gemeten." />);
  expect(screen.getByText("Je binnenbeen is eenmaal gemeten.")).toBeTruthy();
  view.rerender(<AdviceReliability locale="nl" score={{ ...score, reliability: 85 }} />);
  expect(screen.getByRole("meter").getAttribute("aria-valuenow")).toBe("85");
  const css = readFileSync("src/components/profile/AdviceReliability.module.css", "utf8");
  expect(css).toContain("prefers-reduced-motion: reduce");
  expect(css).toContain("transition: none");
});
