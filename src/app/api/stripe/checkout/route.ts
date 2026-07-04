import { NextResponse } from "next/server";
import Stripe from "stripe";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { z } from "zod";
import { api } from "../../../../../convex/_generated/api";
import {
  STRIPE_API_VERSION,
  canUseDevStripeMock,
  getMissingStripeCheckoutEnv,
  getStripeProduct,
  getStripeSiteUrl,
  isStripeProductKey,
} from "@/config/stripeServer";

export const runtime = "nodejs";

const checkoutRequestSchema = z
  .object({
    productKey: z
      .string()
      .min(1)
      .refine(isStripeProductKey, "Unsupported product."),
    sessionId: z
      .string()
      .trim()
      .min(1)
      .max(128)
      .regex(/^[A-Za-z0-9_-]+$/)
      .optional(),
    locale: z.enum(["en", "nl"]).default("en"),
  })
  .strict();

async function parseCheckoutRequest(request: Request) {
  try {
    return checkoutRequestSchema.safeParse(await request.json());
  } catch {
    return checkoutRequestSchema.safeParse(null);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const parsedRequest = await parseCheckoutRequest(request);
    if (!parsedRequest.success) {
      return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
    }

    const { productKey, sessionId, locale } = parsedRequest.data;

    const token = await convexAuthNextjsToken();
    if (!token) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json({ error: "Server misconfigured." }, { status: 500 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const requestOrigin = new URL(request.url).origin;
    const siteUrl = getStripeSiteUrl(requestOrigin);

    if (!siteUrl) {
      return NextResponse.json({ error: "SITE_URL is required in production." }, { status: 500 });
    }

    const product = getStripeProduct(productKey);
    if (!stripeKey || !product) {
      if (!canUseDevStripeMock(productKey)) {
        const missing = getMissingStripeCheckoutEnv(productKey);
        console.error("[stripe/checkout] Missing Stripe checkout configuration", { missing });
        return NextResponse.json({ error: "Stripe checkout is not configured." }, { status: 500 });
      }

      console.log("[DEV] Stripe not configured - returning mock checkout URL");
      return NextResponse.json({ url: `${siteUrl}/pricing?dev=stripe_mock` });
    }

    const convex = new ConvexHttpClient(convexUrl);
    convex.setAuth(token);
    const user = await convex.query(api.users.queries.getCurrentUser);

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: STRIPE_API_VERSION });
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: {
          userId: user._id as string,
        },
      });
      stripeCustomerId = customer.id;
      await convex.mutation(api.users.mutations.storeStripeCustomerId, {
        stripeCustomerId,
      });
    }

    const successUrl = sessionId
      ? `${siteUrl}/${locale === "nl" ? "nl/" : ""}fit/${sessionId}/results?checkout=success&checkout_session_id={CHECKOUT_SESSION_ID}`
      : `${siteUrl}/${locale === "nl" ? "nl/" : ""}dashboard?checkout=success`;

    const cancelUrl = sessionId
      ? `${siteUrl}/${locale === "nl" ? "nl/" : ""}fit/${sessionId}/results?checkout=cancelled`
      : `${siteUrl}/${locale === "nl" ? "nl/" : ""}pricing?checkout=cancelled`;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: product.priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer: stripeCustomerId,
      client_reference_id: user._id as string,
      allow_promotion_codes: true,
      metadata: {
        userId: user._id as string,
        productKey: product.productKey,
        planKey: product.planKey,
        ...(sessionId ? { fitSessionId: sessionId } : {}),
      },
    });

    if (!checkoutSession.url) {
      return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[stripe/checkout] Error creating session:", error);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
