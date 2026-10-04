/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PressureCalculatorCta } from "./PressureCalculatorCta";

vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({
    href,
    children,
    className,
    onClick,
  }: {
    href: string;
    children?: React.ReactNode;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  }) => (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/prototyper-ui/ui/button", () => ({
  Button: ({
    children,
    render,
    className,
    role,
  }: {
    children?: React.ReactNode;
    render?: React.ReactElement;
    className?: string;
    role?: string;
  }) =>
    render ? (
      <a
        href={(render.props as { href?: string }).href}
        className={className}
        role={role}
      >
        {children}
      </a>
    ) : (
      <button className={className}>{children}</button>
    ),
}));

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-05-01T12:00:00Z"));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("PressureCalculatorCta", () => {
  it("keeps the post-result CTA hierarchy value-first in English", () => {
    render(
      <PressureCalculatorCta
        locale="en"
        pagePath="/en/tire-pressure-calculator"
        labels={{
          heading: "What is next?",
          body: "Create a free account to set up your bikes, calculate personalized pressure advice, and track future adjustments.",
          primaryButton: "Create a free account",
          secondaryButton: "Compare plans",
          loginPrompt: "Already have an account?",
          loginLink: "Log in",
        }}
      />
    );

    expect(screen.getByText("What is next?")).toBeTruthy();
    expect(screen.getByText("Create a free account").closest("a")?.getAttribute("href")).toBe(
      "/en/login?src=tire-pressure"
    );
    expect(screen.queryByText(/Donate|Alpe/)).toBeNull();
    expect(
      screen.getByText("Open bike-fit calculator").closest("a")?.getAttribute("href")
    ).toBe("/en/calculators/bike-fit");
    expect(screen.getByText("Log in").closest("a")?.getAttribute("href")).toBe("/en/login?src=tire-pressure");
    expect(screen.getByText("Compare plans").closest("a")?.getAttribute("href")).toBe("/en/pricing");
  });
});
