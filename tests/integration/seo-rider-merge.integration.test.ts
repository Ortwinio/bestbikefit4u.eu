// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import BikeFitPage from "@/app/(public)/calculators/bike-fit/page";
import SaddleHeightPage from "@/app/(public)/calculators/saddle-height/page";
import FrameSizePage from "@/app/(public)/calculators/frame-size/page";
import CrankLengthPage from "@/app/(public)/calculators/crank-length/page";
import SaddleWidthPage from "@/app/(public)/calculators/saddle-width/page";
import GearingPage from "@/app/(public)/calculators/gearing/page";
import PowerSpeedPage from "@/app/(public)/calculators/power-speed/page";
import ClimbPlannerPage from "@/app/(public)/calculators/climb-planner/page";
import FtpWkgPage from "@/app/(public)/calculators/ftp-wkg/page";
import FuelHydrationPage from "@/app/(public)/calculators/fuel-hydration/page";
import { PressureCalculatorPageContent } from "@/app/(public)/bandenspanning-calculator/PressureCalculatorPageContent";
import { readHandoff } from "@/lib/handoff/store";

const request = vi.hoisted(() => ({ locale: "en" as "en" | "nl" }));
vi.mock("server-only", () => ({}));
vi.mock("convex/react", () => ({ useMutation: () => vi.fn() }));
vi.mock("@/i18n/request", () => ({ getRequestLocale: async () => request.locale }));
vi.mock("@/components/seo/JsonLd", () => ({ JsonLd: () => null }));
vi.mock("next/navigation", () => ({
  usePathname: () => `/${request.locale}/calculators`,
  useSearchParams: () => new URLSearchParams(),
}));

afterEach(() => {
  cleanup();
  sessionStorage.clear();
});

const pages = [
  ["bike-fit", BikeFitPage],
  ["saddle-height", SaddleHeightPage],
  ["frame-size", FrameSizePage],
  ["crank-length", () => CrankLengthPage({ searchParams: Promise.resolve({}) })],
  ["saddle-width", SaddleWidthPage],
  ["gearing", GearingPage],
  ["power-speed", PowerSpeedPage],
  ["climb-planner", ClimbPlannerPage],
  ["ftp-wkg", FtpWkgPage],
  ["fuel-hydration", FuelHydrationPage],
  ["tire-pressure", () => PressureCalculatorPageContent({ locale: request.locale })],
] as const;

describe.each(pages)("merged public %s page", (calculator, Page) => {
  it.each(["en", "nl"] as const)("retains SEO answers and untouched rider handoff in %s", async (locale) => {
    request.locale = locale;
    const { container, getAllByRole } = render(await Page());
    const answers = container.querySelectorAll(`[data-calculator-answer="${calculator}"]`);
    expect(answers).toHaveLength(1);
    expect(answers[0].textContent?.trim().length).toBeGreaterThan(100);
    const handoffLinks = [...container.querySelectorAll("a")]
      .map((link) => link.getAttribute("href"))
      .filter((href) => href?.includes("handoff=1"));
    expect(handoffLinks).toEqual([`/${locale}/login?src=${calculator}&handoff=1`]);
    expect(getAllByRole("slider").length).toBeGreaterThan(0);
    expect(readHandoff().entries).toEqual([]);
  });
});
