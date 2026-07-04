import { describe, expect, it } from "vitest";
import { computeStripeSignature, verifyStripeWebhookSignature } from "../webhook";

describe("stripe webhook signature verification", () => {
  it("accepts a valid Stripe signature", async () => {
    const payload = JSON.stringify({ id: "evt_1", type: "invoice.paid" });
    const timestamp = "1760000000";
    const secret = "whsec_test";
    const signature = await computeStripeSignature({
      payload,
      timestamp,
      webhookSecret: secret,
    });

    await expect(
      verifyStripeWebhookSignature({
        payload,
        signatureHeader: `t=${timestamp},v1=${signature}`,
        webhookSecret: secret,
        nowMs: Number(timestamp) * 1000,
      })
    ).resolves.toEqual({ ok: true });
  });

  it("rejects invalid signatures and stale timestamps", async () => {
    const payload = JSON.stringify({ id: "evt_1", type: "invoice.paid" });
    const timestamp = "1760000000";

    await expect(
      verifyStripeWebhookSignature({
        payload,
        signatureHeader: `t=${timestamp},v1=bad`,
        webhookSecret: "whsec_test",
        nowMs: Number(timestamp) * 1000,
      })
    ).resolves.toEqual({ ok: false, reason: "signature" });

    await expect(
      verifyStripeWebhookSignature({
        payload,
        signatureHeader: `t=${timestamp},v1=bad`,
        webhookSecret: "whsec_test",
        nowMs: (Number(timestamp) + 301) * 1000,
      })
    ).resolves.toEqual({ ok: false, reason: "timestamp" });
  });
});

