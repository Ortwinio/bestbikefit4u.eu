import { convexAuth } from "@convex-dev/auth/server";
import { Email } from "@convex-dev/auth/providers/Email";
import { Resend } from "resend";
import { randomInt } from "crypto";

// Email format validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// In-memory rate limiter for magic code requests
// Tracks timestamps of recent requests per email
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 3;

function checkRateLimit(email: string): void {
  const now = Date.now();
  const key = email.toLowerCase();
  const timestamps = rateLimitMap.get(key) ?? [];

  // Remove entries outside the window
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    throw new Error("Too many verification requests. Please try again later.");
  }

  recent.push(now);
  rateLimitMap.set(key, recent);
}

// Configure Email provider for magic code authentication
const EmailProvider = Email({
  id: "resend",
  apiKey: process.env.AUTH_RESEND_KEY,
  maxAge: 60 * 15, // 15 minutes
  async generateVerificationToken() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length: 6 }, () =>
      alphabet[randomInt(0, alphabet.length)]
    ).join("");
  },
  async sendVerificationRequest({ identifier: email, token, expires }) {
    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      throw new Error("Invalid email address format");
    }

    // Check rate limit
    checkRateLimit(email);

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
      from: process.env.AUTH_EMAIL_FROM || "BikeFit AI <noreply@bikefit.ai>",
      to: [email],
      subject: "Your BikeFit AI Login Code",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">BikeFit AI</h2>
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

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [EmailProvider],
});
