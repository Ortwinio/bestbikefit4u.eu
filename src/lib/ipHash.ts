import { createHash } from "node:crypto";

const DEV_IP_HASH_SALT = "dev-public-fit-ip-hash-salt";

function getIpHashSalt() {
  return (
    process.env.IP_HASH_SALT ??
    process.env.PUBLIC_FIT_IP_HASH_SALT ??
    process.env.PREVIEW_TOKEN_SECRET ??
    process.env.PUBLIC_FIT_PREVIEW_TOKEN_SECRET ??
    (process.env.NODE_ENV === "production" ? undefined : DEV_IP_HASH_SALT)
  );
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }

  return request.headers.get("x-real-ip")?.trim() ?? null;
}

export function hashIp(ip: string | null) {
  const salt = getIpHashSalt();
  if (!salt || !ip) {
    return "unknown";
  }

  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

