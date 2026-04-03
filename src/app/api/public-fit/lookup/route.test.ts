import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const query = vi.fn();
  const clientConstructor = vi.fn();
  const consumeRateLimit = vi.fn();
  const getClientIp = vi.fn();
  const hashIp = vi.fn();
  const issuePreviewToken = vi.fn();

  return {
    query,
    clientConstructor,
    consumeRateLimit,
    getClientIp,
    hashIp,
    issuePreviewToken,
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

vi.mock("@/lib/rateLimiter", () => ({
  consumeRateLimit: mocks.consumeRateLimit,
}));

vi.mock("@/lib/ipHash", () => ({
  getClientIp: mocks.getClientIp,
  hashIp: mocks.hashIp,
}));

vi.mock("@/lib/previewToken", () => ({
  issuePreviewToken: mocks.issuePreviewToken,
}));

import { GET, POST } from "./route";

describe("public fit lookup route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://example.convex.cloud";

    mocks.getClientIp.mockReturnValue("127.0.0.1");
    mocks.hashIp.mockReturnValue("hashed-ip");
    mocks.consumeRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 2,
      retryAfterSeconds: null,
      degraded: false,
      mode: "memory",
    });
    mocks.issuePreviewToken.mockReturnValue("preview-token");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a preview-safe payload for a valid public fit code", async () => {
    mocks.query
      .mockResolvedValueOnce({
        bikeId: "bike_1",
        tokenVersion: 789,
        accessMode: "public_fit_code",
        preview: {
          brand: "Canyon",
          model: "Ultimate",
          bikeType: "road",
          sizeLabel: "M",
          geometryQuality: "full",
          primaryPhotoSource: "storage_primary",
          thumbnailSources: ["https://images.example.com/one.jpg", "storage_two"],
        },
      })
      .mockResolvedValueOnce("https://cdn.example.com/primary.jpg")
      .mockResolvedValueOnce("https://cdn.example.com/two.jpg");

    const response = await POST(
      new Request("http://localhost/api/public-fit/lookup", {
        method: "POST",
        body: JSON.stringify({ code: "pfc-ab12-cd34-ef56-9876" }),
        headers: { "Content-Type": "application/json" },
      })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({
      brand: "Canyon",
      model: "Ultimate",
      bikeType: "road",
      sizeLabel: "M",
      geometryQuality: "full",
      primaryPhotoUrl: "https://cdn.example.com/primary.jpg",
      thumbnailUrls: [
        "https://images.example.com/one.jpg",
        "https://cdn.example.com/two.jpg",
      ],
      previewToken: "preview-token",
    });
    expect(mocks.issuePreviewToken).toHaveBeenCalledWith({
      bikeId: "bike_1",
      tokenVersion: 789,
      accessMode: "public_fit_code",
    });
    expect(mocks.query).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      expect.objectContaining({ publicFitCode: "pfc-ab12-cd34-ef56-9876" })
    );
  });

  it("returns the same public 404 body for invalid or disabled preview states", async () => {
    mocks.query.mockResolvedValueOnce(null);

    const response = await POST(
      new Request("http://localhost/api/public-fit/lookup", {
        method: "POST",
        body: JSON.stringify({ publicFitCode: "PFC-FFFF-FFFF-FFFF-FFFF" }),
        headers: { "Content-Type": "application/json" },
      })
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Preview unavailable." });
  });

  it("accepts a bike-passport id for quick-check lookup when preview data is available", async () => {
    mocks.query.mockResolvedValueOnce({
      bikeId: "bike_2",
      tokenVersion: 456,
      accessMode: "bike_passport",
      preview: {
        brand: "Ridley",
        model: "Dean",
        bikeType: "tt_triathlon",
        sizeLabel: "S",
        geometryQuality: "partial",
        primaryPhotoSource: null,
        thumbnailSources: [],
      },
    });

    const response = await POST(
      new Request("http://localhost/api/public-fit/lookup", {
        method: "POST",
        body: JSON.stringify({ code: "BBF-A1B2-C3D4" }),
        headers: { "Content-Type": "application/json" },
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      brand: "Ridley",
      model: "Dean",
      bikeType: "tt_triathlon",
      sizeLabel: "S",
      geometryQuality: "partial",
      previewToken: "preview-token",
    });
    expect(mocks.issuePreviewToken).toHaveBeenCalledWith({
      bikeId: "bike_2",
      tokenVersion: 456,
      accessMode: "bike_passport",
    });
  });

  it("rate limits the fourth request", async () => {
    mocks.consumeRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 180,
      degraded: false,
      mode: "memory",
    });

    const response = await POST(
      new Request("http://localhost/api/public-fit/lookup", {
        method: "POST",
        body: JSON.stringify({ code: "PFC-AB12-CD34-EF56-9876" }),
        headers: { "Content-Type": "application/json" },
      })
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("180");
    expect(await response.json()).toEqual({
      error: "Too many requests. Please try again later.",
    });
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it("rejects GET requests", async () => {
    const response = await GET();

    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("POST");
    expect(await response.json()).toEqual({ error: "Method not allowed." });
  });

  it("returns 400 for invalid JSON bodies", async () => {
    const response = await POST(
      new Request("http://localhost/api/public-fit/lookup", {
        method: "POST",
        body: "{invalid",
        headers: { "Content-Type": "application/json" },
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "A public fit code is required.",
    });
  });
});
