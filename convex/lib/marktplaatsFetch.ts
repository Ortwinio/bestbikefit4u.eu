const ALLOWED_HOSTS = ["marktplaats.nl", "marktplaats.com"];
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/avif",
]);

export function validateMarktplaatsUrl(input: string | URL): URL {
  const url = new URL(input);
  if (
    url.protocol !== "https:" || url.username || url.password ||
    (url.port && url.port !== "443") ||
    !ALLOWED_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))
  ) {
    throw new Error("Unsupported Marktplaats URL");
  }
  return url;
}

/** Validate every destination before sending a request, including redirects. */
export async function fetchMarktplaats(input: string | URL, init: RequestInit = {}) {
  let url = validateMarktplaatsUrl(input);
  const signal = init.signal ?? AbortSignal.timeout(12_000);
  for (let redirects = 0; redirects <= 4; redirects++) {
    const response = await fetch(url, { ...init, signal, redirect: "manual" });
    if (!REDIRECT_STATUSES.has(response.status)) return response;
    const location = response.headers.get("location");
    await response.body?.cancel();
    if (!location || redirects === 4) throw new Error("Invalid Marktplaats redirect");
    url = validateMarktplaatsUrl(new URL(location, url));
  }
  throw new Error("Too many Marktplaats redirects");
}

/** Bound streamed bodies even when Content-Length is absent or dishonest. */
export async function readLimitedBytes(response: Response, maxBytes: number): Promise<Uint8Array<ArrayBuffer>> {
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    await response.body?.cancel();
    throw new Error("Remote response is too large");
  }
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new Error("Remote response is too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}
