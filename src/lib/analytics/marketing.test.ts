import { describe, expect, it, vi } from "vitest";
import {
  ANONYMOUS_MARKETING_EVENT_TYPES,
  MARKETING_EVENT_TYPES,
  isProductionMarketingHost,
  pushDataLayerEvent,
} from "./marketing";
import { trackAdConversion } from "./conversions";

describe("marketing analytics helpers", () => {
  it("keeps public event types typed and discoverable", () => {
    expect(MARKETING_EVENT_TYPES).toContain("pricing_view");
    expect(MARKETING_EVENT_TYPES).toContain("pain_page_view");
    expect(MARKETING_EVENT_TYPES).toContain("bike_setup_page_view");
    expect(MARKETING_EVENT_TYPES).toContain("case_study_recruitment_submit");
    expect(ANONYMOUS_MARKETING_EVENT_TYPES).toContain("bike_setup_page_view");
    expect(ANONYMOUS_MARKETING_EVENT_TYPES).toContain("case_study_recruitment_submit");
  });

  it("pushes conversions to the browser dataLayer", () => {
    vi.stubGlobal("window", {
      dataLayer: [],
      location: { hostname: "bestbikefit4u.eu" },
    });
    trackAdConversion("case_study_lead", { locale: "en" });
    expect((window as Window).dataLayer).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          event: "bbf_conversion",
          conversionKey: "case_study_lead",
          locale: "en",
        }),
      ])
    );
  });

  it("pushes arbitrary analytics events to the dataLayer", () => {
    vi.stubGlobal("window", {
      dataLayer: [],
      location: { hostname: "bestbikefit4u.eu" },
    });
    pushDataLayerEvent({ event: "bbf_test", pagePath: "/pricing" });
    expect((window as Window).dataLayer).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ event: "bbf_test", pagePath: "/pricing" }),
      ])
    );
  });

  it("disables browser marketing helpers outside the production host", () => {
    expect(isProductionMarketingHost("bestbikefit4u.eu")).toBe(true);
    expect(isProductionMarketingHost("preview-bestbikefit4u.vercel.app")).toBe(false);

    vi.stubGlobal("window", {
      dataLayer: [],
      location: { hostname: "preview-bestbikefit4u.vercel.app" },
    });
    pushDataLayerEvent({ event: "bbf_test_preview" });
    trackAdConversion("pricing_signup", { locale: "en" });
    expect((window as Window).dataLayer).toEqual([]);
  });
});
