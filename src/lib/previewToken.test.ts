import { describe, expect, it } from "vitest";
import {
  isPreviewTokenAuthorizedForBike,
  issuePreviewToken,
  verifyPreviewToken,
} from "./previewToken";

process.env.PREVIEW_TOKEN_SECRET = "preview-token-test-secret";

describe("previewToken", () => {
  it("issues and verifies a signed preview token", () => {
    const token = issuePreviewToken({
      bikeId: "bike_1",
      tokenVersion: 123,
      accessMode: "public_fit_code",
      now: 1_000,
      ttlSeconds: 60,
    });

    const result = verifyPreviewToken(token, 1_030);

    expect(result).toEqual({
      valid: true,
      payload: {
        bikeId: "bike_1",
        tokenVersion: 123,
        accessMode: "public_fit_code",
        iat: 1_000,
        exp: 1_060,
      },
    });
  });

  it("rejects expired tokens", () => {
    const token = issuePreviewToken({
      bikeId: "bike_1",
      tokenVersion: 123,
      accessMode: "public_fit_code",
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
      accessMode: "public_fit_code",
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
        accessMode: "public_fit_code",
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
        bike: {
          bikeId: "bike_1",
          bikePassportId: "BBF-A1B2-C3D4",
        },
        publicFitEnabled: true,
        publicFitTokenVersion: 123,
        passportTokenVersion: 999,
      })
    ).toBe(true);

    expect(
      isPreviewTokenAuthorizedForBike({
        payload: issued.payload,
        bike: {
          bikeId: "bike_1",
          bikePassportId: "BBF-A1B2-C3D4",
        },
        publicFitEnabled: false,
        publicFitTokenVersion: 123,
        passportTokenVersion: 999,
      })
    ).toBe(false);

    expect(
      isPreviewTokenAuthorizedForBike({
        payload: issued.payload,
        bike: {
          bikeId: "bike_1",
          bikePassportId: "BBF-A1B2-C3D4",
        },
        publicFitEnabled: true,
        publicFitTokenVersion: 456,
        passportTokenVersion: 999,
      })
    ).toBe(false);
  });

  it("authorizes a bike-passport preview token without requiring public-fit sharing", () => {
    const issued = verifyPreviewToken(
      issuePreviewToken({
        bikeId: "bike_2",
        tokenVersion: 456,
        accessMode: "bike_passport",
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
        bike: {
          bikeId: "bike_2",
          bikePassportId: "BBF-1234-ABCD",
        },
        publicFitEnabled: false,
        publicFitTokenVersion: 999,
        passportTokenVersion: 456,
      })
    ).toBe(true);
  });
});
