/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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

vi.mock("@/components/ui", () => ({
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
  Card: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
    <section {...props}>{children}</section>
  ),
  CardContent: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
    <div {...props}>{children}</div>
  ),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("PressureCalculatorCta", () => {
  it("keeps the post-result CTA hierarchy value-first in English", () => {
    render(
      <PressureCalculatorCta
        locale="en"
        pagePath="/en/bandenspanning-calculator"
        labels={{
          heading: "What is next?",
          body: "Create a free account to save these results, refine your setup with more detail, and track changes over time.",
          primaryButton: "Create account or sign in",
          secondaryButton: "Compare Free vs Pro",
          loginPrompt: "Already have an account?",
          loginLink: "Log in",
        }}
      />
    );

    expect(screen.getByText("What is next?")).toBeTruthy();
    expect(screen.getByText("Create account or sign in").closest("a")?.getAttribute("href")).toBe(
      "/en/login"
    );
    expect(screen.getByText("Compare Free vs Pro").closest("a")?.getAttribute("href")).toBe(
      "/en/pricing"
    );
    expect(screen.getByText("Log in").closest("a")?.getAttribute("href")).toBe("/en/login");
  });
});
