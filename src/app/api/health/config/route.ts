import { NextResponse } from "next/server";

export const runtime = "nodejs";

function hasNonEmptyEnv(name: string): boolean {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0;
}

export async function GET(): Promise<Response> {
  const requiredVars = [
    "NEXT_PUBLIC_CONVEX_URL",
    "NEXT_PUBLIC_CONVEX_SITE_URL",
  ];

  const ok = requiredVars.every((name) => hasNonEmptyEnv(name));

  return NextResponse.json(
    {
      ok,
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
