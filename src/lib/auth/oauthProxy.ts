const hopByHopHeaders = [
  "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
  "te", "trailer", "transfer-encoding", "upgrade",
];

function proxyHeaders(source: Headers): Headers {
  const headers = new Headers(source);
  const connectionHeaders = source.get("connection")?.split(",") ?? [];
  for (const name of [...hopByHopHeaders, ...connectionHeaders]) {
    if (name.trim()) headers.delete(name.trim());
  }
  headers.delete("content-length");
  return headers;
}

function upstreamOrigin(requestOrigin: string): string {
  const configured = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  if (!configured) throw new Error("Missing OAuth upstream");
  const target = new URL(configured);
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(target.hostname);
  if (
    (target.protocol !== "https:" && !(target.protocol === "http:" && loopback)) ||
    target.username || target.password || target.search || target.hash ||
    target.pathname !== "/" || target.origin === requestOrigin
  ) {
    throw new Error("Invalid OAuth upstream");
  }
  return target.origin;
}

function unavailable(status: number): Response {
  return new Response("Authentication temporarily unavailable.", {
    status,
    headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function proxyOAuthRequest(request: Request): Promise<Response> {
  const incoming = new URL(request.url);
  const route = incoming.pathname.match(/^\/api\/auth\/(signin|callback)\/[^/]+(?:\/[^/]+)*$/);
  if (!route) return new Response(null, { status: 404 });
  const allowed = route[1] === "signin" ? ["GET"] : ["GET", "POST"];
  if (!allowed.includes(request.method)) {
    return new Response(null, { status: 405, headers: { Allow: allowed.join(", ") } });
  }

  let origin: string;
  try {
    origin = upstreamOrigin(incoming.origin);
  } catch {
    return unavailable(503);
  }

  const headers = proxyHeaders(request.headers);
  for (const name of ["host", "forwarded", "x-forwarded-host", "x-forwarded-proto", "x-forwarded-port"]) {
    headers.delete(name);
  }

  try {
    const upstream = await fetch(`${origin}${incoming.pathname}${incoming.search}`, {
      method: request.method,
      headers,
      body: request.method === "POST" ? await request.arrayBuffer() : undefined,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(15_000)]),
    });
    const responseHeaders = proxyHeaders(upstream.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("set-cookie");
    for (const cookie of upstream.headers.getSetCookie()) responseHeaders.append("set-cookie", cookie);
    responseHeaders.set("Cache-Control", "no-store");
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch {
    return unavailable(502);
  }
}
