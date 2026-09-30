/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FitPassLandingCta } from "./FitPassLandingCta";
import { fitPassPresentation } from "@/i18n/marketing/fitPass";

vi.mock("convex/react", () => ({ useQuery: () => undefined }));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({
  useMarketingEventLogger: () => vi.fn(),
}));

afterEach(cleanup);

describe("Fit Pass account loading", () => {
  it.each(["nl", "en"] as const)("shows a disabled account-status action in %s", (locale) => {
    render(
      <FitPassLandingCta
        locale={locale}
        label="Buy Fit Pass"
        loadingLabel={fitPassPresentation[locale].loading}
        alreadyActiveLabel="Active"
        loginHref={`/${locale}/login`}
        dashboardHref={`/${locale}/dashboard`}
      />
    );
    const button = screen.getByRole("button", { name: fitPassPresentation[locale].loading });
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(screen.queryByText("Buy Fit Pass")).toBeNull();
  });
});
