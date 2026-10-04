import type { Locale } from "@/i18n/config";
import { giftsCopy } from "@/i18n/account/gifts";

export function validateGift(email: string, message: string, locale: Locale) {
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    email.trim().length > 254
  )
    return giftsCopy[locale].errors.email;
  if (message.length > 500) return giftsCopy[locale].errors.message;
  return null;
}

export function giftError(error: unknown, locale: Locale): string {
  const code =
    typeof error === "object" && error !== null && "data" in error
      ? String(
          typeof error.data === "object" &&
            error.data !== null &&
            "code" in error.data
            ? error.data.code
            : error.data,
        )
      : error instanceof Error
        ? error.message
        : "";
  const errors = giftsCopy[locale].errors;
  if (/SELF_GIFT/.test(code)) return errors.self;
  if (/NO_CREDITS|NO_GIFT_CREDITS/.test(code)) return errors.credits;
  if (/ANNUAL_REQUIRED/.test(code)) return errors.annual;
  if (/RATE_LIMIT/.test(code)) return errors.rate;
  if (/INVALID_EMAIL|INVALID_RECIPIENT_EMAIL/.test(code)) return errors.email;
  if (/MESSAGE_TOO_LONG/.test(code)) return errors.message;
  if (/BIKE/i.test(code)) return errors.bike;
  if (/RECIPIENT|EMAIL_MISMATCH|VERIFIED_EMAIL_REQUIRED/.test(code))
    return errors.recipient;
  if (/EXPIRED|REDEEMED|INVALID_TOKEN|NOT_FOUND|\bINVALID\b/.test(code))
    return errors.unavailable;
  return errors.generic;
}

export const giftTokenStorageKey = "bikefitboost.gift-token";

export function captureGiftToken(): string | null {
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const token = fragment.get("token")?.toLowerCase();
  if (window.location.hash) {
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
      try {
        window.sessionStorage.removeItem(giftTokenStorageKey);
      } catch {
        return null;
      }
      return null;
    }
    try {
      window.sessionStorage.setItem(giftTokenStorageKey, token);
    } catch {
      return token;
    }
    return token;
  }
  try {
    const storedToken = window.sessionStorage.getItem(giftTokenStorageKey);
    if (!storedToken || !/^[a-f0-9]{64}$/i.test(storedToken)) {
      window.sessionStorage.removeItem(giftTokenStorageKey);
      return null;
    }
    const normalizedToken = storedToken.toLowerCase();
    window.sessionStorage.setItem(giftTokenStorageKey, normalizedToken);
    return normalizedToken;
  } catch {
    return null;
  }
}
