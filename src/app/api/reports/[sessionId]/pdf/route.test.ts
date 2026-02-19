import { beforeEach, describe, expect, it, vi } from "vitest";
import { BRAND } from "@/config/brand";

const mocks = vi.hoisted(() => {
  const token = vi.fn();
  const query = vi.fn();
  const setAuth = vi.fn();
  const clientConstructor = vi.fn();
  const mapPdfReportData = vi.fn();
  const renderPdfReportHtml = vi.fn();
  const renderPdfFromHtml = vi.fn();
  const buildRecommendationPdfLines = vi.fn();
  const createSimplePdfFromLines = vi.fn();

  return {
    token,
    query,
    setAuth,
    clientConstructor,
    mapPdfReportData,
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
  },
}));

vi.mock("@/lib/reports/pdfValueMapping", () => ({
  mapPdfReportData: mocks.mapPdfReportData,
}));

vi.mock("@/lib/reports/pdfLayoutTemplate", () => ({
  renderPdfReportHtml: mocks.renderPdfReportHtml,
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

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://example.convex.cloud";
    delete process.env.PDF_RICH_RENDER_ENABLED;

    mocks.mapPdfReportData.mockReturnValue({
      title: BRAND.reportTitle,
      summaryCards: [],
    });
    mocks.renderPdfReportHtml.mockReturnValue("<html>report</html>");
    mocks.renderPdfFromHtml.mockResolvedValue(
      new TextEncoder().encode("%PDF-1.4 rich")
    );
    mocks.buildRecommendationPdfLines.mockReturnValue([
      BRAND.reportTitle,
      "Fallback content",
    ]);
    mocks.createSimplePdfFromLines.mockReturnValue(
      new TextEncoder().encode("%PDF-1.4 fallback")
    );
  });

  it("returns 401 when user is not authenticated", async () => {
    mocks.token.mockResolvedValue(undefined);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ sessionId: "session_1" }),
    });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Not authenticated." });
    expect(mocks.clientConstructor).not.toHaveBeenCalled();
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
    mocks.query
      .mockResolvedValueOnce(sessionFixture)
      .mockResolvedValueOnce(recommendationFixture);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ sessionId: "session_3" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toContain(
      `${BRAND.reportSlug}-session_3.pdf`
    );

    const buffer = await response.arrayBuffer();
    const text = new TextDecoder().decode(buffer);
    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text).toContain("rich");
    expect(mocks.mapPdfReportData).toHaveBeenCalledWith({
      session: sessionFixture,
      recommendation: recommendationFixture,
    });
    expect(mocks.renderPdfFromHtml).toHaveBeenCalledTimes(1);
    expect(mocks.createSimplePdfFromLines).not.toHaveBeenCalled();
  });

  it("falls back to simple renderer when rich renderer fails", async () => {
    mocks.token.mockResolvedValue("token-fallback");
    mocks.query
      .mockResolvedValueOnce(sessionFixture)
      .mockResolvedValueOnce(recommendationFixture);
    mocks.renderPdfFromHtml.mockRejectedValueOnce(new Error("no chromium"));

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ sessionId: "session_3" }),
    });

    expect(response.status).toBe(200);
    expect(mocks.renderPdfFromHtml).toHaveBeenCalledTimes(1);
    expect(mocks.buildRecommendationPdfLines).toHaveBeenCalledWith({
      session: sessionFixture,
      recommendation: recommendationFixture,
    });
    expect(mocks.createSimplePdfFromLines).toHaveBeenCalledTimes(1);

    const bodyText = new TextDecoder().decode(await response.arrayBuffer());
    expect(bodyText).toContain("fallback");
  });

  it("uses simple renderer directly when rich rendering is disabled by env", async () => {
    process.env.PDF_RICH_RENDER_ENABLED = "false";
    mocks.token.mockResolvedValue("token-env-flag");
    mocks.query
      .mockResolvedValueOnce(sessionFixture)
      .mockResolvedValueOnce(recommendationFixture);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ sessionId: "session_3" }),
    });

    expect(response.status).toBe(200);
    expect(mocks.renderPdfFromHtml).not.toHaveBeenCalled();
    expect(mocks.buildRecommendationPdfLines).toHaveBeenCalledTimes(1);
    expect(mocks.createSimplePdfFromLines).toHaveBeenCalledTimes(1);
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
});
