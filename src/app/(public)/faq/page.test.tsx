/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FAQPage from "./page";

let locale: "en" | "nl" = "en";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({
    href,
    children,
  }: {
    href: string;
    children?: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/i18n/request", () => ({
  getRequestLocale: () => Promise.resolve(locale),
}));

vi.mock("@/i18n/metadata", () => ({
  buildLocaleAlternates: () => ({ canonical: `https://bestbikefit4u.eu/${locale}/faq` }),
}));

beforeEach(() => {
  locale = "en";
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("faq page", () => {
  it("keeps trust and next-step CTAs visible in English", async () => {
    const ui = await FAQPage();
    render(ui);

    expect(screen.getByText("Frequently Asked Questions")).toBeTruthy();
    expect(screen.getByText("Ready to get started?")).toBeTruthy();
    expect(
      screen.getByText("Try the Free Bike Fit Calculator").closest("a")?.getAttribute("href")
    ).toBe("/en/calculators/bike-fit");
    expect(screen.getByText("Compare Free vs Pro").closest("a")?.getAttribute("href")).toBe(
      "/en/pricing"
    );
    expect(screen.getByText("Contact Us").closest("a")?.getAttribute("href")).toBe("/en/contact");
  });
});
