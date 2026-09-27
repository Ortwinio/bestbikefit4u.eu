/* @vitest-environment jsdom */

import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { COOKIE_CONSENT_KEY, writeCookieConsent } from "@/lib/cookieConsent";
import { TrackMarketingEventOnView } from "./MarketingEventTracker";

const { mutation, dataLayer } = vi.hoisted(() => ({
  mutation: vi.fn(() => Promise.resolve()),
  dataLayer: vi.fn(),
}));
vi.mock("convex/react", () => ({ useMutation: () => mutation }));
vi.mock("@/lib/analytics/marketing", () => ({ pushDataLayerEvent: dataLayer }));

beforeEach(() => {
  mutation.mockReset().mockResolvedValue(undefined);
  dataLayer.mockReset();
  localStorage.clear();
  document.cookie = `${COOKIE_CONSENT_KEY}=; Max-Age=0; Path=/`;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("marketing view consent", () => {
  it("records the current landing view once when a new visitor accepts cookies", () => {
    render(<TrackMarketingEventOnView eventType="funnel_landing_view" locale="en" pagePath="/en" />);
    expect(mutation).not.toHaveBeenCalled();
    expect(dataLayer).not.toHaveBeenCalled();

    act(() => writeCookieConsent("essential"));
    expect(mutation).not.toHaveBeenCalled();
    act(() => writeCookieConsent("accepted"));
    act(() => writeCookieConsent("accepted"));
    expect(mutation).toHaveBeenCalledTimes(1);
    expect(mutation).toHaveBeenCalledWith(expect.objectContaining({ pagePath: "/en" }));
    expect(dataLayer).toHaveBeenCalledTimes(1);
  });

  it("records a new page view on client navigation without duplicating consent updates", () => {
    writeCookieConsent("accepted");
    const { rerender } = render(<TrackMarketingEventOnView eventType="funnel_landing_view" locale="en" pagePath="/en" />);
    rerender(<TrackMarketingEventOnView eventType="funnel_landing_view" locale="en" pagePath="/en/pricing" />);
    act(() => writeCookieConsent("accepted"));
    expect(mutation).toHaveBeenCalledTimes(2);
    expect(mutation).toHaveBeenLastCalledWith(expect.objectContaining({ pagePath: "/en/pricing" }));
  });

  it("handles analytics delivery failures without an unhandled promise rejection", async () => {
    writeCookieConsent("accepted");
    mutation.mockRejectedValueOnce(new Error("Unavailable"));
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    await act(async () => {
      render(<TrackMarketingEventOnView eventType="funnel_landing_view" locale="en" pagePath="/en" />);
    });
    expect(warning).toHaveBeenCalledWith("Unable to record marketing event");
  });
});
