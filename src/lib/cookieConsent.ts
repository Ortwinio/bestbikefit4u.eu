import { syncHandoffConsent } from "./handoff/store";

export const COOKIE_CONSENT_KEY = "bf_cookie_consent";
export const COOKIE_CONSENT_EVENT = "bf-cookie-consent-change";
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export type CookieConsentChoice = "accepted" | "essential";

function parseCookieValue(
  cookieHeader: string,
  name: string
): string | null {
  const prefix = `${name}=`;
  const cookies = cookieHeader.split(";");

  for (const cookieEntry of cookies) {
    const trimmed = cookieEntry.trim();
    if (!trimmed.startsWith(prefix)) {
      continue;
    }

    return decodeURIComponent(trimmed.slice(prefix.length));
  }

  return null;
}

export function parseCookieConsent(
  value: string | null | undefined
): CookieConsentChoice | null {
  if (value === "accepted" || value === "essential") {
    return value;
  }

  return null;
}

export function readCookieConsent(): CookieConsentChoice | null {
  if (typeof document === "undefined") {
    return null;
  }

  const fromCookie = parseCookieConsent(
    parseCookieValue(document.cookie, COOKIE_CONSENT_KEY)
  );
  if (fromCookie) {
    return fromCookie;
  }

  if (typeof window === "undefined") {
    return null;
  }

  try {
    return parseCookieConsent(window.localStorage.getItem(COOKIE_CONSENT_KEY));
  } catch {
    return null;
  }
}

export function writeCookieConsent(choice: CookieConsentChoice): void {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, choice);
  } catch {
    // Cookie consent still works when browser storage is unavailable.
  }
  document.cookie =
    `${COOKIE_CONSENT_KEY}=${choice}; Path=/; Max-Age=${ONE_YEAR_IN_SECONDS}; SameSite=Lax`;
  syncHandoffConsent(choice);
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
}

export function subscribeToCookieConsent(onChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === COOKIE_CONSENT_KEY) {
      onChange();
    }
  };

  const handleConsentChange = () => {
    onChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(COOKIE_CONSENT_EVENT, handleConsentChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsentChange);
  };
}

export function canTrackMarketing(): boolean {
  return readCookieConsent() === "accepted";
}
