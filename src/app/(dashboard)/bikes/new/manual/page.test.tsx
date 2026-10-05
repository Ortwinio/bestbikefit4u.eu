/* @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import Page from "./page";

const state = vi.hoisted(() => ({ locale: "nl" }));
vi.mock("@/i18n/request", () => ({ getRequestLocale: async () => state.locale }));
vi.mock("@/components/features/bikes/CreateBikeForm", () => ({
  CreateBikeForm: () => <div>Bike form</div>,
}));
vi.mock("@/components/bikes/BikeCreationAccess", () => ({
  BikeCreationAccess: ({ children }: { children: ReactNode }) => children,
}));
afterEach(cleanup);

describe("gift redemption return after bike creation", () => {
  it.each([
    ["nl", "Terug naar je cadeau"],
    ["en", "Back to your gift"],
  ])("returns to the fixed %s gift route", async (locale, label) => {
    state.locale = locale;
    render(await Page({ searchParams: Promise.resolve({ gift: "1" }) }));
    expect(screen.getByRole("link", { name: label }).getAttribute("href")).toBe(`/${locale}/gift`);
  });

  it.each([undefined, "https://evil.example", "true"])("ignores other gift flags: %s", async (gift) => {
    render(await Page({ searchParams: Promise.resolve({ gift }) }));
    expect(screen.queryByRole("link")).toBeNull();
  });
});
