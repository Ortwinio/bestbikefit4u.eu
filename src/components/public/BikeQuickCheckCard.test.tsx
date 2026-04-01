/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { cloneElement } from "react";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BikeQuickCheckCard } from "./BikeQuickCheckCard";

const useQueryMock = vi.fn();
const logMarketingEventMock = vi.fn();

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({
    children,
    href,
    onClick,
  }: {
    children?: ReactNode;
    href: string;
    onClick?: (event: MouseEvent) => void;
  }) => (
    <a href={href} onClick={onClick as never}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/analytics/MarketingEventTracker", () => ({
  useMarketingEventLogger: () => logMarketingEventMock,
}));

vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
    ...props
  }: {
    alt: string;
    src: string;
    [key: string]: unknown;
  }) =>
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} {...props} />,
}));

vi.mock("@/components/ui", () => ({
  Button: ({
    children,
    render,
    ...props
  }: {
    children?: ReactNode;
    render?: ReactElement;
    [key: string]: unknown;
  }) =>
    render ? (
      cloneElement(render, props, children)
    ) : (
      <button {...props}>{children}</button>
    ),
  Input: ({
    label,
    ...props
  }: {
    label?: string;
    [key: string]: unknown;
  }) => (
    <label>
      <span>{label}</span>
      <input {...props} />
    </label>
  ),
  InfoBox: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

vi.mock("./PublicSurfaceCard", () => ({
  PublicSurfaceCard: ({
    title,
    description,
    children,
  }: {
    title?: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
  }) => (
    <section>
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </section>
  ),
}));

const baseCopy: ComponentProps<typeof BikeQuickCheckCard>["copy"] = {
  badge: "Bike passport quick check",
  collapsedTitle: "Check whether this bike could suit your size",
  collapsedDescription: "Use one shared bike code to screen a second-hand bike.",
  expandLabel: "Check a shared bike code",
  codeLabel: "Shared bike code",
  codePlaceholder: "Enter the bike code",
  codeHelper: "Limited screening tool.",
  lookupButton: "Preview this bike",
  lookupLoading: "Checking the shared bike code…",
  invalidTitle: "This code is not available right now",
  invalidDescription: "The code may be wrong, expired, or no longer shared.",
  invalidRetry: "Start again",
  rateLimitedTitle: "Too many attempts for now",
  rateLimitedDescription: "Please wait before trying another shared bike code.",
  rateLimitedRetry: "Try again",
  previewTitle: "Bike preview",
  previewDescription: "We found the shared bike. Enter your height for a first estimate.",
  previewHeightPrompt: "Enter your height for a first estimate",
  previewSupport: "Estimate based on height and available geometry.",
  previewButton: "Run quick check",
  previewLoading: "Calculating a limited estimate…",
  heightLabel: "Your height (cm)",
  heightPlaceholder: "e.g. 178",
  bikeSummaryLabel: "Shared bike",
  sizeLabel: "Frame size",
  geometryLabel: "Geometry quality",
  geometryLimited: "Limited geometry data",
  noPhoto: "No shared bike photo available",
  resultTitle: "Quick check result",
  resultSupport: "Estimate based on height and available geometry.",
  scoreLabel: "Quick check score",
  scoreSuffix: "/75",
  confidenceLabel: "Confidence",
  inseamEstimateLabel: "Estimated inseam",
  limitedEstimate: "Use this as a first screening step, not as a final fit decision.",
  geometryWeakNote: "Weak geometry data keeps this estimate limited.",
  ctaTitle: "Want a better estimate?",
  ctaDescription: "Add your inseam and rider profile for a better estimate.",
  ctaButton: "Create a free account",
  ctaSecondary: "A full rider profile improves precision.",
  signedInCtaTitle: "Want a better estimate?",
  signedInCtaDescription: "Use this quick check as a first screen.",
  signedInPrimaryCta: "Add rider profile",
  signedInSecondaryCta: "Open bike fit",
  confidenceLevels: {
    high: "High",
    medium: "Medium",
    limited: "Limited",
  },
  scoreBands: {
    could_fit: "Could suit your size",
    borderline: "Worth a closer look",
    weak: "Looks uncertain on paper",
    unlikely: "Probably not the right size",
  },
  geometryQualityLabels: {
    full: "Full geometry available",
    partial: "Partial geometry available",
    none: "Limited geometry data",
  },
  explanationCodes: {
    frame_size_close: "The frame size looks close to your height on paper.",
    limited_geometry: "This bike has limited shared geometry.",
    limited_geometry_data: "This bike has limited shared geometry.",
  },
};

function renderCard(copy = baseCopy) {
  return render(
    <BikeQuickCheckCard
      locale="en"
      pagePath="/en"
      loginHref="/en/login"
      profileHref="/en/profile"
      fitHref="/en/fit"
      copy={copy}
    />
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  useQueryMock.mockReset();
  logMarketingEventMock.mockReset();
});

describe("BikeQuickCheckCard", () => {
  it("renders the collapsed state first and expands to the code entry form", () => {
    useQueryMock.mockReturnValue(null);
    renderCard();

    expect(screen.getByText(baseCopy.collapsedTitle)).toBeTruthy();
    expect(screen.queryByLabelText(baseCopy.codeLabel)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: baseCopy.expandLabel }));

    expect(screen.getByLabelText(baseCopy.codeLabel)).toBeTruthy();
  });

  it("moves from lookup to preview on a successful lookup response", async () => {
    useQueryMock.mockReturnValue(null);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            brand: "Canyon",
            model: "Endurace",
            sizeLabel: "M",
            geometryQuality: "partial",
            previewToken: "preview-token",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )
    );

    renderCard();
    fireEvent.click(screen.getByRole("button", { name: baseCopy.expandLabel }));
    fireEvent.change(screen.getByLabelText(baseCopy.codeLabel), {
      target: { value: "BBF-123" },
    });
    fireEvent.submit(screen.getByLabelText(baseCopy.codeLabel).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(baseCopy.previewTitle)).toBeTruthy();
      expect(screen.getByText("Canyon Endurace")).toBeTruthy();
    });
  });

  it("shows the result state with score as /75 and visible confidence", async () => {
    useQueryMock.mockReturnValue(null);
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              brand: "Canyon",
              model: "Endurace",
              sizeLabel: "M",
              geometryQuality: "partial",
              previewToken: "preview-token",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          )
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              score: 61,
              scoreMax: 75,
              scoreBand: "could_fit",
              confidence: "medium",
              explanationCode: "frame_size_close",
              estimatedInseamCm: 84,
              dimensionScores: {
                frameSize: 25,
                cockpit: 21,
                geometryConfidence: 15,
              },
              calcVersion: "qm_v1",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          )
        )
    );

    renderCard();
    fireEvent.click(screen.getByRole("button", { name: baseCopy.expandLabel }));
    fireEvent.change(screen.getByLabelText(baseCopy.codeLabel), {
      target: { value: "BBF-123" },
    });
    fireEvent.submit(screen.getByLabelText(baseCopy.codeLabel).closest("form")!);

    await screen.findByText(baseCopy.previewTitle);

    fireEvent.change(screen.getByLabelText(baseCopy.heightLabel), {
      target: { value: "178" },
    });
    fireEvent.submit(screen.getByLabelText(baseCopy.heightLabel).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(baseCopy.resultTitle)).toBeTruthy();
      expect(screen.getByText(baseCopy.confidenceLabel, { exact: false })).toBeTruthy();
      expect(screen.getByText("/75")).toBeTruthy();
      expect(screen.queryByText("%")).toBeNull();
    });
  });

  it("shows the invalid state for a failed lookup and for an expired preview token", async () => {
    useQueryMock.mockReturnValue(null);
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(new Response("{}", { status: 404 }))
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              brand: "Ridley",
              model: "Dean",
              previewToken: "preview-token",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          )
        )
        .mockResolvedValueOnce(new Response("{}", { status: 401 }))
    );

    renderCard();
    fireEvent.click(screen.getByRole("button", { name: baseCopy.expandLabel }));
    fireEvent.change(screen.getByLabelText(baseCopy.codeLabel), {
      target: { value: "bad-code" },
    });
    fireEvent.submit(screen.getByLabelText(baseCopy.codeLabel).closest("form")!);

    await screen.findByText(baseCopy.invalidTitle);

    fireEvent.change(screen.getByLabelText(baseCopy.codeLabel), {
      target: { value: "good-code" },
    });
    fireEvent.submit(screen.getByLabelText(baseCopy.codeLabel).closest("form")!);
    await screen.findByText(baseCopy.previewTitle);

    fireEvent.change(screen.getByLabelText(baseCopy.heightLabel), {
      target: { value: "178" },
    });
    fireEvent.submit(screen.getByLabelText(baseCopy.heightLabel).closest("form")!);

    await screen.findByText(baseCopy.invalidTitle);
  });

  it("shows the rate-limited state with a countdown from Retry-After", async () => {
    useQueryMock.mockReturnValue(null);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        new Response("{}", {
          status: 429,
          headers: { "Retry-After": "12" },
        })
      )
    );

    renderCard();
    fireEvent.click(screen.getByRole("button", { name: baseCopy.expandLabel }));
    fireEvent.change(screen.getByLabelText(baseCopy.codeLabel), {
      target: { value: "BBF-123" },
    });
    fireEvent.submit(screen.getByLabelText(baseCopy.codeLabel).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(baseCopy.rateLimitedTitle)).toBeTruthy();
      expect(screen.getByText(/12s/)).toBeTruthy();
    });
  });

  it("renders Dutch copy for the surface contract", () => {
    useQueryMock.mockReturnValue(null);
    renderCard({
      ...baseCopy,
      collapsedTitle: "Check of deze fiets bij jouw maat zou kunnen passen",
      expandLabel: "Check een gedeelde fiets-code",
      codeLabel: "Gedeelde fiets-code",
    });

    expect(screen.getByText("Check of deze fiets bij jouw maat zou kunnen passen")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Check een gedeelde fiets-code" }));
    expect(screen.getByLabelText("Gedeelde fiets-code")).toBeTruthy();
  });

  it("shows the signed-in follow-up actions when a user is already logged in", async () => {
    useQueryMock.mockReturnValue({ _id: "user_1" });
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              brand: "Canyon",
              model: "Endurace",
              sizeLabel: "M",
              geometryQuality: "full",
              previewToken: "preview-token",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          )
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              score: 61,
              scoreMax: 75,
              scoreBand: "could_fit",
              confidence: "medium",
              explanationCode: "frame_size_close",
              estimatedInseamCm: 84,
              dimensionScores: {
                frameSize: 25,
                cockpit: 21,
                geometryConfidence: 15,
              },
              calcVersion: "qm_v1",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          )
        )
    );

    renderCard();
    fireEvent.click(screen.getByRole("button", { name: baseCopy.expandLabel }));
    fireEvent.change(screen.getByLabelText(baseCopy.codeLabel), {
      target: { value: "PFC-1234-1234-1234-1234" },
    });
    fireEvent.submit(screen.getByLabelText(baseCopy.codeLabel).closest("form")!);

    await screen.findByText(baseCopy.previewTitle);

    fireEvent.change(screen.getByLabelText(baseCopy.heightLabel), {
      target: { value: "178" },
    });
    fireEvent.submit(screen.getByLabelText(baseCopy.heightLabel).closest("form")!);

    await screen.findByText(baseCopy.signedInCtaTitle);
    expect(screen.getByText(baseCopy.signedInPrimaryCta)).toBeTruthy();
    expect(screen.getByText(baseCopy.signedInSecondaryCta)).toBeTruthy();
  });
});
