import { createHmac, timingSafeEqual } from "node:crypto";

export type PreviewTokenPayload = {
  bikeId: string;
  tokenVersion: number;
  accessMode: "public_fit_code" | "bike_passport";
  iat: number;
  exp: number;
};

type PreviewTokenVerificationResult =
  | { valid: true; payload: PreviewTokenPayload }
  | { valid: false; reason: "malformed" | "signature" | "expired" };

const DEFAULT_TTL_SECONDS = 10 * 60;
const DEV_PREVIEW_TOKEN_SECRET = "dev-public-fit-preview-token-secret";

function getPreviewTokenSecret() {
  const secret =
    process.env.PREVIEW_TOKEN_SECRET ??
    process.env.PUBLIC_FIT_PREVIEW_TOKEN_SECRET ??
    (process.env.NODE_ENV === "production" ? undefined : DEV_PREVIEW_TOKEN_SECRET);

  if (!secret) {
    throw new Error("preview_token_secret_missing");
  }

  return secret;
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Buffer.from(padded, "base64");
}

function signPreviewTokenParts(header: string, payload: string, secret: string) {
  return base64UrlEncode(
    createHmac("sha256", secret).update(`${header}.${payload}`).digest()
  );
}

export function issuePreviewToken({
  bikeId,
  tokenVersion,
  accessMode,
  now = Math.floor(Date.now() / 1000),
  ttlSeconds = DEFAULT_TTL_SECONDS,
}: {
  bikeId: string;
  tokenVersion: number;
  accessMode: PreviewTokenPayload["accessMode"];
  now?: number;
  ttlSeconds?: number;
}) {
  const header = base64UrlEncode(
    JSON.stringify({
      alg: "HS256",
      typ: "BBF_PUBLIC_FIT_PREVIEW",
    })
  );
  const payload = base64UrlEncode(
    JSON.stringify({
      bikeId,
      tokenVersion,
      accessMode,
      iat: now,
      exp: now + ttlSeconds,
    } satisfies PreviewTokenPayload)
  );
  const signature = signPreviewTokenParts(header, payload, getPreviewTokenSecret());
  return `${header}.${payload}.${signature}`;
}

export function verifyPreviewToken(
  token: string,
  now = Math.floor(Date.now() / 1000)
): PreviewTokenVerificationResult {
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) {
    return { valid: false, reason: "malformed" };
  }

  const expectedSignature = signPreviewTokenParts(
    header,
    payload,
    getPreviewTokenSecret()
  );
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return { valid: false, reason: "signature" };
  }

  let parsedPayload: PreviewTokenPayload;
  try {
    parsedPayload = JSON.parse(base64UrlDecode(payload).toString("utf8")) as PreviewTokenPayload;
  } catch {
    return { valid: false, reason: "malformed" };
  }

  if (
    typeof parsedPayload.bikeId !== "string" ||
    typeof parsedPayload.tokenVersion !== "number" ||
    (parsedPayload.accessMode !== "public_fit_code" &&
      parsedPayload.accessMode !== "bike_passport") ||
    typeof parsedPayload.iat !== "number" ||
    typeof parsedPayload.exp !== "number"
  ) {
    return { valid: false, reason: "malformed" };
  }

  if (parsedPayload.exp <= now) {
    return { valid: false, reason: "expired" };
  }

  return {
    valid: true,
    payload: parsedPayload,
  };
}

export function isPreviewTokenAuthorizedForBike({
  payload,
  bike,
  publicFitEnabled,
  publicFitTokenVersion,
  passportTokenVersion,
}: {
  payload: PreviewTokenPayload;
  bike: {
    bikeId: string;
    bikePassportId: string | null;
  };
  publicFitEnabled: boolean;
  publicFitTokenVersion: number | null | undefined;
  passportTokenVersion: number | null | undefined;
}) {
  if (payload.bikeId !== bike.bikeId) {
    return false;
  }

  if (payload.accessMode === "public_fit_code") {
    return Boolean(
      publicFitEnabled &&
        publicFitTokenVersion !== null &&
        publicFitTokenVersion !== undefined &&
        payload.tokenVersion === publicFitTokenVersion
    );
  }

  return Boolean(
    bike.bikePassportId &&
      passportTokenVersion !== null &&
      passportTokenVersion !== undefined &&
      payload.tokenVersion === passportTokenVersion
  );
}
