/* @vitest-environment jsdom */
import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GuideSoftToolCta } from "./GuideSoftToolCta";

vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({ href, children, ctaLabel }: { href: string; children: ReactNode; ctaLabel: string }) =>
    <a href={href} data-event-label={ctaLabel}>{children}</a>,
}));
afterEach(cleanup);

describe("descriptive guide calculator anchors", () => {
  it.each([
    ["nl", "zadelhoogtecalculator", "Gebruik de zadelhoogtecalculator"],
    ["en", "saddle height calculator", "Use the saddle height calculator"],
  ] as const)("names the destination in %s", (locale, toolLabel, label) => {
    const href = `/${locale}/calculators/saddle-height`;
    render(<GuideSoftToolCta locale={locale} toolLabel={toolLabel} toolHref={href} pagePath={`/${locale}/guides`} />);
    const link = screen.getByRole("link", { name: label });
    expect(link.getAttribute("href")).toBe(href);
    expect(link.getAttribute("data-event-label")).toBe(label);
    expect(screen.queryByText(/^Open calculator/)).toBeNull();
  });
});
