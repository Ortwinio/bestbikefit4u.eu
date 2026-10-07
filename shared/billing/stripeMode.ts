export type StripeMode = "test" | "live";

export function parseStripeMode(value: unknown): StripeMode {
  if (value !== "test" && value !== "live") throw new Error("STRIPE_MODE_INVALID");
  return value;
}

export function stripeKeyMode(key: unknown): StripeMode {
  if (typeof key !== "string") throw new Error("STRIPE_KEY_INVALID");
  const match = /^(?:sk|rk)_(test|live)_[A-Za-z0-9]+$/.exec(key);
  if (!match) throw new Error("STRIPE_KEY_INVALID");
  return match[1] as StripeMode;
}

export function assertStripeKeyMode(mode: unknown, key: unknown): StripeMode {
  const configured = parseStripeMode(mode);
  if (stripeKeyMode(key) !== configured) throw new Error("STRIPE_MODE_MISMATCH");
  return configured;
}

export function assertStripeEventMode(mode: unknown, livemode: unknown): StripeMode {
  const configured = parseStripeMode(mode);
  if (typeof livemode !== "boolean" || livemode !== (configured === "live")) {
    throw new Error("STRIPE_MODE_MISMATCH");
  }
  return configured;
}
