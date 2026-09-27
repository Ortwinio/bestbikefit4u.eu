import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { NextRequest } from "next/server";
import { consumeRateLimit } from "@/lib/rateLimiter";
import { getClientIp, hashIp } from "@/lib/ipHash";
import { ALLOWED_IMAGE_TYPES, fetchMarktplaats, readLimitedBytes, validateMarktplaatsUrl } from "../../../../../convex/lib/marktplaatsFetch";

const IMAGE_PROXY_LIMIT = 20;
const IMAGE_PROXY_WINDOW_MS = 60 * 1000;

export async function GET(request: NextRequest) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return new Response("Authentication required", { status: 401 });
  }

  const ipHash = hashIp(getClientIp(request));
  const rateLimit = await consumeRateLimit({
    scope: "marktplaats-image",
    key: ipHash,
    limit: IMAGE_PROXY_LIMIT,
    windowMs: IMAGE_PROXY_WINDOW_MS,
  });

  if (!rateLimit.allowed) {
    return new Response("Too many requests", {
      status: 429,
      headers: {
        "Retry-After": String(rateLimit.retryAfterSeconds ?? 60),
      },
    });
  }

  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return new Response("Missing url", { status: 400 });
  }

  let remoteUrl: URL;
  try {
    remoteUrl = validateMarktplaatsUrl(rawUrl);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }

  try {
    const response = await fetchMarktplaats(remoteUrl, {
      headers: {
        "User-Agent": "BestBikeFit4U Marktplaats Import/1.0",
        Accept: "image/*",
      },
      cache: "no-store",
    });
    if (!response.ok) {
      await response.body?.cancel();
      return new Response("Could not fetch remote image", { status: 502 });
    }
    const contentType = (response.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
      await response.body?.cancel();
      return new Response("Unsupported remote content type", { status: 415 });
    }
    const bytes = await readLimitedBytes(response, 10 * 1024 * 1024);
    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Could not fetch remote image", { status: 502 });
  }
}
