"use node";

import { createHmac, timingSafeEqual } from "node:crypto";
import { resolveSiteOrigin } from "../../shared/brand";

export type EmailCategory = "service" | "marketing" | "newsletter";
type TokenPayload = {
  version: 1;
  userId: string;
  locale: "nl" | "en";
  purpose: "unsubscribe" | "preferences";
  category: EmailCategory;
  expiresAt: number;
};

function secret() {
  const value = process.env.EMAIL_UNSUBSCRIBE_SECRET;
  if (!value || value.length < 32) throw new Error("Email preferences unavailable");
  return value;
}

export function canSendPreferenceEmails() {
  try {
    secret();
    return true;
  } catch {
    console.error("Service/marketing email batch skipped: EMAIL_UNSUBSCRIBE_SECRET is missing or invalid.");
    return false;
  }
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest();
}

export function verifyEmailPreferenceToken(token: string): TokenPayload {
  if (token.length > 2048) throw new Error("Invalid or expired email link");
  const parts = token.split(".");
  if (parts.length !== 2 || !parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))) {
    throw new Error("Invalid or expired email link");
  }
  const expected = signature(parts[0]);
  const actual = Buffer.from(parts[1], "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new Error("Invalid or expired email link");
  }
  const payload = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8")) as TokenPayload;
  if (
    payload.version !== 1 || typeof payload.userId !== "string" || !payload.userId ||
    !["nl", "en"].includes(payload.locale) ||
    !["unsubscribe", "preferences"].includes(payload.purpose) ||
    !["service", "marketing", "newsletter"].includes(payload.category) ||
    !Number.isSafeInteger(payload.expiresAt) || payload.expiresAt <= Date.now()
  ) throw new Error("Invalid or expired email link");
  return payload;
}

function unsubscribeOrigin() {
  const value = process.env.CONVEX_SITE_URL;
  if (!value) throw new Error("Email preferences unavailable");
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash ||
      url.pathname !== "/" || url.hostname.endsWith(".convex.cloud")) {
    throw new Error("Email preferences unavailable");
  }
  return url.origin;
}

export function emailPreferencePageUrl(token: string, locale: "nl" | "en") {
  return `${resolveSiteOrigin()}/${locale}/email-preferences#token=${encodeURIComponent(token)}`;
}

export async function buildEmailPreferenceLinks(userId: string, locale: "nl" | "en", category: EmailCategory) {
  if (!userId || !["nl", "en"].includes(locale) || !["service", "marketing", "newsletter"].includes(category)) {
    throw new Error("Invalid email preference link arguments");
  }
  const sign = (purpose: TokenPayload["purpose"]) => {
    const payload = Buffer.from(JSON.stringify({
      version: 1, userId, locale, category, purpose, expiresAt: Date.now() + 180 * 86400000,
    } satisfies TokenPayload)).toString("base64url");
    return `${payload}.${signature(payload).toString("base64url")}`;
  };
  const unsubscribeUrl = `${unsubscribeOrigin()}/emails/unsubscribe?token=${sign("unsubscribe")}`;
  return {
    unsubscribeUrl,
    preferencesUrl: emailPreferencePageUrl(sign("preferences"), locale),
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}
