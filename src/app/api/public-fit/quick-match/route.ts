import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { z } from "zod";
import { api } from "../../../../../convex/_generated/api";
import {
  isValidQuickMatchHeight,
  QUICK_MATCH_MAX_HEIGHT_CM,
  QUICK_MATCH_MIN_HEIGHT_CM,
  runQuickMatch,
} from "@/lib/fitEngine/quickMatch";
import {
  isPreviewTokenAuthorizedForBike,
  verifyPreviewToken,
} from "@/lib/previewToken";

export const runtime = "nodejs";

const requestSchema = z.object({
  previewToken: z.string().trim().min(1),
  heightCm: z.number().finite(),
});

type PublicFitBikeState = {
  bikeId: string;
  bikePassportId: string | null;
  publicFitTokenVersion: number;
  passportTokenVersion: number;
  publicFitEnabled: boolean;
  snapshot: Parameters<typeof runQuickMatch>[1];
};

function buildConvexClient() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("public_fit_convex_url_missing");
  }

  return new ConvexHttpClient(convexUrl);
}

export async function POST(request: Request): Promise<Response> {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_request_body" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const parsed = requestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request_body" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!isValidQuickMatchHeight(parsed.data.heightCm)) {
    return NextResponse.json(
      {
        error: "height_out_of_range",
        minHeightCm: QUICK_MATCH_MIN_HEIGHT_CM,
        maxHeightCm: QUICK_MATCH_MAX_HEIGHT_CM,
      },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const verified = verifyPreviewToken(parsed.data.previewToken);
  if (!verified.valid) {
    return NextResponse.json(
      { error: "preview_token_invalid" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const convex = buildConvexClient();
    const bikeState = (await convex.query(api.bikes.queries.getPublicFitByBikeId, {
      bikeId: verified.payload.bikeId as never,
    })) as PublicFitBikeState | null;

    if (
      !bikeState ||
      !isPreviewTokenAuthorizedForBike({
        payload: verified.payload,
        bike: {
          bikeId: bikeState.bikeId,
          bikePassportId: bikeState.bikePassportId,
        },
        publicFitEnabled: bikeState.publicFitEnabled,
        publicFitTokenVersion: bikeState.publicFitTokenVersion,
        passportTokenVersion: bikeState.passportTokenVersion,
      })
    ) {
      return NextResponse.json(
        { error: "preview_token_invalid" },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const result = runQuickMatch(parsed.data.heightCm, bikeState.snapshot);
    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Public fit quick match failed.", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "quick_match_failed" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
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
