import { NextRequest } from "next/server";

function isAllowedHost(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  return (
    normalized === "marktplaats.nl" ||
    normalized === "www.marktplaats.nl" ||
    normalized.endsWith(".marktplaats.nl") ||
    normalized.endsWith(".marktplaats.com")
  );
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return new Response("Missing url", { status: 400 });
  }

  let remoteUrl: URL;
  try {
    remoteUrl = new URL(rawUrl);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }

  if (remoteUrl.protocol !== "https:" || !isAllowedHost(remoteUrl.hostname)) {
    return new Response("Unsupported image host", { status: 400 });
  }

  const response = await fetch(remoteUrl.toString(), {
    headers: {
      "User-Agent": "BestBikeFit4U Marktplaats Import/1.0",
      Accept: "image/*",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return new Response("Could not fetch remote image", { status: 502 });
  }

  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  if (!contentType.startsWith("image/")) {
    return new Response("Unsupported remote content type", { status: 415 });
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    },
  });
}
