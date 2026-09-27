import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { captureConfig, sendEmail } = vi.hoisted(() => ({
  captureConfig: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  convexAuth: captureConfig,
}));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendEmail };
  },
}));

type EmailOptions = {
  generateVerificationToken: () => Promise<string>;
  sendVerificationRequest: (
    request: { identifier: string; token: string; expires: Date },
    ctx: { runMutation: ReturnType<typeof vi.fn> }
  ) => Promise<void>;
  authorize: (params: Record<string, string>, account: { providerAccountId: string }) => Promise<void>;
};
type AuthConfig = {
  providers: { id: string; options: EmailOptions }[];
  callbacks: {
    afterUserCreatedOrUpdated: (
      ctx: { db: { get: ReturnType<typeof vi.fn>; patch: ReturnType<typeof vi.fn> } },
      args: { type: string; userId: string; provider: { id: string }; profile: Record<string, string> }
    ) => Promise<void>;
  };
};

async function config() {
  await import("../auth");
  return captureConfig.mock.calls[0][0] as AuthConfig;
}

beforeEach(() => {
  vi.resetModules();
  captureConfig.mockReset().mockReturnValue({});
  sendEmail.mockReset().mockResolvedValue({ data: { id: "test-delivery" }, error: null });
  vi.stubEnv("AUTH_RESEND_KEY", "test-not-a-real-key");
  vi.stubEnv("LOCALHOST_DEV_LOGIN_SECRET", "");
  vi.stubEnv("GOOGLE_CLIENT_ID", "");
  vi.stubEnv("GOOGLE_CLIENT_SECRET", "");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

const request = { identifier: "rider@example.com", token: "ABCDEFG", expires: new Date() };

describe("email registration and delivery", () => {
  it("fails closed without a Resend key, without logging a code or claiming delivery", async () => {
    vi.stubEnv("AUTH_RESEND_KEY", "");
    const log = vi.spyOn(console, "log");
    const runMutation = vi.fn();
    const email = (await config()).providers[0].options;
    await expect(email.sendVerificationRequest(request, { runMutation })).rejects.toThrow("temporarily unavailable");
    expect(log).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
    expect(runMutation).not.toHaveBeenCalled();
  });

  it("sends the generated code only after consuming the durable rate limit", async () => {
    const runMutation = vi.fn().mockResolvedValue(undefined);
    const email = (await config()).providers[0].options;
    await email.sendVerificationRequest(request, { runMutation });
    expect(runMutation).toHaveBeenCalledWith("authRateLimit:consumeEmailVerificationRequest", { email: request.identifier });
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: [request.identifier], html: expect.stringContaining(request.token) }));
    expect(runMutation.mock.invocationCallOrder[0]).toBeLessThan(sendEmail.mock.invocationCallOrder[0]);
  });

  it("propagates delivery failure instead of presenting the code entry step as successful", async () => {
    sendEmail.mockResolvedValue({ error: { message: "Sender domain is not verified" } });
    const email = (await config()).providers[0].options;
    await expect(email.sendVerificationRequest(request, { runMutation: vi.fn() })).rejects.toThrow("Failed to send verification email");
  });

  it("does not send when the request is throttled", async () => {
    const email = (await config()).providers[0].options;
    await expect(email.sendVerificationRequest(request, { runMutation: vi.fn().mockRejectedValue(new Error("rate limited")) })).rejects.toThrow("rate limited");
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("generates seven-character random codes and rejects mismatched email and legacy code", async () => {
    const email = (await config()).providers[0].options;
    const codes = await Promise.all(Array.from({ length: 20 }, () => email.generateVerificationToken()));
    expect(codes.every(code => /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{7}$/.test(code))).toBe(true);
    expect(new Set(codes).size).toBeGreaterThan(1);
    await expect(email.authorize({ email: "other@example.com", code: "ABCDEFG" }, { providerAccountId: request.identifier })).rejects.toThrow("matching");
    await expect(email.authorize({ email: request.identifier, code: "B1KEF1T" }, { providerAccountId: request.identifier })).rejects.toThrow("invalid");
  });

  it("records activity after verification, never from an unverified email request", async () => {
    const callback = (await config()).callbacks.afterUserCreatedOrUpdated;
    const ctx = { db: { get: vi.fn().mockResolvedValue({}), patch: vi.fn() } };
    const args = { userId: "user-1", provider: { id: "resend" }, profile: { email: request.identifier } };
    await callback(ctx, { ...args, type: "email" });
    expect(ctx.db.patch.mock.calls[0][1]).not.toHaveProperty("lastLoginAt");
    await callback(ctx, { ...args, type: "verification" });
    expect(ctx.db.patch.mock.calls[1][1]).toHaveProperty("lastLoginAt", expect.any(Number));
  });

  it("never enables the localhost credential provider for a public site", async () => {
    vi.stubEnv("LOCALHOST_DEV_LOGIN_SECRET", "test-only");
    vi.stubEnv("SITE_URL", "https://bestbikefit4u.eu");
    const providers = (await config()).providers;
    expect(providers.some(provider => provider.id === "localhost-dev")).toBe(false);
  });
});
