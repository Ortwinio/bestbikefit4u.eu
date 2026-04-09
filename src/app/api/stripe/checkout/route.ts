import { NextResponse } from "next/server";
import Stripe from "stripe";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

export const runtime = "nodejs";

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

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const stripePriceId = process.env.STRIPE_PRO_PRICE_ID;
    const siteUrl = process.env.SITE_URL ?? "https://bestbikefit4u.eu";

    if (!stripeKey || !stripePriceId) {
      // Dev fallback
      console.log("[DEV] Stripe not configured — returning mock checkout URL");
      return NextResponse.json({ url: `${siteUrl}/pricing?dev=stripe_mock` });
    }

    const body = await request.json() as { sessionId?: string; locale?: string };
    const { sessionId, locale = "en" } = body;

    const convex = new ConvexHttpClient(convexUrl);
    convex.setAuth(token);
    const user = await convex.query(api.users.queries.getCurrentUser);

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2026-03-25.dahlia" });

    const successUrl = sessionId
      ? `${siteUrl}/${locale === "nl" ? "nl/" : ""}fit/${sessionId}/results?checkout=success&checkout_session_id={CHECKOUT_SESSION_ID}`
      : `${siteUrl}/${locale === "nl" ? "nl/" : ""}dashboard?checkout=success`;

    const cancelUrl = sessionId
      ? `${siteUrl}/${locale === "nl" ? "nl/" : ""}fit/${sessionId}/results?checkout=cancelled`
      : `${siteUrl}/${locale === "nl" ? "nl/" : ""}pricing?checkout=cancelled`;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email ?? undefined,
      allow_promotion_codes: true,
      metadata: {
        userId: user._id as string,
        ...(sessionId ? { convexSessionId: sessionId } : {}),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[stripe/checkout] Error creating session:", error);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
