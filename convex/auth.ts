import { convexAuth } from "@convex-dev/auth/server";
import { Email } from "@convex-dev/auth/providers/Email";
import { Resend } from "resend";
import { BRAND } from "./lib/brand";

// Email format validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFICATION_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const VERIFICATION_TOKEN_LENGTH = 7;
const LEGACY_BLOCKED_CODE = "B1KEF1T";

type ActionMutationRunner = {
  runMutation: (mutationRef: unknown, args: Record<string, unknown>) => Promise<unknown>;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hasMutationRunner(ctx: unknown): ctx is ActionMutationRunner {
  return (
    typeof ctx === "object" &&
    ctx !== null &&
    "runMutation" in ctx &&
    typeof (ctx as { runMutation?: unknown }).runMutation === "function"
  );
}

async function checkRateLimit(email: string, ctx: unknown): Promise<void> {
  if (!hasMutationRunner(ctx)) {
    throw new Error("Verification rate-limit context unavailable.");
  }

  await ctx.runMutation("authRateLimit:consumeEmailVerificationRequest", {
    email: normalizeEmail(email),
  });
}

function randomIndex(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0 || maxExclusive > 256) {
    throw new Error("Invalid random index range");
  }

  const webCrypto = globalThis.crypto;
  if (!webCrypto?.getRandomValues) {
    throw new Error("Secure random generation is unavailable");
  }

  const bytes = new Uint8Array(1);
  const rejectionThreshold = Math.floor(256 / maxExclusive) * maxExclusive;

  while (true) {
    webCrypto.getRandomValues(bytes);
    const randomByte = bytes[0];
    if (randomByte < rejectionThreshold) {
      return randomByte % maxExclusive;
    }
  }
}

function generateVerificationToken(): string {
  let token = "";

  // Explicitly deny the legacy backdoor code, even though generation is random.
  do {
    token = Array.from(
      { length: VERIFICATION_TOKEN_LENGTH },
      () => VERIFICATION_ALPHABET[randomIndex(VERIFICATION_ALPHABET.length)]
    ).join("");
  } while (token === LEGACY_BLOCKED_CODE);

  return token;
}

// Configure Email provider for magic code authentication
const EmailProvider = Email({
  id: "resend",
  apiKey: process.env.AUTH_RESEND_KEY,
  maxAge: 60 * 15, // 15 minutes
  async authorize(params, account) {
    if (typeof params.email !== "string") {
      throw new Error("Token verification requires an `email` in params of `signIn`.");
    }

    if (account.providerAccountId !== params.email) {
      throw new Error(
        "Short verification code requires a matching `email` in params of `signIn`."
      );
    }

    if (params.code === LEGACY_BLOCKED_CODE) {
      throw new Error("This verification code is invalid. Request a new code.");
    }
  },
  async generateVerificationToken() {
    return generateVerificationToken();
  },
  async sendVerificationRequest(
    {
      identifier: email,
      token,
      expires,
    }: { identifier: string; token: string; expires: Date },
    ctx?: unknown
  ) {
    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      throw new Error("Invalid email address format");
    }

    // Check rate limit
    await checkRateLimit(email, ctx);

    if (token === LEGACY_BLOCKED_CODE) {
      throw new Error("This verification code is invalid. Request a new code.");
    }

    // For development without Resend API key, just log the token
    if (!process.env.AUTH_RESEND_KEY) {
      console.log(`\n========================================`);
      console.log(`[DEV] Magic link code for ${email}`);
      console.log(`[DEV] Code: ${token}`);
      console.log(`[DEV] Expires: ${expires}`);
      console.log(`========================================\n`);
      return;
    }

    // Production: Send via Resend
    const resend = new Resend(process.env.AUTH_RESEND_KEY);

    const { error } = await resend.emails.send({
      from: process.env.AUTH_EMAIL_FROM || BRAND.authEmailFrom,
      to: [email],
      subject: `Your ${BRAND.name} Login Code`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">${BRAND.name}</h2>
          <p>Your login code is:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1f2937;">${token}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This code expires in 15 minutes. If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      throw new Error("Failed to send verification email: " + error.message);
    }
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [EmailProvider],
});
