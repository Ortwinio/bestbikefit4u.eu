import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

type LocalhostDevSignInResult =
  | { tokens: { token: string; refreshToken: string } | null }
  | { redirect?: string; verifier?: string }
  | { started?: boolean };

function isLocalDevRequest(request: Request) {
  const { hostname } = new URL(request.url);
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function buildConvexClient() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL");
  }
  return new ConvexHttpClient(convexUrl);
}

export async function POST(request: Request) {
  if (!process.env.LOCALHOST_DEV_LOGIN_SECRET) {
    return jsonError("Localhost dev login is disabled.", 404);
  }

  if (!isLocalDevRequest(request)) {
    return jsonError("Localhost dev login only works on localhost.", 403);
  }

  let body: {
    email?: string;
    name?: string;
    adminRole?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const client = buildConvexClient();
  const result = (await client.action(api.auth.signIn, {
    provider: "localhost-dev",
    params: {
      secret: process.env.LOCALHOST_DEV_LOGIN_SECRET,
      email: body.email,
      name: body.name,
      adminRole: body.adminRole,
    },
  })) as LocalhostDevSignInResult;

  if (!("tokens" in result) || !result.tokens) {
    return jsonError("Could not sign in with localhost dev login.", 500);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("__convexAuthJWT", result.tokens.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  response.cookies.set("__convexAuthRefreshToken", result.tokens.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
