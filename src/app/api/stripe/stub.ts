import { NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { stripeNotImplemented } from "@/lib/billing/stripeStub";

/** The release deliberately has no payment-provider integration. */
export async function handleStripeStubRequest(request: Request): Promise<Response> {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const locale = body !== null && typeof body === "object" && "locale" in body && body.locale === "en"
    ? "en"
    : "nl";
  return NextResponse.json(stripeNotImplemented(locale), {
    status: 501,
    headers: { "Cache-Control": "no-store" },
  });
}
