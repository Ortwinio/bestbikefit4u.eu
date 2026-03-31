import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BRAND } from "@/config/brand";

const mocks = vi.hoisted(() => {
  const token = vi.fn();
  const query = vi.fn();
  const mutation = vi.fn();
  const setAuth = vi.fn();
  const clientConstructor = vi.fn();
  const mapReportV2Payload = vi.fn();
  const renderPdfReportHtml = vi.fn();
  const renderPdfFromHtml = vi.fn();
  const buildRecommendationPdfLines = vi.fn();
  const createSimplePdfFromLines = vi.fn();

  return {
    token,
    query,
    mutation,
    setAuth,
    clientConstructor,
    mapReportV2Payload,
    renderPdfReportHtml,
    renderPdfFromHtml,
    buildRecommendationPdfLines,
    createSimplePdfFromLines,
  };
});

vi.mock("@convex-dev/auth/nextjs/server", () => ({
  convexAuthNextjsToken: mocks.token,
}));

vi.mock("convex/browser", () => ({
  ConvexHttpClient: class MockConvexHttpClient {
    constructor(url: string) {
      mocks.clientConstructor(url);
    }

    setAuth = mocks.setAuth;
    query = mocks.query;
    mutation = mocks.mutation;
  },
}));

vi.mock("@/lib/reports/reportV2Mapper", () => ({
  mapReportV2Payload: mocks.mapReportV2Payload,
}));

vi.mock("@/lib/reports/pdfLayoutTemplate", () => ({
  renderPdfReportHtml: mocks.renderPdfReportHtml,
  renderPdfHeaderTemplate: vi.fn(() => "<div>header</div>"),
  renderPdfFooterTemplate: vi.fn(() => "<div>footer</div>"),
}));

vi.mock("@/lib/pdf/htmlPdf", () => ({
  renderPdfFromHtml: mocks.renderPdfFromHtml,
}));

vi.mock("@/lib/reports/recommendationPdf", () => ({
  buildRecommendationPdfLines: mocks.buildRecommendationPdfLines,
}));

vi.mock("@/lib/pdf/simplePdf", () => ({
  createSimplePdfFromLines: mocks.createSimplePdfFromLines,
}));

import { GET } from "./route";

