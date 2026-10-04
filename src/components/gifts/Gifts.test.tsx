// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GiftGive } from "./GiftGive";
import { GiftRedeem } from "./GiftRedeem";
import {
  captureGiftToken,
  giftError,
  giftTokenStorageKey,
  validateGift,
} from "./giftHelpers";
import { giftsCopy } from "@/i18n/account/gifts";

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
  window.history.replaceState(null, "", "/");
});

describe.each(["nl", "en"] as const)("%s gift screens", (locale) => {
  const copy = giftsCopy[locale];
  it("validates email and message before sending and hides raw server errors", async () => {
    const send = vi
      .fn()
      .mockRejectedValue(new Error("private@example.com confidential profile"));
    render(
      <GiftGive
        locale={locale}
        available={2}
        eligible
        gifts={[]}
        onSend={send}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: copy.send }));
    expect(screen.getByRole("alert").textContent).toBe(copy.errors.email);
    expect(send).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(copy.email), {
      target: { value: "friend@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: copy.send }));
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toBe(copy.errors.generic),
    );
    expect(screen.queryByText(/confidential/)).toBeNull();
    expect(validateGift("friend@example.com", "a".repeat(501), locale)).toBe(
      copy.errors.message,
    );
  });
  it("disables repeat sends while pending and confirms completion", async () => {
    let resolveSend: () => void = () => {};
    const send = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSend = resolve;
        }),
    );
    render(
      <GiftGive
        locale={locale}
        available={2}
        eligible
        gifts={[]}
        onSend={send}
      />,
    );
    fireEvent.change(screen.getByLabelText(copy.email), {
      target: { value: "friend@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: copy.send }));
    expect(
      (screen.getByRole("button", { name: copy.sending }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    resolveSend();
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe(copy.sent),
    );
  });
  it("shows period credits and removes expired recipient data", () => {
    render(
      <GiftGive
        locale={locale}
        available={0}
        eligible
        gifts={[
          {
            id: "expired",
            recipientEmail: "private@example.com",
            status: "expired",
            expiresAt: Date.now(),
          },
        ]}
        onSend={vi.fn()}
      />,
    );
    expect(screen.getByText("0 / 2")).toBeDefined();
    expect(screen.getByText(copy.removed)).toBeDefined();
    expect(screen.queryByText("private@example.com")).toBeNull();
    expect(screen.queryByRole("button", { name: copy.send })).toBeNull();
  });
  it.each(["valid", "soon", "expired", "invalid", "redeemed"] as const)(
    "renders %s redemption without leaking tokens or identities",
    (state) => {
      render(
        <GiftRedeem
          locale={locale}
          state={state}
          authenticated={false}
          bikes={[]}
          onRedeem={vi.fn()}
        />,
      );
      if (state === "valid" || state === "soon") {
        expect(
          screen.getByRole("button", { name: copy.login }).getAttribute("href"),
        ).toBe(`/${locale}/login?gift=1`);
        if (state === "soon")
          expect(screen.getByRole("status").textContent).toBe(copy.soon);
      } else
        expect(screen.queryByRole("button", { name: copy.login })).toBeNull();
      expect(document.body.textContent).not.toMatch(
        /Thomas|profileId|recipientId/,
      );
    },
  );
  it("requires an owned bike selection before redemption", () => {
    const redeem = vi.fn();
    render(
      <GiftRedeem
        locale={locale}
        state="valid"
        authenticated
        bikes={[{ id: "owned", name: "My bicycle" }]}
        onRedeem={redeem}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: copy.redeem }));
    expect(screen.getByRole("alert").textContent).toBe(copy.errors.bike);
    expect(redeem).not.toHaveBeenCalled();
  });
  it("provides the narrow bike creation return flag", () => {
    render(
      <GiftRedeem
        locale={locale}
        state="valid"
        authenticated
        bikes={[]}
        onRedeem={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: copy.addBike }).getAttribute("href"),
    ).toBe(`/${locale}/bikes/new/manual?gift=1`);
  });
  it("redeems only the chosen bike and confirms access", async () => {
    const redeem = vi.fn().mockResolvedValue(undefined);
    render(
      <GiftRedeem
        locale={locale}
        state="valid"
        authenticated
        bikes={[{ id: "owned", name: "My bicycle" }]}
        onRedeem={redeem}
      />,
    );
    fireEvent.mouseDown(screen.getByRole("combobox"));
    fireEvent.click(await screen.findByRole("option", { name: "My bicycle" }));
    fireEvent.click(screen.getByRole("button", { name: copy.redeem }));
    await waitFor(() => expect(redeem).toHaveBeenCalledWith("owned"));
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe(copy.success),
    );
  });
  it("maps backend errors to safe translated text", () => {
    expect(giftError(new Error("SELF_GIFT_NOT_ALLOWED"), locale)).toBe(
      copy.errors.self,
    );
    expect(giftError(new Error("INVALID_RECIPIENT_EMAIL"), locale)).toBe(
      copy.errors.email,
    );
    expect(giftError(new Error("NO_GIFT_CREDITS"), locale)).toBe(
      copy.errors.credits,
    );
    expect(giftError(new Error("GIFT_RATE_LIMIT"), locale)).toBe(
      copy.errors.rate,
    );
  });
});

it("scrubs a fragment token and retains it across a login return without putting it in a URL", () => {
  const token = "a".repeat(64);
  window.history.replaceState(null, "", `/nl/gift#token=${token}`);
  expect(captureGiftToken()).toBe(token);
  expect(window.location.hash).toBe("");
  expect(window.location.search).toBe("");
  expect(window.sessionStorage.getItem(giftTokenStorageKey)).toBe(token);
  expect(captureGiftToken()).toBe(token);
});

it("rejects malformed fragment tokens", () => {
  window.sessionStorage.setItem(giftTokenStorageKey, "a".repeat(64));
  window.history.replaceState(null, "", "/en/gift#token=bad");
  expect(captureGiftToken()).toBeNull();
  expect(window.location.hash).toBe("");
  expect(window.sessionStorage.getItem(giftTokenStorageKey)).toBeNull();
});

it.each(["bad", "a".repeat(65), "a".repeat(63), "z".repeat(64)])(
  "rejects invalid stored tokens on reload: %s",
  (token) => {
    window.sessionStorage.setItem(giftTokenStorageKey, token);
    expect(captureGiftToken()).toBeNull();
    expect(window.sessionStorage.getItem(giftTokenStorageKey)).toBeNull();
  },
);

it("canonicalizes fragment and stored uppercase tokens for the backend", () => {
  const token = "ABCDEF".repeat(10) + "ABCD";
  window.history.replaceState(null, "", `/en/gift#token=${token}`);
  expect(captureGiftToken()).toBe(token.toLowerCase());
  expect(window.sessionStorage.getItem(giftTokenStorageKey)).toBe(
    token.toLowerCase(),
  );
  window.sessionStorage.setItem(giftTokenStorageKey, token);
  expect(captureGiftToken()).toBe(token.toLowerCase());
  expect(window.sessionStorage.getItem(giftTokenStorageKey)).toBe(
    token.toLowerCase(),
  );
});

it.each(["nl", "en"] as const)(
  "localizes invalid redemption results in %s without exposing details",
  (locale) => {
    expect(giftError(new Error("INVALID"), locale)).toBe(
      giftsCopy[locale].errors.unavailable,
    );
    expect(
      giftError(
        {
          data: {
            code: "VERIFIED_EMAIL_REQUIRED",
            email: "private@example.com",
          },
        },
        locale,
      ),
    ).toBe(giftsCopy[locale].errors.recipient);
  },
);
