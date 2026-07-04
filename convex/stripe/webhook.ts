export type StripeSignatureVerificationResult =
  | { ok: true }
  | { ok: false; reason: "missing" | "format" | "timestamp" | "signature" };

export async function verifyStripeWebhookSignature(args: {
  payload: string;
  signatureHeader: string | null;
  webhookSecret: string;
  nowMs?: number;
  toleranceSeconds?: number;
}): Promise<StripeSignatureVerificationResult> {
  const { payload, signatureHeader, webhookSecret } = args;
  if (!signatureHeader) {
    return { ok: false, reason: "missing" };
  }

  const sigParts: Record<string, string[]> = {};
  for (const part of signatureHeader.split(",")) {
    const [key, ...rest] = part.split("=");
    if (!key || rest.length === 0) continue;
    if (!sigParts[key]) sigParts[key] = [];
    sigParts[key].push(rest.join("="));
  }

  const timestamp = sigParts["t"]?.[0];
  const signatures = sigParts["v1"] ?? [];
  if (!timestamp || signatures.length === 0) {
    return { ok: false, reason: "format" };
  }

  const parsedTimestamp = Number(timestamp);
  if (!Number.isFinite(parsedTimestamp)) {
    return { ok: false, reason: "format" };
  }

  const toleranceSeconds = args.toleranceSeconds ?? 300;
  const nowSeconds = (args.nowMs ?? Date.now()) / 1000;
  if (Math.abs(nowSeconds - parsedTimestamp) > toleranceSeconds) {
    return { ok: false, reason: "timestamp" };
  }

  const expectedSignature = await computeStripeSignature({
    payload,
    timestamp,
    webhookSecret,
  });

  const isValid = signatures.some((signature) =>
    timingSafeEqual(signature, expectedSignature)
  );
  return isValid ? { ok: true } : { ok: false, reason: "signature" };
}

export async function computeStripeSignature(args: {
  payload: string;
  timestamp: string;
  webhookSecret: string;
}) {
  const signedPayload = `${args.timestamp}.${args.payload}`;
  const secretBytes = new TextEncoder().encode(args.webhookSecret);
  const payloadBytes = new TextEncoder().encode(signedPayload);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const hmacBuffer = await crypto.subtle.sign("HMAC", cryptoKey, payloadBytes);
  return Array.from(new Uint8Array(hmacBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  const len = Math.max(aBytes.length, bBytes.length);
  let result = aBytes.length ^ bBytes.length;

  for (let i = 0; i < len; i++) {
    result |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }

  return result === 0;
}

