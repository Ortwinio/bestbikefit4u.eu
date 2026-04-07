/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FrameSizeCalculatorPage from "./page";

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
  buildLocaleAlternates: () => ({ canonical: `https://bestbikefit4u.eu/${locale}/calculators/frame-size` }),
}));

vi.mock("@/lib/seo/jsonLd", () => ({
  buildWebApplicationSchema: () => ({}),
}));

vi.mock("./FrameSizeCalculatorForm", () => ({
  FrameSizeCalculatorForm: () => <div>Frame size form</div>,
}));

beforeEach(() => {
  locale = "en";
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("frame size calculator page", () => {
  it("keeps the value-first next-step CTAs visible in English", async () => {
    const ui = await FrameSizeCalculatorPage();
    render(ui);

    expect(screen.getByText("Frame Size Calculator")).toBeTruthy();
    expect(screen.getByText("Frame size form")).toBeTruthy();
    expect(screen.getByText("Create account or sign in").closest("a")?.getAttribute("href")).toBe(
      "/en/login"
    );
    expect(screen.getByText("Compare Free vs Pro").closest("a")?.getAttribute("href")).toBe(
      "/en/pricing"
    );
    expect(screen.getByText("Open bike-fit calculator").closest("a")?.getAttribute("href")).toBe(
      "/en/calculators/bike-fit"
    );
  });
});
