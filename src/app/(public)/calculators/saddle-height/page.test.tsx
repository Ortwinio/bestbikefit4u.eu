/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SaddleHeightCalculatorPage from "./page";

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

vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: () => null,
}));

vi.mock("@/components/seo/RelatedLinksSection", () => ({
  RelatedLinksSection: () => <section>Related links</section>,
}));

vi.mock("@/i18n/request", () => ({
  getRequestLocale: () => Promise.resolve(locale),
}));

vi.mock("@/i18n/metadata", () => ({
  buildLocaleAlternates: () => ({ canonical: `https://bestbikefit4u.eu/${locale}/calculators/saddle-height` }),
}));

vi.mock("@/lib/seo/jsonLd", () => ({
  buildHowToSchema: () => ({}),
  buildWebApplicationSchema: () => ({}),
}));

vi.mock("./SaddleHeightCalculatorForm", () => ({
  SaddleHeightCalculatorForm: () => <div>Saddle height form</div>,
}));

beforeEach(() => {
  locale = "en";
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("saddle height calculator page", () => {
  it("keeps the value-first next-step CTAs visible in English", async () => {
    const ui = await SaddleHeightCalculatorPage();
    render(ui);

    expect(screen.getByText("Saddle Height Calculator")).toBeTruthy();
    expect(screen.getByText("Saddle height form")).toBeTruthy();
    expect(screen.getByText("Open bike-fit calculator").closest("a")?.getAttribute("href")).toBe(
      "/en/calculators/bike-fit"
    );
    expect(screen.getByText("Continue in dashboard").closest("a")?.getAttribute("href")).toBe(
      "/en/login"
    );
  });
});
