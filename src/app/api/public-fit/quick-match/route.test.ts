import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { issuePreviewToken } from "@/lib/previewToken";

const mocks = vi.hoisted(() => {
  const query = vi.fn();
  const clientConstructor = vi.fn();

  return {
    query,
    clientConstructor,
  };
});

vi.mock("convex/browser", () => ({
  ConvexHttpClient: class MockConvexHttpClient {
    constructor(url: string) {
      mocks.clientConstructor(url);
    }

    query = mocks.query;
  },
}));

import { GET, POST } from "./route";

describe("public fit quick-match route", () => {
  const secret = "test-preview-secret-12345";

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://example.convex.cloud";
    process.env.PREVIEW_TOKEN_SECRET = secret;
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_CONVEX_URL;
    delete process.env.PREVIEW_TOKEN_SECRET;
  });

  it("returns 200 for a valid preview token and current bike state", async () => {
    const previewToken = issuePreviewToken({
      bikeId: "bike_1",
      tokenVersion: 789,
      now: Math.floor(Date.now() / 1000),
      ttlSeconds: 600,
    });

    mocks.query.mockResolvedValueOnce({
      bikeId: "bike_1",
      tokenVersion: 789,
      publicFitEnabled: true,
      snapshot: {
        bikeType: "road",
        sizeLabel: "56",
        stackMm: 553,
        reachMm: 392,
        geometryQuality: "full",
        source: "geometry_record",
        snapshotUpdatedAt: 789,
      },
    });

    const response = await POST(
      new Request("http://localhost/api/public-fit/quick-match", {
        method: "POST",
        body: JSON.stringify({ previewToken, heightCm: 178 }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toMatchObject({
      scoreMax: 75,
      scoreBand: "could_fit",
      confidence: "high",
      calcVersion: "qm_v1",
    });
  });

  it("returns 400 for out-of-range height", async () => {
    const previewToken = issuePreviewToken({
      bikeId: "bike_1",
      tokenVersion: 123,
      now: Math.floor(Date.now() / 1000),
      ttlSeconds: 600,
    });

    const response = await POST(
      new Request("http://localhost/api/public-fit/quick-match", {
        method: "POST",
        body: JSON.stringify({ previewToken, heightCm: 120 }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: "height_out_of_range",
      minHeightCm: 130,
      maxHeightCm: 220,
    });
  });

  it("returns 401 for expired tokens", async () => {
    const expiredToken = issuePreviewToken({
      bikeId: "bike_1",
      tokenVersion: 123,
      now: Math.floor(Date.now() / 1000) - 601,
      ttlSeconds: 600,
    });

    const response = await POST(
      new Request("http://localhost/api/public-fit/quick-match", {
        method: "POST",
        body: JSON.stringify({ previewToken: expiredToken, heightCm: 178 }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "preview_token_invalid",
    });
  });

  it("returns 401 when preview has been disabled or token version no longer matches", async () => {
    const previewToken = issuePreviewToken({
      bikeId: "bike_1",
      tokenVersion: 789,
      now: Math.floor(Date.now() / 1000),
      ttlSeconds: 600,
    });

    mocks.query.mockResolvedValueOnce({
      bikeId: "bike_1",
      tokenVersion: 790,
      publicFitEnabled: false,
      snapshot: {
        bikeType: "road",
        geometryQuality: "none",
        source: "none",
        snapshotUpdatedAt: 790,
      },
    });

    const response = await POST(
      new Request("http://localhost/api/public-fit/quick-match", {
        method: "POST",
        body: JSON.stringify({ previewToken, heightCm: 178 }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "preview_token_invalid",
    });
  });

  it("rejects GET requests", async () => {
    const response = await GET();

    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("POST");
    expect(await response.json()).toEqual({ error: "Method not allowed." });
  });
});