describe("pdf report route", () => {
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  const sessionFixture = {
    _id: "session_3",
    createdAt: 1734307200000,
    completedAt: 1734393600000,
    bikeType: "road",
    ridingStyle: "sportive",
    primaryGoal: "balanced",
  };

  const recommendationFixture = {
    algorithmVersion: "1.0.0",
    confidenceScore: 84,
    calculatedFit: {
      recommendedStackMm: 575,
      recommendedReachMm: 390,
      effectiveTopTubeMm: 540,
      saddleHeightMm: 725,
      saddleSetbackMm: 62,
      saddleHeightRange: { min: 715, max: 735 },
      handlebarDropMm: 78,
      handlebarReachMm: 505,
      stemLengthMm: 100,
      stemAngleRecommendation: "-6 deg",
      crankLengthMm: 172.5,
      handlebarWidthMm: 420,
    },
    frameSizeRecommendations: [
      { size: "54", fitScore: 92, brand: "Example", notes: "Best match" },
    ],
    adjustmentPriorities: [
      {
        priority: 1,
        component: "Saddle Height",
        recommendedValue: "725 mm",
        rationale: "Optimize knee extension",
      },
    ],
    fitNotes: ["Reassess after 2 weeks of riding"],
  };

  const reportSourceFixture = {
    session: sessionFixture,
    recommendation: recommendationFixture,
    bike: {
      name: "Race Machine",
      bikeType: "road",
      photoUrl: null,
    },
    bikeProfile: null,
    profile: {
      heightCm: 182,
      inseamCm: 86,
      armLengthCm: 63,
      torsoLengthCm: 61,
      shoulderWidthCm: 41,
      flexibilityScore: "good",
      coreStabilityScore: 4,
    },
    latestPressureCalculation: null,
    user: {
      displayName: "Ortwin",
      image: "https://images.example.com/rider.jpg",
    },
    questionnaireResponses: [
      {
        questionId: "road_riding_type",
        questionOrder: 1,
        response: "training",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://example.convex.cloud";
    delete process.env.PDF_RICH_RENDER_ENABLED;
    // By default the rate limit check allows the request
    mocks.mutation.mockResolvedValue(true);

    mocks.mapReportV2Payload.mockReturnValue({
      profile: { sessionId: "session_3" },
    });
    mocks.renderPdfReportHtml.mockReturnValue("<html>report</html>");
    mocks.renderPdfFromHtml.mockResolvedValue({
      pdf: new TextEncoder().encode("%PDF-1.4 rich"),
      strategy: "playwright",
    });
    mocks.buildRecommendationPdfLines.mockReturnValue([
      BRAND.reportTitle,
      "Fallback content",
    ]);
    mocks.createSimplePdfFromLines.mockReturnValue(
      new TextEncoder().encode("%PDF-1.4 fallback")
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    mocks.token.mockResolvedValue(undefined);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ sessionId: "session_1" }),
    });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Not authenticated." });
    expect(mocks.mutation).not.toHaveBeenCalled();
  });

  it("returns 429 when the report rate limit is exceeded", async () => {
    mocks.token.mockResolvedValue("token-rl");
    mocks.mutation.mockResolvedValue(false);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ sessionId: "session_1" }),
    });

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("30");
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it("returns 404 when the session is missing or not owned", async () => {
    mocks.token.mockResolvedValue("token-123");
    mocks.query.mockResolvedValueOnce(null);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ sessionId: "session_2" }),
    });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Session not found." });
    expect(mocks.setAuth).toHaveBeenCalledWith("token-123");
  });

  it("returns 200 with rich renderer output for authorized users", async () => {
    mocks.token.mockResolvedValue("token-abc");
    mocks.query.mockResolvedValueOnce(reportSourceFixture);

    const response = await GET(new Request("http://localhost?locale=nl"), {
      params: Promise.resolve({ sessionId: "session_3" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toContain(
      `${BRAND.reportSlug}-session_3-nl.pdf`
    );
    expect(response.headers.get("X-Report-Render-Mode")).toBe("rich");
    expect(response.headers.get("X-Report-Render-Strategy")).toBe("playwright");
    expect(response.headers.get("X-Report-Render-Fallback-Reason")).toBeNull();

    const buffer = await response.arrayBuffer();
    const text = new TextDecoder().decode(buffer);
    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text).toContain("rich");
    expect(mocks.mapReportV2Payload).toHaveBeenCalledWith({
      ...reportSourceFixture,
      bikeImageUrl: null,
      riderImageUrl: "https://images.example.com/rider.jpg",
    });
    expect(mocks.renderPdfReportHtml).toHaveBeenCalledTimes(1);
    expect(mocks.renderPdfFromHtml).toHaveBeenCalledWith(
      expect.objectContaining({
        html: "<html>report</html>",
        headerTemplate: "<div>header</div>",
        footerTemplate: "<div>footer</div>",
      })
    );
    expect(mocks.createSimplePdfFromLines).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledWith("PDF rich render succeeded.", {
      sessionId: "session_3",
      locale: "nl",
      strategy: "playwright",
    });
  });

  it("returns inline disposition when explicitly requested for the viewer", async () => {
    mocks.token.mockResolvedValue("token-inline");
    mocks.query.mockResolvedValueOnce(reportSourceFixture);

    const response = await GET(
      new Request("http://localhost?locale=en&disposition=inline"),
      {
        params: Promise.resolve({ sessionId: "session_3" }),
      }
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Disposition")).toBe(
      `${"inline"}; filename="${BRAND.reportSlug}-session_3-en.pdf"`
    );
  });

  it("falls back to simple renderer when rich renderer fails", async () => {
    mocks.token.mockResolvedValue("token-fallback");
    mocks.query.mockResolvedValueOnce(reportSourceFixture);
    mocks.renderPdfFromHtml.mockRejectedValueOnce(new Error("no chromium"));

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ sessionId: "session_3" }),
    });

    expect(response.status).toBe(200);
    expect(mocks.renderPdfFromHtml).toHaveBeenCalledTimes(1);
    expect(mocks.buildRecommendationPdfLines).toHaveBeenCalledWith({
      session: sessionFixture,
      recommendation: recommendationFixture,
      locale: "en",
    });
    expect(mocks.createSimplePdfFromLines).toHaveBeenCalledTimes(1);
    expect(response.headers.get("X-Report-Render-Mode")).toBe("simple");
    expect(response.headers.get("X-Report-Render-Strategy")).toBe("simple");
    expect(response.headers.get("X-Report-Render-Fallback-Reason")).toBe(
      "no chromium"
    );

    const bodyText = new TextDecoder().decode(await response.arrayBuffer());
    expect(bodyText).toContain("fallback");
    expect(errorSpy).toHaveBeenCalledWith(
      "Rich PDF render failed, using simple fallback.",
      {
        sessionId: "session_3",
        locale: "en",
        fallbackReason: "no chromium",
      }
    );
  });

  it("uses simple renderer directly when rich rendering is disabled by env", async () => {
    process.env.PDF_RICH_RENDER_ENABLED = "false";
    mocks.token.mockResolvedValue("token-env-flag");
    mocks.query.mockResolvedValueOnce(reportSourceFixture);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ sessionId: "session_3" }),
    });

    expect(response.status).toBe(200);
    expect(mocks.renderPdfFromHtml).not.toHaveBeenCalled();
    expect(mocks.buildRecommendationPdfLines).toHaveBeenCalledWith({
      session: sessionFixture,
      recommendation: recommendationFixture,
      locale: "en",
    });
    expect(mocks.createSimplePdfFromLines).toHaveBeenCalledTimes(1);
    expect(response.headers.get("X-Report-Render-Mode")).toBe("simple");
    expect(response.headers.get("X-Report-Render-Strategy")).toBe("simple");
    expect(response.headers.get("X-Report-Render-Fallback-Reason")).toBe(
      "rich-render-disabled"
    );
    expect(infoSpy).toHaveBeenCalledWith(
      "PDF rich render disabled, using simple renderer.",
      {
        sessionId: "session_3",
        locale: "en",
      }
    );
  });

  it("resolves the locale from the referrer path when the query parameter is missing", async () => {
    mocks.token.mockResolvedValue("token-referrer");
    mocks.query.mockResolvedValueOnce(reportSourceFixture);

    const response = await GET(
      new Request("http://localhost/api/reports/session_3/pdf", {
        headers: {
          referer: "http://localhost/nl/fit/session_3/results",
        },
      }),
      {
        params: Promise.resolve({ sessionId: "session_3" }),
      }
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Disposition")).toContain(
      `${BRAND.reportSlug}-session_3-nl.pdf`
    );
  });

  it("returns 500 on generation failures", async () => {
    mocks.token.mockResolvedValue("token-xyz");
    mocks.query.mockRejectedValue(new Error("boom"));

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ sessionId: "session_4" }),
    });

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Failed to generate report.",
    });
  });

  it("returns 409 when recommendation is missing", async () => {
    mocks.token.mockResolvedValue("token-wait");
    mocks.query.mockResolvedValueOnce({
      session: sessionFixture,
      recommendation: null,
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ sessionId: "session_3" }),
    });

    expect(response.status).toBe(409);
  });
});
