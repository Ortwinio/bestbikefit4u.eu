import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  BikePublicFitControls,
  getPublicFitToggleLabel,
  shouldShowWeakPublicFitGuidance,
} from "./BikePublicFitControls";

const messages = {
  bikes: {
    publicFit: {
      title: "Second-hand fit preview",
      description:
        "Let potential buyers run a limited size check for this bike with a shared fit code.",
      enabledBadge: "Preview enabled",
      disabledBadge: "Preview disabled",
      codeLabel: "Public fit code",
      codeHint: "This code stays stable when you disable and re-enable the preview.",
      copyAction: "Copy fit code",
      enableAction: "Enable preview",
      reenableAction: "Re-enable preview",
      disableAction: "Disable preview",
      copied: "Public fit code copied.",
      copyFailed: "Could not copy the public fit code.",
      privacyNote:
        "Only bike size and geometry preview data are shared. Personal account details are not shared.",
      weakGeometryTitle: "Preview quality is limited",
      weakGeometryNote: "Add fuller bike geometry for a better public estimate.",
      geometryQuality: {
        full: "Full geometry available",
        partial: "Partial geometry available",
        none: "No geometry shared yet",
      },
      followUpTitle: "Get a better estimate with your inseam and rider profile",
      followUpDescription:
        "Use the quick check as a first screen. Add your rider data for a better estimate.",
      followUpProfileCta: "Add rider profile",
      followUpFitCta: "Open bike fit",
    },
  },
} as const;

vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({
    locale: "en",
    messages,
    languageSwitchLabels: null,
  }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/bikes/bike_1/edit",
}));

vi.mock("@/components/ui", async () => {
  const actual = await vi.importActual<typeof import("@/components/ui")>("@/components/ui");
  return {
    ...actual,
    useToast: () => ({
      success: () => undefined,
      error: () => undefined,
    }),
  };
});

vi.mock("@/components/analytics/MarketingEventTracker", () => ({
  useMarketingEventLogger: () => () => undefined,
}));

describe("BikePublicFitControls", () => {
  it("renders the enabled owner controls with code, privacy note, and copy action", () => {
    const html = renderToStaticMarkup(
      <BikePublicFitControls
        bikeId="bike_1"
        publicFitCode="PFC-AB12-CD34-EF56-7890"
        publicFitEnabled={true}
        geometryQuality="full"
        onEnable={async () => undefined}
        onDisable={async () => undefined}
      />
    );

    expect(html).toContain("Second-hand fit preview");
    expect(html).toContain("Preview enabled");
    expect(html).toContain("PFC-AB12-CD34-EF56-7890");
    expect(html).toContain("Copy fit code");
    expect(html).toContain("Only bike size and geometry preview data are shared");
    expect(html).toContain("Disable preview");
  });

  it("renders the weak-geometry guidance and re-enable action when preview is disabled", () => {
    const html = renderToStaticMarkup(
      <BikePublicFitControls
        bikeId="bike_1"
        publicFitCode="PFC-AB12-CD34-EF56-7890"
        publicFitEnabled={false}
        geometryQuality="partial"
        onEnable={async () => undefined}
        onDisable={async () => undefined}
      />
    );

    expect(html).toContain("Preview disabled");
    expect(html).toContain("Re-enable preview");
    expect(html).toContain("Preview quality is limited");
    expect(html).toContain("Add fuller bike geometry for a better public estimate.");
  });

  it("keeps weak-geometry guidance scoped to partial or missing geometry", () => {
    expect(shouldShowWeakPublicFitGuidance("full")).toBe(false);
    expect(shouldShowWeakPublicFitGuidance("partial")).toBe(true);
    expect(shouldShowWeakPublicFitGuidance("none")).toBe(true);
    expect(shouldShowWeakPublicFitGuidance(null)).toBe(false);
  });

  it("uses the stable re-enable label once a code already exists", () => {
    expect(
      getPublicFitToggleLabel({
        hasCode: false,
        labels: {
          enableAction: "Enable preview",
          reenableAction: "Re-enable preview",
        },
      })
    ).toBe("Enable preview");
    expect(
      getPublicFitToggleLabel({
        hasCode: true,
        labels: {
          enableAction: "Enable preview",
          reenableAction: "Re-enable preview",
        },
      })
    ).toBe("Re-enable preview");
  });
});
