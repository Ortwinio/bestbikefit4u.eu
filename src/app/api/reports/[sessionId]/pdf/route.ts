import { NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { createHash } from "node:crypto";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { BRAND } from "@/config/brand";
import { createSimplePdfFromLines } from "@/lib/pdf/simplePdf";
import { renderPdfFromHtml } from "@/lib/pdf/htmlPdf";
import { renderPdfReportHtml } from "@/lib/reports/pdfLayoutTemplate";
import { mapPdfReportData } from "@/lib/reports/pdfValueMapping";
import { buildRecommendationPdfLines } from "@/lib/reports/recommendationPdf";

interface PdfRouteContext {
  params: Promise<{ sessionId: string }>;
}

export const runtime = "nodejs";

const REPORT_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const REPORT_RATE_LIMIT_MAX_REQUESTS = 8;
const reportRateLimitState = new Map<
  string,
  { tokens: number; lastRefillAt: number }
>();

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex").slice(0, 16);
}

function consumeReportRateLimitToken(key: string): boolean {
  const now = Date.now();
  const existing = reportRateLimitState.get(key);
  if (!existing) {
    reportRateLimitState.set(key, {
      tokens: REPORT_RATE_LIMIT_MAX_REQUESTS - 1,
      lastRefillAt: now,
    });
    return true;
  }

  const elapsed = Math.max(0, now - existing.lastRefillAt);
  const refillRatePerMs = REPORT_RATE_LIMIT_MAX_REQUESTS / REPORT_RATE_LIMIT_WINDOW_MS;
  const available = Math.min(
    REPORT_RATE_LIMIT_MAX_REQUESTS,
    existing.tokens + elapsed * refillRatePerMs
  );
  if (available < 1) {
    reportRateLimitState.set(key, {
      tokens: available,
      lastRefillAt: now,
    });
    return false;
  }

  reportRateLimitState.set(key, {
    tokens: available - 1,
    lastRefillAt: now,
  });
  return true;
}

export async function GET(
  _request: Request,
  context: PdfRouteContext
): Promise<Response> {
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json(
        { error: "Server configuration missing." },
        { status: 500 }
      );
    }

    const token = await convexAuthNextjsToken();
    if (!token) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { sessionId } = await context.params;
    const limitKey = `report:${sessionId}:${hashToken(token)}`;
    if (!consumeReportRateLimitToken(limitKey)) {
      console.warn("Report download rate limit exceeded.", { sessionId });
      return NextResponse.json(
        { error: "Too many report requests. Please try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": "30",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const convex = new ConvexHttpClient(convexUrl);
    convex.setAuth(token);

    const typedSessionId = sessionId as Id<"fitSessions">;

    const session = await convex.query(api.sessions.queries.getById, {
      sessionId: typedSessionId,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found." },
        { status: 404 }
      );
    }

    const recommendation = await convex.query(
      api.recommendations.queries.getBySession,
      {
        sessionId: typedSessionId,
      }
    );

    if (!recommendation) {
      return NextResponse.json(
        { error: "Recommendation not available yet." },
        { status: 409 }
      );
    }

    let pdfBytes: Uint8Array;

    const richRenderingEnabled =
      process.env.PDF_RICH_RENDER_ENABLED?.toLowerCase() !== "false";

    if (richRenderingEnabled) {
      try {
        const mappedReport = mapPdfReportData({ session, recommendation });
        const html = renderPdfReportHtml({ report: mappedReport });
        pdfBytes = await renderPdfFromHtml({ html });
      } catch (richRenderError) {
        console.error("Rich PDF render failed, using simple fallback.", {
          sessionId,
          error:
            richRenderError instanceof Error
              ? richRenderError.message
              : String(richRenderError),
        });

        const lines = buildRecommendationPdfLines({ session, recommendation });
        pdfBytes = createSimplePdfFromLines(lines);
      }
    } else {
      const lines = buildRecommendationPdfLines({ session, recommendation });
      pdfBytes = createSimplePdfFromLines(lines);
    }

    const pdfBuffer = new ArrayBuffer(pdfBytes.byteLength);
    new Uint8Array(pdfBuffer).set(pdfBytes);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${BRAND.reportSlug}-${sessionId}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to generate PDF report:", error);
    return NextResponse.json(
      { error: "Failed to generate report." },
      { status: 500 }
    );
  }
}
