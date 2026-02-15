import { NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { createSimplePdfFromLines } from "@/lib/pdf/simplePdf";
import { buildRecommendationPdfLines } from "@/lib/reports/recommendationPdf";

interface PdfRouteContext {
  params: Promise<{ sessionId: string }>;
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

    const lines = buildRecommendationPdfLines({ session, recommendation });
    const pdfBytes = createSimplePdfFromLines(lines);
    const pdfBuffer = new ArrayBuffer(pdfBytes.byteLength);
    new Uint8Array(pdfBuffer).set(pdfBytes);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="bikefit-report-${sessionId}.pdf"`,
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
