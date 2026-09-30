// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { flexibilityTests } from "@/lib/validations/profile";
import { FlexibilityScale } from "./FlexibilityScale";

const state = vi.hoisted(() => ({ locale: "nl" as "nl" | "en" }));

vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({
    locale: state.locale,
    messages: getDashboardMessages(state.locale),
  }),
}));

afterEach(cleanup);

describe.each(["nl", "en"] as const)("FlexibilityScale in %s", (locale) => {
  it.each(flexibilityTests)("names the $score progressbar and preserves its value", ({ score }) => {
    state.locale = locale;
    render(<FlexibilityScale score={score} />);

    const progress = screen.getByRole("progressbar", {
      name: getDashboardMessages(locale).profile.sections.flexibility,
    });
    const index = flexibilityTests.findIndex((entry) => entry.score === score) + 1;
    expect(progress.getAttribute("aria-valuenow")).toBe(String(index * 20));
    expect(progress.getAttribute("aria-valuemin")).toBe("0");
    expect(progress.getAttribute("aria-valuemax")).toBe("100");
  });
});
