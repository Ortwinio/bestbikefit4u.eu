import { describe, expect, it } from "vitest";
import {
  isPreviewTokenAuthorizedForBike,
  issuePreviewToken,
  verifyPreviewToken,
} from "./previewToken";

describe("previewToken", () => {
  it("issues and verifies a signed preview token", () => {
    const token = issuePreviewToken({
      bikeId: "bike_1",
      tokenVersion: 123,
      now: 1_000,
      ttlSeconds: 60,
    });

    const result = verifyPreviewToken(token, 1_030);

    expect(result).toEqual({
      valid: true,
      payload: {
        bikeId: "bike_1",
        tokenVersion: 123,
        iat: 1_000,
        exp: 1_060,
      },
    });
  });

  it("rejects expired tokens", () => {
    const token = issuePreviewToken({
      bikeId: "bike_1",
      tokenVersion: 123,
      now: 1_000,
      ttlSeconds: 60,
    });

    expect(verifyPreviewToken(token, 1_060)).toEqual({
      valid: false,
      reason: "expired",
    });
  });

  it("rejects tampered tokens", () => {
    const token = issuePreviewToken({
      bikeId: "bike_1",
      tokenVersion: 123,
      now: 1_000,
      ttlSeconds: 60,
    });
    const tampered = `${token.slice(0, -1)}A`;

    expect(verifyPreviewToken(tampered, 1_030)).toEqual({
      valid: false,
      reason: "signature",
    });
  });

  it("requires current bike state for authorization", () => {
    const issued = verifyPreviewToken(
      issuePreviewToken({
        bikeId: "bike_1",
        tokenVersion: 123,
        now: 1_000,
        ttlSeconds: 60,
      }),
      1_030
    );

    expect(issued.valid).toBe(true);
    if (!issued.valid) {
      throw new Error("Expected a valid token payload.");
    }

    expect(
      isPreviewTokenAuthorizedForBike({
        payload: issued.payload,
        bikeId: "bike_1",
        publicFitEnabled: true,
        tokenVersion: 123,
      })
    ).toBe(true);

    expect(
      isPreviewTokenAuthorizedForBike({
        payload: issued.payload,
        bikeId: "bike_1",
        publicFitEnabled: false,
        tokenVersion: 123,
      })
    ).toBe(false);

    expect(
      isPreviewTokenAuthorizedForBike({
        payload: issued.payload,
        bikeId: "bike_1",
        publicFitEnabled: true,
        tokenVersion: 456,
      })
    ).toBe(false);
  });
});
