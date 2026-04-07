/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ContactPage from "./page";

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
  buildLocaleAlternates: () => ({ canonical: `https://bestbikefit4u.eu/${locale}/contact` }),
}));

beforeEach(() => {
  locale = "en";
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("contact page", () => {
  it("keeps support reassurance and conversion paths visible in English", async () => {
    const ui = await ContactPage();
    render(ui);

    expect(screen.getByText("Contact Us")).toBeTruthy();
    expect(screen.getByText("Direct support route")).toBeTruthy();
    expect(screen.getByText("View FAQ").closest("a")?.getAttribute("href")).toBe("/en/faq");
    expect(screen.getByText("Open email app").closest("a")?.getAttribute("href")).toBe(
      "mailto:support@bestbikefit4u.eu"
    );
  });
});
