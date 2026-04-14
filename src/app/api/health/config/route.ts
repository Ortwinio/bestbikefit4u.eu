import { NextResponse } from "next/server";

export const runtime = "nodejs";

function hasNonEmptyEnv(name: string): boolean {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0;
}

export async function GET(): Promise<Response> {
  const required = {
    NEXT_PUBLIC_CONVEX_URL: hasNonEmptyEnv("NEXT_PUBLIC_CONVEX_URL"),
    NEXT_PUBLIC_CONVEX_SITE_URL: hasNonEmptyEnv("NEXT_PUBLIC_CONVEX_SITE_URL"),
  };

  const optional = {
    AUTH_RESEND_KEY: hasNonEmptyEnv("AUTH_RESEND_KEY"),
    NEXT_PUBLIC_GTM_ID: hasNonEmptyEnv("NEXT_PUBLIC_GTM_ID"),
    NEXT_PUBLIC_GOOGLE_ADS_ID: hasNonEmptyEnv("NEXT_PUBLIC_GOOGLE_ADS_ID"),
    NEXT_PUBLIC_META_PIXEL_ID: hasNonEmptyEnv("NEXT_PUBLIC_META_PIXEL_ID"),
  };

  const ok = Object.values(required).every(Boolean);

  return NextResponse.json(
    {
      ok,
      required,
      optional,
      checkedAt: new Date().toISOString(),
    },
    {
      status: ok ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
