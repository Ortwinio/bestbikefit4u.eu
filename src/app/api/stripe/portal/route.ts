import { NextResponse } from "next/server";
import Stripe from "stripe";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

export const runtime = "nodejs";

type PortalRequestBody = {
  locale?: string;
};

function resolveSiteUrl(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const siteUrl =
    process.env.SITE_URL ??
    (process.env.NODE_ENV === "production" ? undefined : requestOrigin);

  return siteUrl;
}

function resolveReturnUrl(siteUrl: string, locale?: string) {
  const normalizedLocale = locale === "nl" ? "nl" : "en";
  const path = normalizedLocale === "nl" ? "/nl/settings" : "/settings";
  return new URL(`${path}?billing=portal_return`, siteUrl).toString();
}

export async function POST(request: Request): Promise<Response> {
  try {
    const token = await convexAuthNextjsToken();
    if (!token) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json({ error: "Server misconfigured." }, { status: 500 });
    }

    const siteUrl = resolveSiteUrl(request);
    if (!siteUrl) {
      return NextResponse.json({ error: "SITE_URL is required in production." }, { status: 500 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: "Stripe Customer Portal is not configured." }, { status: 503 });
    }

    const body = (await request.json().catch(() => ({}))) as PortalRequestBody;
    const convex = new ConvexHttpClient(convexUrl);
    convex.setAuth(token);
    const user = await convex.query(api.users.queries.getCurrentUser);

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.tier !== "pro" && user.tier !== "premium") {
      return NextResponse.json({ error: "No paid subscription is available to manage." }, { status: 403 });
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: "This paid account is not linked to a Stripe customer yet." },
        { status: 409 }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2026-06-24.dahlia" });
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: resolveReturnUrl(siteUrl, body.locale),
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("[stripe/portal] Error creating portal session:", error);
    return NextResponse.json({ error: "Failed to create billing portal session." }, { status: 500 });
  }
}
