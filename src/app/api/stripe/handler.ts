import { NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { isStripeBillingEnabled } from "@/config/billing";
import { stripeNotImplemented } from "@/lib/billing/stripeStub";

type Body = Record<string, unknown>;
export function stripeRoute(action: (body: Body, token: string, locale: "nl" | "en") => Promise<unknown>) {
  return async (request: Request): Promise<Response> => {
    const token = await convexAuthNextjsToken();
    if (!token) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    const parsed: unknown = await request.json().catch(() => null);
    const body: Body = parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Body : {};
    const locale = body.locale === "en" ? "en" : "nl";
    const headers = { "Cache-Control": "no-store" };
    if (!isStripeBillingEnabled()) return NextResponse.json(stripeNotImplemented(locale), { status: 501, headers });
    try {
      return NextResponse.json(await action(body, token, locale), { headers });
    } catch (error) {
      console.error("Stripe request failed", error);
      return NextResponse.json({ code: "BILLING_REQUEST_FAILED", message: locale === "nl"
        ? "De betaling kon niet worden verwerkt. Probeer het opnieuw."
        : "The billing request could not be processed. Please try again." }, { status: 400, headers });
    }
  };
}
