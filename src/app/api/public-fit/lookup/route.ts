import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { getClientIp, hashIp } from "@/lib/ipHash";
import { issuePreviewToken } from "@/lib/previewToken";
import { consumeRateLimit } from "@/lib/rateLimiter";

const LOOKUP_LIMIT = 3;
const LOOKUP_WINDOW_MS = 5 * 60 * 1000;
const GENERIC_NOT_FOUND_BODY = {
  error: "Preview unavailable.",
} as const;

export const runtime = "nodejs";

type PublicFitLookupInternalResult = {
  bikeId: string;
  tokenVersion: number;
  accessMode: "public_fit_code" | "bike_passport";
  preview: {
    brand: string | null;
    model: string | null;
    bikeType: string;
    sizeLabel: string | null;
    geometryQuality: "full" | "partial" | "none";
    primaryPhotoSource: string | null;
    thumbnailSources: string[];
  };
};

function buildConvexClient() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("public_fit_convex_url_missing");
  }
  return new ConvexHttpClient(convexUrl);
}

function isDirectUrl(value: string | null): value is string {
  return Boolean(
    value && (value.startsWith("http://") || value.startsWith("https://"))
  );
}

async function resolvePhotoSource(
  convex: ConvexHttpClient,
  source: string | null
): Promise<string | null> {
  if (!source) {
    return null;
  }
  if (isDirectUrl(source)) {
    return source;
  }
  return await convex.query(api.files.actions.getUrl, {
    storageId: source,
  });
}

async function parseLookupBody(request: Request) {
  try {
    const body = (await request.json()) as { code?: string; publicFitCode?: string };
    const rawCode =
      typeof body.code === "string"
        ? body.code
        : typeof body.publicFitCode === "string"
          ? body.publicFitCode
          : "";
    return rawCode.trim();
  } catch {
    return null;
  }
}

export async function POST(request: Request): Promise<Response> {
  const ipHash = hashIp(getClientIp(request));
  const rateLimit = await consumeRateLimit({
    scope: "public-fit-lookup",
    key: ipHash,
    limit: LOOKUP_LIMIT,
    windowMs: LOOKUP_WINDOW_MS,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(rateLimit.retryAfterSeconds ?? 300),
        },
      }
    );
  }

  const code = await parseLookupBody(request);
  if (!code) {
    return NextResponse.json(
      { error: "A public fit code is required." },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  try {
    const convex = buildConvexClient();
    const lookup = (await convex.query(api.bikes.queries.getByPublicFitCode, {
      publicFitCode: code,
    })) as PublicFitLookupInternalResult | null;

    if (!lookup) {
      return NextResponse.json(GENERIC_NOT_FOUND_BODY, {
        status: 404,
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    const [primaryPhotoUrl, thumbnailUrls] = await Promise.all([
      resolvePhotoSource(convex, lookup.preview.primaryPhotoSource),
      Promise.all(
        lookup.preview.thumbnailSources.map((source) =>
          resolvePhotoSource(convex, source)
        )
      ),
    ]);

    return NextResponse.json(
      {
        brand: lookup.preview.brand,
        model: lookup.preview.model,
        bikeType: lookup.preview.bikeType,
        sizeLabel: lookup.preview.sizeLabel,
        geometryQuality: lookup.preview.geometryQuality,
        primaryPhotoUrl,
        thumbnailUrls: thumbnailUrls.filter((value): value is string => Boolean(value)),
        previewToken: issuePreviewToken({
          bikeId: lookup.bikeId,
          tokenVersion: lookup.tokenVersion,
          accessMode: lookup.accessMode,
        }),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Public fit lookup failed.", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Preview lookup failed." },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

export async function GET(): Promise<Response> {
  return NextResponse.json(
    { error: "Method not allowed." },
    {
      status: 405,
      headers: {
        Allow: "POST",
        "Cache-Control": "no-store",
      },
    }
  );
}
