import { NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { BRAND } from "@/config/brand";
import { createSimplePdfFromLines } from "@/lib/pdf/simplePdf";
import { renderPdfFromHtml } from "@/lib/pdf/htmlPdf";
import {
  renderPdfFooterTemplate,
  renderPdfHeaderTemplate,
  renderPdfReportHtml,
} from "@/lib/reports/pdfLayoutTemplate";
import { getReportV2Copy } from "@/lib/reports/reportV2Copy";
import { mapReportV2Payload } from "@/lib/reports/reportV2Mapper";
import { buildRecommendationPdfLines } from "@/lib/reports/recommendationPdf";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  LOCALE_HEADER_NAME,
  normalizeLocale,
  resolvePreferredLocale,
  type Locale,
} from "@/i18n/config";
import { extractLocaleFromPathname } from "@/i18n/navigation";
import { getEffectiveProfileImageSource } from "@/lib/userIdentity";

interface PdfRouteContext {
  params: Promise<{ sessionId: string }>;
}

export const runtime = "nodejs";

function isDirectUrl(source?: string | null): source is string {
  return Boolean(
    source && (source.startsWith("http://") || source.startsWith("https://"))
  );
}

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(";")) {
    const [rawKey, ...valueParts] = part.trim().split("=");
    if (rawKey === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

function resolvePdfLocale(request: Request): Locale {
  const requestUrl = new URL(request.url);
  const queryLocale = normalizeLocale(requestUrl.searchParams.get("locale"));
  if (queryLocale) {
    return queryLocale;
  }

  const headerLocale = normalizeLocale(request.headers.get(LOCALE_HEADER_NAME));
  if (headerLocale) {
    return headerLocale;
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refererLocale = extractLocaleFromPathname(new URL(referer).pathname);
      if (refererLocale) {
        return refererLocale;
      }
    } catch {
      // Ignore malformed referrers and continue to the next locale source.
    }
  }

  return (
    resolvePreferredLocale({
      cookieLocale: getCookieValue(
        request.headers.get("cookie"),
        LOCALE_COOKIE_NAME
      ),
      acceptLanguageHeader: request.headers.get("accept-language"),
    }) ?? DEFAULT_LOCALE
  );
}

function resolveContentDisposition(request: Request, sessionId: string, locale: Locale) {
  const requestUrl = new URL(request.url);
  const disposition = requestUrl.searchParams.get("disposition");
  const filename = `${BRAND.reportSlug}-${sessionId}-${locale}.pdf`;

  if (disposition === "inline") {
    return `inline; filename="${filename}"`;
  }

  return `attachment; filename="${filename}"`;
}

export async function GET(
  request: Request,
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
    const locale = resolvePdfLocale(request);
    const contentDisposition = resolveContentDisposition(request, sessionId, locale);

    const convex = new ConvexHttpClient(convexUrl);
    convex.setAuth(token);

    const typedSessionId = sessionId as Id<"fitSessions">;

    const allowed = await convex.mutation(
      api.reportRateLimit.consumeReportRateLimitToken,
      { sessionId: typedSessionId }
    );
    if (!allowed) {
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

    const reportSource = await convex.query(api.recommendations.queries.getReportV2, {
      sessionId: typedSessionId,
    });

    if (!reportSource) {
      return NextResponse.json(
        { error: "Session not found." },
        { status: 404 }
      );
    }
    const { session, recommendation } = reportSource;

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
        const bikeImageSource = reportSource.bike?.photoUrl;
        const bikeImageUrl = isDirectUrl(bikeImageSource)
          ? bikeImageSource
          : bikeImageSource
            ? await convex.query(api.files.actions.getUrl, {
                storageId: bikeImageSource,
              })
            : null;
        const riderImageSource = getEffectiveProfileImageSource(reportSource.user);
        const riderImageUrl = isDirectUrl(riderImageSource)
          ? riderImageSource
          : riderImageSource
            ? await convex.query(api.files.actions.getUrl, {
                storageId: riderImageSource,
              })
            : null;
        const mappedReport = mapReportV2Payload({
          ...reportSource,
          bikeImageUrl,
          riderImageUrl,
        });
        const copy = getReportV2Copy(locale);
        const html = renderPdfReportHtml({
          report: mappedReport,
          copy,
        });
        pdfBytes = await renderPdfFromHtml({
          html,
          headerTemplate: renderPdfHeaderTemplate({ report: mappedReport, copy }),
          footerTemplate: renderPdfFooterTemplate(),
        });
      } catch (richRenderError) {
        console.error("Rich PDF render failed, using simple fallback.", {
          sessionId,
          error:
            richRenderError instanceof Error
              ? richRenderError.message
              : String(richRenderError),
        });

        pdfBytes = createSimplePdfFromLines(
          buildRecommendationPdfLines({ session, recommendation, locale })
        );
      }
    } else {
      pdfBytes = createSimplePdfFromLines(
        buildRecommendationPdfLines({ session, recommendation, locale })
      );
    }

    const pdfBuffer = new ArrayBuffer(pdfBytes.byteLength);
    new Uint8Array(pdfBuffer).set(pdfBytes);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition,
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
