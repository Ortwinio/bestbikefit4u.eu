/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, expect, it } from "vitest";
import { ProfileStrengthRings } from "./ProfileStrengthRings";

afterEach(cleanup);

it.each(["nl", "en"] as const)("marks the free completeness cap without changing the score or reliability in %s", locale => {
  const view = render(<ProfileStrengthRings locale={locale} capped score={{ completeness: 80, reliability: 57 }} />);
  const meters = screen.getAllByRole("meter");
  expect(meters[0].getAttribute("aria-valuenow")).toBe("80");
  expect(meters[0].getAttribute("aria-valuetext")).toContain(locale === "nl" ? "maximaal 80" : "up to 80");
  expect(meters[1].getAttribute("aria-valuenow")).toBe("57");
  expect(meters[1].getAttribute("aria-valuetext")).not.toContain("80");
  expect(view.container.querySelectorAll('line[transform="rotate(288 60 60)"]')).toHaveLength(1);
  view.rerender(<ProfileStrengthRings locale={locale} score={{ completeness: 100, reliability: 91 }} />);
  expect(view.container.querySelector("line")).toBeNull();
  expect(screen.getAllByRole("meter")[0].getAttribute("aria-valuenow")).toBe("100");
});

it("retains two labelled meters in the compact mobile presentation", () => {
  render(<ProfileStrengthRings locale="nl" compact size="sm" score={{ completeness: 68, reliability: 57 }} />);
  expect(screen.getAllByRole("meter")).toHaveLength(2);
  expect(screen.getByText("Volledig")).toBeTruthy();
  expect(screen.getByText("Betrouwbaar")).toBeTruthy();
});

it.each(["nl", "en"] as const)("labels both meters and levels in %s", locale => {
  render(<ProfileStrengthRings locale={locale} score={{ completeness: 68, reliability: 57 }} />);
  const meters = screen.getAllByRole("meter");
  expect(meters).toHaveLength(2);
  expect(meters[0].getAttribute("aria-valuenow")).toBe("68");
  expect(meters[1].getAttribute("aria-valuenow")).toBe("57");
  expect(meters[0].getAttribute("aria-valuemin")).toBe("0");
  expect(meters[0].getAttribute("aria-valuemax")).toBe("100");
  expect(meters[0].getAttribute("aria-valuetext")).toBe(locale === "nl" ? "68 van 100" : "68 out of 100");
  expect(screen.getByText(locale === "nl" ? "Goed op weg" : "On your way")).toBeTruthy();
  expect(screen.getByText(locale === "nl" ? "Betrouwbaar" : "Reliable")).toBeTruthy();
});

it.each(["sm", "lg"] as const)("renders %s without removing text or meter semantics", size => {
  render(<ProfileStrengthRings locale="nl" size={size} score={{ completeness: 100, reliability: 80.5 }} />);
  expect(screen.getAllByRole("meter")[1].getAttribute("aria-valuenow")).toBe("81");
  expect(screen.getByText("Compleet")).toBeTruthy();
});

it("updates the real stroke and text when the score rises", () => {
  const view = render(<ProfileStrengthRings locale="nl" score={{ completeness: 33, reliability: 27 }} />);
  view.rerender(<ProfileStrengthRings locale="nl" score={{ completeness: 41, reliability: 32 }} />);
  expect(screen.getAllByRole("meter")[0].getAttribute("aria-valuenow")).toBe("41");
  expect(view.container.querySelector('circle[stroke-dashoffset="59"]')).toBeTruthy();
  const css = readFileSync("src/components/profile/ProfileStrengthRings.module.css", "utf8");
  expect(css).toContain("prefers-reduced-motion: reduce");
  expect(css).toContain("transition: none");
});

it("clamps invalid presentation values and links the next step with a localized gain", () => {
  render(<ProfileStrengthRings locale="nl" score={{ completeness: -1, reliability: Infinity }}
    nextStep={{ label: "Meet je armlengte", href: "/nl/profile", gain: 6.5 }} />);
  expect(screen.getAllByRole("meter").map(meter => meter.getAttribute("aria-valuenow"))).toEqual(["0", "0"]);
  expect(screen.getByRole("link", { name: "Meet je armlengte" }).getAttribute("href")).toBe("/nl/profile");
  expect(screen.getByText(/6,5 punten/)).toBeTruthy();
});
