import { NextResponse } from "next/server";
import { billingDeploymentChecks, isHttpsUrl } from "../../../../../shared/billing/deploymentConfig";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const checks = {
    NEXT_PUBLIC_CONVEX_URL: isHttpsUrl(process.env.NEXT_PUBLIC_CONVEX_URL),
    NEXT_PUBLIC_CONVEX_SITE_URL: isHttpsUrl(process.env.NEXT_PUBLIC_CONVEX_SITE_URL),
    ...billingDeploymentChecks(process.env),
  };
  const ok = Object.values(checks).every(Boolean);
  return NextResponse.json({ ok, checks }, {
    status: ok ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
