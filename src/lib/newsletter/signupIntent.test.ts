/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearNewsletterSignupIntent, createNewsletterSignupIntent, NEWSLETTER_INTENT_KEY,
  NEWSLETTER_INTENT_TTL, readNewsletterSignupIntent } from "./signupIntent";

beforeEach(() => { sessionStorage.clear(); vi.spyOn(Date, "now").mockReturnValue(1791000000000); });
afterEach(() => vi.restoreAllMocks());

describe("newsletter signup intent", () => {
  it("starts absent and stores only the explicit attempt metadata", () => {
    expect(readNewsletterSignupIntent()).toBeNull();
    const result = createNewsletterSignupIntent("nl", "email");
    expect(result.persisted).toBe(true);
    expect(readNewsletterSignupIntent()).toEqual(result.intent);
    expect(Object.keys(result.intent).sort()).toEqual(["createdAt", "locale", "provider", "requestId", "wordingVersion"]);
    expect(location.search).toBe("");
    clearNewsletterSignupIntent();
    expect(readNewsletterSignupIntent()).toBeNull();
  });

  it("retains an ID for retries but gives a new explicit attempt a fresh ID", () => {
    const first = createNewsletterSignupIntent("en", "google").intent;
    expect(readNewsletterSignupIntent()?.requestId).toBe(first.requestId);
    expect(createNewsletterSignupIntent("en", "google").intent.requestId).not.toBe(first.requestId);
  });

  it("expires at thirty minutes, rejects a future timestamp, and clears storage", () => {
    const { intent } = createNewsletterSignupIntent("nl", "google");
    expect(readNewsletterSignupIntent(intent.createdAt + NEWSLETTER_INTENT_TTL - 1)).toEqual(intent);
    expect(readNewsletterSignupIntent(intent.createdAt + NEWSLETTER_INTENT_TTL)).toBeNull();
    expect(sessionStorage.getItem(NEWSLETTER_INTENT_KEY)).toBeNull();
    createNewsletterSignupIntent("nl", "email");
    expect(readNewsletterSignupIntent(Date.now() - 1)).toBeNull();
  });

  it.each(["null", "[]", "{", "{}", JSON.stringify({ requestId: "bad" })])("fails closed for %s", raw => {
    sessionStorage.setItem(NEWSLETTER_INTENT_KEY, raw);
    expect(readNewsletterSignupIntent()).toBeNull();
    expect(sessionStorage.getItem(NEWSLETTER_INTENT_KEY)).toBeNull();
  });

  it("does not treat unavailable storage as persisted consent", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("unavailable"); });
    expect(createNewsletterSignupIntent("en", "email").persisted).toBe(false);
    expect(readNewsletterSignupIntent()).toBeNull();
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("unavailable"); });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw new Error("unavailable"); });
    expect(readNewsletterSignupIntent()).toBeNull();
    expect(() => clearNewsletterSignupIntent()).not.toThrow();
  });
});
